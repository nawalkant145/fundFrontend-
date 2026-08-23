import { motion } from "framer-motion";
import { HiPhone, HiVideoCamera, HiX, HiVolumeUp } from "react-icons/hi";
import { useCall } from "../../context/CallContext";

/**
 * Full-screen incoming-call prompt with accept / decline and ringtone handling.
 */
export default function IncomingCallModal({ info, onAccept, onDecline }) {
  const { isAutoplayBlocked, startIncomingRingtone } = useCall();

  if (!info) return null;
  const isVideo = info.type === "video";

  const handleContainerClick = () => {
    if (isAutoplayBlocked) {
      startIncomingRingtone();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#0F2A1E] to-[#0A1F14] border border-[#1B5E3F]/40 rounded-3xl p-8 w-[90%] max-w-sm text-center shadow-2xl relative"
      >
        {isAutoplayBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-2.5 bg-[#F5B942]/10 border border-[#F5B942]/40 rounded-xl text-xs text-[#F5B942] flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-1.5 font-medium text-left">
              <HiVolumeUp className="w-4 h-4 shrink-0 text-[#F5B942]" />
              Ringtone muted by browser policy.
            </span>
            <button
              onClick={() => startIncomingRingtone()}
              className="px-2.5 py-1 bg-[#F5B942] text-black font-bold rounded-lg text-[11px] hover:bg-[#f3ad22] transition-colors whitespace-nowrap"
            >
              Enable Ringtone
            </button>
          </motion.div>
        )}

        <motion.img
          src={
            info.peerAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              info.peerName || "U",
            )}&background=1B5E3F&color=fff&size=160`
          }
          alt={info.peerName}
          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-[#F5B942]/40 shadow-xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <h2 className="text-2xl font-black text-white mt-5">
          {info.peerName || "Unknown"}
        </h2>
        <p className="text-[#F5B942] mt-1 font-semibold inline-flex items-center gap-1.5 justify-center">
          <HiVideoCamera className="w-4 h-4" />
          Incoming Meeting Room Request…
        </p>

        <div className="flex items-center justify-center gap-8 mt-8">
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-2 group"
          >
            <span className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center shadow-xl shadow-red-600/40 transition-colors">
              <HiX className="w-7 h-7 text-white" />
            </span>
            <span className="text-xs text-gray-300 font-semibold">Decline</span>
          </button>
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-green-600 group-hover:bg-green-700 flex items-center justify-center shadow-xl shadow-green-600/40 transition-colors"
            >
              {isVideo ? (
                <HiVideoCamera className="w-7 h-7 text-white" />
              ) : (
                <HiPhone className="w-7 h-7 text-white" />
              )}
            </motion.span>
            <span className="text-xs text-gray-300 font-semibold">Accept</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
