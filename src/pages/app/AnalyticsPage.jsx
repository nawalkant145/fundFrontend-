import { motion } from "framer-motion";
import {
  HiEye,
  HiHeart,
  HiBookmark,
  HiClock,
  HiArrowUp,
  HiTrendingUp,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { MOCK_PITCHES } from "../../constants/mockData";

export default function AnalyticsPage() {
  const pitch = MOCK_PITCHES[0];
  // Synth chart data — last 7 days
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const views = [120, 230, 410, 580, 380, 720, 890];
  const max = Math.max(...views);

  return (
    <DashboardShell title="Pitch analytics" subtitle={pitch.title}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiEye} label="Total views" value="4,200" trend={12} />
        <StatCard
          icon={HiHeart}
          label="Likes"
          value="312"
          accent="green"
          trend={8}
        />
        <StatCard
          icon={HiBookmark}
          label="Saves"
          value="89"
          accent="blue"
          trend={4}
        />
        <StatCard
          icon={HiClock}
          label="Avg watch time"
          value="48s"
          hint="55% completion"
        />
      </div>

      {/* Views over time chart */}
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Views over time</h3>
            <p className="text-xs text-gray-400">Last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
            <HiArrowUp className="w-4 h-4" />
            +24% vs prior week
          </div>
        </div>
        <div className="flex items-end gap-2 sm:gap-3 h-36 sm:h-48">
          {views.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  className="w-full bg-gradient-to-t from-gold to-bright-gold rounded-t-lg relative group cursor-pointer"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-dark-bg px-2 py-1 rounded">
                    {v}
                  </span>
                </motion.div>
              </div>
              <span className="text-xs text-gray-400 font-semibold">
                {days[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Watch retention */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-1">
            Watch retention
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            % of investors still watching at each second
          </p>
          <div className="space-y-3">
            <RetentionBar label="0–10s" value={100} />
            <RetentionBar label="10–30s" value={86} />
            <RetentionBar label="30–60s" value={68} />
            <RetentionBar label="60s+" value={55} />
            <RetentionBar label="Full pitch" value={42} />
          </div>
        </div>

        {/* Audience breakdown */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-1">
            Top investor industries
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Where your viewers focus their investments
          </p>
          <div className="space-y-3">
            <IndustryBar industry="HealthTech" pct={42} />
            <IndustryBar industry="DeepTech" pct={26} />
            <IndustryBar industry="Climate" pct={18} />
            <IndustryBar industry="AI / ML" pct={14} />
          </div>
        </div>
      </div>

      {/* Trending banner */}
      <motion.div
        className="mt-6 p-5 bg-gradient-to-br from-gold/15 to-primary-green/10 border-2 border-gold/30 rounded-2xl flex items-center gap-4"
        whileHover={{ y: -2 }}
      >
        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
          <HiTrendingUp className="w-6 h-6 text-gold" />
        </div>
        <div>
          <p className="font-bold">Your pitch is trending in HealthTech</p>
          <p className="text-sm text-gray-300">
            Currently #4 in the category for the past 7 days.
          </p>
        </div>
      </motion.div>
    </DashboardShell>
  );
}

function RetentionBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 font-semibold">{label}</span>
        <span className="text-gold font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-bright-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function IndustryBar({ industry, pct }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 font-semibold">{industry}</span>
        <span className="text-primary-green font-bold">{pct}%</span>
      </div>
      <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-green to-secondary-green rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}
