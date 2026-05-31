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
} from "react-icons/hi";
import { CURRENT_USER, MOCK_NOTIFICATIONS } from "../../constants/mockData";

/**
 * Instagram-style mobile bottom tab bar.
 * Fixed at the bottom, 5 most-used items + avatar.
 */
const FOUNDER_TABS = [
  { to: "/app", label: "Home", icon: HiHome, end: true },
  { to: "/app/upload", label: "Upload", icon: HiUpload },
  { to: "/app/my-pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/app/messages", label: "Chats", icon: HiChatAlt2 },
];

const INVESTOR_TABS = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  { to: "/app/saved", label: "Saved", icon: HiHeart },
  { to: "/app/messages", label: "Chats", icon: HiChatAlt2 },
];

const ADMIN_TABS = [
  { to: "/admin", label: "Stats", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/kyc", label: "KYC", icon: HiShieldCheck },
];

export default function BottomBar({ mode }) {
  const location = useLocation();
  const role = mode || CURRENT_USER.role;
  const tabs =
    role === "investor"
      ? INVESTOR_TABS
      : role === "admin"
        ? ADMIN_TABS
        : FOUNDER_TABS;

  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  const isActive = (tab) =>
    tab.end
      ? location.pathname === tab.to
      : location.pathname === tab.to ||
        location.pathname.startsWith(tab.to + "/");

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-xl border-t border-gold/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => (
          <TabButton key={tab.to} {...tab} active={isActive(tab)} />
        ))}
        <TabButton
          to={role === "admin" ? "/admin/audit" : "/app/notifications"}
          label="Alerts"
          icon={role === "admin" ? HiClipboardList : HiBell}
          active={
            location.pathname.endsWith("/notifications") ||
            location.pathname.endsWith("/audit")
          }
          badge={role === "admin" ? 0 : unread}
        />
        <Link
          to="/app/profile"
          className="flex items-center justify-center w-14 h-full"
        >
          <img
            src={CURRENT_USER.avatar}
            alt="Profile"
            className={`w-7 h-7 rounded-full object-cover border-2 transition-all ${
              location.pathname === "/app/profile"
                ? "border-gold scale-110"
                : "border-transparent"
            }`}
          />
        </Link>
      </div>
    </nav>
  );
}

function TabButton({ to, icon: Icon, active, badge }) {
  return (
    <Link
      to={to}
      className="relative flex items-center justify-center w-14 h-full"
    >
      <motion.div whileTap={{ scale: 0.85 }} className="relative">
        <Icon
          className={`w-7 h-7 transition-all ${
            active
              ? "text-gold drop-shadow-[0_0_8px_rgba(245,185,66,0.5)]"
              : "text-white"
          }`}
        />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}
