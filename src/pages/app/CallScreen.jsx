import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiPhone,
  HiVideoCamera,
  HiVolumeUp,
  HiVolumeOff,
  HiX,
  HiSwitchHorizontal,
  HiMicrophone,
} from "react-icons/hi";

import { MOCK_CHATS, CURRENT_USER } from "../../constants/mockData";

export default function CallScreen() {
  const { kind = "video", chatId } = useParams();
  const navigate = useNavigate();
  const chat = MOCK_CHATS.find((c) => c._id === chatId) || MOCK_CHATS[0];
  const other =
    CURRENT_USER.role === "founder" ? chat.investorId : chat.founderId;

  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0",
    )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-white">
      {/* Remote video / avatar */}
      <div className="absolute inset-0">
        {kind === "video" ? (
          <img
            src={other.avatar}
            alt={other.name}
            className="w-full h-full object-cover blur-sm scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-navy via-dark-bg to-primary-green/30" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Caller info */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-8 flex-1">
        <motion.img
          src={other.avatar}
          alt={other.name}
          className="w-32 h-32 rounded-full border-4 border-gold/40 object-cover shadow-2xl shadow-gold/20"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-3xl font-black mt-6">{other.name}</h2>
        <p className="text-gold mt-1 font-semibold">{fmt(duration)}</p>
        <p className="text-gray-300 mt-1 text-sm">
          {kind === "video" ? "Video call" : "Audio call"}
        </p>

        {/* Local self preview (video only) */}
        {kind === "video" && !cameraOff && (
          <div className="absolute top-6 right-6 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl">
            <img
              src={CURRENT_USER.avatar}
              alt="You"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 text-[10px] rounded-full">
              You
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 pb-12 px-6 flex items-center justify-center gap-3 sm:gap-5">
        <CtrlBtn
          active={muted}
          activeBg="bg-red-500/30 text-red-400 border-red-500/50"
          icon={muted ? HiVolumeOff : HiMicrophone}
          onClick={() => setMuted((v) => !v)}
        />

        {kind === "video" && (
          <CtrlBtn
            active={cameraOff}
            activeBg="bg-red-500/30 text-red-400 border-red-500/50"
            icon={HiVideoCamera}
            onClick={() => setCameraOff((v) => !v)}
            slash={cameraOff}
          />
        )}

        <CtrlBtn
          active={!speaker}
          activeBg="bg-red-500/30 text-red-400 border-red-500/50"
          icon={speaker ? HiVolumeUp : HiVolumeOff}
          onClick={() => setSpeaker((v) => !v)}
        />

        {kind === "video" && (
          <CtrlBtn icon={HiSwitchHorizontal} onClick={() => {}} />
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl shadow-red-600/40"
        >
          <HiX className="w-7 h-7 rotate-45" />
        </motion.button>
      </div>
    </div>
  );
}

function CtrlBtn({ icon: Icon, onClick, active, activeBg = "" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-md border-2 flex items-center justify-center transition-all ${
        active
          ? activeBg
          : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
      }`}
    >
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
    </motion.button>
  );
}
