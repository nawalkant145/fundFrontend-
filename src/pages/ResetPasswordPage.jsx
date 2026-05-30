import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiLockClosed, HiCheckCircle, HiArrowRight } from "react-icons/hi";

import AuthShell from "../components/auth/AuthShell";
import { FormField, PasswordStrength } from "../components/auth/FormField";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setDone(true);
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <AuthShell maxWidth="max-w-xl">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="text-center mb-2">
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                Set a new{" "}
                <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
                  password
                </span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Choose a strong password you don't use anywhere else.
              </p>
            </div>

            <div>
              <FormField
                label="New password"
                name="password"
                icon={HiLockClosed}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={password} />
            </div>

            <FormField
              label="Confirm new password"
              name="confirm"
              icon={HiLockClosed}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              error={
                confirm && password !== confirm
                  ? "Passwords do not match"
                  : null
              }
              success={
                confirm && password === confirm ? "Passwords match" : null
              }
              required
            />

            <motion.button
              type="submit"
              disabled={!valid}
              className={`w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 transition-all flex items-center justify-center gap-2 ${
                !valid ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={valid ? { scale: 1.01, y: -2 } : {}}
              whileTap={valid ? { scale: 0.99 } : {}}
            >
              Reset password <HiArrowRight />
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-6"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40">
              <HiCheckCircle className="w-14 h-14 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Password updated</h2>
            <p className="text-gray-300">Redirecting to login…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div className="text-center mt-8 pt-6 border-t border-gold/10">
          <p className="text-gray-300 text-sm">
            <Link
              to="/login"
              className="text-gold hover:text-bright-gold font-semibold"
            >
              Back to login
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}

export default ResetPasswordPage;
