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
      setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "connected") setStatus("connected");
      if (st === "failed" || st === "closed") {
        // Connection dropped
        if (callInfoRef.current) handleRemoteEnd();
      }
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current));
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
      if (!socket) {
        toast?.error("Connection not ready. Try again.");
        return;
      }
      if (status !== "idle") {
        toast?.error("You're already in a meeting session");
        return;
      }
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
        if (!ack?.ok) {
          toast?.error(ack?.error || "Could not start meeting");
          cleanup();
          return;
        }
        iceServersRef.current = ack.iceServers?.length
          ? ack.iceServers
          : FALLBACK_ICE;
        setCallInfo((prev) => ({ ...prev, callId: ack.callId }));
      });
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

  // ─── Controls ───────────────────────────────
  const toggleMute = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const track = s.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const track = s.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOff(!track.enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share and revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (pcRef.current && localStreamRef.current) {
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        const videoSender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender && cameraTrack) {
          await videoSender.replaceTrack(cameraTrack);
        }
      }
      setScreenStream(null);
      setIsScreenSharing(false);
      toast?.info("Stopped screen sharing");
    } else {
      // Start screen share
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenStreamRef.current = displayStream;
        setScreenStream(displayStream);

        if (pcRef.current) {
          const videoSender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
          } else {
            pcRef.current.addTrack(screenTrack, displayStream);
          }
        }

        screenTrack.onended = () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          if (pcRef.current && localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            const videoSender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
            if (videoSender && cameraTrack) {
              videoSender.replaceTrack(cameraTrack);
            }
          }
          setScreenStream(null);
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
        toast?.success("Sharing screen");
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          toast?.error("Could not share screen");
        }
      }
    }
  }, [isScreenSharing, toast]);

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
    socket.on("call_declined", onDeclined);
    socket.on("call_ended", onEnded);
    socket.on("call_no_answer", onNoAnswer);

    return () => {
      socket.off("incoming_call", onIncoming);
      socket.off("call_accepted", onAccepted);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("ice_candidate", onCandidate);
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
