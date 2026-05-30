import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMail,
  HiDeviceMobile,
  HiCheckCircle,
  HiArrowRight,
} from "react-icons/hi";

import AuthShell from "../components/auth/AuthShell";
import OtpInput from "../components/auth/OtpInput";
import Stepper from "../components/auth/Stepper";

const STEPS = ["Email", "Phone", "Done"];
const RESEND_SECONDS = 30;

function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "you@example.com";
  const phone = location.state?.phone || "+91 98765 43210";

  const [step, setStep] = useState(0); // 0 email, 1 phone, 2 done
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(RESEND_SECONDS);
  const [phoneCooldown, setPhoneCooldown] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");

  // Cooldown ticker for email step
  useEffect(() => {
    if (step !== 0 || emailCooldown <= 0) return;
    const t = setInterval(() => setEmailCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, emailCooldown]);

  // Cooldown ticker for phone step
  useEffect(() => {
    if (step !== 1 || phoneCooldown <= 0) return;
    const t = setInterval(() => setPhoneCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, phoneCooldown]);

  const handleEmailVerify = (e) => {
    e.preventDefault();
    setError("");
    if (emailOtp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    // Static — would POST /api/auth/verify-email-otp
    setStep(1);
    setPhoneCooldown(RESEND_SECONDS);
  };

  const handlePhoneVerify = (e) => {
    e.preventDefault();
    setError("");
    if (phoneOtp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setStep(2);
  };

  const resend = (which) => {
    if (which === "email") {
      setEmailCooldown(RESEND_SECONDS);
      setEmailOtp("");
    } else {
      setPhoneCooldown(RESEND_SECONDS);
      setPhoneOtp("");
    }
  };

  return (
    <AuthShell maxWidth="max-w-xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">
          Verify your{" "}
          <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
            account
          </span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Two quick steps to unlock the full platform
        </p>
      </div>

      <Stepper steps={STEPS} current={step} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.form
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleEmailVerify}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-3">
                <HiMail className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-xl font-bold mb-1">Check your inbox</h2>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="text-gold font-semibold">{email}</span>
              </p>
            </div>

            <OtpInput value={emailOtp} onChange={setEmailOtp} />

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <ResendBlock
              cooldown={emailCooldown}
              onResend={() => resend("email")}
            />

            <PrimaryButton disabled={emailOtp.length !== 6}>
              Verify email
            </PrimaryButton>
          </motion.form>
        )}

        {step === 1 && (
          <motion.form
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handlePhoneVerify}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-green/10 border border-primary-green/30 mb-3">
                <HiDeviceMobile className="w-8 h-8 text-primary-green" />
              </div>
              <h2 className="text-xl font-bold mb-1">Verify your phone</h2>
              <p className="text-gray-400 text-sm">
                We sent a code to{" "}
                <span className="text-primary-green font-semibold">
                  {phone}
                </span>
              </p>
            </div>

            <OtpInput value={phoneOtp} onChange={setPhoneOtp} />

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <ResendBlock
              cooldown={phoneCooldown}
              onResend={() => resend("phone")}
            />

            <PrimaryButton disabled={phoneOtp.length !== 6} accent="green">
              Verify phone
            </PrimaryButton>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center space-y-6 py-4"
          >
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <HiCheckCircle className="w-14 h-14 text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                You're all set
              </h2>
              <p className="text-gray-300 max-w-md mx-auto">
                Email and phone verified. Complete your KYC to unlock investing
                and the verified blue tick.
              </p>
            </div>

            <div className="bg-dark-bg/50 border border-gold/10 rounded-2xl p-5 text-left max-w-md mx-auto">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                Verification level: 2 of 3
              </p>
              <div className="space-y-2">
                <LevelRow done label="Email verified" />
                <LevelRow done label="Phone verified" />
                <LevelRow label="KYC documents (unlocks Level 3)" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/kyc">
                <motion.button
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete KYC <HiArrowRight />
                </motion.button>
              </Link>
              <button
                onClick={() => navigate("/app")}
                className="w-full py-3.5 rounded-xl font-bold border-2 border-gold/20 hover:border-gold/50 transition-all"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

function ResendBlock({ cooldown, onResend }) {
  return (
    <div className="text-center text-sm">
      <span className="text-gray-400">Didn't get the code? </span>
      {cooldown > 0 ? (
        <span className="text-gray-500">Resend in {cooldown}s</span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          className="text-gold hover:text-bright-gold font-semibold transition-colors"
        >
          Resend code
        </button>
      )}
    </div>
  );
}

function PrimaryButton({ children, disabled, accent = "gold" }) {
  const cls =
    accent === "gold"
      ? "from-gold to-bright-gold text-dark-navy shadow-gold/30 hover:shadow-gold/50"
      : "from-primary-green to-secondary-green text-white shadow-primary-green/30 hover:shadow-primary-green/50";
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      className={`w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r ${cls} shadow-lg transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      whileHover={disabled ? {} : { scale: 1.01, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
    >
      {children}
    </motion.button>
  );
}

function LevelRow({ label, done }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          done ? "bg-emerald-500/20" : "bg-gray-700/40"
        }`}
      >
        {done ? (
          <HiCheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-500" />
        )}
      </span>
      <span className={done ? "text-gray-300" : "text-gray-400"}>{label}</span>
    </div>
  );
}

export default VerifyPage;
