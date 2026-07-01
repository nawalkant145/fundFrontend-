import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiLockClosed,
  HiUser,
  HiShieldCheck,
  HiArrowRight,
} from "react-icons/hi";

import { useAuth } from "../../context/AuthContext";

/**
 * Dedicated admin login — separate from the public /login page.
 * Lives at /admin/login. Only users with role "admin" are allowed through;
 * anyone else is rejected even with valid credentials.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user, loading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin → go straight to dashboard
  if (!loading && user?.role === "admin") {
    const dest = location.state?.from?.pathname || "/admin";
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setError("");
    setSubmitting(true);
    try {
      const data = await login({ identifier, password, remember: true });
      if (data.user?.role !== "admin") {
        // Not an admin — reject and clear the session
        await logout();
        setError("This account does not have admin access.");
        return;
      }
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1F14] relative overflow-hidden px-4">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#1B5E3F]/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F5B942]/10 rounded-full blur-[180px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F5B942]/15 border border-[#F5B942]/30 mb-4">
              <HiShieldCheck className="w-8 h-8 text-[#F5B942]" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              Admin Console
            </h1>
            <p className="text-sm text-white/50">
              Restricted access · authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                Email or username
              </label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@expglo.com"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#F5B942]/60 focus:ring-4 focus:ring-[#F5B942]/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#F5B942]/60 focus:ring-4 focus:ring-[#F5B942]/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? {} : { y: -2 }}
              whileTap={submitting ? {} : { scale: 0.99 }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F5B942] to-[#FFD166] text-[#0A1F14] shadow-lg shadow-[#F5B942]/20 inline-flex items-center justify-center gap-2 ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-[#0A1F14]/30 border-t-[#0A1F14] rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to console
                  <HiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            This area is monitored. Unauthorized access attempts are logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
