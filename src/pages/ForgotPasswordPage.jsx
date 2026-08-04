import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMail,
  HiCheckCircle,
  HiArrowRight,
  HiExclamationCircle,
} from "react-icons/hi";

import AuthShell from "../components/auth/AuthShell";
import { FormField } from "../components/auth/FormField";
import { authService } from "../services/authService";

// Mirrors the backend's email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalized = email.trim().toLowerCase();

    // Client-side format check before hitting the network
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Please enter a valid email address (e.g. you@example.com).");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(normalized);
      // Always show the success screen — backend intentionally does not reveal
      // whether the email is registered (prevents user enumeration).
      setSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-xl">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] mb-4 shadow-md shadow-[#1B5E3F]/25">
                <HiMail className="w-7 h-7 text-[#F5B942]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                Forgot your{" "}
                <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
                  password?
                </span>
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base">
                Enter your email and we'll send you a link to reset it.
              </p>
            </div>

            <FormField
              label="Email address"
              name="email"
              icon={HiMail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
              >
                <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { y: -2 }}
              whileTap={loading ? {} : { scale: 0.99 }}
              className={`w-full py-3.5 rounded-full font-bold text-base bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 transition-all flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send reset link <HiArrowRight />
                </>
              )}
            </motion.button>

            <div className="text-center pt-3 border-t border-[#1B5E3F]/10">
              <p className="text-[#0A1F14]/65 text-sm">
                Remember it now?{" "}
                <Link
                  to="/login"
                  className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center space-y-6 py-2"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200">
              <HiCheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                Check your inbox
              </h2>
              <p className="text-[#0A1F14]/65 max-w-md mx-auto">
                If an account exists for{" "}
                <span className="text-[#1B5E3F] font-bold">{email}</span>,
                you'll get a reset link in a few seconds.
              </p>
            </div>
            <Link to="/login">
              <motion.button
                whileHover={{ y: -2 }}
                className="px-7 py-3 rounded-full font-bold border border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40 text-[#0F4A2E] bg-white hover:bg-[#FAFAF7] transition-all"
              >
                Back to login
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
