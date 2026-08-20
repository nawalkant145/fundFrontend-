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
  HiCreditCard,
  HiClock,
  HiXCircle,
  HiLightningBolt,
  HiUpload,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import AuthShell from "../components/auth/AuthShell";
import FileDropzone from "../components/auth/FileDropzone";
import kycService from "../services/kycService";
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

  // DigiLocker
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [digilockerFailed, setDigilockerFailed] = useState(false);

  // Pre-account signup flow detection (Commented out — uncomment when mandatory pre-account KYC is enabled)
  /*
  const params = new URLSearchParams(location.search);
  const signupSessionId =
    params.get("session") || sessionStorage.getItem("signupSessionId") || null;
  const isSignupFlow = !!signupSessionId;
  */
  const signupSessionId = null;
  const isSignupFlow = false;


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
  // (backend redirects to /kyc?digilocker=approved&signup=1|manual_review|failed)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const result = urlParams.get("digilocker");
    const fromSignup = urlParams.get("signup") === "1";
    if (!result) return;

    if (result === "approved") {
      if (fromSignup) {
        // ── PRE-ACCOUNT FLOW: Account was JUST CREATED by the backend callback ──
        // Auth cookies are already set by the backend.
        // Clear the temporary signupSessionId — it has been consumed.
        sessionStorage.removeItem("signupSessionId");
        toast.success("Identity verified! Your account has been created. Welcome! 🎉");
        // Refresh the user context to load the newly-created account
        if (refreshUser) {
          refreshUser().then((freshUser) => {
            const role = freshUser?.role || user?.role;
            navigate(role === "investor" ? "/app" : "/app", { replace: true });
          }).catch(() => navigate("/app", { replace: true }));
        } else {
          navigate("/app", { replace: true });
        }
        return;
      }
      // Post-account flow (existing user)
      toast.success("Identity verified via DigiLocker! 🎉");
    } else if (result === "manual_review") {
      toast.success("Documents received — a compliance reviewer will confirm shortly.");
    } else if (result === "failed") {
      if (fromSignup) {
        // Pre-account failure — no account created
        toast.error("Identity verification failed. Your account has not been created.");
        setDigilockerFailed(true);
        navigate(`/kyc?session=${sessionStorage.getItem("signupSessionId") || ""}`, { replace: true });
        return;
      }
      toast.error("DigiLocker verification failed. You can try again or upload manually.");
    }

    fetchStatus();
    if (refreshUser) refreshUser();
    // Clean the query param so a refresh doesn't re-trigger the toast
    navigate("/kyc", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);



  const handleVerifyWithDigiLocker = async () => {
    setDigilockerLoading(true);
    try {
      let res;
      if (isSignupFlow && signupSessionId) {
        // Pre-account signup flow — use unauthenticated signupSessionId endpoint
        res = await kycService.initiateDigiLockerForSignup(signupSessionId);
      } else {
        // Post-account flow — user is authenticated
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
      toast.error(err.response?.data?.message || "Company submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvestorSubmit = async (e) => {
    e.preventDefault();
    if (!investorDocs.accountNumber || !investorDocs.ifscCode || !investorDocs.addressProofUrl) {
      toast.error("Please fill address proof, account number, and IFSC code");
      return;
    }
    setSubmitting(true);
    try {
      const addressProofUrl = await readFileAsBase64(investorDocs.addressProofUrl);
      const bankProofUrl = await readFileAsBase64(investorDocs.bankProofUrl);

      await kycService.submitInvestmentKyc({
        addressProof: {
          docType: investorDocs.addressProofType,
          docUrl: addressProofUrl,
        },
        bankAccount: {
          accountNumber: investorDocs.accountNumber,
          ifscCode: investorDocs.ifscCode,
          bankName: investorDocs.bankName || "HDFC Bank",
          proofUrl: bankProofUrl,
        },
        netWorthDeclaration: { declaredAmount: Number(investorDocs.declaredNetWorth) || 1000000 },
      });
      setSubmitted(true);
      if (refreshUser) refreshUser();
      toast.success("Investor transaction KYC submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Investor submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Verification Flags
  const identitySt = status?.statusCard?.identityVerified?.status || user?.kycStatus;
  const verificationMethod = status?.statusCard?.identityVerified?.verificationMethod || "manual";
  const isPersonalApproved = identitySt === "approved" || identitySt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 2) || user?.verifiedBadge;
  const isPersonalManualReview = identitySt === "manual_review" || status?.statusCard?.identityVerified?.manualReviewRequired;
  const isPersonalPending =
    !isPersonalManualReview &&
    (identitySt === "pending" || identitySt === "under_review" || identitySt === "submitted" || identitySt === "resubmitted" || identitySt === "digilocker_pending");
  const isPersonalRejected = identitySt === "rejected";

  const companySt = status?.statusCard?.founderVerification?.status || user?.companyVerificationStatus;
  const isCompanyApproved = companySt === "approved" || companySt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 3);
  const isCompanyPending = companySt === "pending" || companySt === "under_review";

  const investorSt = status?.statusCard?.investmentKyc?.status || user?.investmentVerificationStatus;
  const isInvestorApproved = investorSt === "approved" || investorSt === "completed" || (user?.verificationLevel && user?.verificationLevel >= 4);
  const isInvestorPending = investorSt === "pending" || investorSt === "under_review";

  return (
    <AuthShell maxWidth="max-w-4xl">
      <AnimatePresence mode="wait">
        {/* === PRE-ACCOUNT SIGNUP VERIFICATION MODE (Commented out — uncomment when pre-account KYC is enabled) ===
        {isSignupFlow && (
          <motion.div key="signup-verification" ...> ... </motion.div>
        )}
        ==================================================================================================== */}

        {!submitted ? (

          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] mb-3 shadow-md shadow-[#1B5E3F]/25">
                <HiShieldCheck className="w-7 h-7 text-[#F5B942]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight text-[#0A1F14]">
                Verification Workspace
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base max-w-xl mx-auto">
                Complete level requirements to unlock badges, startup publishing, and deal rooms.
              </p>
            </div>

            {/* Level Tabs - Resets submitted state on click to allow smooth navigation */}
            <div className="flex justify-center mb-6 overflow-x-auto pb-2">
              <div className="inline-flex bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full p-1.5 gap-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const isSelected = activeTab === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setActiveTab(t.value);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25"
                          : "text-[#0A1F14]/65 hover:text-[#0F4A2E] hover:bg-emerald-50/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2 Personal ID Section */}
            {activeTab === "personal" && (
              <div>
                {isPersonalApproved ? (
                  <div className="bg-[#FAFAF7] border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200">
                      <MdVerified className="w-10 h-10 text-[#0F4A2E]" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Level 2 Verified
                      </span>
                      <h3 className="text-2xl font-black text-[#0A1F14] mt-2">Identity Verification Complete 🎉</h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        {verificationMethod === "digilocker"
                          ? "Verified instantly via DigiLocker. Your profile is awarded the Blue Verified Badge."
                          : "Your government ID documents have been verified and your profile is awarded the Blue Verified Badge."}
                      </p>
                    </div>

                    <div className="pt-3 flex justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setActiveTab("company");
                        }}
                        className="px-6 py-3 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-full shadow-md transition-all flex items-center gap-2"
                      >
                        Proceed to Level 3 Founder Verification <HiArrowRight />
                      </button>
                    </div>
                  </div>
                ) : isPersonalManualReview ? (
                  <div className="bg-[#FAFAF7] border-2 border-amber-500/20 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200">
                      <HiClock className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        In Compliance Review
                      </span>
                      <h3 className="text-xl font-black text-[#0A1F14] mt-2">DigiLocker Details Flagged for Review</h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                        Your DigiLocker documents didn't fully match your account details, so a compliance reviewer
                        is confirming it manually. This is usually quick — no action needed from you.
                      </p>
                    </div>
                  </div>
                ) : isPersonalPending && !isPersonalRejected ? (
                  <div className="bg-[#FAFAF7] border-2 border-amber-500/20 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200">
                      <HiClock className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        {identitySt === "digilocker_pending" ? "Connecting to DigiLocker" : "Under Review"}
                      </span>
                      <h3 className="text-xl font-black text-[#0A1F14] mt-2">
                        {identitySt === "digilocker_pending"
                          ? "Completing DigiLocker Authorization"
                          : "Documents Under Compliance Inspection"}
                      </h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                        {identitySt === "digilocker_pending"
                          ? "If you were redirected back here without finishing on DigiLocker, you can try again below."
                          : "Our compliance team is verifying your submitted ID documents. Review is typically completed within 24 hours."}
                      </p>
                      {identitySt === "digilocker_pending" && (
                        <button
                          type="button"
                          onClick={handleVerifyWithDigiLocker}
                          disabled={digilockerLoading}
                          className="mt-4 px-5 py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-full shadow-md transition-all inline-flex items-center gap-2"
                        >
                          {digilockerLoading ? "Redirecting…" : "Try DigiLocker Again"} <HiArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isPersonalRejected && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-sm">
                          <HiXCircle className="w-5 h-5 text-red-600" /> Action Required
                        </p>
                        <p className="text-red-700 font-medium">
                          Reason: {status?.statusCard?.identityVerified?.rejectionReason || user?.documents?.rejectionReason || "Please verify again or upload clearer copies of your ID documents."}
                        </p>
                      </div>
                    )}

                    {!showManualUpload ? (
                      /* --- Primary path: DigiLocker --- */
                      <div className="bg-[#FAFAF7] border-2 border-[#1B5E3F]/15 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1B5E3F]/10 border-2 border-[#1B5E3F]/20">
                          <HiLightningBolt className="w-9 h-9 text-[#1B5E3F]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-[#0A1F14]">Verify with DigiLocker</h3>
                          <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Fetches your Aadhaar/PAN directly from DigiLocker and verifies automatically —
                            usually done in under a minute, no photo uploads needed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyWithDigiLocker}
                          disabled={digilockerLoading}
                          className="px-7 py-3.5 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2 mx-auto disabled:opacity-60"
                        >
                          {digilockerLoading ? "Redirecting to DigiLocker…" : "Verify with DigiLocker"} <HiArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManualUpload(true)}
                          className="text-xs font-semibold text-[#0A1F14]/55 hover:text-[#0F4A2E] underline underline-offset-2"
                        >
                          DigiLocker not available? Upload documents manually
                        </button>
                      </div>
                    ) : (
                      /* --- Fallback path: manual upload --- */
                      <form onSubmit={handlePersonalSubmit} className="space-y-4">
                        <button
                          type="button"
                          onClick={() => setShowManualUpload(false)}
                          className="text-xs font-bold text-[#1B5E3F] hover:text-[#0F4A2E] flex items-center gap-1"
                        >
                          ← Back to DigiLocker verification
                        </button>

                        <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-4 flex gap-3">
                          <HiInformationCircle className="w-6 h-6 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-[#0F4A2E]">Manual Document Upload</p>
                            <p className="text-xs text-[#0A1F14]/70">
                              Reviewed by our compliance team, typically within 24 hours.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#0A1F14] mb-1">Document Type</label>
                            <select
                              value={personalDocs.documentType}
                              onChange={(e) => setPersonalDocs({ ...personalDocs, documentType: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold focus:outline-none"
                            >
                              <option value="pan">PAN Card</option>
                              <option value="govt_id">Aadhaar / Govt ID</option>
                              <option value="passport">Passport</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#0A1F14] mb-1">Document Number (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. ABCDE1234F"
                              value={personalDocs.documentNumber}
                              onChange={(e) => setPersonalDocs({ ...personalDocs, documentNumber: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                            />
                          </div>
                        </div>

                        <FileDropzone
                          label="Front Image of ID"
                          description="Clear photo of PAN or Govt ID · JPG, PNG or PDF"
                          value={personalDocs.documentFront}
                          onChange={(f) => setPersonalDocs({ ...personalDocs, documentFront: f })}
                          required
                        />

                        <FileDropzone
                          label="Selfie Holding ID"
                          description="Clear photo of your face holding your ID"
                          accept="image/*"
                          value={personalDocs.selfie}
                          onChange={(f) => setPersonalDocs({ ...personalDocs, selfie: f })}
                          required
                        />

                        <div className="flex justify-between items-center pt-4">
                          <button type="button" onClick={() => navigate("/")} className="text-sm font-semibold text-gray-500">
                            Skip for now
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-7 py-3 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2"
                          >
                            {isPersonalRejected ? "Resubmit Level 2" : "Submit Level 2"} <HiArrowRight />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Level 3 Founder Company Section */}
            {activeTab === "company" && (
              <div>
                {isCompanyApproved ? (
                  <div className="bg-[#FAFAF7] border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200">
                      <HiCheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Level 3 Verified
                      </span>
                      <h3 className="text-2xl font-black text-[#0A1F14] mt-2">Founder & Company Verified 🚀</h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        Your corporate incorporation documents have been verified. You can publish pitches and startups to the platform.
                      </p>
                    </div>
                  </div>
                ) : isCompanyPending ? (
                  <div className="bg-[#FAFAF7] border-2 border-amber-500/20 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200">
                      <HiClock className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Under Review
                      </span>
                      <h3 className="text-xl font-black text-[#0A1F14] mt-2">Company Verification Under Review</h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                        Our compliance team is verifying your Certificate of Incorporation and CIN details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-4 flex gap-3">
                      <HiInformationCircle className="w-6 h-6 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#0F4A2E]">Level 3 Founder Verification</p>
                        <p className="text-xs text-[#0A1F14]/70">
                          Required to publish startups and video pitch decks to investor feeds.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">Company Name</label>
                        <input
                          type="text"
                          placeholder="EXPGLO Technologies Pvt Ltd"
                          value={companyDocs.companyName}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, companyName: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">CIN (Corporate ID Number)</label>
                        <input
                          type="text"
                          placeholder="U72900DL2024PTC123456"
                          value={companyDocs.CIN}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, CIN: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">GST Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="07AAAAA0000A1Z5"
                          value={companyDocs.GST}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, GST: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">Business Email</label>
                        <input
                          type="email"
                          placeholder="founder@company.com"
                          value={companyDocs.businessEmail}
                          onChange={(e) => setCompanyDocs({ ...companyDocs, businessEmail: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <FileDropzone
                      label="Certificate of Incorporation"
                      description="Registration Certificate / Incorporation PDF or image"
                      value={companyDocs.registrationCertificate}
                      onChange={(f) => setCompanyDocs({ ...companyDocs, registrationCertificate: f })}
                      required
                    />

                    <div className="flex justify-between items-center pt-4">
                      <button type="button" onClick={() => navigate("/")} className="text-sm font-semibold text-gray-500">
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-7 py-3 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2"
                      >
                        Submit Level 3 <HiArrowRight />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Level 4 Investor Transaction Section */}
            {activeTab === "investment" && (
              <div>
                {isInvestorApproved ? (
                  <div className="bg-[#FAFAF7] border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200">
                      <HiCheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Level 4 Verified
                      </span>
                      <h3 className="text-2xl font-black text-[#0A1F14] mt-2">Investor KYC Verified 💼</h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        Your investor address proof and bank verification are complete. You can enter deal rooms and initiate investments.
                      </p>
                    </div>
                  </div>
                ) : isInvestorPending ? (
                  <div className="bg-[#FAFAF7] border-2 border-amber-500/20 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200">
                      <HiClock className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Under Review
                      </span>
                      <h3 className="text-xl font-black text-[#0A1F14] mt-2">Investor Verification Under Review</h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                        Our compliance team is verifying your address proof and bank account details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleInvestorSubmit} className="space-y-4">
                    <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-4 flex gap-3">
                      <HiInformationCircle className="w-6 h-6 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#0F4A2E]">Level 4 Investor Transaction KYC</p>
                        <p className="text-xs text-[#0A1F14]/70">
                          Required for initiating investments, escrow payments, and deal rooms.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">Bank Account Number</label>
                        <input
                          type="text"
                          placeholder="987654321012"
                          value={investorDocs.accountNumber}
                          onChange={(e) => setInvestorDocs({ ...investorDocs, accountNumber: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14] mb-1">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="HDFC0001234"
                          value={investorDocs.ifscCode}
                          onChange={(e) => setInvestorDocs({ ...investorDocs, ifscCode: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <FileDropzone
                      label="Address Proof (Utility Bill / Statement)"
                      description="Recent bill or bank statement showing your residential address"
                      value={investorDocs.addressProofUrl}
                      onChange={(f) => setInvestorDocs({ ...investorDocs, addressProofUrl: f })}
                      required
                    />

                    <div className="flex justify-between items-center pt-4">
                      <button type="button" onClick={() => navigate("/")} className="text-sm font-semibold text-gray-500">
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-7 py-3 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2"
                      >
                        Submit Level 4 <HiArrowRight />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 shadow-lg shadow-emerald-500/10">
              <MdVerified className="w-12 h-12 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                Submission Successful
              </span>
              <h2 className="text-3xl font-black text-[#0A1F14]">Verification Under Review</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your verification documents have been received and logged into our compliance queue.
              </p>
            </div>

            {/* Reference ID & Meta Summary Card */}
            <div className="bg-[#FAFAF7] border-2 border-[#1B5E3F]/15 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[#1B5E3F]/10">
                <span className="text-xs text-gray-500 font-semibold uppercase">Reference ID</span>
                <span className="text-xs font-mono font-bold text-[#1B5E3F] bg-[#1B5E3F]/10 px-2 py-0.5 rounded">
                  {submittedRefId || "KYC-20260806-REQ"}
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
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Under Review
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold">Estimated Processing Time</span>
                <span className="text-xs font-bold text-emerald-700">Within 24 Hours</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              You will receive an in-app notification and email as soon as the review is complete.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                refreshUser?.();
              }}
              className="px-8 py-3.5 rounded-full font-bold bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white text-sm shadow-md hover:shadow-lg transition-all"
            >
              Continue to Workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
