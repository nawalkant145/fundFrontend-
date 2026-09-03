import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiLockClosed,
  HiCheckCircle,
  HiArrowRight,
  HiExclamationCircle,
} from "react-icons/hi";

import AuthShell from "../components/auth/AuthShell";
import { FormField, PasswordStrength } from "../components/auth/FormField";
import { authService } from "../services/authService";

                                                                                                                                                                     
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

                                                                         
  const token = searchParams.get("token") || "";
  const emailFromUrl = (searchParams.get("email") || "").trim().toLowerCase();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

                                                   
  const passwordComplex = PASSWORD_REGEX.test(password);
  const passwordsMatch = password === confirm && confirm.length > 0;
  const valid = passwordComplex && passwordsMatch;

                                                                        
  if (!token || !emailFromUrl) {
    return (
      <AuthShell maxWidth="max-w-xl">
        <div className="text-center space-y-5 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border-2 border-red-200">
            <HiExclamationCircle className="w-9 h-9 text-red-500" />
          </div>
          <h1 className="text-2xl font-black">Invalid reset link</h1>
          <p className="text-[#0A1F14]/65 max-w-sm mx-auto">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link to="/forgot-password">
            <motion.button
              whileHover={{ y: -2 }}
              className="px-7 py-3 rounded-full font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-xl shadow-[#1B5E3F]/30 transition-all"
            >
              Request new link
            </motion.button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword({
        email: emailFromUrl,
        token,
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to reset password. The link may have expired — please request a new one.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] mb-4 shadow-md shadow-[#1B5E3F]/25">
                <HiLockClosed className="w-7 h-7 text-[#F5B942]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                Set a new{" "}
                <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
                  password
                </span>
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base">
                Resetting password for{" "}
                <span className="font-semibold text-[#1B5E3F]">
                  {emailFromUrl}
                </span>
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
                error={
                  password && !passwordComplex
                    ? "Must have uppercase, lowercase, number, and special character"
                    : null
                }
                success={password && passwordComplex ? "Password strength looks good" : null}
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
              error={confirm && !passwordsMatch ? "Passwords do not match" : null}
              success={passwordsMatch ? "Passwords match" : null}
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
              disabled={!valid || loading}
              whileHover={valid && !loading ? { y: -2 } : {}}
              whileTap={valid && !loading ? { scale: 0.99 } : {}}
              className={`w-full py-3.5 rounded-full font-bold text-base bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 transition-all flex items-center justify-center gap-2 ${
                !valid || loading ? "opacity-50 cursor-not-allowed shadow-none" : ""
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Reset password <HiArrowRight />
                </>
              )}
            </motion.button>

            <div className="text-center pt-3 border-t border-[#1B5E3F]/10">
              <p className="text-[#0A1F14]/65 text-sm">
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
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200">
              <HiCheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black">Password updated!</h2>
            <p className="text-[#0A1F14]/65">
              Redirecting you to login…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
