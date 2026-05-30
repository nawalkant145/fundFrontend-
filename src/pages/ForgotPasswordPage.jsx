import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMail, HiCheckCircle, HiArrowRight } from "react-icons/hi";

import AuthShell from "../components/auth/AuthShell";
import { FormField } from "../components/auth/FormField";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static — would POST /api/auth/forgot-password
    setSent(true);
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
            className="space-y-6"
          >
            <div className="text-center mb-2">
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                Forgot your{" "}
                <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
                  password?
                </span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
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

            <motion.button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              Send reset link <HiArrowRight />
            </motion.button>

            <div className="text-center pt-3 border-t border-gold/10">
              <p className="text-gray-300 text-sm">
                Remember it now?{" "}
                <Link
                  to="/login"
                  className="text-gold hover:text-bright-gold font-semibold"
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
            className="text-center space-y-6 py-4"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40">
              <HiCheckCircle className="w-14 h-14 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Check your inbox
              </h2>
              <p className="text-gray-300 max-w-md mx-auto">
                If an account exists for{" "}
                <span className="text-gold font-semibold">{email}</span>, you'll
                get a reset link in a few seconds.
              </p>
            </div>
            <Link to="/login">
              <motion.button
                className="px-7 py-3 rounded-xl font-bold border-2 border-gold/20 hover:border-gold/50 transition-all"
                whileHover={{ scale: 1.02 }}
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

export default ForgotPasswordPage;
