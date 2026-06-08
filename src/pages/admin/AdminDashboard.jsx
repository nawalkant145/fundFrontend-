import { motion } from "framer-motion";
import {
  HiUsers,
  HiVideoCamera,
  HiCurrencyDollar,
  HiShieldCheck,
  HiFlag,
  HiChatAlt2,
  HiPhone,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { MOCK_ADMIN_STATS, formatINR } from "../../constants/mockData";

export default function AdminDashboard() {
  const s = MOCK_ADMIN_STATS;

  return (
    <DashboardShell
      mode="admin"
      title="Admin dashboard"
      subtitle="Platform health at a glance."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiUsers}
          label="Total users"
          value={s.users.total.toLocaleString()}
          hint={`+${s.users.newToday} today`}
          trend={12}
        />
        <StatCard
          icon={HiVideoCamera}
          label="Active pitches"
          value={s.videos.active.toLocaleString()}
          accent="green"
        />
        <StatCard
          icon={HiCurrencyDollar}
          label="Total invested"
          value={formatINR(s.investments.totalAmount)}
          accent="gold"
          trend={8}
        />
        <StatCard
          icon={HiShieldCheck}
          label="KYC pending"
          value={s.pending.documents}
          accent="red"
          hint="awaiting review"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Users breakdown */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Users breakdown</h3>
          <div className="space-y-3">
            <Bar
              label="Founders"
              value={s.users.founders}
              max={s.users.total}
              accent="gold"
            />
            <Bar
              label="Investors"
              value={s.users.investors}
              max={s.users.total}
              accent="green"
            />
            <Bar
              label="Banned"
              value={s.users.banned}
              max={s.users.total}
              accent="red"
            />
          </div>
        </div>

        {/* Pitches breakdown */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Pitches</h3>
          <div className="space-y-3">
            <Bar
              label="Active"
              value={s.videos.active}
              max={s.videos.total}
              accent="green"
            />
            <Bar
              label="Processing"
              value={s.videos.processing}
              max={s.videos.total}
              accent="blue"
            />
            <Bar
              label="Expired"
              value={s.videos.expired}
              max={s.videos.total}
              accent="gold"
            />
            <Bar
              label="Rejected"
              value={s.videos.rejected}
              max={s.videos.total}
              accent="red"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniLive
          icon={HiPhone}
          label="Active calls"
          value={s.calls.active}
          accent="green"
        />
        <MiniLive
          icon={HiChatAlt2}
          label="Active chats"
          value={s.chats.active.toLocaleString()}
          accent="gold"
        />
        <MiniLive
          icon={HiFlag}
          label="Open reports"
          value={s.pending.reports}
          accent="red"
        />
        <MiniLive
          icon={HiVideoCamera}
          label="Pitches in review"
          value={s.videos.pendingReview}
          accent="blue"
        />
      </div>
    </DashboardShell>
  );
}

function Bar({ label, value, max, accent = "gold" }) {
  const colors = {
    gold: "from-gold to-bright-gold",
    green: "from-primary-green to-secondary-green",
    red: "from-red-500 to-red-400",
    blue: "from-secondary-green to-primary-green",
  };
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 font-semibold">{label}</span>
        <span className="text-white font-bold">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[accent]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function MiniLive({ icon: Icon, label, value, accent }) {
  const accents =
    {
      gold: "border-gold/20 text-gold",
      green: "border-primary-green/20 text-primary-green",
      red: "border-red-500/20 text-red-400",
      blue: "border-secondary-green/30 text-secondary-green",
    }[accent] || "border-gold/20 text-gold";
  return (
    <motion.div
      className={`bg-card-bg/60 border-2 ${accents} rounded-2xl p-5`}
      whileHover={{ y: -3 }}
    >
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
    </motion.div>
  );
}
