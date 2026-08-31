import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiBell,
  HiChatAlt2,
  HiChevronDown,
  HiUser,
  HiCog,
  HiLogout,
  HiSparkles,
  HiCurrencyDollar,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useSearch } from "../../context/SearchContext";

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useNotifications().unreadCount;
  const { searchQuery, setSearchQuery } = useSearch();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isInvestor = user?.role === "investor";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4 sm:gap-6">
        {/* LEFT: Logo + Search Bar */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 max-w-[760px]">
          <Link to="/app" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/Expglo fund logo.jpeg"
              alt="EXPGLO"
              className="h-10 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          {/* Search Bar (Stable 600-650px desktop width, responsive on smaller screens) */}
          <div className="flex-1 min-w-0 max-w-[620px]">
            <div className="relative w-full">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#64748B] pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups, people, pitches..."
                className="w-full pl-11 pr-4 h-11 bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 border border-[#E2E8F0] rounded-full text-sm text-[#0F172A] placeholder-[#64748B] focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Invest Now (Investor) + Messages + Notifications + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-auto">
          {/* Invest Now Button (Investor ONLY) */}
          {isInvestor && (
            <Link to="/app/invest" className="hidden sm:flex items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <HiCurrencyDollar className="w-4 h-4 text-[#F59E0B]" />
                <span>Invest Now</span>
              </motion.button>
            </Link>
          )}
          {/* Messages Icon */}
          <Link to="/app/messages" className="flex items-center">
            <motion.button
              className="w-10 h-10 text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F3E8FF]/50 rounded-xl transition-colors flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Messages"
            >
              <HiChatAlt2 className="w-6 h-6" />
            </motion.button>
          </Link>

          {/* Notifications Bell */}
          <Link to="/app/notifications" className="relative flex items-center">
            <motion.button
              className="relative w-10 h-10 text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F3E8FF]/50 rounded-xl transition-colors flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <HiBell className="w-5.5 h-5.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4.5 px-1 bg-[#F59E0B] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </motion.button>
          </Link>

          {/* User Profile Chip & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-[#F8FAFC] rounded-xl transition-colors text-left cursor-pointer"
            >
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=7C3AED&color=fff&size=80`
                }
                alt={user?.name || "Profile"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7C3AED]/20"
              />
              <div className="hidden md:block text-left leading-tight">
                <p className="font-bold text-xs text-[#0F172A] truncate max-w-[110px]">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-[#64748B] capitalize truncate font-medium">
                  {isInvestor ? "Investor" : (user?.role || "Founder")}
                </p>
              </div>
              <HiChevronDown className="w-4 h-4 text-[#64748B] hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl py-2 z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#E2E8F0]">
                    <p className="font-bold text-xs text-[#0F172A] truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/app/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#7C3AED] transition-colors"
                  >
                    <HiUser className="w-4 h-4" /> View Profile
                  </Link>

                  <Link
                    to="/app/subscription"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#7C3AED] transition-colors"
                  >
                    <HiSparkles className="w-4 h-4 text-[#7C3AED]" />
                    {isInvestor ? "Investor Pro" : "Studio Pro"}
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#7C3AED] transition-colors"
                  >
                    <HiCog className="w-4 h-4" /> Settings
                  </Link>

                  <div className="border-t border-[#E2E8F0] my-1" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <HiLogout className="w-4 h-4" /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
