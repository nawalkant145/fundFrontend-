
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiUser,
  HiLockClosed,
  HiTrendingUp,
  HiArrowRight,
  HiCheckCircle,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import { IoRocketSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

import AuthShell from "../components/auth/AuthShell";
import { FormField, Checkbox } from "../components/auth/FormField";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    remember: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    useEffect(() => {
    const preSelectedRole = location.state?.role;
    if (preSelectedRole && (preSelectedRole === "founder" || preSelectedRole === "investor")) {
      setUserType(preSelectedRole);
    }
  }, [location.state]);

  // Redirect to the page they were trying to visit before being redirected to login
  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) return;
    setError("");
    setLoading(true);

    try {
      const data = await login({
        identifier: formData.identifier,
        password: formData.password,
        remember: formData.remember,
        role: userType,
      });
      const role = data.user?.role || userType;
      navigate(role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  return (
    <AuthShell maxWidth="max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
            EXPGLO FUND
          </span>
        </h1>
        <p className="text-[#0A1F14]/60 text-base sm:text-lg">
          Log in to continue your fundraising journey
        </p>
      </div>

      {!userType ? (
        <div>
          <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-[#1B5E3F] mb-3">
            CHOOSE YOUR PATH
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-center mb-6 text-[#0A1F14]">
            I am a…
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            <RoleCard
              role="founder"
              title="Founder"
              icon={<IoRocketSharp className="w-7 h-7 text-[#0F4A2E]" />}
              description="Pitch your startup. Connect with investors. Close your round."
              accent="gold"
              onClick={() => setUserType("founder")}
            />
            <RoleCard
              role="investor"
              title="Investor"
             icon={<HiTrendingUp className="w-7 h-7 text-[#0F4A2E]" />}
              description="Discover promising startups. Back the next big thing."
              accent="green"
              onClick={() => setUserType("investor")}
            />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <RoleBadge userType={userType} onChange={() => setUserType("")} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Username, email, or phone"
              name="identifier"
              icon={HiUser}
              value={formData.identifier}
              onChange={handleChange}
              placeholder="john_startup, you@example.com, or +91…"
              autoComplete="username"
              required
            />

            <FormField
              label="Password"
              name="password"
              icon={HiLockClosed}
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              >
                Remember me
              </Checkbox>
              <Link
                to="/forgot-password"
                className="text-sm text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 rounded-full font-bold text-base shadow-xl transition-all bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-[#1B5E3F]/30 inline-flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              whileHover={loading ? {} : { y: -2 }}
              whileTap={loading ? {} : { scale: 0.99 }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Log in
                  <HiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <Divider>Or continue with</Divider>

          <div className="grid grid-cols-2 gap-3">
            <SocialButton icon={<FcGoogle className="w-5 h-5" />}>
              Google
            </SocialButton>
            <SocialButton
              icon={<FaLinkedin className="w-5 h-5 text-[#0A66C2]" />}
            >
              LinkedIn
            </SocialButton>
          </div>
        </motion.div>
      )}

      <div className="text-center mt-7 pt-6 border-t border-[#1B5E3F]/10">
        <p className="text-[#0A1F14]/65 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link
            to="/signup"
            state={{ role: userType }}
            className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── Sub-components ──────────────────────────

function RoleCard({ title, icon, description, accent, onClick }) {
  const isGold = accent === "gold";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-5 sm:p-6 rounded-3xl border text-left overflow-hidden transition-all ${
        isGold
          ? "bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD] border-[#F5B942]/40 hover:border-[#F5B942]/70 shadow-md hover:shadow-xl hover:shadow-[#F5B942]/20"
          : "bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] border-[#1B5E3F]/30 hover:border-[#1B5E3F] shadow-md hover:shadow-xl hover:shadow-[#1B5E3F]/30 text-white"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            isGold
              ? "bg-[#F5B942] shadow-[#F5B942]/35"
              : "bg-[#F5B942] shadow-[#F5B942]/35"
          }`}
        >
          {icon}
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full ${
            isGold
              ? "bg-[#0F4A2E] text-[#F5B942]"
              : "bg-[#F5B942] text-[#0F4A2E]"
          }`}
        >
          {isGold ? "FOR FOUNDERS" : "FOR INVESTORS"}
        </span>
      </div>
      <h3
        className={`text-xl sm:text-2xl font-black mb-1.5 ${
          isGold ? "text-[#0F4A2E]" : "text-white"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-3 leading-relaxed ${
          isGold ? "text-[#0A1F14]/75" : "text-white/80"
        }`}
      >
        {description}
      </p>
      <div
        className={`mt-3 font-bold flex items-center gap-1.5 text-sm ${
          isGold ? "text-[#0F4A2E]" : "text-[#F5B942]"
        }`}
      >
        Continue as {title}
        <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.button>
  );
}

function RoleBadge({ userType, onChange }) {
  const isFounder = userType === "founder";
  return (
    <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${
          isFounder
            ? "bg-[#FFF6E0] border-[#F5B942]/40 text-[#0F4A2E]"
            : "bg-[#1B5E3F]/10 border-[#1B5E3F]/30 text-[#0F4A2E]"
        }`}
      >
        {isFounder ? (
          <IoRocketSharp className="w-4 h-4 text-[#0F4A2E]" />
        ) : (
          <HiTrendingUp className="w-4 h-4 text-[#1B5E3F]" />
        )}
        <span className="font-bold text-xs uppercase tracking-wider">
          {isFounder ? "Founder" : "Investor"}
        </span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="text-xs text-[#0A1F14]/55 hover:text-[#1B5E3F] transition-colors underline font-semibold"
      >
        Change
      </button>
    </div>
  );
}

function Divider({ children }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#1B5E3F]/15" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-[#0A1F14]/55 font-semibold">
          {children}
        </span>
      </div>
    </div>
  );
}

function SocialButton({ icon, children, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="py-3 px-4 bg-white border border-[#1B5E3F]/15 rounded-full hover:border-[#1B5E3F]/40 hover:shadow-md transition-all font-bold text-sm flex items-center justify-center gap-2 text-[#0A1F14]"
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
