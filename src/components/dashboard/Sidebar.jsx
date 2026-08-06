import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiUpload,
  HiVideoCamera,
  HiChartBar,
  HiHeart,
  HiChatAlt2,
  HiBell,
  HiCog,
  HiCurrencyDollar,
  HiShieldCheck,
  HiUsers,
  HiClipboardList,
  HiFlag,
  HiLogout,
  HiSearch,
  HiDocumentText,
  HiSparkles,
  HiCollection,
  HiPlay,
  HiBookmark,
  HiTrash,
  HiAcademicCap,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { isPro } from "../../lib/auth";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useUploadModal } from "../../context/UploadModalContext";

const founderNav = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/studio", label: "My Studio", icon: HiCollection },
  { to: "/app/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Studio Pro", icon: HiSparkles },
];

const investorNav = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/pitch", label: "Pitch", icon: HiPlay },
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  // { to: "/app/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/app/saved", label: "Saved", icon: HiBookmark },
  { to: "/app/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Investor Pro", icon: HiSparkles },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/kyc", label: "KYC Queue", icon: HiShieldCheck },
  { to: "/admin/moderation", label: "Moderation", icon: HiSparkles },
  { to: "/admin/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/admin/reports", label: "Reports", icon: HiFlag },
  { to: "/admin/audit", label: "Audit Log", icon: HiClipboardList },
  { to: "/admin/trash", label: "Trash", icon: HiTrash },
  { to: "/admin/broadcast", label: "Broadcast", icon: HiBell },
  { to: "/admin/settings", label: "Settings", icon: HiCog },
];

/**
 * Instagram-style desktop sidebar — light theme:
 *   - Collapsed (72px) by default, expands to 240px on hover
 *   - Labels fade in on expand
 *   - Sidebar OVERLAYS content during hover — main area doesn't shift
 */
export default function Sidebar({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { openPitchModal } = useUploadModal();
  const role = mode || user?.role || "founder";
  const items =
    role === "investor"
      ? investorNav
      : role === "admin"
        ? adminNav
        : founderNav;

  const unread = unreadCount;

  const isActive = (item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
        location.pathname.startsWith(item.to + "/");

  return (
    <aside className="hidden md:flex group fixed top-0 left-0 z-50 h-screen w-[72px] hover:w-60 transition-[width] duration-200 ease-out bg-white border-r border-[#1B5E3F]/12 flex-col overflow-hidden shadow-[2px_0_24px_rgba(15,74,46,0.04)]">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center h-16 px-3 border-b border-[#1B5E3F]/10 flex-shrink-0"
      >
        <img
          src="/Logobgremove.jpeg"
          alt="EXPGLO"
          className="h-10 w-10 flex-shrink-0 object-contain mix-blend-multiply"
        />
        <span className="ml-3 font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap text-[#0F4A2E]">
          EXPGLO FUND
        </span>
      </Link>

      {/* Profile chip */}
      <Link
        to="/app/profile"
        className="flex items-center h-16 px-3 border-b border-[#1B5E3F]/10 hover:bg-[#FAFAF7] transition-colors flex-shrink-0"
      >
        <div className="relative flex-shrink-0">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=80`
            }
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-full ring-2 ring-[#1B5E3F]/20 object-cover"
          />
          {user?.isVerified && (
            <MdVerified className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-[#F5B942] bg-white rounded-full" />
          )}
        </div>
        <div className="ml-3 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <p className="font-bold text-sm truncate text-[#0A1F14] inline-flex items-center gap-1.5">
            {user?.name || "User"}
            {isPro() && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-br from-[#F5B942] to-[#FFD166] text-[#0F4A2E] text-[8px] font-black uppercase tracking-wider rounded-full">
                <HiSparkles className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </p>
          <p className="text-xs text-[#0A1F14]/55 capitalize truncate">
            {role}
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto sidebar-scroll">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
            badge={item.to.endsWith("/notifications") ? unread : 0}
            onClick={item.to === "/app/upload" ? openPitchModal : undefined}
          />
        ))}
      </nav>

      {/* Bottom — Settings + Logout */}
      <div className="border-t border-[#1B5E3F]/10 px-3 py-3 space-y-1 flex-shrink-0">
        {role !== "admin" && (
          <NavLink
            to="/app/settings"
            label="Settings"
            icon={HiCog}
            active={location.pathname === "/app/settings"}
          />
        )}
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="w-full flex items-center h-12 rounded-xl text-[#0A1F14]/65 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <HiLogout className="w-6 h-6 flex-shrink-0 mx-3" />
          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap text-sm font-semibold">
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({ to, label, icon: Icon, active, badge, onClick }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`flex items-center h-12 rounded-xl transition-colors relative ${
        active
          ? "bg-[#1B5E3F]/10 text-[#0F4A2E]"
          : "text-[#0A1F14]/70 hover:bg-[#FAFAF7] hover:text-[#0F4A2E]"
      }`}
    >
      <div className="relative mx-3 flex-shrink-0">
        <Icon className="w-6 h-6" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5B942] text-[#0F4A2E] text-[9px] font-black rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap text-sm font-semibold">
        {label}
      </span>
    </Link>
  );
}
