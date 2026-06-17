import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  HiPencilAlt,
  HiGlobe,
  HiOfficeBuilding,
  HiBriefcase,
  HiShieldCheck,
  HiUpload,
  HiChartBar,
  HiCurrencyDollar,
  HiDocumentText,
  HiSearch,
  HiBell,
  HiSparkles,
  HiCog,
  HiLogout,
  HiChevronRight,
} from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useAuth } from "../../context/AuthContext";

// Menu items shown on mobile only (sidebar items that don't fit bottom bar)
const FOUNDER_MENU = [
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/deck-requests", label: "Deck Requests", icon: HiDocumentText },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Studio Pro", icon: HiSparkles },
  { to: "/app/settings", label: "Settings", icon: HiCog },
];

const INVESTOR_MENU = [
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  { to: "/app/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Investor Pro", icon: HiSparkles },
  { to: "/app/settings", label: "Settings", icon: HiCog },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "founder";
  const menu = role === "investor" ? INVESTOR_MENU : FOUNDER_MENU;

  if (!user) return null;

  return (
    <DashboardShell title="My profile">
      {/* Cover + avatar */}
      <div className="relative bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden mb-6">
        <div className="h-28 sm:h-40 bg-gradient-to-br from-[#1B5E3F]/20 via-[#F5B942]/20 to-[#1B5E3F]/10" />
        <div className="px-4 sm:px-5 pb-5 -mt-10 sm:-mt-12">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B5E3F&color=fff&size=200`
            }
            alt={user.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="flex items-end justify-between flex-wrap gap-3 mt-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[#0A1F14]">
                {user.name}
                {user.isVerified && (
                  <MdVerified className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5B942]" />
                )}
              </h2>
              <p className="text-sm text-[#0A1F14]/55">
                @{user.username || "user"} ·{" "}
                <span className="capitalize">{role}</span>
              </p>
              {user.bio && (
                <p className="text-sm text-[#0A1F14]/75 mt-2 max-w-2xl">
                  {user.bio}
                </p>
              )}
            </div>
            <Link to="/app/settings">
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-md shadow-[#1B5E3F]/25"
                whileHover={{ scale: 1.03 }}
              >
                <HiPencilAlt className="w-4 h-4" />
                Edit profile
              </motion.button>
            </Link>
          </div>

          {/* Quick info chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {user.companyName && (
              <Chip icon={HiOfficeBuilding}>{user.companyName}</Chip>
            )}
            {user.industry && <Chip icon={HiBriefcase}>{user.industry}</Chip>}
            {user.fundingStage && (
              <Chip icon={HiShieldCheck}>{user.fundingStage}</Chip>
            )}
            {user.website && <Chip icon={HiGlobe}>{user.website}</Chip>}
            {user.linkedIn && <Chip icon={FaLinkedin}>LinkedIn</Chip>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <MiniStat label="Total views" value={user.totalPitchViews || 0} />
          <MiniStat label="Connections" value={user.followersCount || 0} />
          <MiniStat
            label="Level"
            value={`${user.verificationLevel || 0} / 3`}
          />
        </div>

        {/* Profile completeness */}
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider font-bold text-[#0A1F14]/55 mb-1">
            Profile completeness
          </p>
          <p className="text-3xl font-black text-[#0A1F14] mb-2">
            {user.profileCompleteness || 0}%
          </p>
          <div className="h-2 bg-[#FAFAF7] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1B5E3F] to-[#F5B942]"
              initial={{ width: 0 }}
              animate={{ width: `${user.profileCompleteness || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-[#0A1F14]/55 mt-2">
            {user.profileCompleteness >= 100
              ? "All set!"
              : "Complete your profile for better reach"}
          </p>
        </div>
      </div>

      {/* Mobile-only menu — sidebar items that don't fit the bottom bar */}
      <div className="md:hidden mt-8">
        <h3 className="text-base font-bold mb-3 text-[#0A1F14]">Menu</h3>
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden divide-y divide-[#1B5E3F]/8">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-[#FAFAF7] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#1B5E3F]/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#1B5E3F]" />
              </span>
              <span className="flex-1 font-semibold text-sm text-[#0A1F14]">
                {item.label}
              </span>
              <HiChevronRight className="w-5 h-5 text-[#0A1F14]/35" />
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-red-50 transition-colors w-full"
          >
            <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <HiLogout className="w-5 h-5 text-red-500" />
            </span>
            <span className="flex-1 font-semibold text-sm text-red-500 text-left">
              Log out
            </span>
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-3 sm:p-5 text-center">
      <p className="text-xl sm:text-3xl font-black text-[#0A1F14]">{value}</p>
      <p className="text-[10px] sm:text-xs text-[#0A1F14]/55 mt-1 font-semibold">
        {label}
      </p>
    </div>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-full text-xs font-semibold text-[#0A1F14]/75">
      <Icon className="w-4 h-4 text-[#1B5E3F]" />
      {children}
    </span>
  );
}
