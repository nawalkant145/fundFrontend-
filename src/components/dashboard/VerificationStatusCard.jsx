import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiArrowRight,
  HiShieldCheck,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import useProfileCompletion from "../../hooks/useProfileCompletion";

export default function VerificationStatusCard({ user }) {
  const { completion, missingSections, loading } = useProfileCompletion();

  const level = user?.verificationLevel || 1;
  const isVerified = user?.verifiedBadge || user?.isVerified;

  const renderBadge = (st) => {
    if (st === "completed" || st === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] border border-[#A5D6A7] px-3.5 py-1 rounded-full">
          <HiCheckCircle className="w-4 h-4 text-[#2E7D32]" /> Verified
        </span>
      );
    }
    if (st === "pending" || st === "under_review" || st === "submitted" || st === "resubmitted") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full">
          <HiClock className="w-4 h-4 text-amber-600" /> Under Review
        </span>
      );
    }
    if (st === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-3.5 py-1 rounded-full">
          <HiXCircle className="w-4 h-4 text-red-600" /> Action Needed
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3.5 py-1 rounded-full">
        Not Started
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header matching reference image */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Shield Icon + Verification Tier Title + LEVEL badge */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0F4A2E] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#F5B942]/20">
            <HiShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5B942]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">Verification Tier</h3>
              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold bg-[#E8F5E9] text-[#2E7D32] rounded-full uppercase tracking-wide border border-[#A5D6A7] shrink-0">
                LEVEL {level}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
              Progressive KYC & Account Privileges
            </p>
          </div>
        </div>

        {/* Right: Profile Completeness + Progress bar + Keep going helper text */}
        <div className="w-full sm:w-64">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-[#0F172A]">Profile Completeness</span>
            <span className="text-xs font-extrabold text-[#0F4A2E]">
              {loading || completion === null ? "..." : `${completion}%`}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0F4A2E] to-[#F59E0B]"
              initial={{ width: 0 }}
              animate={{ width: `${loading || completion === null ? 0 : completion}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <p className="text-[11px] font-medium text-slate-400 mt-1">
            {missingSections.length > 0
              ? "Keep going! Complete remaining steps."
              : "All verification steps completed!"}
          </p>
        </div>
      </div>

      {/* Level Rows matching reference image */}
      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="w-6 h-6 border-2 border-[#0F4A2E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* L1 Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs flex items-center justify-center border border-[#A5D6A7] shrink-0">
                L1
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0F172A] truncate">Email & Mobile OTP</p>
                <p className="text-xs font-medium text-slate-500 leading-tight">Instant Onboarding & Platform Access</p>
              </div>
            </div>
            <div className="self-end sm:self-auto shrink-0">
              {renderBadge("completed")}
            </div>
          </div>

          {/* L2 Row */}
          <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs flex items-center justify-center border border-[#A5D6A7] shrink-0">
                  L2
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#0F172A] truncate">Identity Verification</p>
                    <MdVerified className="w-4 h-4 text-[#F5B942] shrink-0" />
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-tight">Government ID & Blue Verified Badge</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
                {renderBadge(user?.kycStatus || (isVerified ? "approved" : "none"))}
                {(!isVerified && (user?.kycStatus === "none" || user?.kycStatus === "rejected")) && (
                  <Link to="/kyc">
                    <button className="h-9 sm:h-10 px-3.5 sm:px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                      <span className="text-white-force">
                        {user?.kycStatus === "rejected" ? "Resubmit Documents" : "Get Verified"}
                      </span>{" "}
                      <HiArrowRight className="w-3.5 h-3.5 text-white-force" />
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* 4-Stage Stepper Timeline for Active Submissions */}
            {(user?.kycStatus === "pending" || user?.kycStatus === "under_review" || user?.kycStatus === "resubmitted" || user?.kycStatus === "rejected") && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 block truncate">✓ Submitted</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 block truncate">✓ Uploaded</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${user?.kycStatus === "rejected" ? "bg-red-500" : "bg-amber-500 animate-pulse"}`} />
                    <span className={`text-[10px] font-bold block truncate ${user?.kycStatus === "rejected" ? "text-red-600" : "text-amber-700"}`}>
                      {user?.kycStatus === "rejected" ? "✖ Reviewed" : "⏳ Under Review"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${user?.kycStatus === "rejected" ? "bg-red-500" : "bg-slate-200"}`} />
                    <span className={`text-[10px] font-bold block truncate ${user?.kycStatus === "rejected" ? "text-red-600" : "text-slate-400"}`}>
                      {user?.kycStatus === "rejected" ? "✖ Rejected" : "○ Pending"}
                    </span>
                  </div>
                </div>

                {user?.kycStatus === "rejected" && user?.documents?.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <HiXCircle className="w-4 h-4 text-red-600 shrink-0" /> Rejection Reason:
                    </p>
                    <p className="text-red-700 italic font-medium">
                      "{user?.documents?.rejectionReason}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* L3 Row (Founder) */}
          {user?.role === "founder" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                  L3
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">Founder Verification</p>
                  <p className="text-xs font-medium text-slate-500 leading-tight">Certificate of Incorporation & GST / CIN</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
                {renderBadge(user?.companyVerificationStatus)}
                {user?.companyVerificationStatus !== "approved" && user?.companyVerificationStatus !== "pending" && (
                  <Link to="/kyc">
                    <button className="h-9 sm:h-10 px-3.5 sm:px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                      <span className="text-white-force">Verify Company</span> <HiArrowRight className="w-3.5 h-3.5 text-white-force" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* L4 Row (Investor) */}
          {user?.role === "investor" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200 shrink-0">
                  L4
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">Investor Verification</p>
                  <p className="text-xs font-medium text-slate-500 leading-tight">Address Proof & Bank Account Verification</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
                {renderBadge(user?.investmentVerificationStatus)}
                {user?.investmentVerificationStatus !== "approved" && user?.investmentVerificationStatus !== "pending" && (
                  <Link to="/kyc">
                    <button className="h-9 sm:h-10 px-3.5 sm:px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                      <span className="text-white-force">Complete KYC</span> <HiArrowRight className="w-3.5 h-3.5 text-white-force" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
