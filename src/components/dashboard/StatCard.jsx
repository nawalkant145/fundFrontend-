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
    gold: { ring: "border-gold/20", icon: "text-gold", bg: "bg-gold/10" },
    green: {
      ring: "border-primary-green/20",
      icon: "text-primary-green",
      bg: "bg-primary-green/10",
    },
    red: {
      ring: "border-red-500/20",
      icon: "text-red-400",
      bg: "bg-red-500/10",
    },
    blue: {
      ring: "border-blue-500/20",
      icon: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  }[accent] || { ring: "border-gold/20", icon: "text-gold", bg: "bg-gold/10" };

  return (
    <motion.div
      className={`bg-card-bg/60 border-2 ${accents.ring} rounded-2xl p-5 backdrop-blur-md`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl ${accents.bg} flex items-center justify-center`}
        >
          {Icon && <Icon className={`w-6 h-6 ${accents.icon}`} />}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              trend >= 0
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-black mb-1">{value}</p>
      <p className="text-sm text-gray-400 font-semibold">{label}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </motion.div>
  );
}
