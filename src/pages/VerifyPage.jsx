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
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { setAuth } from "../lib/auth";

const STEPS = ["Email", "Phone", "Done"];
const RESEND_SECONDS = 30;

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, register, refreshUser } = useAuth();
  const email = location.state?.email || user?.email || "you@example.com";
  const phone = location.state?.phone || user?.phone || "";
  const registerData = location.state?.registerData || null;

  const [step, setStep] = useState(0);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(RESEND_SECONDS);
  const [phoneCooldown, setPhoneCooldown] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Dev-only: OTP shown on screen (no real email/SMS during testing)
  const [devEmailOtp, setDevEmailOtp] = useState(location.state?.devOtp || "");
  const [devPhoneOtp, setDevPhoneOtp] = useState("");

  useEffect(() => {
    if (step !== 0 || emailCooldown <= 0) return;
    const t = setInterval(() => setEmailCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, emailCooldown]);

  useEffect(() => {
    if (step !== 1 || phoneCooldown <= 0) return;
    const t = setInterval(() => setPhoneCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, phoneCooldown]);

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (emailOtp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      // Verify OTP
      await authService.verifyPreRegisterOtp(email, emailOtp);

      // Now create the account (email is verified)
      if (registerData && !user) {
        await register(registerData);
      }

      // If phone provided, move to phone verification
      if (phone) {
        setStep(1);
        setPhoneCooldown(RESEND_SECONDS);
        authService
          .sendPhoneOtp(phone)
          .then((res) => setDevPhoneOtp(res?.data?.data?.devOtp || ""))
          .catch(() => {});
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (phoneOtp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await authService.verifyPhoneOtp(phoneOtp);
      await refreshUser();
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async (which) => {
    try {
      if (which === "email") {
        const res = await authService.sendPreRegisterOtp(email);
        setDevEmailOtp(res?.data?.data?.devOtp || "");
        setEmailCooldown(RESEND_SECONDS);
        setEmailOtp("");
      } else {
        const res = await authService.sendPhoneOtp(phone);
        setDevPhoneOtp(res?.data?.data?.devOtp || "");
        setPhoneCooldown(RESEND_SECONDS);
        setPhoneOtp("");
      }
    } catch {}
  };

  return (
    <AuthShell maxWidth="max-w-xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
          Verify your{" "}
          <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
            account
          </span>
        </h1>
        <p className="text-[#0A1F14]/60 text-sm sm:text-base">
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
            className="space-y-5"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD] border border-[#F5B942]/40 mb-3">
                <HiMail className="w-7 h-7 text-[#0F4A2E]" />
              </div>
              <h2 className="text-xl font-black mb-1">Check your inbox</h2>
              <p className="text-[#0A1F14]/55 text-sm">
                We sent a 6-digit code to{" "}
                <span className="text-[#1B5E3F] font-bold">{email}</span>
              </p>
            </div>

            <OtpInput value={emailOtp} onChange={setEmailOtp} />


            {error && (
              <p className="text-center text-sm text-red-500 font-semibold">
                {error}
              </p>
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
            className="space-y-5"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] mb-3 shadow-md shadow-[#1B5E3F]/25">
                <HiDeviceMobile className="w-7 h-7 text-[#F5B942]" />
              </div>
              <h2 className="text-xl font-black mb-1">Verify your phone</h2>
              <p className="text-[#0A1F14]/55 text-sm">
                We sent a code to{" "}
                <span className="text-[#1B5E3F] font-bold">{phone}</span>
              </p>
            </div>

            <OtpInput value={phoneOtp} onChange={setPhoneOtp} />

         

            {error && (
              <p className="text-center text-sm text-red-500 font-semibold">
                {error}
              </p>
            )}

            <ResendBlock
              cooldown={phoneCooldown}
              onResend={() => resend("phone")}
            />

            <PrimaryButton disabled={phoneOtp.length !== 6}>
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
            className="text-center space-y-6 py-2"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <HiCheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                You're all set
              </h2>
              <p className="text-[#0A1F14]/65 max-w-md mx-auto">
                Email and phone verified. Complete your KYC to unlock investing
                and get the verified blue tick.
              </p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-5 text-left max-w-md mx-auto">
              <p className="text-xs uppercase tracking-wider text-[#0A1F14]/55 font-bold mb-3">
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
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-full font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 flex items-center justify-center gap-2 transition-all"
                >
                  Complete KYC <HiArrowRight />
                </motion.button>
              </Link>
              <button
                onClick={() => navigate("/app")}
                className="w-full py-3.5 rounded-full font-bold border border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40 text-[#0F4A2E] bg-white hover:bg-[#FAFAF7] transition-all"
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

function DevOtpBanner({ otp }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFF6E0] border border-[#F5B942]/40 rounded-xl">
      <span className="text-xs font-semibold text-[#0A1F14]/70">
        Dev mode — your code is
      </span>
      <span className="text-base font-black tracking-[0.3em] text-[#0F4A2E]">
        {otp}
      </span>
    </div>
  );
}

function ResendBlock({ cooldown, onResend }) {
  return (
    <div className="text-center text-sm">
      <span className="text-[#0A1F14]/55">Didn't get the code? </span>
      {cooldown > 0 ? (
        <span className="text-[#0A1F14]/45 font-semibold">
          Resend in {cooldown}s
        </span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors"
        >
          Resend code
        </button>
      )}
    </div>
  );
}

function PrimaryButton({ children, disabled }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      whileHover={disabled ? {} : { y: -2 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={`w-full py-3.5 rounded-full font-bold text-base bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 transition-all flex items-center justify-center gap-2 ${
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : ""
      }`}
    >
      {children}
      <HiArrowRight />
    </motion.button>
  );
}

function LevelRow({ label, done }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          done ? "bg-emerald-100" : "bg-[#1B5E3F]/8"
        }`}
      >
        {done ? (
          <HiCheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#0A1F14]/35" />
        )}
      </span>
      <span
        className={
          done ? "text-[#0A1F14]/85 font-semibold" : "text-[#0A1F14]/55"
        }
      >
        {label}
      </span>
    </div>
  );
}
