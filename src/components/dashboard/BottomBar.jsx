import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiHome,
  HiSearch,
  HiHeart,
  HiChatAlt2,
  HiBell,
  HiCurrencyDollar,
  HiUpload,
  HiVideoCamera,
  HiChartBar,
  HiUsers,
  HiShieldCheck,
  HiFlag,
  HiClipboardList,
  HiCollection,
  HiPlay,
  HiBookmark,
} from "react-icons/hi";
import { MOCK_NOTIFICATIONS } from "../../constants/mockData";
import { useAuth } from "../../context/AuthContext";

/**
 * Instagram-style mobile bottom tab bar.
 * 5 slots: 4 tab buttons + profile avatar. Messages sits in the MIDDLE.
 * Notifications live in the sidebar (desktop) and the in-page header bell
 * on mobile — not in the bottom bar.
 */
const FOUNDER_TABS = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2, center: true },
  { to: "/app/studio", label: "Studio", icon: HiCollection },
];

const INVESTOR_TABS = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2, center: true },
  { to: "/app/saved", label: "Saved", icon: HiBookmark },
];

const ADMIN_TABS = [
  { to: "/admin", label: "Stats", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/kyc", label: "KYC", icon: HiShieldCheck },
];

export default function BottomBar({ mode }) {
  const location = useLocation();
  const { user } = useAuth();
  const role = mode || user?.role || "founder";
  const tabs =
    role === "investor"
      ? INVESTOR_TABS
      : role === "admin"
        ? ADMIN_TABS
        : FOUNDER_TABS;

  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  // Immersive routes — the swipeable Pitch player. Here the bar floats as a
  // translucent dark overlay on top of the video, exactly like Instagram
  // Reels on mobile web.
  const immersive =
    location.pathname === "/app/pitch" || location.pathname === "/app/feed";

  const isActive = (tab) =>
    tab.end
      ? location.pathname === tab.to
      : location.pathname === tab.to ||
        location.pathname.startsWith(tab.to + "/");

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${
        immersive
          ? "bg-gradient-to-t from-black/85 to-transparent border-0"
          : "bg-white/90 backdrop-blur-xl border-t border-[#1B5E3F]/8 shadow-[0_-4px_24px_rgba(15,74,46,0.04)]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => (
          <TabButton
            key={tab.to}
            {...tab}
            active={isActive(tab)}
            immersive={immersive}
            badge={tab.center ? unread : 0}
          />
        ))}
        <Link
          to="/app/profile"
          className="flex items-center justify-center w-14 h-full"
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=56`
            }
            alt="Profile"
            className={`w-7 h-7 rounded-full object-cover ring-2 transition-all ${
              location.pathname === "/app/profile"
                ? immersive
                  ? "ring-white scale-110"
                  : "ring-[#1B5E3F] scale-110"
                : "ring-transparent"
            }`}
          />
        </Link>
      </div>
    </nav>
  );
}

function TabButton({ to, icon: Icon, active, badge, immersive, center }) {
  return (
    <Link
      to={to}
      className="relative flex items-center justify-center w-14 h-full"
    >
      <motion.div whileTap={{ scale: 0.85 }} className="relative">
        <Icon
          className={`transition-all ${center ? "w-8 h-8" : "w-7 h-7"} ${
            immersive
              ? active
                ? "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                : "text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              : active
                ? "text-[#1B5E3F]"
                : "text-[#0A1F14]/55"
          }`}
        />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#F5B942] text-[#0F4A2E] text-[9px] font-black rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}
