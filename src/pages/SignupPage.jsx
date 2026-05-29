import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiUser,
  HiTrendingUp,
  HiCheckCircle,
} from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";

function SignupPage() {
  const [userType, setUserType] = useState(""); // 'founder' or 'investor'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Sign up as:", userType, formData);
    // Add your signup logic here
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-dark-navy/80"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] animate-gradient-shift opacity-10">
            <div className="absolute inset-0 bg-gradient-radial from-primary-green/30 via-transparent to-transparent"></div>
            <div
              className="absolute inset-0 bg-gradient-radial from-gold/20 via-transparent to-transparent"
              style={{ left: "60%", top: "60%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Logo */}
        <Link to="/">
          <motion.img
            src="/Logobgremove.jpeg"
            alt="EXPGLO FUND"
            className="h-16 w-auto mx-auto mb-8 drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          />
        </Link>

        <motion.div
          className="bg-card-bg/50 backdrop-blur-xl border-2 border-gold/20 rounded-3xl p-8 md:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              Join{" "}
              <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
                EXPGLO FUND
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Start your fundraising journey today
            </p>
          </div>

          {/* User Type Selection */}
          {!userType ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center mb-6">I am a...</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Founder Option */}
                <motion.button
                  onClick={() => setUserType("founder")}
                  className="group relative p-8 bg-gradient-to-br from-gold/10 to-bright-gold/5 border-2 border-gold/30 rounded-2xl hover:border-gold transition-all text-left overflow-hidden"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all"></div>
                  <IoRocketSharp className="w-12 h-12 text-gold mb-4 relative z-10" />
                  <h3 className="text-2xl font-bold mb-2 relative z-10">
                    Founder
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 relative z-10">
                    Pitch your startup and connect with investors who believe in
                    your vision
                  </p>
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-gold" />
                      Upload 60-second pitch videos
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-gold" />
                      Connect with 850+ investors
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-gold" />
                      Access fundraising courses
                    </div>
                  </div>
                  <motion.div
                    className="mt-4 text-gold font-semibold flex items-center gap-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Sign up as Founder →
                  </motion.div>
                </motion.button>

                {/* Investor Option */}
                <motion.button
                  onClick={() => setUserType("investor")}
                  className="group relative p-8 bg-gradient-to-br from-primary-green/10 to-secondary-green/5 border-2 border-primary-green/30 rounded-2xl hover:border-primary-green transition-all text-left overflow-hidden"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/10 rounded-full blur-3xl group-hover:bg-primary-green/20 transition-all"></div>
                  <HiTrendingUp className="w-12 h-12 text-primary-green mb-4 relative z-10" />
                  <h3 className="text-2xl font-bold mb-2 relative z-10">
                    Investor
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 relative z-10">
                    Discover promising startups and invest in the next big thing
                  </p>
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-primary-green" />
                      Browse 2,400+ startup pitches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-primary-green" />
                      AI-powered matching
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <HiCheckCircle className="text-primary-green" />
                      Direct founder communication
                    </div>
                  </div>
                  <motion.div
                    className="mt-4 text-primary-green font-semibold flex items-center gap-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    Sign up as Investor →
                  </motion.div>
                </motion.button>
              </div>
            </div>
          ) : (
            /* Signup Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Selected User Type Badge */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 ${
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
                  <span className="font-bold">
                    Signing up as{" "}
                    {userType === "founder" ? "Founder" : "Investor"}
                  </span>
                </div>
                <button
                  onClick={() => setUserType("")}
                  className="text-sm text-gray-400 hover:text-gold transition-colors underline"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                    >
                      {showPassword ? (
                        <HiEyeOff className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 mt-0.5 rounded border-gold/30 bg-dark-bg/50 text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{" "}
                      <a
                        href="#terms"
                        className="text-gold hover:text-bright-gold transition-colors"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#privacy"
                        className="text-gold hover:text-bright-gold transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    userType === "founder"
                      ? "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30 hover:shadow-gold/50"
                      : "bg-gradient-to-r from-primary-green to-secondary-green text-white shadow-primary-green/30 hover:shadow-primary-green/50"
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Account
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card-bg/50 text-gray-400">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className="py-3 px-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl hover:border-gold transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Google
                </motion.button>
                <motion.button
                  className="py-3 px-4 bg-dark-bg/50 border-2 border-gold/20 rounded-xl hover:border-gold transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  LinkedIn
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gold/10">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-gold hover:text-bright-gold font-semibold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <Link to="/">
          <motion.p
            className="text-center mt-6 text-gray-400 hover:text-gold transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            ← Back to Home
          </motion.p>
        </Link>
      </div>
    </div>
  );
}

export default SignupPage;
