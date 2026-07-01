import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiEye,
  HiHeart,
  HiBookmark,
  HiClock,
  HiTrendingUp,
  HiVideoCamera,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { videoService } from "../../services/videoService";

export default function AnalyticsPage() {
  const [pitches, setPitches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load the founder's pitches and auto-select the first
  useEffect(() => {
    videoService
      .getMyPitches()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.videos || data || [];
        setPitches(list);
        if (list.length > 0) setSelectedId(list[0]._id);
      })
      .catch(() => setPitches([]))
      .finally(() => setLoading(false));
  }, []);

  // Load analytics for the selected pitch
  useEffect(() => {
    if (!selectedId) return;
    setLoadingAnalytics(true);
    videoService
      .getAnalytics(selectedId)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setAnalytics(data);
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false));
  }, [selectedId]);

  const selectedPitch = pitches.find((p) => p._id === selectedId);

  if (loading) {
    return (
      <DashboardShell title="Pitch analytics">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (pitches.length === 0) {
    return (
      <DashboardShell title="Pitch analytics">
        <div className="text-center py-20">
          <HiVideoCamera className="w-12 h-12 text-gold/40 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No pitches to analyze yet.</p>
          <p className="text-sm text-gray-500">
            Upload a pitch to start seeing analytics here.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const a = analytics || {};
  const completionRate = a.completionRate || 0;
  const avgWatch = a.avgWatchTime || 0;

  return (
    <DashboardShell
      title="Pitch analytics"
      subtitle={selectedPitch?.title || ""}
    >
      {/* Pitch selector (only if more than one) */}
      {pitches.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {pitches.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedId(p._id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                selectedId === p._id
                  ? "bg-gold text-dark-navy border-gold"
                  : "border-gold/20 text-gray-300 hover:border-gold/50"
              }`}
            >
              {p.title?.slice(0, 24) || "Untitled"}
            </button>
          ))}
        </div>
      )}

      {loadingAnalytics && (
        <div className="flex items-center justify-center py-4 mb-2">
          <div className="w-6 h-6 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiEye}
          label="Total views"
          value={(a.totalViews || 0).toLocaleString()}
          hint={`${(a.uniqueViewers || 0).toLocaleString()} unique`}
        />
        <StatCard
          icon={HiHeart}
          label="Likes"
          value={(a.totalLikes || 0).toLocaleString()}
          accent="green"
        />
        <StatCard
          icon={HiBookmark}
          label="Saves"
          value={(a.totalSaves || 0).toLocaleString()}
          accent="blue"
        />
        <StatCard
          icon={HiClock}
          label="Avg watch time"
          value={`${avgWatch}s`}
          hint={`${completionRate}% completion`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Engagement breakdown */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-1">Engagement</h3>
          <p className="text-xs text-gray-400 mb-5">
            How investors interact with this pitch
          </p>
          <div className="space-y-3">
            <MetricBar
              label="Completion rate"
              value={completionRate}
              suffix="%"
            />
            <MetricBar
              label="Like rate"
              value={
                a.totalViews
                  ? Math.round(((a.totalLikes || 0) / a.totalViews) * 100)
                  : 0
              }
              suffix="%"
            />
            <MetricBar
              label="Save rate"
              value={
                a.totalViews
                  ? Math.round(((a.totalSaves || 0) / a.totalViews) * 100)
                  : 0
              }
              suffix="%"
            />
          </div>
        </div>

        {/* Quick numbers */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-1">At a glance</h3>
          <p className="text-xs text-gray-400 mb-5">Raw engagement counts</p>
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Total views" value={a.totalViews || 0} />
            <Tile label="Unique viewers" value={a.uniqueViewers || 0} />
            <Tile label="Likes" value={a.totalLikes || 0} />
            <Tile label="Saves" value={a.totalSaves || 0} />
            <Tile label="Avg watch" value={`${avgWatch}s`} />
            <Tile label="Not interested" value={a.notInterestedCount || 0} />
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <motion.div
        className="mt-6 p-5 bg-gradient-to-br from-gold/15 to-primary-green/10 border-2 border-gold/30 rounded-2xl flex items-center gap-4"
        whileHover={{ y: -2 }}
      >
        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
          <HiTrendingUp className="w-6 h-6 text-gold" />
        </div>
        <div>
          <p className="font-bold">
            {completionRate >= 50
              ? "Strong retention!"
              : "Hook investors faster"}
          </p>
          <p className="text-sm text-gray-300">
            {completionRate >= 50
              ? `${completionRate}% of viewers watch your pitch through. Keep it up.`
              : "Lead with your traction in the first 10 seconds to boost completion."}
          </p>
        </div>
      </motion.div>
    </DashboardShell>
  );
}

function MetricBar({ label, value, suffix = "" }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 font-semibold">{label}</span>
        <span className="text-gold font-bold">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-bright-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="bg-dark-bg/40 rounded-xl p-3">
      <p className="text-lg font-black text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
    </div>
  );
}
