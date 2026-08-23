import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldCheck,
  HiInformationCircle,
  HiCheckCircle,
  HiArrowRight,
  HiBadgeCheck,
  HiOfficeBuilding,
  HiLibrary,
  HiCreditCard,
  HiClock,
  HiXCircle,
  HiLightningBolt,
  HiUpload,
  HiLockClosed,
  HiUser,
  HiExclamationCircle,
  HiArrowLeft,
  HiSparkles,
} from "react-icons/hi";
import { HiBuildingLibrary } from "react-icons/hi2";
import { MdVerified } from "react-icons/md";


import AuthShell from "../components/auth/AuthShell";
import FileDropzone from "../components/auth/FileDropzone";
import kycService from "../services/kycService";
import { authService } from "../services/authService";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { value: "personal", label: "Level 2: Personal ID", icon: HiBadgeCheck },
  { value: "company", label: "Level 3: Founder & Startup", icon: HiOfficeBuilding },
  { value: "investment", label: "Level 4: Investor Transaction", icon: HiCreditCard },
];

const readFileAsBase64 = (file) => {
  if (!file) return Promise.resolve("");
  if (typeof file === "string") return Promise.resolve(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function KycPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState("");

  // DigiLocker & Pre-account flow state
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [digilockerFailed, setDigilockerFailed] = useState(false);

  // Skip Verification Modal state
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippingLoading, setSkippingLoading] = useState(false);

  // Pre-account signup flow detection
  const params = new URLSearchParams(location.search);
  const signupSessionId =
    params.get("session") || sessionStorage.getItem("signupSessionId") || null;
  const isSignupFlow = !!signupSessionId;

  // Level 2 Docs
  const [personalDocs, setPersonalDocs] = useState({
    documentType: "pan",
    documentNumber: "",
    documentFront: null,
    documentBack: null,
    selfie: null,
  });

  // Level 3 Docs
  const [companyDocs, setCompanyDocs] = useState({
    companyName: "",
    CIN: "",
    GST: "",
    companyPAN: "",
    businessEmail: "",
    registrationCertificate: null,
    startupIndiaCert: null,
  });

  // Level 4 Docs
  const [investorDocs, setInvestorDocs] = useState({
    addressProofType: "bank_statement",
    addressProofUrl: null,
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    bankProofUrl: null,
    declaredNetWorth: "",
  });

  const fetchStatus = () => {
    if (isSignupFlow) return; // no account yet — skip status fetch
    kycService
      .getStatus()
      .then((res) => {
        const sData = res?.data?.data || res?.data;
        setStatus(sData);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the browser landing back here after the DigiLocker OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const result = urlParams.get("digilocker");
    const fromSignup = urlParams.get("signup") === "1";
    if (!result) return;

    if (result === "approved") {
      if (fromSignup) {
        sessionStorage.removeItem("signupSessionId");
        toast.success("Identity verified! Your account has been created. Welcome! 🎉");
        if (refreshUser) {
          refreshUser()
            .then((freshUser) => {
              navigate("/app", { replace: true });
            })
            .catch(() => navigate("/app", { replace: true }));
        } else {
          navigate("/app", { replace: true });
        }
        return;
      }
      toast.success("Identity verified via DigiLocker! 🎉");
    } else if (result === "manual_review") {
      toast.success("Documents received — a compliance reviewer will confirm shortly.");
    } else if (result === "failed") {
      if (fromSignup) {
        toast.error("Identity verification failed. Your account has not been created.");
        setDigilockerFailed(true);
        navigate(`/kyc?session=${sessionStorage.getItem("signupSessionId") || ""}`, { replace: true });
        return;
      }
      toast.error("DigiLocker verification failed. You can try again or upload manually.");
    }

    fetchStatus();
    if (refreshUser) refreshUser();
    navigate("/kyc", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleVerifyWithDigiLocker = async () => {
    setDigilockerLoading(true);
    try {
      let res;
      if (isSignupFlow && signupSessionId) {
        res = await kycService.initiateDigiLockerForSignup(signupSessionId);
      } else {
        res = await kycService.initiateDigiLocker();
      }
      const data = res?.data?.data || res?.data;
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("Could not start DigiLocker verification. Please try again.");
        setDigilockerLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start DigiLocker verification.");
      setDigilockerLoading(false);
    }
  };

  const handleConfirmSkip = async () => {
    setSkippingLoading(true);
    try {
      if (isSignupFlow && signupSessionId) {
        // Pre-account flow: Call backend API to create unverified account
        const res = await authService.skipSignup(signupSessionId);
        const payload = res?.data?.data || res?.data;
        sessionStorage.removeItem("signupSessionId");
        toast.info("Verification skipped. You can complete verification anytime from your profile.");
        if (refreshUser) {
          await refreshUser();
        }
        navigate("/app", { replace: true });
      } else {
        // Post-account flow: Logged-in user skipping to app
        toast.info("You can complete verification anytime from Settings or Profile.");
        navigate("/app", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not skip verification.");
    } finally {
      setSkippingLoading(false);
      setShowSkipModal(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    if (!personalDocs.documentFront || !personalDocs.selfie) {
      toast.error("Please upload front ID and selfie");
      return;
    }
    setSubmitting(true);
    try {
      const frontUrl = await readFileAsBase64(personalDocs.documentFront);
      const backUrl = await readFileAsBase64(personalDocs.documentBack);
      const selfieUrl = await readFileAsBase64(personalDocs.selfie);

      const isRejected = status?.statusCard?.identityVerified?.status === "rejected";
      const apiCall = isRejected ? kycService.resubmitPersonalKyc : kycService.submitPersonalKyc;

      const res = await apiCall({
        documentType: personalDocs.documentType,
        documentNumber: personalDocs.documentNumber,
        documentFront: frontUrl,
        documentBack: backUrl,
        selfie: selfieUrl,
      });

      const data = res?.data?.data || res?.data;
      setSubmittedRefId(data?.referenceId || "");
      setSubmitted(true);
      if (refreshUser) refreshUser();
      toast.success(isRejected ? "Personal KYC resubmitted successfully!" : "Personal KYC submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyDocs.companyName || !companyDocs.CIN || !companyDocs.registrationCertificate) {
      toast.error("Please fill company name, CIN, and registration certificate");
      return;
    }
    setSubmitting(true);
    try {
      const regCertUrl = await readFileAsBase64(companyDocs.registrationCertificate);
      const panCertUrl = await readFileAsBase64(companyDocs.companyPAN);
      const startupCertUrl = await readFileAsBase64(companyDocs.startupIndiaCert);

      await kycService.submitCompanyKyc({
        companyName: companyDocs.companyName,
        CIN: companyDocs.CIN,
        GST: companyDocs.GST,
        companyPAN: companyDocs.companyPAN || "ABCDE1234F",
        businessEmail: companyDocs.businessEmail || "founder@company.com",
        registrationCertificate: regCertUrl,
        companyPanUrl: panCertUrl,
        startupIndiaCert: startupCertUrl,
      });
      setSubmitted(true);
      if (refreshUser) refreshUser();
      toast.success("Company verification submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvestorSubmit = async (e) => {
    e.preventDefault();
    if (!investorDocs.accountNumber || !investorDocs.ifscCode || !investorDocs.bankProofUrl) {
      toast.error("Please fill bank account details and proof document");
      return;
    }
    setSubmitting(true);
    try {
      const addressUrl = await readFileAsBase64(investorDocs.addressProofUrl);
      const bankProofUrl = await readFileAsBase64(investorDocs.bankProofUrl);

      await kycService.submitInvestmentKyc({
        addressProofType: investorDocs.addressProofType,
        addressProofUrl: addressUrl,
        bankAccountDetails: {
          accountNumber: investorDocs.accountNumber,
          ifscCode: investorDocs.ifscCode,
          bankName: investorDocs.bankName || "HDFC Bank",
          proofUrl: bankProofUrl,
        },
        declaredNetWorth: Number(investorDocs.declaredNetWorth) || 5000000,
      });
      setSubmitted(true);
      if (refreshUser) refreshUser();
      toast.success("Investment transaction verification submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const identitySt = status?.statusCard?.identityVerified?.status || user?.kycStatus;
  const isIdentityApproved = identitySt === "approved" || identitySt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 1);
  const isIdentityPending = identitySt === "pending" || identitySt === "under_review" || identitySt === "digilocker_pending";
  const isIdentityRejected = identitySt === "rejected" || identitySt === "failed";

  const companySt = status?.statusCard?.founderVerification?.status || user?.companyVerificationStatus;
  const isCompanyApproved = companySt === "approved" || companySt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 3);
  const isCompanyPending = companySt === "pending" || companySt === "under_review";

  const investorSt = status?.statusCard?.investmentKyc?.status || user?.investmentVerificationStatus;
  const isInvestorApproved = investorSt === "approved" || investorSt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 4);
  const isInvestorPending = investorSt === "pending" || investorSt === "under_review";

  return (
    <AuthShell maxWidth="max-w-4xl">
      <AnimatePresence mode="wait">
        {/* ── PRE-ACCOUNT SIGNUP VERIFICATION MODE ─────────────────────────── */}
        {isSignupFlow ? (
          <motion.div
            key="signup-verification"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-7"
          >
            {/* 1. Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B5E3F] via-[#24704B] to-[#0F4A2E] shadow-xl shadow-[#1B5E3F]/20 mx-auto">
                <HiShieldCheck className="w-9 h-9 text-[#F5B942]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0A1F14]">
                Verify Your Identity
              </h1>
              <p className="text-[#0A1F14]/70 text-sm sm:text-base max-w-lg mx-auto font-medium">
                Your account will be created only after successful identity verification.
              </p>
            </div>

            {/* 2. Account Status Alert */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex gap-3.5 items-start shadow-xs">
              <div className="p-2 bg-amber-100/80 text-amber-700 rounded-xl flex-shrink-0 mt-0.5">
                <HiExclamationCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-amber-900 tracking-tight">Account not created yet</p>
                <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed">
                  No EXPGLO account exists until you complete identity verification below. If you leave this page, you can restart signup.
                </p>
              </div>
            </div>

            {/* 3. DigiLocker Verification Card */}
            {digilockerFailed ? (
              /* FAILURE STATE */
              <div className="bg-red-50/90 border-2 border-red-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 border-2 border-red-200 mx-auto">
                  <HiXCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
                    Verification Failed
                  </span>
                  <h3 className="text-2xl font-black text-[#0A1F14] mt-2">Identity Verification Failed</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your identity could not be verified. Your account has not been created. You can retry verification or go back to correct your details.
                  </p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={() => setDigilockerFailed(false)}
                    className="px-7 py-3.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Retry Verification <HiArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem("signupSessionId");
                      navigate("/signup");
                    }}
                    className="px-7 py-3.5 border border-[#1B5E3F]/30 text-[#0F4A2E] text-sm font-bold rounded-xl hover:bg-[#1B5E3F]/5 transition-all cursor-pointer"
                  >
                    Go Back to Signup
                  </button>
                </div>
              </div>
            ) : (
              /* TWO-COLUMN DIGILOCKER CARD */
              <div className="bg-white border border-[#1B5E3F]/15 rounded-3xl p-6 sm:p-8 md:p-9 shadow-sm hover:shadow-md transition-all">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Security Illustration & Messaging */}
                  <div className="md:col-span-5 bg-gradient-to-br from-[#F4F7F4] via-[#EEF5F0] to-[#E2EFE7] rounded-2xl p-6 sm:p-7 border border-[#1B5E3F]/12 text-center space-y-4">
                    {/* Visual Security Stack */}
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#1B5E3F]/10 animate-ping opacity-30" />
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1B5E3F] to-[#2D7A4F] text-white flex items-center justify-center shadow-lg shadow-[#1B5E3F]/25 relative z-10">
                        <HiLockClosed className="w-10 h-10 text-[#F5B942]" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border border-[#1B5E3F]/20 shadow-md z-20">
                        <HiShieldCheck className="w-5 h-5 text-[#1B5E3F]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#0A1F14]">
                        Your data is safe with us.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#0A1F14]/70 leading-relaxed font-medium">
                        We use secure and trusted government APIs for identity verification.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1B5E3F]/10 flex items-center justify-center gap-2 text-xs font-semibold text-[#1B5E3F]">
                      <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>256-bit Encryption Standard</span>
                    </div>
                  </div>

                  {/* Right Column: Verification Action & Features */}
                  <div className="md:col-span-7 space-y-5">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#1B5E3F]/10 text-[#0F4A2E] border border-[#1B5E3F]/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Trusted by Government of India</span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F14] tracking-tight">
                        Verify with DigiLocker
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Fetch your Aadhaar/PAN directly from DigiLocker and verify your identity automatically. Once verified, your EXPGLO account will be created and you'll be logged in.
                      </p>
                    </div>

                    {/* Three Security Feature Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1">
                      {/* 1. Secure */}
                      <div className="bg-[#F8FAF8] border border-[#1B5E3F]/12 rounded-2xl p-3 flex items-start gap-2.5 text-left shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <HiShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-extrabold text-[#0A1F14] text-xs sm:text-sm tracking-tight truncate">
                            Secure
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            End-to-end encryption
                          </p>
                        </div>
                      </div>

                      {/* 2. Official */}
                      <div className="bg-[#F8FAF8] border border-[#1B5E3F]/12 rounded-2xl p-3 flex items-start gap-2.5 text-left shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <HiBuildingLibrary className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-extrabold text-[#0A1F14] text-xs sm:text-sm tracking-tight truncate">
                            Official
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            Government verified source
                          </p>
                        </div>
                      </div>

                      {/* 3. Fast & Easy */}
                      <div className="bg-[#F8FAF8] border border-[#1B5E3F]/12 rounded-2xl p-3 flex items-start gap-2.5 text-left shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <HiLightningBolt className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-extrabold text-[#0A1F14] text-xs sm:text-sm tracking-tight truncate">
                            Fast & Easy
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            Takes less than a minute
                          </p>
                        </div>
                      </div>
                    </div>



                    {/* Primary CTA Button */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleVerifyWithDigiLocker}
                        disabled={digilockerLoading}
                        className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-gradient-to-r from-[#1B5E3F] via-[#23744A] to-[#0F4A2E] hover:from-[#23744A] hover:to-[#1B5E3F] shadow-lg shadow-[#1B5E3F]/25 hover:shadow-xl hover:shadow-[#1B5E3F]/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {digilockerLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting to DigiLocker…</span>
                          </>
                        ) : (
                          <>
                            <span>Verify with DigiLocker</span>
                            <HiArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-slate-500 text-center font-medium">
                        Provider OTPs required by DigiLocker/Aadhaar are expected and allowed.
                      </p>
                    </div>

                    {/* Edit details back link */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.removeItem("signupSessionId");
                          navigate("/signup");
                        }}
                        className="text-xs font-bold text-[#1B5E3F] hover:text-[#0F4A2E] underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
                      >
                        <HiArrowLeft className="w-3.5 h-3.5" />
                        <span>Go back and edit my details</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 4. NEW — Skip Verification Section */}
            <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 bg-white border border-[#1B5E3F]/15 text-[#1B5E3F] rounded-2xl flex-shrink-0 shadow-xs">
                    <HiUser className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-base font-black text-[#0A1F14]">
                      Want to explore first?
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      You can skip identity verification for now and do it later from your profile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSkipModal(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#1B5E3F]/25 hover:border-[#1B5E3F] text-[#0F4A2E] hover:bg-emerald-50/50 text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Skip for now</span>
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 pt-2">
              <HiShieldCheck className="w-4 h-4 text-[#1B5E3F]/70" />
              <span>Some features may be limited until identity verification is completed.</span>
            </div>
          </motion.div>
        ) : !submitted ? (

          /* ── POST-ACCOUNT LOGGED-IN KYC WORKSPACE MODE ─────────────────── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] mb-3 shadow-md shadow-[#1B5E3F]/25 mx-auto">
                <HiShieldCheck className="w-7 h-7 text-[#F5B942]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight text-[#0A1F14]">
                Verification Workspace
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base max-w-xl mx-auto font-medium">
                Complete verification levels to unlock badges, startup publishing, and deal rooms.
              </p>
            </div>

            {/* Logged in verification summary bar */}
            <div className="bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Verification Level</span>
                <span className="text-lg font-black text-[#1B5E3F]">
                  Level {user?.verificationLevel || 0}
                </span>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${isIdentityApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  Level 2: {isIdentityApproved ? "Approved ✓" : "Pending"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${isCompanyApproved ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                  Level 3: {isCompanyApproved ? "Approved ✓" : "Unverified"}
                </span>
              </div>
            </div>

            {/* DigiLocker Instant Card for Logged In User */}
            {!isIdentityApproved && !showManualUpload && (
              <div className="bg-white border-2 border-[#1B5E3F]/20 rounded-3xl p-6 sm:p-8 mb-8 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1B5E3F]/10 border border-[#1B5E3F]/20 mx-auto">
                  <HiLightningBolt className="w-8 h-8 text-[#1B5E3F]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[#0A1F14]">Instant Verification with DigiLocker</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Fetches your Aadhaar/PAN directly from DigiLocker and verifies your identity automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyWithDigiLocker}
                  disabled={digilockerLoading}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white font-bold rounded-full text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-60"
                >
                  {digilockerLoading ? "Redirecting to DigiLocker…" : "Verify with DigiLocker →"}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualUpload(true)}
                    className="text-xs font-semibold text-slate-500 hover:text-[#1B5E3F] underline"
                  >
                    Or upload documents manually
                  </button>
                </div>
              </div>
            )}

            {/* Level Tabs */}
            {(isIdentityApproved || showManualUpload) && (
              <>
                <div className="flex border-b border-[#1B5E3F]/15 mb-6 overflow-x-auto">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                          activeTab === tab.value
                            ? "border-[#1B5E3F] text-[#1B5E3F]"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Level 2 Personal Upload */}
                {activeTab === "personal" && (
                  <form onSubmit={handlePersonalSubmit} className="space-y-6 bg-white p-6 rounded-3xl border border-[#1B5E3F]/15">
                    <h3 className="text-xl font-black text-[#0A1F14]">Level 2: Personal ID Verification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">ID Document Type</label>
                        <select
                          value={personalDocs.documentType}
                          onChange={(e) => setPersonalDocs({ ...personalDocs, documentType: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        >
                          <option value="pan">PAN Card</option>
                          <option value="aadhar">Aadhaar Card</option>
                          <option value="passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Document Number</label>
                        <input
                          type="text"
                          placeholder="Enter document number"
                          value={personalDocs.documentNumber}
                          onChange={(e) => setPersonalDocs({ ...personalDocs, documentNumber: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Document Front Image *</label>
                        <FileDropzone
                          accept="image/*,.pdf"
                          value={personalDocs.documentFront}
                          onChange={(file) => setPersonalDocs({ ...personalDocs, documentFront: file })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Selfie Verification *</label>
                        <FileDropzone
                          accept="image/*"
                          value={personalDocs.selfie}
                          onChange={(file) => setPersonalDocs({ ...personalDocs, selfie: file })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#1B5E3F] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#0F4A2E] transition-all cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Personal ID for Review"}
                    </button>
                  </form>
                )}

                {/* Level 3 Company Upload */}
                {activeTab === "company" && (
                  <form onSubmit={handleCompanySubmit} className="space-y-6 bg-white p-6 rounded-3xl border border-[#1B5E3F]/15">
                    <h3 className="text-xl font-black text-[#0A1F14]">Level 3: Startup & Company Verification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          placeholder="Registered Legal Name"
                          value={companyDocs.companyName}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, companyName: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">CIN / Registration No *</label>
                        <input
                          type="text"
                          placeholder="e.g. U74999MH2024PTC123456"
                          value={companyDocs.CIN}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, CIN: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Incorporation Certificate *</label>
                      <FileDropzone
                        accept="image/*,.pdf"
                        value={companyDocs.registrationCertificate}
                        onChange={(file) => setCompanyDocs({ ...companyDocs, registrationCertificate: file })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#1B5E3F] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#0F4A2E] transition-all cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Company Documents"}
                    </button>
                  </form>
                )}

                {/* Level 4 Investor Upload */}
                {activeTab === "investment" && (
                  <form onSubmit={handleInvestorSubmit} className="space-y-6 bg-white p-6 rounded-3xl border border-[#1B5E3F]/15">
                    <h3 className="text-xl font-black text-[#0A1F14]">Level 4: Investor Transaction KYC</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bank Account Number *</label>
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={investorDocs.accountNumber}
                          onChange={(e) => setInvestorDocs({ ...investorDocs, accountNumber: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">IFSC Code *</label>
                        <input
                          type="text"
                          placeholder="IFSC Code"
                          value={investorDocs.ifscCode}
                          onChange={(e) => setInvestorDocs({ ...investorDocs, ifscCode: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bank Statement / Cancelled Cheque *</label>
                      <FileDropzone
                        accept="image/*,.pdf"
                        value={investorDocs.bankProofUrl}
                        onChange={(file) => setInvestorDocs({ ...investorDocs, bankProofUrl: file })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#1B5E3F] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#0F4A2E] transition-all cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Investor KYC"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Skip section for logged-in users who haven't completed verification */}
            <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-3xl p-5 sm:p-6 shadow-xs mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-[#1B5E3F]/15 text-[#1B5E3F] rounded-xl flex-shrink-0">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A1F14]">Continue as Unverified User</h4>
                    <p className="text-xs text-slate-500">You can return to complete verification anytime.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSkipModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#1B5E3F]/30 text-[#0F4A2E] text-xs font-bold hover:bg-emerald-50/50 transition-all cursor-pointer"
                >
                  Skip to Workspace →
                </button>
              </div>
            </div>

          </motion.div>
        ) : (

          /* ── SUBMITTED FEEDBACK STATE ─────────────────────────────────── */
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6 py-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 mx-auto shadow-md">
              <HiCheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#0A1F14]">Verification Under Review</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
                Your documents have been submitted to compliance. You will receive an in-app update once approved.
              </p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#1B5E3F]/10">
                <span className="text-xs text-gray-500 font-bold uppercase">Reference ID</span>
                <span className="text-xs font-mono font-bold text-[#1B5E3F] bg-[#1B5E3F]/10 px-2.5 py-1 rounded-md">
                  {submittedRefId || "KYC-2026-SUBMITTED"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold">Submitted Date</span>
                <span className="text-xs font-bold text-gray-800">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold">Current Status</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Under Review
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                if (refreshUser) refreshUser();
                navigate("/app");
              }}
              className="px-8 py-3.5 rounded-full font-bold bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Continue to Workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. SKIP CONFIRMATION MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showSkipModal && (
          <div className="fixed inset-0 z-50 bg-[#0A1F14]/65 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="bg-white border border-[#1B5E3F]/20 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Top Accent bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <HiExclamationCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#0A1F14] tracking-tight">
                  Skip Identity Verification?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  You will enter EXPGLO as an unverified user. You can explore the platform, but verification will be required later for restricted actions.
                </p>
              </div>

              {/* Status & feature impact breakdown */}
              <div className="bg-[#FAFBF9] border border-[#1B5E3F]/12 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Identity status: Unverified (Level 0)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Browse startups, public feed & courses</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-amber-600 font-bold">⚠</span>
                  <span>Deal Room & verified features require KYC later</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmSkip}
                  disabled={skippingLoading}
                  className="w-full py-3.5 px-5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] hover:from-[#23744A] hover:to-[#1B5E3F] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {skippingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating unverified account…</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Skip for Now</span>
                      <HiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSkipModal(false)}
                  disabled={skippingLoading}
                  className="w-full py-3 px-5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back to Verification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
