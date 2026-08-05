import { motion } from "framer-motion";
import { MdVerified } from "react-icons/md";

export default function AvatarProgressRing({
  user,
  percentage = 55,
  size = 116,
  strokeWidth = 5,
  onClick,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isVerified = user?.verifiedBadge || user?.isVerified || user?.verificationLevel >= 2;

  return (
    <div
      onClick={onClick}
      className="relative inline-flex flex-col items-center justify-center cursor-pointer group select-none flex-shrink-0"
    >
      <div
        className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.03]"
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 overflow-visible"
        >
          {/* Track (Light Gray Track) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Dark Green Progress Stroke (#0F4A2E) */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0F4A2E"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* User Avatar Circle */}
        <div
          className="absolute rounded-full overflow-hidden border-2 border-white shadow-md bg-[#0F4A2E] text-white-force font-bold flex items-center justify-center"
          style={{
            width: size - strokeWidth * 3,
            height: size - strokeWidth * 3,
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl sm:text-3xl font-black text-white-force tracking-tight">
              {(user?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>

        {/* Blue Verified Badge Overlay (Bottom-Right) */}
        {isVerified && (
          <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-xs">
            <MdVerified className="w-5 h-5 text-[#0F4A2E]" />
          </div>
        )}

        {/* Percentage Badge Pill overlapping bottom of the ring */}
        <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-[#0F4A2E] text-white-force text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md border border-white/20">
          <span className="text-white-force">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
