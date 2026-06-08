import { motion } from "framer-motion";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "gold",
  trend,
}) {
  const accents = {
    gold: {
      ring: "border-[#F5B942]/35",
      icon: "text-[#0F4A2E]",
      bg: "bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD]",
    },
    green: {
      ring: "border-[#1B5E3F]/20",
      icon: "text-[#1B5E3F]",
      bg: "bg-[#1B5E3F]/10",
    },
    red: {
      ring: "border-red-200",
      icon: "text-red-500",
      bg: "bg-red-50",
    },
    blue: {
      ring: "border-[#2D7A4F]/25",
      icon: "text-[#2D7A4F]",
      bg: "bg-[#2D7A4F]/10",
    },
  }[accent] || {
    ring: "border-[#F5B942]/35",
    icon: "text-[#0F4A2E]",
    bg: "bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD]",
  };

  return (
    <motion.div
      className={`bg-white border ${accents.ring} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl ${accents.bg} flex items-center justify-center shadow-sm`}
        >
          {Icon && <Icon className={`w-6 h-6 ${accents.icon}`} />}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-black mb-1 text-[#0A1F14]">
        {value}
      </p>
      <p className="text-sm text-[#0A1F14]/60 font-semibold">{label}</p>
      {hint && <p className="text-xs text-[#0A1F14]/45 mt-1">{hint}</p>}
    </motion.div>
  );
}
