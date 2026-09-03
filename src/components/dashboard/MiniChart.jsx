import { motion } from "framer-motion";

                                                                                                                                                               

export function BarChart({ data = [], color = "#F5B942", height = 160 }) {
  if (!data.length)
    return <Empty height={height} text="No data for this period" />;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-2 min-w-0"
        >
          <div className="w-full flex-1 flex items-end">
            <motion.div
              className="w-full rounded-t-md relative group cursor-pointer"
              style={{ background: color }}
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.02, duration: 0.4 }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-dark-navy text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                {d.value}
              </span>
            </motion.div>
          </div>
          <span className="text-[9px] text-gray-500 font-semibold truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data = [], color = "#1B5E3F", height = 160 }) {
  if (!data.length)
    return <Empty height={height} text="No data for this period" />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 100;
  const h = 100;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => `${i * step},${h - (d.value / max) * h}`)
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <div style={{ height }} className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#lc-grad)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span
            key={i}
            className="text-[9px] text-gray-500 font-semibold"
            style={{
              display: i % Math.ceil(data.length / 7) === 0 ? "block" : "none",
            }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Empty({ height, text }) {
  return (
    <div
      className="flex items-center justify-center text-gray-500 text-xs"
      style={{ height }}
    >
      {text}
    </div>
  );
}
