import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiPlus } from "react-icons/hi";
import { isFollowing, toggleFollow } from "../../lib/auth";

/**
 * One-click follow button. Optimistic UI, persists in localStorage.
 *
 * Variants:
 *   - "default" — full pill button
 *   - "compact" — small pill (used in feed overlays)
 *   - "outline" — outlined style for light backgrounds
 */
export default function FollowButton({
  userId,
  variant = "default",
  className = "",
  onChange,
}) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing(userId));
  }, [userId]);

  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const next = toggleFollow(userId);
    setFollowing(next);
    onChange?.(next);
  };

  const baseClasses = {
    default:
      "px-4 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 transition-all",
    compact:
      "px-2.5 py-0.5 text-[11px] font-bold rounded-full inline-flex items-center gap-1 transition-all",
    outline:
      "px-4 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 transition-all border",
  }[variant];

  const stateClasses = following
    ? variant === "outline"
      ? "bg-white border-[#1B5E3F]/25 text-[#0F4A2E]"
      : "bg-white/15 text-white border border-white/40 backdrop-blur-sm"
    : variant === "outline"
      ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white border-transparent shadow-md shadow-[#1B5E3F]/25"
      : "bg-[#F5B942] text-[#0F4A2E]";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {following ? (
        <>
          <HiCheck className="w-3.5 h-3.5" /> Following
        </>
      ) : (
        <>
          <HiPlus className="w-3.5 h-3.5" /> Follow
        </>
      )}
    </motion.button>
  );
}
