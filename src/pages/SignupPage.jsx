import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUser,
  HiAtSymbol,
  HiMail,
  HiLockClosed,
  HiTrendingUp,
  HiCheckCircle,
  HiOfficeBuilding,
  HiGlobe,
  HiArrowLeft,
  HiArrowRight,
} from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";

import AuthShell from "../components/auth/AuthShell";
import {
  FormField,
  PasswordStrength,
  Checkbox,
  MultiSelectChips,
  PhoneInput,
} from "../components/auth/FormField";
import Select from "../components/auth/Select";
import Stepper from "../components/auth/Stepper";
import { setAuth } from "../lib/auth";
import { authService } from "../services/authService";
import {
  INDUSTRIES,
  FUNDING_STAGES,
  INVESTOR_TYPES,
  INVESTMENT_RANGES,
  COUNTRIES,
} from "../constants/options";

const STEPS = ["Role", "Account", "Profile"];

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    agreeToTerms: false,
    companyName: "",
    industry: "",
    fundingStage: "",
    website: "",
    linkedIn: "",
    investorType: "",
    investmentRange: "",
    preferredIndustries: [],
    preferredStages: [],
    investmentThesis: "",
  });

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  // ─── Live availability checks (username / email) ─────────────
  // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [emailStatus, setEmailStatus] = useState("idle");
  const debounceRef = useRef({});

  const usernameValidFmt = /^[a-zA-Z0-9_]{3,20}$/.test(data.username);
  const emailValidFmt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  useEffect(() => {
    clearTimeout(debounceRef.current.username);
    if (!data.username) return setUsernameStatus("idle");
    if (!usernameValidFmt) return setUsernameStatus("invalid");
    setUsernameStatus("checking");
    debounceRef.current.username = setTimeout(async () => {
      try {
        const res = await authService.checkAvailability({
          username: data.username,
        });
        setUsernameStatus(res?.data?.data?.username || "idle");
      } catch {
        setUsernameStatus("idle");
      }
    }, 450);
    return () => clearTimeout(debounceRef.current.username);
  }, [data.username, usernameValidFmt]);

  useEffect(() => {
    clearTimeout(debounceRef.current.email);
    if (!data.email) return setEmailStatus("idle");
    if (!emailValidFmt) return setEmailStatus("invalid");
    setEmailStatus("checking");
    debounceRef.current.email = setTimeout(async () => {
      try {
        const res = await authService.checkAvailability({ email: data.email });
        setEmailStatus(res?.data?.data?.email || "idle");
      } catch {
        setEmailStatus("idle");
      }
    }, 450);
    return () => clearTimeout(debounceRef.current.email);
  }, [data.email, emailValidFmt]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    update(e.target.name, value);
  };

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(data.username);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const passwordValid = data.password.length >= 8;
  const passwordsMatch =
    data.password === data.confirmPassword && data.confirmPassword.length > 0;
  const phoneValid = /^\+\d{1,4}\d{6,14}$/.test(data.phone);

  const accountStepValid =
    data.fullName.trim().length >= 2 &&
    usernameValid &&
    usernameStatus !== "taken" &&
    usernameStatus !== "invalid" &&
    emailValid &&
    emailStatus !== "taken" &&
    emailStatus !== "invalid" &&
    phoneValid &&
    passwordValid &&
    passwordsMatch &&
    data.agreeToTerms;

  const profileStepValid =
    userType === "founder"
      ? data.companyName.trim().length >= 2 &&
        data.industry &&
        data.fundingStage
      : data.investorType &&
        data.investmentRange &&
        data.preferredIndustries.length > 0 &&
        data.preferredStages.length > 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!profileStepValid) return;
    setError("");
    setLoading(true);

    try {
      // Step 1: Send OTP to verify email (account is NOT created yet)
      const res = await authService.sendPreRegisterOtp(data.email);
      const devOtp = res?.data?.data?.devOtp || null;

      // Convert the selected investment-range key → { min, max } for the API
      const rangeOpt = INVESTMENT_RANGES.find(
        (r) => r.value === data.investmentRange,
      );
      const investmentRange = rangeOpt
        ? { min: rangeOpt.min, max: rangeOpt.max }
        : undefined;

      const isFounder = userType === "founder";

      // Navigate to verify page with all form data so we can register after OTP
      navigate("/verify", {
        state: {
          email: data.email,
          phone: data.phone,
          devOtp,
          registerData: {
            // Common
            name: data.fullName,
            username: data.username,
            email: data.email,
            password: data.password,
            role: userType,
            phone: data.phone || undefined,
            country: data.country || undefined,
            linkedIn: data.linkedIn || undefined,
            // Founder-only
            ...(isFounder
              ? {
                  companyName: data.companyName || undefined,
                  industry: data.industry || undefined,
                  fundingStage: data.fundingStage || undefined,
                  website: data.website || undefined,
                }
              : {
                  // Investor-only
                  investorType: data.investorType || undefined,
                  investmentRange,
                  investmentThesis: data.investmentThesis || undefined,
                  preferredIndustries: data.preferredIndustries?.length
                    ? data.preferredIndustries
                    : undefined,
                  preferredStages: data.preferredStages?.length
                    ? data.preferredStages
                    : undefined,
                }),
          },
        },
      });
    } catch (err) {
      console.error("Signup error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification email. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-3xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 leading-tight tracking-tight">
          Join{" "}
          <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
            EXPGLO FUND
          </span>
        </h1>
        <p className="text-[#0A1F14]/60 text-base sm:text-lg">
          Start your fundraising journey today
        </p>
      </div>

      {step > 0 && <Stepper steps={STEPS} current={step} />}

      <AnimatePresence mode="wait">
        {/* ─── STEP 1: ROLE ──────────────────────── */}
        {step === 0 && (
          <motion.div
            key="step-role"
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
                description="Pitch your startup and connect with investors who believe in your vision."
                accent="gold"
                bullets={[
                  "Upload 60-second pitch videos",
                  "Connect with 850+ investors",
                  "Access fundraising courses",
                ]}
                onClick={() => {
                  setUserType("founder");
                  setStep(1);
                }}
              />
              <RoleCard
                title="Investor"
                icon={<HiTrendingUp className="w-7 h-7 text-[#F5B942]" />}
                description="Discover promising startups and back the next big thing."
                accent="green"
                bullets={[
                  "Browse 2,400+ startup pitches",
                  "AI-powered matching",
                  "Direct founder messaging",
                ]}
                onClick={() => {
                  setUserType("investor");
                  setStep(1);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: ACCOUNT BASICS ─────────────── */}
        {step === 1 && (
          <motion.form
            key="step-account"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (accountStepValid) setStep(2);
            }}
            className="space-y-4"
          >
            <RoleBadge userType={userType} onChange={() => setStep(0)} />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Full name"
                name="fullName"
                icon={HiUser}
                value={data.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                required
              />
              <FormField
                label="Username"
                name="username"
                icon={HiAtSymbol}
                value={data.username}
                onChange={handleChange}
                placeholder="john_startup"
                autoComplete="username"
                helper={
                  usernameStatus === "checking"
                    ? "Checking availability…"
                    : usernameStatus === "idle" && !data.username
                      ? "3-20 characters, letters, numbers, underscore"
                      : null
                }
                error={
                  usernameStatus === "invalid"
                    ? "3-20 chars: letters, numbers, underscore only"
                    : usernameStatus === "taken"
                      ? "This username is already taken"
                      : null
                }
                success={
                  usernameStatus === "available" ? "Username available" : null
                }
                required
              />
            </div>

            <FormField
              label="Email address"
              name="email"
              icon={HiMail}
              type="email"
              value={data.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              helper={
                emailStatus === "checking" ? "Checking availability…" : null
              }
              error={
                emailStatus === "invalid"
                  ? "Enter a valid email"
                  : emailStatus === "taken"
                    ? "This email is already registered — try logging in"
                    : null
              }
              success={emailStatus === "available" ? "Email available" : null}
            />

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
                Phone number<span className="text-[#1B5E3F] ml-1">*</span>
              </label>
              <PhoneInput value={data.phone} onChange={handleChange} required />
              <p className="text-xs text-[#0A1F14]/55 mt-1.5">
                We'll send a verification code to this number.
              </p>
            </div>

            <Select
              label="Country"
              name="country"
              value={data.country}
              onChange={handleChange}
              options={COUNTRIES}
              placeholder="Select your country"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Password"
                  name="password"
                  icon={HiLockClosed}
                  type="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
                <PasswordStrength password={data.password} />
              </div>
              <FormField
                label="Confirm password"
                name="confirmPassword"
                icon={HiLockClosed}
                type="password"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
                error={
                  data.confirmPassword && !passwordsMatch
                    ? "Passwords do not match"
                    : null
                }
                success={passwordsMatch ? "Passwords match" : null}
                required
              />
            </div>

            <Checkbox
              name="agreeToTerms"
              checked={data.agreeToTerms}
              onChange={handleChange}
              required
            >
              I agree to the{" "}
              <Link
                to="#"
                className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="#"
                className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold"
              >
                Privacy Policy
              </Link>
            </Checkbox>

            <div className="flex items-center justify-between gap-3 pt-2">
              <BackButton onClick={() => setStep(0)} />
              <NextButton disabled={!accountStepValid}>Continue</NextButton>
            </div>
          </motion.form>
        )}

        {/* ─── STEP 3: ROLE-SPECIFIC PROFILE ──────── */}
        {step === 2 && (
          <motion.form
            key="step-profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <RoleBadge userType={userType} onChange={() => setStep(0)} />

            {userType === "founder" ? (
              <>
                <FormField
                  label="Company / startup name"
                  name="companyName"
                  icon={HiOfficeBuilding}
                  value={data.companyName}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  required
                />
                <Select
                  label="Industry"
                  name="industry"
                  value={data.industry}
                  onChange={handleChange}
                  options={INDUSTRIES}
                  placeholder="Pick your sector"
                  required
                />
                <Select
                  label="Funding stage"
                  name="fundingStage"
                  value={data.fundingStage}
                  onChange={handleChange}
                  options={FUNDING_STAGES}
                  placeholder="Where are you?"
                  required
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Website (optional)"
                    name="website"
                    icon={HiGlobe}
                    value={data.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                  />
                  <FormField
                    label="LinkedIn (optional)"
                    name="linkedIn"
                    icon={FaLinkedin}
                    value={data.linkedIn}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/you"
                  />
                </div>
              </>
            ) : (
              <>
                <Select
                  label="Investor type"
                  name="investorType"
                  value={data.investorType}
                  onChange={handleChange}
                  options={INVESTOR_TYPES}
                  placeholder="What kind of investor are you?"
                  required
                />
                <Select
                  label="Typical investment range"
                  name="investmentRange"
                  value={data.investmentRange}
                  onChange={handleChange}
                  options={INVESTMENT_RANGES}
                  placeholder="Select a range"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
                    Preferred industries
                    <span className="text-[#1B5E3F] ml-1">*</span>
                    <span className="text-xs text-[#0A1F14]/45 ml-2 font-normal">
                      pick at least 1
                    </span>
                  </label>
                  <MultiSelectChips
                    options={INDUSTRIES}
                    value={data.preferredIndustries}
                    onChange={(v) => update("preferredIndustries", v)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
                    Preferred funding stages
                    <span className="text-[#1B5E3F] ml-1">*</span>
                    <span className="text-xs text-[#0A1F14]/45 ml-2 font-normal">
                      pick at least 1
                    </span>
                  </label>
                  <MultiSelectChips
                    options={FUNDING_STAGES.map((s) =>
                      typeof s === "string" ? s : s.label,
                    )}
                    value={data.preferredStages}
                    onChange={(v) => update("preferredStages", v)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
                    Investment thesis (optional)
                    <span className="text-xs text-[#0A1F14]/45 ml-2 font-normal">
                      what excites you
                    </span>
                  </label>
                  <textarea
                    name="investmentThesis"
                    value={data.investmentThesis}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. I back early-stage founders solving climate problems with hardware…"
                    className="w-full px-4 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none transition-all resize-none text-base"
                  />
                </div>

                <FormField
                  label="LinkedIn (optional)"
                  name="linkedIn"
                  icon={FaLinkedin}
                  value={data.linkedIn}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/you"
                />
              </>
            )}

            {error && (
              <p className="text-sm text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <BackButton onClick={() => setStep(1)} />
              <NextButton type="submit" disabled={!profileStepValid || loading}>
                {loading ? "Sending OTP…" : "Create account"}
              </NextButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="text-center mt-7 pt-6 border-t border-[#1B5E3F]/10">
        <p className="text-[#0A1F14]/65 text-sm sm:text-base">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── Sub-components ──────────────────────────

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
    <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
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
          Signing up as {isFounder ? "Founder" : "Investor"}
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

function BackButton({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="px-5 py-3 text-[#0A1F14]/75 font-bold rounded-full border border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40 hover:text-[#0F4A2E] flex items-center gap-2 transition-all bg-white"
    >
      <HiArrowLeft className="w-4 h-4" />
      Back
    </motion.button>
  );
}

function NextButton({ children, disabled, type = "submit" }) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`px-7 py-3 rounded-full font-bold text-sm shadow-xl transition-all flex items-center gap-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-[#1B5E3F]/30 ${
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : ""
      }`}
    >
      {children}
      <HiArrowRight className="w-4 h-4" />
    </motion.button>
  );
}
