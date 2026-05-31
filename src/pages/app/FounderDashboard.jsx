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
import StatCard from "../../components/dashboard/StatCard";
import {
  CURRENT_USER,
  MOCK_PITCHES,
  formatINR,
} from "../../constants/mockData";

export default function FounderDashboard() {
  const myPitch = MOCK_PITCHES[0];

  return (
    <DashboardShell
      title={`Welcome back, ${CURRENT_USER.name.split(" ")[0]}`}
      subtitle="Here's what's happening with your pitch today."
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiEye}
          label="Total views"
          value="4,200"
          accent="gold"
          trend={12}
        />
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
          icon={HiCurrencyDollar}
          label="Active deals"
          value="3"
          accent="gold"
          hint="₹17.5L proposed"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Active pitch */}
        <motion.div
          className="lg:col-span-2 bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Your Active Pitch</h3>
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full">
              ● Live
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={myPitch.thumbnailUrl}
              alt={myPitch.title}
              className="w-full sm:w-48 h-32 sm:h-48 object-cover rounded-xl border border-gold/15"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold mb-1">{myPitch.title}</h4>
              <p className="text-sm text-gray-400 mb-4">
                {myPitch.description}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <MiniStat label="Asking" value={formatINR(myPitch.askAmount)} />
                <MiniStat label="Equity" value={`${myPitch.equityOffered}%`} />
                <MiniStat label="Stage" value={myPitch.fundingStage} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link to="/app/analytics">
                  <motion.button
                    className="px-4 py-2 bg-gold text-dark-navy text-sm font-bold rounded-lg flex items-center gap-1"
                    whileHover={{ scale: 1.03 }}
                  >
                    Analytics <HiArrowRight />
                  </motion.button>
                </Link>
                <Link to="/app/my-pitches">
                  <motion.button
                    className="px-4 py-2 border-2 border-gold/30 hover:border-gold text-sm font-bold rounded-lg"
                    whileHover={{ scale: 1.03 }}
                  >
                    Edit
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <MdVerified className="w-6 h-6 text-gold" />
            Verification
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Level {CURRENT_USER.verificationLevel} of 3
          </p>
          <div className="space-y-3">
            <VerifyRow done label="Email verified" />
            <VerifyRow done label="Phone verified" />
            <VerifyRow done label="KYC approved" />
          </div>
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <MdVerified className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">
              Verified Founder
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Quick actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/app/upload"
            icon={HiUpload}
            label="Upload new pitch"
            accent="gold"
          />
          <QuickAction
            to="/app/messages"
            icon={HiChatAlt2}
            label="Reply to investors"
            accent="green"
            badge="2"
          />
          <QuickAction
            to="/app/deals"
            icon={HiCurrencyDollar}
            label="Manage deals"
            accent="gold"
            badge="3"
          />
          <QuickAction
            to="/app/analytics"
            icon={HiTrendingUp}
            label="View analytics"
            accent="green"
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Recent activity</h3>
        <div className="space-y-3">
          <ActivityRow
            icon={HiHeart}
            text="Vikram Patel liked your pitch"
            time="2 min ago"
            accent="gold"
          />
          <ActivityRow
            icon={HiCurrencyDollar}
            text="Meera Kapoor expressed interest — ₹50L"
            time="1 hr ago"
            accent="green"
          />
          <ActivityRow
            icon={HiUserGroup}
            text="3 investors viewed your profile"
            time="3 hr ago"
            accent="gold"
          />
          <ActivityRow
            icon={HiBookmark}
            text="2 investors saved your pitch"
            time="Yesterday"
            accent="green"
          />
          <ActivityRow
            icon={HiChatAlt2}
            text="New comment on your pitch"
            time="2 days ago"
            accent="gold"
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-dark-bg/40 rounded-lg p-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold capitalize">{value}</p>
    </div>
  );
}

function VerifyRow({ label, done }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
          done ? "bg-emerald-500/20" : "bg-gray-700/40"
        }`}
      >
        {done ? (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-500" />
        )}
      </span>
      <span className={done ? "text-gray-300" : "text-gray-500"}>{label}</span>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, accent = "gold", badge }) {
  const accents =
    accent === "gold"
      ? "from-gold/10 to-bright-gold/5 border-gold/30 hover:border-gold text-gold"
      : "from-primary-green/10 to-secondary-green/5 border-primary-green/30 hover:border-primary-green text-primary-green";
  return (
    <Link to={to}>
      <motion.div
        className={`relative p-5 bg-gradient-to-br ${accents} border-2 rounded-2xl transition-all`}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        {badge && (
          <span className="absolute top-3 right-3 w-6 h-6 bg-gold text-dark-navy text-xs font-black rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
        <Icon className="w-7 h-7 mb-3" />
        <p className="text-sm font-bold text-white">{label}</p>
      </motion.div>
    </Link>
  );
}

function ActivityRow({ icon: Icon, text, time, accent = "gold" }) {
  const cls =
    accent === "gold"
      ? "bg-gold/10 text-gold"
      : "bg-primary-green/10 text-primary-green";
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-dark-bg/40 rounded-xl transition-colors">
      <div
        className={`w-9 h-9 rounded-xl ${cls} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
