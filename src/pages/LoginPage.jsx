import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiUser, HiLockClosed, HiTrendingUp } from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

import AuthShell from "../components/auth/AuthShell";
import { FormField, Checkbox } from "../components/auth/FormField";
import { setAuth } from "../lib/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    remember: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) return;

    // Static demo login: detect admin if identifier contains "admin"
    const role = /admin/i.test(formData.identifier) ? "admin" : userType;
    setAuth({ role, identifier: formData.identifier });

    if (role === "admin") navigate("/admin");
    else navigate("/app");
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
            EXPGLO FUND
          </span>
        </h1>
        <p className="text-gray-300 text-base sm:text-lg">
          Log in to continue your journey
        </p>
      </div>

      {!userType ? (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
            I am a...
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <RoleCard
              role="founder"
              title="Founder"
              icon={<IoRocketSharp className="w-12 h-12 text-gold" />}
              description="Pitch your startup and connect with investors who believe in your vision."
              accent="gold"
              onClick={() => setUserType("founder")}
            />
            <RoleCard
              role="investor"
              title="Investor"
              icon={<HiTrendingUp className="w-12 h-12 text-primary-green" />}
              description="Discover promising startups and back the next big thing."
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

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="flex items-center justify-between">
              <Checkbox
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              >
                Remember me
              </Checkbox>
              <Link
                to="/forgot-password"
                className="text-sm text-gold hover:text-bright-gold font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all ${
                userType === "founder"
                  ? "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30 hover:shadow-gold/50"
                  : "bg-gradient-to-r from-primary-green to-secondary-green text-white shadow-primary-green/30 hover:shadow-primary-green/50"
              }`}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              Log In
            </motion.button>
          </form>

          <Divider>Or continue with</Divider>

          <div className="grid grid-cols-2 gap-4">
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

      <div className="text-center mt-8 pt-6 border-t border-gold/10">
        <p className="text-gray-300 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-gold hover:text-bright-gold font-semibold transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function RoleCard({ title, icon, description, accent, onClick }) {
  const accents =
    accent === "gold"
      ? "from-gold/10 to-bright-gold/5 border-gold/30 hover:border-gold text-gold"
      : "from-primary-green/10 to-secondary-green/5 border-primary-green/30 hover:border-primary-green text-primary-green";
  return (
    <motion.button
      onClick={onClick}
      className={`group relative p-6 sm:p-8 bg-gradient-to-br ${accents} border-2 rounded-2xl transition-all text-left overflow-hidden`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl bg-current opacity-10 group-hover:opacity-20 transition-all" />
      <div className="relative z-10">
        {icon}
        <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-3 text-white">
          {title}
        </h3>
        <p className="text-gray-300 text-sm">{description}</p>
        <motion.div
          className="mt-4 font-semibold flex items-center gap-2"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Continue as {title} →
        </motion.div>
      </div>
    </motion.button>
  );
}

function RoleBadge({ userType, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
      <div
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 ${
          userType === "founder"
            ? "bg-gold/10 border-gold/30 text-gold"
            : "bg-primary-green/10 border-primary-green/30 text-primary-green"
        }`}
      >
        {userType === "founder" ? (
          <IoRocketSharp className="w-5 h-5" />
        ) : (
          <HiTrendingUp className="w-5 h-5" />
        )}
        <span className="font-bold text-sm">
          Continuing as {userType === "founder" ? "Founder" : "Investor"}
        </span>
      </div>
      <button
        onClick={onChange}
        className="text-sm text-gray-400 hover:text-gold transition-colors underline"
      >
        Change
      </button>
    </div>
  );
}

function Divider({ children }) {
  return (
    <div className="relative my-7">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gold/15" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-card-bg/60 text-gray-400">{children}</span>
      </div>
    </div>
  );
}

function SocialButton({ icon, children }) {
  return (
    <motion.button
      type="button"
      className="py-3 px-4 bg-dark-bg/60 border-2 border-gold/20 rounded-xl hover:border-gold transition-all font-semibold flex items-center justify-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}

export default LoginPage;
