import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiPlus } from "react-icons/hi";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

/**
 * One-click follow button — calls real API (POST /user/follow/:userId).
 * Optimistic UI. Reads initial state from the API on mount.
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
  initialFollowing, // optional pre-known state to avoid an API call
}) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loaded, setLoaded] = useState(initialFollowing != null);

  // Check follow status on mount (if not pre-provided)
  useEffect(() => {
    if (!userId || initialFollowing != null) return;
    // Check from the logged-in user's following list (stored on user obj)
    if (user?.following && Array.isArray(user.following)) {
      const isF = user.following.some(
        (id) => (id._id || id).toString() === userId,
      );
      setFollowing(isF);
      setLoaded(true);
      return;
    }
    userService
      .checkFollowing(userId)
      .then((res) => {
        const data = res?.data?.data ?? res?.data;
        setFollowing(!!data?.isFollowing);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [userId, initialFollowing, user]);

  // Don't render follow button for yourself
  if (!userId || userId === user?._id) return null;

  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const next = !following;
    setFollowing(next);
    onChange?.(next);
    userService.follow(userId).catch(() => {
      // Revert on error
      setFollowing(!next);
    });
  };

  const baseClasses = {
    default:
      "px-4 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 transition-all",
    compact:
      "px-2.5 py-0.5 text-[11px] font-bold rounded-full inline-flex items-center gap-1 transition-all",
    outline:
      "px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold rounded-full inline-flex items-center justify-center gap-1.5 transition-all border flex-shrink-0",
  }[variant];

  const stateClasses = following
    ? variant === "outline"
      ? "bg-[#E8F5EF] border-[#1B5E3F]/40 text-[#1B5E3F] hover:bg-red-50 hover:border-red-300 hover:text-red-500"
      : "bg-white/15 text-white border border-white/40 backdrop-blur-sm"
    : variant === "outline"
      ? "bg-[#F5B942] border-transparent text-[#0F4A2E] shadow-sm hover:bg-[#FFD166] hover:shadow-md"
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
