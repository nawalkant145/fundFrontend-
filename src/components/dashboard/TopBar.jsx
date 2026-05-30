import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiMenu, HiSearch, HiBell } from "react-icons/hi";
import { CURRENT_USER, MOCK_NOTIFICATIONS } from "../../constants/mockData";

export default function TopBar({ onMenuClick, title, subtitle }) {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-dark-navy/85 backdrop-blur-xl border-b border-gold/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-300 hover:text-white p-2 -ml-2"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            {title && (
              <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search (desktop) */}
          <div className="relative hidden md:block">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search pitches, founders…"
              className="pl-9 pr-4 py-2 bg-card-bg/60 border border-gold/15 rounded-xl text-sm w-64 focus:border-gold focus:outline-none transition-all"
            />
          </div>

          {/* Notifications */}
          <Link to="/app/notifications" className="relative">
            <motion.button
              className="relative p-2.5 bg-card-bg/60 border border-gold/15 rounded-xl text-gray-300 hover:text-gold hover:border-gold/40 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-dark-navy text-[10px] font-black rounded-full flex items-center justify-center">
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
              className="w-10 h-10 rounded-full object-cover border-2 border-gold/40 hover:border-gold transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
