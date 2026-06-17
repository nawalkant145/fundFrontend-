import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiMenu, HiSearch, HiBell } from "react-icons/hi";
import { MOCK_NOTIFICATIONS } from "../../constants/mockData";
import { useAuth } from "../../context/AuthContext";

export default function TopBar({ onMenuClick, title, subtitle }) {
  const { user } = useAuth();
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-[#1B5E3F]/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[#0A1F14]/65 hover:text-[#1B5E3F] p-2 -ml-2"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            {title && (
              <h1 className="text-lg sm:text-xl font-bold truncate text-[#0A1F14]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-[#0A1F14]/55 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search (desktop) */}
          <div className="relative hidden md:block">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A1F14]/45 pointer-events-none" />
            <input
              type="search"
              placeholder="Search pitches, founders…"
              className="pl-9 pr-4 py-2 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm w-64 text-[#0A1F14] placeholder-[#0A1F14]/45 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/12 focus:outline-none transition-all"
            />
          </div>

          {/* Notifications */}
          <Link to="/app/notifications" className="relative">
            <motion.button
              className="relative p-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14]/65 hover:text-[#1B5E3F] hover:border-[#1B5E3F]/40 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5B942] text-[#0F4A2E] text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </Link>

          {/* Avatar */}
          <Link to="/app/profile">
            <motion.img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/15 hover:ring-[#1B5E3F]/40 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
