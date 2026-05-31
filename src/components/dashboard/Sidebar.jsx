import { Link, useLocation } from "react-router-dom";
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
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { CURRENT_USER, MOCK_NOTIFICATIONS } from "../../constants/mockData";
import { clearAuth } from "../../lib/auth";

const founderNav = [
  { to: "/app", label: "Dashboard", icon: HiHome, end: true },
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/my-pitches", label: "My Pitches", icon: HiVideoCamera },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/deck-requests", label: "Deck Requests", icon: HiDocumentText },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
];

const investorNav = [
  { to: "/app", label: "Feed", icon: HiHome, end: true },
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  { to: "/app/saved", label: "Saved", icon: HiHeart },
  { to: "/app/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/app/messages", label: "Messages", icon: HiChatAlt2 },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: HiHome, end: true },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/pitches", label: "Pitches", icon: HiVideoCamera },
  { to: "/admin/kyc", label: "KYC Queue", icon: HiShieldCheck },
  { to: "/admin/reports", label: "Reports", icon: HiFlag },
  { to: "/admin/audit", label: "Audit Log", icon: HiClipboardList },
];

/**
 * Instagram-style desktop sidebar:
 *   - Hidden on mobile (< md)
 *   - Collapsed (72px) by default, expands to 240px on hover
 *   - Labels fade in on expand
 *   - Sidebar OVERLAYS content during hover — main area doesn't shift
 */
export default function Sidebar({ mode }) {
  const location = useLocation();
  const role = mode || CURRENT_USER.role;
  const items =
    role === "investor"
      ? investorNav
      : role === "admin"
        ? adminNav
        : founderNav;

  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  const isActive = (item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
        location.pathname.startsWith(item.to + "/");

  return (
    <aside className="hidden md:flex group fixed top-0 left-0 z-50 h-screen w-[72px] hover:w-60 transition-[width] duration-200 ease-out bg-dark-bg/95 backdrop-blur-xl border-r border-gold/10 flex-col overflow-hidden">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center h-16 px-3 border-b border-gold/10 flex-shrink-0"
      >
        <img
          src="/Logobgremove.jpeg"
          alt="EXPGLO"
          className="h-10 w-10 flex-shrink-0 object-contain drop-shadow-[0_0_8px_rgba(245,185,66,0.3)]"
        />
        <span className="ml-3 font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
          EXPGLO FUND
        </span>
      </Link>

      {/* Profile chip */}
      <Link
        to="/app/profile"
        className="flex items-center h-16 px-3 border-b border-gold/10 hover:bg-card-bg/40 transition-colors flex-shrink-0"
      >
        <div className="relative flex-shrink-0">
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            className="w-10 h-10 rounded-full border-2 border-gold/40 object-cover"
          />
          {CURRENT_USER.isVerified && (
            <MdVerified className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-gold bg-dark-bg rounded-full" />
          )}
        </div>
        <div className="ml-3 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <p className="font-bold text-sm truncate">{CURRENT_USER.name}</p>
          <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
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
          />
        ))}
      </nav>

      {/* Bottom — Settings + Logout */}
      <div className="border-t border-gold/10 px-3 py-3 space-y-1 flex-shrink-0">
        {role !== "admin" && (
          <NavLink
            to="/app/settings"
            label="Settings"
            icon={HiCog}
            active={location.pathname === "/app/settings"}
          />
        )}
        <Link
          to="/login"
          onClick={() => clearAuth()}
          className="flex items-center h-12 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <HiLogout className="w-6 h-6 flex-shrink-0 mx-3" />
          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap text-sm font-semibold">
            Log out
          </span>
        </Link>
      </div>
    </aside>
  );
}

function NavLink({ to, label, icon: Icon, active, badge }) {
  return (
    <Link
      to={to}
      className={`flex items-center h-12 rounded-xl transition-colors relative ${
        active
          ? "bg-gold/10 text-gold"
          : "text-gray-300 hover:bg-card-bg hover:text-white"
      }`}
    >
      <div className="relative mx-3 flex-shrink-0">
        <Icon className="w-6 h-6" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-dark-navy text-[9px] font-black rounded-full flex items-center justify-center">
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
