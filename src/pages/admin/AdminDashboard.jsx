import { useEffect, useState } from "react";
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
import { BarChart, LineChart } from "../../components/dashboard/MiniChart";
import { adminService } from "../../services/adminService";
import { formatINR } from "../../constants/mockData";

const EMPTY_STATS = {
  users: { total: 0, founders: 0, investors: 0, banned: 0, newToday: 0 },
  videos: {
    total: 0,
    active: 0,
    processing: 0,
    expired: 0,
    rejected: 0,
    pendingReview: 0,
  },
  pending: { documents: 0, reports: 0 },
  investments: { total: 0, completed: 0, totalAmount: 0 },
  calls: { active: 0, total7d: 0 },
  chats: { active: 0, messages24h: 0 },
};

export default function AdminDashboard() {
  const [s, setS] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        if (data?.users) setS({ ...EMPTY_STATS, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

                                 
  useEffect(() => {
    adminService
      .getStats({ days })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setStats(data);
      })
      .catch(() => setStats(null));
  }, [days]);

                                                          
  const fmtLabel = (d) => {
                        
    const parts = String(d).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
  };
  const userGrowth = (stats?.userGrowth || []).map((g) => ({
    label: fmtLabel(g._id),
    value: (g.founders || 0) + (g.investors || 0),
  }));
  const videoUploads = (stats?.videoUploads || []).map((v) => ({
    label: fmtLabel(v._id),
    value: v.count || 0,
  }));
  const investmentAmounts = (stats?.investmentAmounts || []).map((i) => ({
    label: fmtLabel(i._id),
    value: Math.round((i.amount || 0) / 1000),        
  }));

  return (
    <DashboardShell
      mode="admin"
      title="Admin dashboard"
      subtitle="Platform health at a glance."
    >
      {loading && (
        <div className="flex items-center justify-center py-6 mb-2">
          <div className="w-7 h-7 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiUsers}
          label="Total users"
          value={(s.users.total || 0).toLocaleString()}
          hint={`+${s.users.newToday || 0} today`}
        />
        <StatCard
          icon={HiVideoCamera}
          label="Active pitches"
          value={(s.videos.active || 0).toLocaleString()}
          accent="green"
        />
        <StatCard
          icon={HiCurrencyDollar}
          label="Total invested"
          value={formatINR(s.investments.totalAmount || 0)}
          accent="gold"
        />
        <StatCard
          icon={HiShieldCheck}
          label="KYC pending"
          value={s.pending.documents || 0}
          accent="red"
          hint="awaiting review"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {                     }
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Users breakdown</h3>
          <div className="space-y-3">
            <Bar
              label="Founders"
              value={s.users.founders || 0}
              max={s.users.total || 1}
              accent="gold"
            />
            <Bar
              label="Investors"
              value={s.users.investors || 0}
              max={s.users.total || 1}
              accent="green"
            />
            <Bar
              label="Banned"
              value={s.users.banned || 0}
              max={s.users.total || 1}
              accent="red"
            />
          </div>
        </div>

        {                       }
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Pitches</h3>
          <div className="space-y-3">
            <Bar
              label="Active"
              value={s.videos.active || 0}
              max={s.videos.total || 1}
              accent="green"
            />
            <Bar
              label="Processing"
              value={s.videos.processing || 0}
              max={s.videos.total || 1}
              accent="blue"
            />
            <Bar
              label="Expired"
              value={s.videos.expired || 0}
              max={s.videos.total || 1}
              accent="gold"
            />
            <Bar
              label="Rejected"
              value={s.videos.rejected || 0}
              max={s.videos.total || 1}
              accent="red"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniLive
          icon={HiPhone}
          label="Active calls"
          value={s.calls.active || 0}
          accent="green"
        />
        <MiniLive
          icon={HiChatAlt2}
          label="Active chats"
          value={(s.chats.active || 0).toLocaleString()}
          accent="gold"
        />
        <MiniLive
          icon={HiFlag}
          label="Open reports"
          value={s.pending.reports || 0}
          accent="red"
        />
        <MiniLive
          icon={HiVideoCamera}
          label="Pitches in review"
          value={s.videos.pendingReview || 0}
          accent="blue"
        />
      </div>

      {                              }
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold">Trends</h3>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  days === d
                    ? "bg-gold text-dark-navy"
                    : "bg-dark-bg/60 text-gray-300 border border-gold/20 hover:border-gold/50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <ChartCard
            title="User growth"
            subtitle={`New signups · last ${days}d`}
          >
            <LineChart data={userGrowth} color="#1B5E3F" />
          </ChartCard>
          <ChartCard title="Pitch uploads" subtitle={`Per day · last ${days}d`}>
            <BarChart data={videoUploads} color="#F5B942" />
          </ChartCard>
          <ChartCard
            title="Investment volume"
            subtitle={`In ₹K · last ${days}d`}
          >
            <BarChart data={investmentAmounts} color="#2D7A4F" />
          </ChartCard>
        </div>
      </div>
    </DashboardShell>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5">
      <h4 className="text-sm font-bold">{title}</h4>
      <p className="text-xs text-gray-400 mb-4">{subtitle}</p>
      {children}
    </div>
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
