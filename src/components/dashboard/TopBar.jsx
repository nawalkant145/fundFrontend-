import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  HiMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useSearch } from "../../context/SearchContext";

export default function TopBar({ onMenuClick, onRightSidebarClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotifications().unreadCount;
  const { searchQuery, setSearchQuery } = useSearch();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isInvestor = user?.role === "investor";
  const isFeedPage = location.pathname === "/app" || location.pathname === "/app/" || location.pathname === "/app/feed";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-[72px] min-h-[72px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-2xs">
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {                                                    }
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer shrink-0"
          aria-label="Open Mobile Menu"
        >
          <HiMenu className="w-5.5 h-5.5 text-[#0F172A]" />
        </button>

        {                }
        <Link to="/app" className="flex items-center gap-2 shrink-0">
          <img
            src="/Expglo fund logo.jpeg"
            alt="EXPGLO"
            className="h-9 sm:h-10 w-auto object-contain mix-blend-multiply"
          />
        </Link>

        {                                                                                }
        <div className="flex-1 min-w-0 max-w-[620px]">
          <div className="relative w-full">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#64748B] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search startups, people, pitches..."
              className="w-full pl-11 pr-4 h-11 bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 border border-[#E2E8F0] rounded-full text-sm text-[#0F172A] placeholder-[#64748B] focus:border-[#1B5E3F] focus:bg-white focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {                                                                                     }
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-auto">
        {                                       }
        {isInvestor && (
          <Link to="/app/invest" className="hidden sm:flex items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="invest-now-btn px-3.5 py-2 rounded-xl text-xs font-black bg-[#1B5E3F] text-white-force hover:bg-[#0F4A2E] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <HiCurrencyDollar className="w-4 h-4 text-[#F5B942]" />
              <span className="text-white-force" style={{ color: "#ffffff" }}>Invest Now</span>
            </motion.button>
          </Link>
        )}

        {                                                              }
        <Link to="/app/messages" className="hidden lg:flex items-center">
          <motion.button
            className="w-10 h-10 text-[#64748B] hover:text-[#1B5E3F] hover:bg-[#1B5E3F]/10 rounded-xl transition-colors flex items-center justify-center shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Messages"
          >
            <HiChatAlt2 className="w-6 h-6" />
          </motion.button>
        </Link>

        {                                                                                                      }
        {!isInvestor && isFeedPage && (
          <motion.button
            onClick={onRightSidebarClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-[#1B5E3F]/10 rounded-xl transition-colors flex items-center justify-center shrink-0 lg:hidden cursor-pointer"
            aria-label="Open Right Sidebar Panels"
            title="Open Right Sidebar Panels"
          >
            <HiCurrencyDollar className="w-7 h-7 text-[#F4C45E]" />
          </motion.button>
        )}

        {                        }
        <Link to="/app/notifications" className="relative flex items-center">
          <motion.button
            className="relative w-10 h-10 text-[#64748B] hover:text-[#1B5E3F] hover:bg-[#1B5E3F]/10 rounded-xl transition-colors flex items-center justify-center shrink-0"
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

        {                                  }
        <div className="relative hidden md:block">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-[#F8FAFC] rounded-xl transition-colors text-left cursor-pointer"
          >
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=80`
              }
              alt={user?.name || "Profile"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
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

          {                   }
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
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#1B5E3F] transition-colors"
                >
                  <HiUser className="w-4 h-4" /> View Profile
                </Link>

                <Link
                  to="/app/subscription"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#1B5E3F] transition-colors"
                >
                  <HiSparkles className="w-4 h-4 text-[#1B5E3F]" />
                  {isInvestor ? "Investor Pro" : "Studio Pro"}
                </Link>

                <Link
                  to="/app/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#1B5E3F] transition-colors"
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
    </header>
  );
}
