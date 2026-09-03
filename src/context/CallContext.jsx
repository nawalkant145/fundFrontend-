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

                                                         
const FALLBACK_ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

                                                                      
export const canShareScreen =
  typeof window !== "undefined" &&
  !!window.isSecureContext &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getDisplayMedia === "function";

                                                                                                                                                                                                                                                                                                                                   
export function CallProvider({ children }) {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState("idle");
  const [callInfo, setCallInfo] = useState(null);                                                            
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

  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingCandidates = useRef([]);
  const pendingOffer = useRef(null);
  const iceServersRef = useRef(FALLBACK_ICE);
  const callInfoRef = useRef(null);
  const ringtoneRef = useRef(null);
  const incomingRingtoneRef = useRef(null);
  const endCallRef = useRef(null);

                                                                
  useEffect(() => {
    callInfoRef.current = callInfo;
  }, [callInfo]);

                                                   
  const stopIncomingRingtone = useCallback(() => {
    console.log("🔕 Stopping incoming ringtone");
    setIsAutoplayBlocked(false);

    if (incomingRingtoneRef.current) {
      const ringObj = incomingRingtoneRef.current;
      ringObj.isPlaying = false;

      if (ringObj.audio) {
        try {
          ringObj.audio.pause();
          ringObj.audio.currentTime = 0;
        } catch (err) {
          console.warn("Error pausing incoming audio:", err);
        }
      }
    }
  }, []);

  const startIncomingRingtone = useCallback(() => {
    console.log("🔔 Starting incoming ringtone");

    if (incomingRingtoneRef.current?.isPlaying) {
      console.log("🔔 Incoming ringtone is already playing, ignoring duplicate start");
      return;
    }

    try {
      if (!incomingRingtoneRef.current) {
        const audio = new Audio("/sounds/incoming-call.wav");
        audio.loop = true;
        audio.volume = 0.7;
        audio.preload = "auto";
        incomingRingtoneRef.current = {
          audio,
          isPlaying: false,
        };
      }

      const ringObj = incomingRingtoneRef.current;
      ringObj.isPlaying = true;

      const playPromise = ringObj.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("🔔 Incoming ringtone playback started successfully");
            setIsAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn("⚠️ Autoplay policy blocked incoming ringtone:", err?.name || err);
            setIsAutoplayBlocked(true);
          });
      }
    } catch (err) {
      console.error("❌ Failed to start incoming ringtone:", err);
      setIsAutoplayBlocked(true);
    }
  }, []);

                                                                  
  useEffect(() => {
    if (status !== "incoming") {
      stopIncomingRingtone();
    }
  }, [status, stopIncomingRingtone]);

                                                 
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
    stopIncomingRingtone();
  }, [stopIncomingRingtone]);

                                                 
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

                                                 
  const getMedia = async (type) => {
    try {
      console.log("🎥 Getting user media for type:", type);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "audio" ? false : { facingMode: "user" },
      });
      console.log("🎥 Local media stream acquired:", {
        streamId: stream.id,
        tracks: stream.getTracks().map((t) => `${t.kind}:${t.label}:${t.readyState}`),
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("❌ getUserMedia failed:", err);
      throw err;
    }
  };

                                                 
  const createPeer = (peerId) => {
    console.log("🌐 Creating RTCPeerConnection for peerId:", peerId, "with ICE servers:", iceServersRef.current);
    if (pcRef.current) {
      try {
        console.log("Closing existing RTCPeerConnection before creating new one");
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.oniceconnectionstatechange = null;
        pcRef.current.close();
      } catch (err) {
        console.error("Error closing previous peer connection:", err);
      }
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        console.log("🧊 Sending ICE candidate to peerId:", peerId, e.candidate.candidate);
        socket.emit("ice_candidate", {
          targetId: peerId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      console.log("📹 ONTRACK EVENT FIRED:", {
        streamsCount: e.streams?.length,
        streamId: e.streams?.[0]?.id,
        trackKind: e.track?.kind,
        trackId: e.track?.id,
        trackReadyState: e.track?.readyState,
        trackEnabled: e.track?.enabled,
      });

      let streamToUse = null;
      if (e.streams && e.streams[0]) {
        streamToUse = e.streams[0];
      } else if (e.track) {
        streamToUse = new MediaStream([e.track]);
      }

      if (streamToUse) {
        console.log("✅ Setting remoteStream state:", {
          id: streamToUse.id,
          videoTracks: streamToUse.getVideoTracks().map((t) => `${t.kind}:${t.readyState}:${t.enabled}`),
          audioTracks: streamToUse.getAudioTracks().map((t) => `${t.kind}:${t.readyState}:${t.enabled}`),
        });
        setRemoteStream(streamToUse);
      } else {
        console.error("❌ No remote stream or track found in ontrack event!");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 PC connectionState:", pc.connectionState, "signalingState:", pc.signalingState);
      if (pc.connectionState === "connected") {
        setStatus("connected");
        sendMediaState();
      }
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        if (callInfoRef.current) handleRemoteEnd();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("🧊 PC iceConnectionState:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setStatus("connected");
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log("🧊 PC iceGatheringState:", pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      console.log("🚥 PC signalingState:", pc.signalingState);
    };

                       
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        console.log("➕ Adding local track to PC:", t.kind, t.id, t.label);
        pc.addTrack(t, localStreamRef.current);
      });
    } else {
      console.warn("⚠️ createPeer called but localStreamRef.current is empty!");
    }

                                                                                                  
    const senders = pc.getSenders();
    const hasVideoSender = senders.some((s) => s.track?.kind === "video");
    if (!hasVideoSender) {
      try {
        console.log("➕ Adding video transceiver sendrecv");
        pc.addTransceiver("video", { direction: "sendrecv" });
      } catch (err) {
        console.warn("Could not add video transceiver:", err);
      }
    }

    pcRef.current = pc;
    return pc;
  };

  const drainCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingCandidates.current;
    pendingCandidates.current = [];
    console.log("🧊 Draining queued ICE candidates count:", queued.length);
    for (const c of queued) {
      try {
        await pc.addIceCandidate(c);
        console.log("✅ Drained ICE candidate added successfully");
      } catch (err) {
        console.error("❌ Error adding drained ICE candidate:", err);
      }
    }
  };

                                                               
  const processOffer = async (from, offer) => {
    const pc = pcRef.current;
    if (!pc) {
      console.error("❌ processOffer failed: pcRef.current is null");
      return;
    }
    try {
      console.log("📥 Setting remote description (offer) from:", from);
      await pc.setRemoteDescription(offer);
      await drainCandidates();
      console.log("📤 Creating answer for:", from);
      const answer = await pc.createAnswer();
      console.log("📝 Setting local description (answer)");
      await pc.setLocalDescription(answer);
      console.log("📤 Emitting webrtc_answer to:", from);
      socket?.emit("webrtc_answer", { targetId: from, answer });
    } catch (err) {
      console.error("❌ Error processing offer:", err);
      toast?.error("Failed to connect");
      endCallRef.current?.();
    }
  };

                                                 
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
                                                                       
      createPeer(info.peerId);
                                                                               
      if (pendingOffer.current) {
        const { from, offer } = pendingOffer.current;
        pendingOffer.current = null;
        processOffer(from, offer);
      }
    });
                               
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
                                             
      if (screenStreamRef.current) {
        try {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch (err) {
          console.warn("Error stopping screen tracks:", err);
        }
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);

      const cameraTrack = await ensureCameraTrack();
      if (pcRef.current) {
        const videoSender =
          pcRef.current.getSenders().find(
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
                                
      if (typeof window !== "undefined" && !window.isSecureContext) {
        console.error("Screen sharing failed: Page is not in a secure context (HTTPS required).");
        toast?.error("Screen sharing requires a secure HTTPS connection.");
        return;
      }

                                      
      if (!canShareScreen) {
        console.error("Screen sharing failed: navigator.mediaDevices.getDisplayMedia is not available.");
        toast?.error(
          "Screen sharing is not supported on this mobile browser. Please use a supported browser or desktop."
        );
        return;
      }

                                       
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        });

        const screenTrack = displayStream.getVideoTracks()[0];
        if (!screenTrack) {
          throw new Error("No video track obtained from screen capture.");
        }

        screenStreamRef.current = displayStream;
        setScreenStream(displayStream);

        if (pcRef.current) {
          const videoSender =
            pcRef.current.getSenders().find(
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
          console.log("🖥️ Screen track ended by user/browser");
          if (screenStreamRef.current) {
            try {
              screenStreamRef.current.getTracks().forEach((t) => t.stop());
            } catch {}
            screenStreamRef.current = null;
          }
          setScreenStream(null);
          setIsScreenSharing(false);

          const cameraTrack = await ensureCameraTrack();
          if (pcRef.current) {
            const videoSender =
              pcRef.current.getSenders().find(
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
        console.error("Screen sharing failed:", err);

        const errorName = err?.name || "";
        if (errorName === "NotAllowedError") {
          toast?.error("Screen sharing permission was denied.");
        } else if (errorName === "NotSupportedError" || err instanceof TypeError) {
          toast?.error("Screen sharing is not supported on this device/browser.");
        } else if (errorName === "AbortError") {
          toast?.error("Screen sharing was cancelled.");
        } else if (errorName === "SecurityError") {
          toast?.error("Screen sharing is blocked by the browser or page security policy.");
        } else {
          toast?.error(err?.message || "Unable to start screen sharing. Please try again.");
        }
      }
    }
  }, [isScreenSharing, cameraOff, toast, sendMediaState, renegotiate]);

                                                 
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

                                                 
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (data) => {
      console.log("📞 Incoming call received:", data.callId, "from caller:", data.callerName);
                            
      if (callInfoRef.current) {
        console.log("Busy: Auto-declining second incoming call:", data.callId);
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
      startIncomingRingtone();
    };

    const onAccepted = async ({ iceServers }) => {
                                                             
      console.log("📥 Received call_accepted event from receiver with iceServers:", iceServers);
      stopRingtone();
      iceServersRef.current = iceServers?.length ? iceServers : FALLBACK_ICE;
      const info = callInfoRef.current;
      if (!info) {
        console.error("❌ onAccepted failed: callInfoRef.current is null");
        return;
      }
      setStatus("connecting");
      const pc = createPeer(info.peerId);
      try {
        console.log("📤 Creating offer for peer:", info.peerId);
        const offer = await pc.createOffer();
        console.log("📝 Setting local description (offer)");
        await pc.setLocalDescription(offer);
        console.log("📤 Emitting webrtc_offer to targetId:", info.peerId);
        socket.emit("webrtc_offer", { targetId: info.peerId, offer });
      } catch (err) {
        console.error("❌ Error in onAccepted offer creation:", err);
        toast?.error("Failed to establish connection");
        endCall();
      }
    };

    const onOffer = async ({ from, offer }) => {
      console.log("📥 Received webrtc_offer event from:", from);
                                                           
      if (!pcRef.current) {
        console.log("⏳ Buffering offer because pcRef.current is not initialized yet");
        pendingOffer.current = { from, offer };
        return;
      }
      await processOffer(from, offer);
    };

    const onAnswer = async ({ answer }) => {
      console.log("📥 Received webrtc_answer event");
                    
      const pc = pcRef.current;
      if (!pc) {
        console.error("❌ onAnswer failed: pcRef.current is null");
        return;
      }
      try {
        console.log("📝 Setting remote description (answer)");
        await pc.setRemoteDescription(answer);
        await drainCandidates();
      } catch (err) {
        console.error("❌ Error setting remote description (answer):", err);
      }
    };

    const onCandidate = async ({ candidate }) => {
      console.log("📥 Received ice_candidate event:", candidate?.candidate);
      const pc = pcRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(candidate);
          console.log("✅ Added remote ICE candidate successfully");
        } catch (err) {
          console.error("❌ Error adding remote ICE candidate:", err);
        }
      } else {
        console.log("⏳ Buffering ICE candidate until remote description is set");
        pendingCandidates.current.push(candidate);
      }
    };

    const onMediaStateChange = ({ muted, cameraOff, isScreenSharing }) => {
      setPeerMediaState({ muted, cameraOff, isScreenSharing });
    };

    const onDeclined = () => {
      console.log("❌ Call declined by recipient");
      toast?.info("Call declined");
      stopIncomingRingtone();
      cleanup();
    };
    const onEnded = () => {
      console.log("📴 Call cancelled or ended by remote participant");
      stopIncomingRingtone();
      cleanup();
    };
    const onNoAnswer = () => {
      console.log("⏱️ Incoming call timed out");
      toast?.info("No answer");
      stopIncomingRingtone();
      cleanup();
    };

    const onDisconnect = () => {
      console.log("🔌 Socket disconnected, stopping ringtone");
      stopIncomingRingtone();
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
    socket.on("disconnect", onDisconnect);

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
      socket.off("disconnect", onDisconnect);
    };
                               
  }, [socket, toast, cleanup, endCall, startIncomingRingtone, stopIncomingRingtone]);

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
    canShareScreen,
    isAutoplayBlocked,
    startIncomingRingtone,
    stopIncomingRingtone,
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
