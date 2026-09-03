import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiAtSymbol,
  HiLockClosed,
  HiArrowRight,
  HiTrendingUp,
  HiCheckCircle,
} from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

import AuthShell from "../components/auth/AuthShell";
import { FormField, Checkbox } from "../components/auth/FormField";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/app";

  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType) {
      setError("Please select whether you are a Founder or Investor.");
      return;
    }
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

                                                      
      const pendingClaimToken = sessionStorage.getItem("expglo_pending_purchase");
      if (pendingClaimToken && ["founder", "investor"].includes(role)) {
        try {
          await courseService.claimPurchaseToken({ claimToken: pendingClaimToken });
          sessionStorage.removeItem("expglo_pending_purchase");
          navigate("/app/courses", { replace: true });
          return;
        } catch (claimErr) {
          console.warn("Could not claim pending purchase on login:", claimErr);
        }
      }

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

  const handleSocialLogin = (provider) => {
    const backendUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  return (
    <AuthShell maxWidth="max-w-3xl">
      {            }
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 leading-tight tracking-tight">
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
            EXPGLO FUND
          </span>
        </h1>
        <p className="text-[#0A1F14]/60 text-base sm:text-lg">
          Log in to continue your fundraising journey
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!userType ? (
          <motion.div
            key="role-select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-[#1B5E3F] mb-3">
              CHOOSE YOUR PATH
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-center mb-6 text-[#0A1F14]">
              I am a…
            </h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <RoleCard
                title="Founder"
                icon={<IoRocketSharp className="w-7 h-7 text-[#0F4A2E]" />}
                description="Pitch your startup. Connect with investors. Close your round."
                accent="gold"
                             
                                                    
                                                    
                                                       
                     
                onClick={() => setUserType("founder")}
              />
              <RoleCard
                title="Investor"
                icon={<HiTrendingUp className="w-7 h-7 text-[#0F4A2E]" />}
                description="Discover promising startups. Back the next big thing."
                accent="green"
                             
                                                
                                                
                                                      
                     
                onClick={() => setUserType("investor")}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <RoleBadge userType={userType} onChange={() => setUserType("")} />

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Email or username"
                name="identifier"
                icon={HiAtSymbol}
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="you@company.com or username"
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

              <div className="flex items-center justify-between pt-1 pb-1 flex-wrap gap-2">
                <Checkbox
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                >
                  Remember me
                </Checkbox>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#1B5E3F] hover:text-[#0F4A2E] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    Log In <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {                                    }
            {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 }
          </motion.div>
        )}
      </AnimatePresence>

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

function RoleCard({ title, icon, description, bullets, accent, onClick }) {
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
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-[#F5B942] shadow-[#F5B942]/35">
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
        className={`text-sm mb-4 leading-relaxed ${
          isGold ? "text-[#0A1F14]/75" : "text-white/80"
        }`}
      >
        {description}
      </p>
      {bullets && (
        <ul className="space-y-1.5 mb-3">
          {bullets.map((b) => (
            <li
              key={b}
              className={`flex items-center gap-2 text-sm ${
                isGold ? "text-[#0A1F14]/80" : "text-white/85"
              }`}
            >
              <HiCheckCircle
                className={`w-4 h-4 flex-shrink-0 ${
                  isGold ? "text-[#1B5E3F]" : "text-[#F5B942]"
                }`}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
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
        className="text-xs font-bold text-[#1B5E3F] hover:text-[#0F4A2E] hover:underline transition-colors cursor-pointer"
      >
        Change
      </button>
    </div>
  );
}
