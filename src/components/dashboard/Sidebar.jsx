import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiHome,
  HiUpload,
  HiVideoCamera,
  HiChartBar,
  HiHeart,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiCog,
  HiCurrencyDollar,
  HiShieldCheck,
  HiUsers,
  HiClipboardList,
  HiFlag,
  HiLogout,
  HiX,
  HiSearch,
  HiDocumentText,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { CURRENT_USER } from "../../constants/mockData";
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
  { to: "/app/saved", label: "Saved Pitches", icon: HiHeart },
  { to: "/app/investments", label: "My Investments", icon: HiCurrencyDollar },
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

const bottomNav = [
  { to: "/app/profile", label: "Profile", icon: HiUser },
  { to: "/app/settings", label: "Settings", icon: HiCog },
];

export default function Sidebar({ open, onClose, mode = "founder" }) {
  const location = useLocation();
  const navItems =
    mode === "investor"
      ? investorNav
      : mode === "admin"
        ? adminNav
        : founderNav;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-dark-bg border-r border-gold/10 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gold/10">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/Logobgremove.jpeg"
                alt="EXPGLO FUND"
                className="h-10 w-auto drop-shadow-[0_0_8px_rgba(245,185,66,0.3)]"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white p-2"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* User */}
          <div className="p-4 border-b border-gold/10">
            <Link
              to="/app/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-card-bg transition-colors"
            >
              <div className="relative">
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-gold/40"
                />
                {CURRENT_USER.isVerified && (
                  <MdVerified className="absolute -bottom-1 -right-1 w-5 h-5 text-gold bg-dark-bg rounded-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">
                  {CURRENT_USER.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{mode}</p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                active={
                  item.end
                    ? location.pathname === item.to
                    : location.pathname === item.to ||
                      location.pathname.startsWith(item.to + "/")
                }
              />
            ))}

            {mode !== "admin" && (
              <>
                <div className="h-px bg-gold/10 my-4" />
                {bottomNav.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    active={location.pathname === item.to}
                  />
                ))}
              </>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gold/10">
            <Link
              to="/login"
              onClick={() => clearAuth()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-semibold"
            >
              <HiLogout className="w-5 h-5" />
              Log out
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
        active
          ? "bg-gold/10 text-gold"
          : "text-gray-400 hover:bg-card-bg hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-pill"
          className="absolute left-0 top-2 bottom-2 w-1 bg-gold rounded-r"
        />
      )}
      <Icon className="w-5 h-5 flex-shrink-0" />
      {label}
    </Link>
  );
}
