import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiVideoCamera,
  HiEye,
  HiHeart,
  HiBookmark,
  HiCurrencyDollar,
  HiTrendingUp,
  HiChatAlt2,
  HiUpload,
  HiArrowRight,
  HiUserGroup,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FundingSummaryBar from "../../components/dashboard/FundingSummaryBar";
import StatCard from "../../components/dashboard/StatCard";
import FundingImpactCard from "../../components/dashboard/FundingImpactCard";
import {
  ActiveFundingOpportunitiesCard,
  InvestorActivityCard,
  UpcomingEventsCard,
} from "../../components/dashboard/RightSidebarCards";
import { videoService } from "../../services/videoService";
import { notificationService } from "../../services/notificationService";
import { investmentService } from "../../services/investmentService";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../constants/mockData";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);

  useEffect(() => {
    videoService
      .getMyPitches()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.videos || data || [];
        setPitches(list);
      })
      .catch(() => setPitches([]))
      .finally(() => setLoading(false));

    notificationService
      .list({ limit: 5 })
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.notifications || data || [];
        setActivity(list);
      })
      .catch(() => setActivity([]));

    investmentService
      .getMyDeals()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.deals || data?.investments || data || [];
        setRecentDeals(Array.isArray(list) ? list.slice(0, 3) : []);
      })
      .catch(() => setRecentDeals([]));
  }, []);

                                                     
  const totals = pitches.reduce(
    (acc, p) => {
      acc.views += p.views || 0;
      acc.likes += Array.isArray(p.likes) ? p.likes.length : p.likeCount || 0;
      acc.saves += Array.isArray(p.saves) ? p.saves.length : p.saveCount || 0;
      return acc;
    },
    { views: 0, likes: 0, saves: 0 },
  );

                                                  
  const activePitches = pitches.filter((p) => p.status === "active");
  const activePitch = activePitches[0] || pitches[0] || null;

  const verificationLevel = user?.verificationLevel || 0;

  const formattedActivity = activity.map((n) => ({
    text: n.title || n.body || "New notification",
    time: formatTimeAgo(n.createdAt),
  }));

  const rightSidebarContent = (
    <>
      {                                   }
      <FundingImpactCard />

      {                                     }
      <ActiveFundingOpportunitiesCard />

      {                          }
      <InvestorActivityCard activities={activity} />

      {                        }
      <UpcomingEventsCard />
    </>
  );

  return (
    <DashboardShell
      title={`Welcome back, ${(user?.name || "Founder").split(" ")[0]}`}
      subtitle="Here's what's happening with your startup today."
      rightSidebar={rightSidebarContent}
    >
      {                        }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          icon={HiEye}
          label="Total views"
          value={totals.views.toLocaleString()}
          accent="gold"
        />
        <StatCard
          icon={HiHeart}
          label="Likes"
          value={totals.likes.toLocaleString()}
          accent="green"
        />
        <StatCard
          icon={HiBookmark}
          label="Saves"
          value={totals.saves.toLocaleString()}
          accent="blue"
        />
        <StatCard
          icon={HiVideoCamera}
          label="Pitches"
          value={pitches.length}
          accent="gold"
          hint={activePitches.length > 0 ? `${activePitches.length} live` : "none live"}
        />
      </div>

      {                         }
      <div className="space-y-6">
        {                       }
        <motion.div
          className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0A1F14]">Your Active Pitch</h3>
            {activePitch && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                ● Live
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
            </div>
          ) : !activePitch ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4 text-sm">
                You don't have an active pitch video yet.
              </p>
              <Link to="/app/upload">
                <motion.button
                  className="px-5 py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-sm font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md transition-colors"
                  whileHover={{ scale: 1.03 }}
                >
                  <HiUpload className="w-4 h-4" /> Upload your first pitch
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={activePitch.thumbnailUrl || activePitch.coverUrl}
                alt={activePitch.title}
                className="w-full sm:w-48 h-36 object-cover rounded-xl border border-[#1B5E3F]/15"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-[#0A1F14] mb-1 truncate">
                  {activePitch.title}
                </h4>
                <p className="text-xs text-[#0A1F14]/70 mb-4 line-clamp-2">
                  {activePitch.description}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <MiniStat label="Asking" value={formatINR(activePitch.askAmount)} />
                  <MiniStat label="Equity" value={`${activePitch.equityOffered}%`} />
                  <MiniStat label="Stage" value={activePitch.fundingStage || "N/A"} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/app/analytics">
                    <motion.button
                      className="px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      Analytics <HiArrowRight />
                    </motion.button>
                  </Link>
                  <Link to="/app/studio">
                    <motion.button
                      className="px-4 py-2 border border-[#1B5E3F]/30 hover:border-[#1B5E3F] text-[#0F4A2E] text-xs font-bold rounded-xl transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      Edit Studio
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {                                                    }
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0A1F14] flex items-center gap-2">
              <HiCurrencyDollar className="w-5 h-5 text-[#1B5E3F]" />
              Recent Investors & Funded Deals
            </h3>
            <Link
              to="/app/deals"
              className="text-xs font-bold text-[#1B5E3F] hover:underline inline-flex items-center gap-1"
            >
              View All Deals <HiArrowRight />
            </Link>
          </div>

          {recentDeals.length === 0 ? (
            <p className="text-xs text-[#0A1F14]/60 py-3 text-center">
              No recent deal activity. Completed deals will be summarized here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentDeals.map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between p-3 bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-xl flex-wrap gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        d.investorId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(d.investorId?.name || "Investor")}&background=1B5E3F&color=fff`
                      }
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-[#1B5E3F]/20"
                    />
                    <div>
                      <p className="font-bold text-[#0A1F14] flex items-center gap-1">
                        {d.investorId?.name || "Investor"}
                        <MdVerified className="w-3.5 h-3.5 text-[#F5B942]" />
                      </p>
                      <p className="text-[10px] text-[#0A1F14]/60">
                        {formatINR(d.amount)} • {d.equity ?? 0}% Equity • Series A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      {d.status === "paid" ? "Funded" : d.stage}
                    </span>
                    <Link to={`/app/deals?dealId=${d._id}`}>
                      <button className="px-2.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px]">
                        View Deal →
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {                   }
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0A1F14] mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction
              to="/app/upload"
              icon={HiUpload}
              label="Upload pitch"
              accent="gold"
            />
            <QuickAction
              to="/app/messages"
              icon={HiChatAlt2}
              label="Messages"
              accent="green"
            />
            <QuickAction
              to="/app/deals"
              icon={HiCurrencyDollar}
              label="Deals"
              accent="gold"
            />
            <QuickAction
              to="/app/analytics"
              icon={HiTrendingUp}
              label="Analytics"
              accent="green"
            />
          </div>
        </div>

        {                                   }
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#0A1F14] flex items-center gap-2">
              <MdVerified className="w-5 h-5 text-[#F5B942]" />
              Founder Verification Status
            </h3>
            <span className="text-xs font-semibold text-[#0A1F14]/60">
              Level {verificationLevel} of 3
            </span>
          </div>
          <div className="space-y-2.5">
            <VerifyRow done={!!user?.isEmailVerified} label="Email verified" />
            <VerifyRow done={verificationLevel >= 2} label="Phone verified" />
            <VerifyRow done={verificationLevel >= 3} label="KYC & Business approved" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-lg p-2">
      <p className="text-[10px] text-[#0A1F14]/50">{label}</p>
      <p className="text-xs font-bold text-[#0A1F14] capitalize truncate">{value}</p>
    </div>
  );
}

function VerifyRow({ label, done }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span
        className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
          done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-[#0A1F14] font-medium" : "text-[#0A1F14]/50"}>
        {label}
      </span>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, accent = "gold" }) {
  const accents =
    accent === "gold"
      ? "bg-amber-50/50 hover:bg-amber-50 border-amber-200/60 text-[#0F4A2E]"
      : "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/60 text-[#0F4A2E]";

  return (
    <Link to={to}>
      <motion.div
        className={`p-3.5 border rounded-xl transition-all ${accents}`}
        whileHover={{ y: -2 }}
      >
        <Icon className="w-5 h-5 mb-2 text-[#1B5E3F]" />
        <p className="text-xs font-bold truncate">{label}</p>
      </motion.div>
    </Link>
  );
}
