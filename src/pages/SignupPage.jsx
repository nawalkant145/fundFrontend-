import { useState } from "react";
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
  HiCash,
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
import {
  INDUSTRIES,
  FUNDING_STAGES,
  INVESTOR_TYPES,
  INVESTMENT_RANGES,
  COUNTRIES,
} from "../constants/options";

const STEPS = ["Role", "Account", "Profile"];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [data, setData] = useState({
    // Step 2 — Account basics
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    agreeToTerms: false,
    // Founder
    companyName: "",
    industry: "",
    fundingStage: "",
    website: "",
    linkedIn: "",
    // Investor
    investorType: "",
    investmentRange: "",
    preferredIndustries: [],
    preferredStages: [],
    investmentThesis: "",
  });

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    update(e.target.name, value);
  };

  // ─── Validation ────────────────────────────
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(data.username);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const passwordValid = data.password.length >= 8;
  const passwordsMatch =
    data.password === data.confirmPassword && data.confirmPassword.length > 0;
  const phoneValid = /^\+\d{1,4}\d{6,14}$/.test(data.phone);

  const accountStepValid =
    data.fullName.trim().length >= 2 &&
    usernameValid &&
    emailValid &&
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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!profileStepValid) return;
    // Static — would POST to /api/auth/register
    setAuth({ role: userType, identifier: data.email });
    navigate("/verify", { state: { email: data.email, phone: data.phone } });
  };

  return (
    <AuthShell maxWidth="max-w-3xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">
          Join{" "}
          <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
            EXPGLO FUND
          </span>
        </h1>
        <p className="text-gray-300 text-base sm:text-lg">
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
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
              I am a...
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <RoleCard
                title="Founder"
                icon={<IoRocketSharp className="w-12 h-12 text-gold" />}
                description="Pitch your startup and connect with investors who believe in your vision."
                accent="gold"
                bullets={[
                  "Upload 60-second pitch videos",
                  "Connect with 850+ investors",
                  "Access fundraising courses",
                ]}
                active={userType === "founder"}
                onClick={() => {
                  setUserType("founder");
                  setStep(1);
                }}
              />
              <RoleCard
                title="Investor"
                icon={<HiTrendingUp className="w-12 h-12 text-primary-green" />}
                description="Discover promising startups and back the next big thing."
                accent="green"
                bullets={[
                  "Browse 2,400+ startup pitches",
                  "AI-powered matching",
                  "Direct founder communication",
                ]}
                active={userType === "investor"}
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
            className="space-y-5"
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
                  data.username && !usernameValid
                    ? null
                    : "3-20 characters, letters, numbers, underscore"
                }
                error={
                  data.username && !usernameValid
                    ? "Invalid username format"
                    : null
                }
                success={data.username && usernameValid ? "Looks good" : null}
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
              error={data.email && !emailValid ? "Invalid email" : null}
            />

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Phone number<span className="text-gold ml-1">*</span>
              </label>
              <PhoneInput value={data.phone} onChange={handleChange} required />
              <p className="text-xs text-gray-400 mt-1.5">
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
              <Link to="#" className="text-gold hover:text-bright-gold">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-gold hover:text-bright-gold">
                Privacy Policy
              </Link>
            </Checkbox>

            <div className="flex items-center justify-between gap-3 pt-2">
              <BackButton onClick={() => setStep(0)} />
              <NextButton
                disabled={!accountStepValid}
                accent={userType === "founder" ? "gold" : "green"}
              >
                Continue
              </NextButton>
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
            className="space-y-5"
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
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Preferred industries
                    <span className="text-gold ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">
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
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Preferred funding stages
                    <span className="text-gold ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      pick at least 1
                    </span>
                  </label>
                  <MultiSelectChips
                    options={FUNDING_STAGES.map((s) => s.label)}
                    value={data.preferredStages}
                    onChange={(v) => update("preferredStages", v)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Investment thesis (optional)
                    <span className="text-xs text-gray-500 ml-2">
                      what excites you
                    </span>
                  </label>
                  <textarea
                    name="investmentThesis"
                    value={data.investmentThesis}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. I back early-stage founders solving climate problems with hardware…"
                    className="w-full px-4 py-4 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all resize-none"
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <BackButton onClick={() => setStep(1)} />
              <NextButton
                type="submit"
                disabled={!profileStepValid}
                accent={userType === "founder" ? "gold" : "green"}
              >
                Create account
              </NextButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="text-center mt-8 pt-6 border-t border-gold/10">
        <p className="text-gray-300 text-sm sm:text-base">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gold hover:text-bright-gold font-semibold transition-colors"
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
  const accents =
    accent === "gold"
      ? "from-gold/10 to-bright-gold/5 border-gold/30 hover:border-gold"
      : "from-primary-green/10 to-secondary-green/5 border-primary-green/30 hover:border-primary-green";
  const bulletColor = accent === "gold" ? "text-gold" : "text-primary-green";
  const arrowColor = accent === "gold" ? "text-gold" : "text-primary-green";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative p-6 sm:p-8 bg-gradient-to-br ${accents} border-2 rounded-2xl transition-all text-left overflow-hidden`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
          accent === "gold" ? "bg-gold/10" : "bg-primary-green/10"
        } group-hover:opacity-30 transition-all`}
      />
      <div className="relative z-10">
        {icon}
        <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-3 text-white">
          {title}
        </h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        <div className="space-y-2">
          {bullets.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <HiCheckCircle className={`flex-shrink-0 ${bulletColor}`} />
              <span>{b}</span>
            </div>
          ))}
        </div>
        <motion.div
          className={`mt-5 font-semibold flex items-center gap-2 ${arrowColor}`}
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
    <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
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
          Signing up as {userType === "founder" ? "Founder" : "Investor"}
        </span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="text-xs text-gray-400 hover:text-gold transition-colors underline"
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
      className="px-5 py-3 text-gray-300 font-semibold rounded-xl border-2 border-gold/15 hover:border-gold/40 hover:text-white flex items-center gap-2 transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <HiArrowLeft className="w-5 h-5" />
      Back
    </motion.button>
  );
}

function NextButton({ children, disabled, accent = "gold", type = "submit" }) {
  const cls =
    accent === "gold"
      ? "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30 hover:shadow-gold/50"
      : "bg-gradient-to-r from-primary-green to-secondary-green text-white shadow-primary-green/30 hover:shadow-primary-green/50";
  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={`px-7 py-3.5 rounded-xl font-bold text-base shadow-lg transition-all flex items-center gap-2 ${cls} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {children}
      <HiArrowRight className="w-5 h-5" />
    </motion.button>
  );
}

export default SignupPage;
