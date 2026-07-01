import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HiPhone, HiVideoCamera, HiX, HiMicrophone } from "react-icons/hi";
import { useCall } from "../../context/CallContext";

/**
 * Active-call overlay. Shows the remote stream full-screen, a local PIP,
 * and call controls (mute, camera, hang up). Driven entirely by CallContext.
 */
export default function CallOverlay() {
  const {
    status,
    callInfo,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    duration,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const isVideo = callInfo?.type === "video";

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel =
    status === "calling"
      ? "Ringing…"
      : status === "connecting"
        ? "Connecting…"
        : fmt(duration);

  const showRemoteVideo = isVideo && remoteStream && status === "connected";

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col text-white">
      {/* Remote video / avatar backdrop */}
      <div className="absolute inset-0">
        {showRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {callInfo?.peerAvatar ? (
              <img
                src={callInfo.peerAvatar}
                alt={callInfo?.peerName}
                className="w-full h-full object-cover blur-xl scale-110 opacity-60"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0F2A1E] via-[#0A1F14] to-[#1B5E3F]/30" />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
      </div>

      {/* Audio element for remote audio (always present so audio plays even
          when there's no remote video element rendered) */}
      {!showRemoteVideo && remoteStream && (
        <audio
          autoPlay
          ref={(el) => {
            if (el && el.srcObject !== remoteStream)
              el.srcObject = remoteStream;
          }}
        />
      )}

      {/* Peer info */}
      {!showRemoteVideo && (
        <div className="relative z-10 flex flex-col items-center pt-20 flex-1">
          <motion.img
            src={
              callInfo?.peerAvatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                callInfo?.peerName || "U",
              )}&background=1B5E3F&color=fff&size=160`
            }
            alt={callInfo?.peerName}
            className="w-32 h-32 rounded-full border-4 border-[#F5B942]/40 object-cover shadow-2xl"
            animate={
              status !== "connected" ? { scale: [1, 1.04, 1] } : { scale: 1 }
            }
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-3xl font-black mt-6">
            {callInfo?.peerName || "Unknown"}
          </h2>
          <p className="text-[#F5B942] mt-1 font-semibold">{statusLabel}</p>
          <p className="text-gray-300 mt-1 text-sm">
            {isVideo ? "Video call" : "Audio call"}
          </p>
        </div>
      )}

      {/* Timer pill when remote video is showing */}
      {showRemoteVideo && (
        <div className="relative z-10 flex justify-center pt-6">
          <span className="px-4 py-1.5 bg-black/50 backdrop-blur rounded-full text-sm font-semibold">
            {callInfo?.peerName} · {fmt(duration)}
          </span>
        </div>
      )}

      {/* Local PIP (video only) */}
      {isVideo && localStream && (
        <div className="absolute top-6 right-6 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#F5B942]/40 shadow-2xl bg-black z-20">
          {cameraOff ? (
            <div className="w-full h-full flex items-center justify-center bg-[#0A1F14] text-xs text-gray-400">
              Camera off
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 text-[10px] rounded-full">
            You
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-10 pb-12 pt-4 px-6 flex items-center justify-center gap-4 sm:gap-5">
        <CtrlBtn
          active={muted}
          activeBg="bg-red-500/30 text-red-400 border-red-500/50"
          icon={HiMicrophone}
          slash={muted}
          onClick={toggleMute}
          label={muted ? "Unmute" : "Mute"}
        />

        {isVideo && (
          <CtrlBtn
            active={cameraOff}
            activeBg="bg-red-500/30 text-red-400 border-red-500/50"
            icon={HiVideoCamera}
            slash={cameraOff}
            onClick={toggleCamera}
            label={cameraOff ? "Start video" : "Stop video"}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl shadow-red-600/40"
          title="End call"
        >
          <HiPhone className="w-7 h-7 rotate-[135deg]" />
        </motion.button>
      </div>
    </div>
  );
}

function CtrlBtn({ icon: Icon, onClick, active, activeBg = "", slash, label }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={label}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-md border-2 flex items-center justify-center transition-all ${
        active
          ? activeBg
          : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
      }`}
    >
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      {slash && (
        <span className="absolute w-8 h-0.5 bg-current rotate-45 rounded-full" />
      )}
    </motion.button>
  );
}
