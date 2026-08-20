import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { useToast } from "../components/ui/Toast";
import CallOverlay from "../components/call/CallOverlay";
import IncomingCallModal from "../components/call/IncomingCallModal";

const CallContext = createContext(null);

// Fallback ICE servers if the backend doesn't supply any
const FALLBACK_ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/**
 * Global call manager. Handles outgoing + incoming WebRTC calls end-to-end:
 * getUserMedia → RTCPeerConnection → offer/answer/ICE over Socket.IO.
 * Renders the call overlay + incoming-call modal so calls work from anywhere.
 *
 * Status machine: idle → calling | incoming → connecting → connected → (ended)
 */
export function CallProvider({ children }) {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState("idle");
  const [callInfo, setCallInfo] = useState(null); // { callId, peerId, peerName, peerAvatar, type, isCaller }
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peerMediaState, setPeerMediaState] = useState({
    muted: false,
    cameraOff: false,
    isScreenSharing: false,
  });
  const [duration, setDuration] = useState(0);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingCandidates = useRef([]);
  const pendingOffer = useRef(null);
  const iceServersRef = useRef(FALLBACK_ICE);
  const callInfoRef = useRef(null);
  const ringtoneRef = useRef(null);
  const endCallRef = useRef(null);

  // Keep a ref copy of callInfo for use inside socket callbacks
  useEffect(() => {
    callInfoRef.current = callInfo;
  }, [callInfo]);

  // ─── Cleanup ────────────────────────────────
  const cleanup = useCallback(() => {
    try {
      pcRef.current?.getSenders?.().forEach((s) => s.track?.stop());
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingCandidates.current = [];
    pendingOffer.current = null;
    iceServersRef.current = FALLBACK_ICE;
    setLocalStream(null);
    setScreenStream(null);
    setRemoteStream(null);
    setCallInfo(null);
    setStatus("idle");
    setMuted(false);
    setCameraOff(false);
    setIsScreenSharing(false);
    setPeerMediaState({ muted: false, cameraOff: false, isScreenSharing: false });
    setDuration(0);
    stopRingtone();
  }, []);

  // ─── Ringtone (simple oscillator beep loop) ──
  const startRingtone = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0.0008;
      gain.connect(ctx.destination);
      const beep = () => {
        const osc = ctx.createOscillator();
        osc.frequency.value = 480;
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      };
      beep();
      const interval = setInterval(beep, 1500);
      ringtoneRef.current = { ctx, interval };
    } catch {}
  };
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current.interval);
      ringtoneRef.current.ctx?.close?.();
      ringtoneRef.current = null;
    }
  };

  // ─── Media ──────────────────────────────────
  const getMedia = async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "audio" ? false : { facingMode: "user" },
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  // ─── Peer connection ────────────────────────
  const createPeer = (peerId) => {
    if (pcRef.current) {
      try {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
      } catch (err) {
        console.error("Error closing previous peer connection:", err);
      }
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit("ice_candidate", {
          targetId: peerId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        setRemoteStream(e.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "connected") {
        setStatus("connected");
        sendMediaState();
      }
      if (st === "failed" || st === "closed") {
        if (callInfoRef.current) handleRemoteEnd();
      }
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current));
    }

    // Ensure a video transceiver exists so screen sharing can replace/send video track seamlessly
    const senders = pc.getSenders();
    const hasVideoSender = senders.some((s) => s.track?.kind === "video");
    if (!hasVideoSender) {
      try {
        pc.addTransceiver("video", { direction: "sendrecv" });
      } catch {}
    }

    pcRef.current = pc;
    return pc;
  };

  const drainCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingCandidates.current;
    pendingCandidates.current = [];
    for (const c of queued) {
      try {
        await pc.addIceCandidate(c);
      } catch {}
    }
  };

  // Receiver: apply the caller's offer and send back an answer
  const processOffer = async (from, offer) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.setRemoteDescription(offer);
      await drainCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.emit("webrtc_answer", { targetId: from, answer });
    } catch {
      toast?.error("Failed to connect");
      endCallRef.current?.();
    }
  };

  // ─── Outgoing call ──────────────────────────
  const startCall = useCallback(
    async ({ receiverId, name, avatar, type = "meeting" }) => {
      console.log("CALL SOCKET STATUS", {
        connected: socket?.connected,
        id: socket?.id,
      });
      console.log("STARTING CALL", {
        receiverId,
        socketConnected: socket?.connected,
      });

      if (!receiverId) {
        toast?.error("Recipient not found. Select a user first.");
        return;
      }
      if (status !== "idle") {
        toast?.error("You're already in a meeting session");
        return;
      }

      if (socket && socket.connected) {
        try {
          await getMedia(type);
        } catch {
          toast?.error("Camera/microphone permission denied");
          cleanup();
          return;
        }
        setCallInfo({
          peerId: receiverId,
          peerName: name,
          peerAvatar: avatar,
          type,
          isCaller: true,
        });
        setStatus("calling");
        startRingtone();

        socket.emit("call_initiate", { receiverId, type, callType: type }, (ack) => {
          console.log("CALL ACK", ack);
          if (!ack?.ok) {
            const errMsg = ack?.error || "Could not start meeting";
            console.error("Backend rejected call initiation:", errMsg);
            toast?.error(errMsg);
            cleanup();
            return;
          }
          iceServersRef.current = ack.iceServers?.length
            ? ack.iceServers
            : FALLBACK_ICE;
          setCallInfo((prev) => ({ ...prev, callId: ack.callId }));
        });
      } else {
        // Socket not connected — try REST fallback
        console.warn("🔌 Socket not connected, attempting REST fallback for meeting initiation...");
        try {
          const response = await callService.initiate({ receiverId, callType: type, type });
          const data = response?.data?.data || response?.data || response;
          const callDoc = data?.call;
          const iceServers = data?.iceServers;

          if (!callDoc?._id) {
            throw new Error(data?.message || "Failed to start meeting");
          }

          await getMedia(type);
          iceServersRef.current = iceServers?.length ? iceServers : FALLBACK_ICE;
          setCallInfo({
            callId: callDoc._id,
            peerId: receiverId,
            peerName: name,
            peerAvatar: avatar,
            type,
            isCaller: true,
          });
          setStatus("calling");
          startRingtone();
        } catch (apiErr) {
          const errMsg =
            apiErr?.response?.data?.message ||
            apiErr?.message ||
            "Connection not ready. Try again.";
          console.error("Call initiation failed via REST fallback:", apiErr);
          toast?.error(errMsg);
          cleanup();
        }
      }
    },
    [socket, status, toast, cleanup],
  );

  // ─── Accept / decline incoming ──────────────
  const acceptCall = useCallback(async () => {
    const info = callInfoRef.current;
    if (!socket || !info?.callId) return;
    stopRingtone();
    try {
      await getMedia(info.type);
    } catch {
      toast?.error("Camera/microphone permission denied");
      declineCall();
      return;
    }
    setStatus("connecting");
    socket.emit("call_accept", { callId: info.callId }, (ack) => {
      if (!ack?.ok) {
        toast?.error(ack?.error || "Could not accept meeting");
        cleanup();
        return;
      }
      iceServersRef.current = ack.iceServers?.length
        ? ack.iceServers
        : FALLBACK_ICE;
      // Receiver creates the peer now and waits for the caller's offer
      createPeer(info.peerId);
      // If the offer already arrived before the peer was ready, process it now
      if (pendingOffer.current) {
        const { from, offer } = pendingOffer.current;
        pendingOffer.current = null;
        processOffer(from, offer);
      }
    });
    // eslint-disable-next-line
  }, [socket, toast, cleanup]);

  const declineCall = useCallback(() => {
    const info = callInfoRef.current;
    if (socket && info?.callId) {
      socket.emit("call_decline", { callId: info.callId });
    }
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    const info = callInfoRef.current;
    if (socket && info?.callId) {
      socket.emit("call_end", { callId: info.callId });
    }
    cleanup();
  }, [socket, cleanup]);

  const handleRemoteEnd = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // ─── Track Recovery Helpers ─────────────────
  const ensureCameraTrack = async () => {
    let track = localStreamRef.current?.getVideoTracks?.()?.[0];
    if (!track || track.readyState === "ended") {
      try {
        const freshStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        const newTrack = freshStream.getVideoTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((t) => {
            t.stop();
            localStreamRef.current.removeTrack(t);
          });
          localStreamRef.current.addTrack(newTrack);
        } else {
          localStreamRef.current = freshStream;
        }
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        track = newTrack;
      } catch (err) {
        console.error("Failed to re-acquire camera track:", err);
      }
    }
    return track;
  };

  const sendMediaState = useCallback(
    (override) => {
      const info = callInfoRef.current;
      if (socket && info?.peerId) {
        const payload = {
          targetId: info.peerId,
          muted: override?.muted ?? muted,
          cameraOff: override?.cameraOff ?? cameraOff,
          isScreenSharing: override?.isScreenSharing ?? isScreenSharing,
        };
        socket.emit("media_state_change", payload);
      }
    },
    [socket, muted, cameraOff, isScreenSharing],
  );

  const renegotiate = useCallback(async () => {
    const pc = pcRef.current;
    const info = callInfoRef.current;
    if (!pc || !info?.peerId || !socket) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { targetId: info.peerId, offer });
    } catch (err) {
      console.error("Renegotiation failed:", err);
    }
  }, [socket]);

  // ─── Controls ───────────────────────────────
  const toggleMute = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const track = s.getAudioTracks()[0];
    if (track) {
      const nextMuted = !muted;
      track.enabled = !nextMuted;
      setMuted(nextMuted);
      sendMediaState({ muted: nextMuted });
    }
  }, [muted, sendMediaState]);

  const toggleCamera = useCallback(async () => {
    const nextCameraOff = !cameraOff;
    let track = localStreamRef.current?.getVideoTracks()?.[0];

    if (!nextCameraOff) {
      // User wants camera ON -> Ensure live track
      track = await ensureCameraTrack();
      if (track) {
        track.enabled = true;
        if (pcRef.current && !isScreenSharing) {
          const videoSender = pcRef.current.getSenders().find(
            (s) => s.track?.kind === "video" || (s.track === null && s.kind === "video"),
          ) || pcRef.current.getSenders().find((s) => s.track === null);

          if (videoSender) {
            await videoSender.replaceTrack(track);
          } else {
            pcRef.current.addTrack(track, localStreamRef.current);
            await renegotiate();
          }
        }
      }
    } else {
      // User wants camera OFF
      if (track) {
        track.enabled = false;
      }
    }

    if (localStreamRef.current) {
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    }
    setCameraOff(nextCameraOff);
    sendMediaState({ cameraOff: nextCameraOff });
  }, [cameraOff, isScreenSharing, sendMediaState, renegotiate]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share & revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);

      const cameraTrack = await ensureCameraTrack();
      if (pcRef.current) {
        const videoSender = pcRef.current.getSenders().find(
          (s) => s.track?.kind === "video" || (s.track === null && s.kind === "video"),
        ) || pcRef.current.getSenders().find((s) => s.track === null);

        if (videoSender) {
          if (cameraTrack) {
            cameraTrack.enabled = !cameraOff;
            await videoSender.replaceTrack(cameraTrack);
          } else {
            await videoSender.replaceTrack(null);
          }
        } else if (cameraTrack) {
          pcRef.current.addTrack(cameraTrack, localStreamRef.current);
          await renegotiate();
        }
      }

      sendMediaState({ isScreenSharing: false });
      toast?.info("Stopped screen sharing");
    } else {
      // Start screen share
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenStreamRef.current = displayStream;
        setScreenStream(displayStream);

        if (pcRef.current) {
          const videoSender = pcRef.current.getSenders().find(
            (s) => s.track?.kind === "video" || (s.track === null && s.kind === "video"),
          ) || pcRef.current.getSenders().find((s) => s.track === null);

          if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
          } else {
            pcRef.current.addTrack(screenTrack, displayStream);
            await renegotiate();
          }
        }

        screenTrack.onended = async () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          setScreenStream(null);
          setIsScreenSharing(false);

          const cameraTrack = await ensureCameraTrack();
          if (pcRef.current) {
            const videoSender = pcRef.current.getSenders().find(
              (s) => s.track?.kind === "video" || (s.track === null && s.kind === "video"),
            ) || pcRef.current.getSenders().find((s) => s.track === null);

            if (videoSender) {
              if (cameraTrack) {
                cameraTrack.enabled = !cameraOff;
                await videoSender.replaceTrack(cameraTrack);
              } else {
                await videoSender.replaceTrack(null);
              }
            }
          }

          sendMediaState({ isScreenSharing: false });
        };

        setIsScreenSharing(true);
        sendMediaState({ isScreenSharing: true });
        toast?.success("Sharing screen");
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          toast?.error("Could not share screen");
        }
      }
    }
  }, [isScreenSharing, cameraOff, toast, sendMediaState, renegotiate]);

  // ─── Duration timer ─────────────────────────
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // ─── Socket event wiring ────────────────────
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (data) => {
      // Busy → auto-decline
      if (callInfoRef.current) {
        socket.emit("call_decline", { callId: data.callId });
        return;
      }
      setCallInfo({
        callId: data.callId,
        peerId: data.callerId,
        peerName: data.callerName,
        peerAvatar: data.callerAvatar,
        type: data.type,
        isCaller: false,
      });
      setStatus("incoming");
      startRingtone();
    };

    const onAccepted = async ({ iceServers }) => {
      // Caller side: build the peer, create + send the offer
      stopRingtone();
      iceServersRef.current = iceServers?.length ? iceServers : FALLBACK_ICE;
      const info = callInfoRef.current;
      if (!info) return;
      setStatus("connecting");
      const pc = createPeer(info.peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc_offer", { targetId: info.peerId, offer });
      } catch {
        toast?.error("Failed to establish connection");
        endCall();
      }
    };

    const onOffer = async ({ from, offer }) => {
      // Receiver side — buffer if the peer isn't ready yet
      if (!pcRef.current) {
        pendingOffer.current = { from, offer };
        return;
      }
      await processOffer(from, offer);
    };

    const onAnswer = async ({ answer }) => {
      // Caller side
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(answer);
        await drainCandidates();
      } catch {}
    };

    const onCandidate = async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {}
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    const onMediaStateChange = ({ muted, cameraOff, isScreenSharing }) => {
      setPeerMediaState({ muted, cameraOff, isScreenSharing });
    };

    const onDeclined = () => {
      toast?.info("Call declined");
      cleanup();
    };
    const onEnded = () => {
      cleanup();
    };
    const onNoAnswer = () => {
      toast?.info("No answer");
      cleanup();
    };

    socket.on("incoming_call", onIncoming);
    socket.on("call_accepted", onAccepted);
    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("ice_candidate", onCandidate);
    socket.on("media_state_change", onMediaStateChange);
    socket.on("call_declined", onDeclined);
    socket.on("call_ended", onEnded);
    socket.on("call_no_answer", onNoAnswer);

    return () => {
      socket.off("incoming_call", onIncoming);
      socket.off("call_accepted", onAccepted);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("ice_candidate", onCandidate);
      socket.off("media_state_change", onMediaStateChange);
      socket.off("call_declined", onDeclined);
      socket.off("call_ended", onEnded);
      socket.off("call_no_answer", onNoAnswer);
    };
    // eslint-disable-next-line
  }, [socket, toast, cleanup, endCall]);

  const value = {
    status,
    callInfo,
    localStream,
    screenStream,
    remoteStream,
    muted,
    cameraOff,
    isScreenSharing,
    peerMediaState,
    duration,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {status === "incoming" && (
        <IncomingCallModal
          info={callInfo}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
      {(status === "calling" ||
        status === "connecting" ||
        status === "connected") && <CallOverlay />}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}
