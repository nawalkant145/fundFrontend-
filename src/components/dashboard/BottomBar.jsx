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
  HiAcademicCap,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

/**
 * Mobile bottom navigation bar.
 * 6 slots: 5 tab buttons + profile avatar button.
 * Uses flexible equal-width layout with icon + label.
 */
const FOUNDER_TABS = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2, center: true },
];

const INVESTOR_TABS = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/saved", label: "Saved", icon: HiBookmark },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2, center: true },
];

const ADMIN_TABS = [
  { to: "/admin", label: "Stats", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/courses", label: "Courses", icon: HiAcademicCap },
];

const GUEST_TABS = [
  { to: "/", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2, center: true },
];

export default function BottomBar({ mode }) {
  const location = useLocation();
  const { user } = useAuth();
  const role = mode || user?.role || (user ? "founder" : "guest");
  const tabs =
    role === "investor"
      ? INVESTOR_TABS
      : role === "admin"
        ? ADMIN_TABS
        : role === "guest"
          ? GUEST_TABS
          : FOUNDER_TABS;

  const unread = useNotifications().unreadCount;

  // Immersive routes — the swipeable Pitch player. Here the bar floats as a
  // translucent dark overlay on top of the video, exactly like Instagram
  // Reels on mobile web.
  const immersive =
    location.pathname === "/app/pitch" || location.pathname === "/app/feed";

  const isActive = (tab) => {
    if (tab.to && tab.to.includes("courses")) {
      return (
        location.pathname === "/courses" ||
        location.pathname.startsWith("/courses/") ||
        location.pathname === "/app/courses" ||
        location.pathname.startsWith("/app/courses/") ||
        location.pathname === "/admin/courses" ||
        location.pathname.startsWith("/admin/courses/")
      );
    }
    return tab.end
      ? location.pathname === tab.to
      : location.pathname === tab.to ||
        location.pathname.startsWith(tab.to + "/");
  };

  return (
    <nav
      data-bottombar
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 w-full max-w-full ${
        immersive
          ? "bg-black border-t border-white/10 shadow-2xl"
          : "bg-white/90 backdrop-blur-xl border-t border-[#1B5E3F]/8 shadow-[0_-4px_24px_rgba(15,74,46,0.04)]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex items-center justify-between h-14 px-1 w-full max-w-full">
        {tabs.map((tab) => (
          <TabButton
            key={tab.to}
            {...tab}
            active={isActive(tab)}
            immersive={immersive}
            badge={tab.center ? unread : 0}
          />
        ))}
        <ProfileButton
          user={user}
          active={location.pathname === "/app/profile"}
          immersive={immersive}
        />
      </div>
    </nav>
  );
}

function TabButton({ to, label, icon: Icon, active, badge, immersive, center }) {
  return (
    <Link
      to={to}
      className="flex-1 flex flex-col items-center justify-center h-full min-w-0 px-0.5"
    >
      <motion.div whileTap={{ scale: 0.85 }} className="relative flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <Icon
            className={`transition-all ${center ? "w-5.5 h-5.5" : "w-5 h-5"} ${
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
            <span className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-1 bg-[#F5B942] text-[#0F4A2E] text-[8px] font-black rounded-full flex items-center justify-center">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-medium leading-none mt-1 truncate max-w-full transition-colors ${
            immersive
              ? active
                ? "text-white font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                : "text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              : active
                ? "text-[#1B5E3F] font-bold"
                : "text-[#0A1F14]/55"
          }`}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

function ProfileButton({ user, active, immersive }) {
  const profileTo = user ? "/app/profile" : "/login";
  return (
    <Link
      to={profileTo}
      className="flex-1 flex flex-col items-center justify-center h-full min-w-0 px-0.5"
    >
      <motion.div whileTap={{ scale: 0.85 }} className="relative flex flex-col items-center justify-center">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=56`
          }
          alt="Profile"
          className={`w-5 h-5 rounded-full object-cover ring-2 transition-all ${
            active
              ? immersive
                ? "ring-white scale-105"
                : "ring-[#1B5E3F] scale-105"
              : "ring-transparent"
          }`}
        />
        <span
          className={`text-[10px] font-medium leading-none mt-1 truncate max-w-full transition-colors ${
            immersive
              ? active
                ? "text-white font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                : "text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              : active
                ? "text-[#1B5E3F] font-bold"
                : "text-[#0A1F14]/55"
          }`}
        >
          Profile
        </span>
      </motion.div>
    </Link>
  );
}

