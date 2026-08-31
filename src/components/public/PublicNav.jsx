import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiUser, HiCog, HiLogout } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import DropdownMenu from "../ui/DropdownMenu";


/**
 * Shared frosted-glass navbar for public pages (Home, Courses, etc.)
 * Pulls active link styling from the current route automatically.
 */
export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const { isLoggedIn, role, logout, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const isActive = (href) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.slice(1);
    }
    return pathname === href;
  };

  const links = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Courses", href: "/courses" },
  ];

  return (
    <nav
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-6xl rounded-full transition-all duration-300 ${
        menuOpen
          ? "bg-white border border-[#1B5E3F]/15 shadow-[0_10px_40px_rgba(15,74,46,0.15)] !rounded-3xl"
          : scrolled
            ? "bg-white/45 border border-white/60 shadow-[0_10px_40px_rgba(15,74,46,0.15)] ring-1 ring-[#1B5E3F]/8"
            : "bg-white/25 border border-white/40 shadow-[0_4px_24px_rgba(15,74,46,0.06)] ring-1 ring-white/30"
      }`}
      style={
        menuOpen
          ? undefined
          : {
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }
      }
    >
      <div className="px-3 sm:px-5 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/Expglo fund logo.jpeg"
            alt="EXPGLO FUND"
            className="h-10 w-auto mix-blend-multiply"
          />
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => {
            const active = isActive(l.href);
            return l.href.startsWith("/#") ? (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#1B5E3F]"
                    : "text-[#0A1F14]/75 hover:text-[#1B5E3F]"
                }`}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#1B5E3F]"
                    : "text-[#0A1F14]/75 hover:text-[#1B5E3F]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`${menuOpen ? "hidden" : "hidden sm:flex"} items-center gap-2`}>
            {loading ? (
              <div className="h-9 w-24 bg-[#1B5E3F]/10 animate-pulse rounded-full" />
            ) : isLoggedIn && pathname !== "/verify" ? (
              <DropdownMenu
                align="right"
                triggerClass="flex items-center p-1 rounded-full hover:bg-black/5 transition-all"
                trigger={
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=80`
                    }
                    alt={user?.name || "Profile"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/15 hover:ring-[#1B5E3F]/40 transition-colors cursor-pointer"
                  />
                }
                items={[
                  {
                    label: role === "admin" ? "Admin Panel" : "Go to App",
                    icon: HiUser,
                    onClick: () => navigate(role === "admin" ? "/admin" : "/app"),
                  },
                  {
                    label: "Settings",
                    icon: HiCog,
                    onClick: () => navigate(role === "admin" ? "/admin/settings" : "/app/settings"),
                  },
                  { divider: true },
                  {
                    label: "Log out",
                    icon: HiLogout,
                    danger: true,
                    onClick: logout,
                  },
                ]}
              />
            ) : (
              <div className="inline-flex bg-[#FAFAF7] rounded-full p-1 border border-[#1B5E3F]/10">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    pathname === "/login"
                      ? "bg-[#1B5E3F] text-white shadow-md"
                      : "text-[#0A1F14]/70 hover:text-[#0A1F14]"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    pathname === "/signup" || pathname === "/verify"
                      ? "bg-[#1B5E3F] text-white shadow-md"
                      : "text-[#0A1F14]/70 hover:text-[#0A1F14]"
                  }`}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#0F4A2E] p-2 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white rounded-b-3xl border-t border-[#1B5E3F]/10 overflow-hidden shadow-[0_20px_40px_rgba(15,74,46,0.12)]"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((l) =>
                l.href.startsWith("/#") ? (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm font-semibold text-[#0A1F14]/75 py-2"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm font-semibold text-[#0A1F14]/75 py-2"
                  >
                    {l.label}
                  </Link>
                ),
              )}
              <div className="pt-3 border-t border-[#1B5E3F]/10 space-y-2">
                {loading ? (
                  <div className="w-full h-10 bg-[#1B5E3F]/10 animate-pulse rounded-full" />
                ) : isLoggedIn && pathname !== "/verify" ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
                      <img
                        src={
                          user?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=80`
                        }
                        alt={user?.name || "Profile"}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0A1F14] truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-[#0A1F14]/50 truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={role === "admin" ? "/admin" : "/app"}
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 border border-[#1B5E3F]/15 text-sm font-bold rounded-full text-[#0F4A2E] bg-white"
                    >
                      {role === "admin" ? "Admin Panel" : "Go to App"}
                    </Link>
                    <Link
                      to={role === "admin" ? "/admin/settings" : "/app/settings"}
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 border border-[#1B5E3F]/15 text-sm font-bold rounded-full text-[#0F4A2E] bg-white"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-center px-4 py-2.5 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white text-sm font-bold rounded-full transition-all"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex bg-[#FAFAF7] rounded-full p-1 border border-[#1B5E3F]/10 w-full">
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className={`flex-1 text-center px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                          pathname === "/login"
                            ? "bg-[#1B5E3F] text-white shadow-md"
                            : "text-[#0A1F14]/70 hover:text-[#0A1F14]"
                        }`}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMenuOpen(false)}
                        className={`flex-1 text-center px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                          pathname === "/signup" || pathname === "/verify"
                            ? "bg-[#1B5E3F] text-white shadow-md"
                            : "text-[#0A1F14]/70 hover:text-[#0A1F14]"
                        }`}
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
