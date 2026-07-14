import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";


/**
 * Shared frosted-glass navbar for public pages (Home, Courses, etc.)
 * Pulls active link styling from the current route automatically.
 */
export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const { isLoggedIn, role, logout, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
            src="/Logobgremove.jpeg"
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

        <div className="hidden sm:flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 bg-[#1B5E3F]/10 animate-pulse rounded-full" />
          ) : isLoggedIn ? (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/app"}
                className="px-4 py-2 text-sm font-bold text-[#0A1F14]/75 hover:text-[#1B5E3F] transition-colors"
              >
                {role === "admin" ? "Admin Panel" : "Go to App"}
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-md shadow-[#1B5E3F]/20 transition-all"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-[#0A1F14]/75 hover:text-[#1B5E3F] transition-colors"
              >
                Log in
              </Link>
              <Link to="/signup">
                <button className="px-5 py-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-md shadow-[#1B5E3F]/20 transition-all">
                  Sign up free
                </button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#0F4A2E] p-1"
        >
          {menuOpen ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiMenu className="w-6 h-6" />
          )}
        </button>
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
                ) : isLoggedIn ? (
                  <>
                    <Link
                      to={role === "admin" ? "/admin" : "/app"}
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 border border-[#1B5E3F]/15 text-sm font-bold rounded-full text-[#0F4A2E] bg-white"
                    >
                      {role === "admin" ? "Admin Panel" : "Go to App"}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-center px-4 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold rounded-full"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 border border-[#1B5E3F]/15 text-sm font-bold rounded-full text-[#0F4A2E] bg-white"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold rounded-full"
                    >
                      Sign up free
                    </Link>
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
