import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HiPhone, HiVideoCamera, HiMicrophone, HiDesktopComputer } from "react-icons/hi";
import { useCall } from "../../context/CallContext";

/**
 * Modern Responsive Meeting Room Overlay.
 * Displays screen share / remote video in main view, local camera in floating PIP,
 * and fixed responsive meeting controls toolbar at bottom.
 */
export default function CallOverlay() {
  const {
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
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useCall();

  const mainVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  // Active stream to display in main view (Screen Share > Remote Stream)
  const activeMainStream = isScreenSharing ? screenStream : remoteStream;
  const isMainActive = Boolean(activeMainStream && status === "connected");

  useEffect(() => {
    if (mainVideoRef.current && activeMainStream) {
      console.log("📹 CallOverlay mainVideoRef setting srcObject:", activeMainStream.id, "tracks:", activeMainStream.getTracks());
      mainVideoRef.current.srcObject = activeMainStream;
      mainVideoRef.current
        .play()
        .then(() => console.log("✅ Remote video playback started successfully"))
        .catch((err) => console.warn("⚠️ Remote video autoplay failed:", err));
    }
  }, [activeMainStream, status, isMainActive, peerMediaState.isScreenSharing]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("🎥 CallOverlay localVideoRef setting srcObject:", localStream.id);
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.warn("⚠️ Local video autoplay failed:", err));
    }
  }, [localStream]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel =
    status === "calling"
      ? "Ringing…"
      : status === "connecting"
        ? "Connecting Meeting Room…"
        : fmt(duration);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between text-white overflow-hidden select-none">
      {/* Dedicated audio element for remote participant audio - ALWAYS active */}
      {remoteStream && (
        <audio
          autoPlay
          ref={(el) => {
            if (el && el.srcObject !== remoteStream) {
              console.log("🔊 Dedicated remote audio element setting srcObject:", remoteStream.id);
              el.srcObject = remoteStream;
              el.play().catch((err) => console.warn("⚠️ Remote audio play failed:", err));
            }
          }}
        />
      )}

      {/* ─── MAIN DISPLAY AREA (Remote Video or Screen Share) ─── */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0b141a]">
        {isMainActive ? (
          <video
            ref={(el) => {
              mainVideoRef.current = el;
              if (el && activeMainStream && el.srcObject !== activeMainStream) {
                console.log("📹 Callback ref setting mainVideoRef.srcObject:", activeMainStream.id);
                el.srcObject = activeMainStream;
                el.play()
                  .then(() => console.log("✅ Remote video playback started via callback ref"))
                  .catch((err) => console.warn("⚠️ Remote video play failed via callback ref:", err));
              }
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            {callInfo?.peerAvatar ? (
              <img
                src={callInfo.peerAvatar}
                alt={callInfo?.peerName}
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F2A1E] via-[#0A1F14] to-[#1B5E3F]/30" />
            )}
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <motion.img
                src={
                  callInfo?.peerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    callInfo?.peerName || "U",
                  )}&background=1B5E3F&color=fff&size=160`
                }
                alt={callInfo?.peerName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#F5B942]/50 object-cover shadow-2xl"
                animate={
                  status !== "connected" ? { scale: [1, 1.05, 1] } : { scale: 1 }
                }
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h2 className="text-2xl sm:text-3xl font-black mt-5 drop-shadow-md">
                {callInfo?.peerName || "Meeting Room Participant"}
              </h2>
              <p className="text-[#F5B942] font-extrabold mt-1 text-sm sm:text-base">
                {statusLabel}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                Meeting Room Session
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── TOP HEADER BADGES (Fixed Center) ─── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 max-w-[90vw]">
        <div className="px-4 py-1.5 bg-[#182229]/90 border border-gold/30 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {status === "connected"
            ? `Meeting Room · ${callInfo?.peerName || "Session"} · ${fmt(duration)}`
            : status === "connecting"
              ? "Meeting Room · Connecting…"
              : "Meeting Room · Ringing…"}
        </div>
        {(isScreenSharing || peerMediaState.isScreenSharing) && (
          <div className="px-3.5 py-1 bg-emerald-600/90 text-white rounded-full text-xs font-extrabold animate-pulse shadow-lg border border-emerald-400/40 flex items-center gap-1.5">
            <HiDesktopComputer className="w-4 h-4" />
            <span>
              {isScreenSharing
                ? "You are sharing your screen"
                : `${callInfo?.peerName || "Participant"} is sharing screen`}
            </span>
          </div>
        )}
      </div>

      {/* ─── FLOATING LOCAL PIP (Top Right Camera Preview) ─── */}
      {localStream && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 w-28 h-40 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl bg-black/90 backdrop-blur-md">
          {cameraOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A1F14] text-xs text-gray-400 text-center p-2">
              <HiVideoCamera className="w-6 h-6 mb-1 opacity-50" />
              <span>Camera Off</span>
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
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-bold rounded-full border border-white/20 whitespace-nowrap">
            {isScreenSharing ? "Camera (You)" : "You"}
          </div>
        </div>
      )}

      {/* ─── RESPONSIVE CONTROLS TOOLBAR (Fixed Bottom Center) ─── */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 sm:gap-5 bg-[#182229]/95 border border-gold/30 backdrop-blur-xl px-5 sm:px-6 py-3 rounded-full shadow-2xl max-w-[95vw]">
        {/* Mute Mic */}
        <CtrlBtn
          active={muted}
          activeBg="bg-red-500/30 text-red-400 border-red-500/50"
          icon={HiMicrophone}
          slash={muted}
          onClick={toggleMute}
          label={muted ? "Unmute Mic" : "Mute Mic"}
        />

        {/* Toggle Camera */}
        <CtrlBtn
          active={cameraOff}
          activeBg="bg-red-500/30 text-red-400 border-red-500/50"
          icon={HiVideoCamera}
          slash={cameraOff}
          onClick={toggleCamera}
          label={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
        />

        {/* Share Screen */}
        <CtrlBtn
          active={isScreenSharing}
          activeBg="bg-emerald-500/40 text-emerald-300 border-emerald-500/70 shadow-lg shadow-emerald-500/20"
          icon={HiDesktopComputer}
          onClick={toggleScreenShare}
          label={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        />

        {/* End Call */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={endCall}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30 transition-all"
          title="End Meeting Room Session"
        >
          <HiPhone className="w-6 h-6 rotate-[135deg]" />
        </motion.button>
      </div>
    </div>
  );
}

function CtrlBtn({ icon: Icon, onClick, active, activeBg = "", slash, label }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={label}
      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
        active
          ? activeBg
          : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
      }`}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      {slash && (
        <span className="absolute w-7 h-0.5 bg-current rotate-45 rounded-full" />
      )}
    </motion.button>
  );
}
