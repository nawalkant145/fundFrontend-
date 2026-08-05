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
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header matching reference image */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Shield Icon + Verification Tier Title + LEVEL badge */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4A2E] text-white-force flex items-center justify-center flex-shrink-0 shadow-xs">
            <HiShieldCheck className="w-7 h-7 text-white-force" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Verification Tier</h3>
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-[#E8F5E9] text-[#2E7D32] rounded-full uppercase tracking-wide border border-[#A5D6A7]">
                LEVEL {level}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Progressive KYC & Account Privileges
            </p>
          </div>
        </div>

        {/* Right: Profile Completeness + Progress bar + Keep going helper text */}
        <div className="w-full sm:w-64">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-[#0F172A]">Profile Completeness</span>
            <span className="text-xs font-extrabold text-[#0F4A2E]">{completion}%</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0F4A2E] to-[#F59E0B]"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
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
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs flex items-center justify-center border border-[#A5D6A7]">
                L1
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Email & Mobile OTP</p>
                <p className="text-xs font-medium text-slate-500">Instant Onboarding & Platform Access</p>
              </div>
            </div>
            {renderBadge("completed")}
          </div>

          {/* L2 Row */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs flex items-center justify-center border border-[#A5D6A7]">
                  L2
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#0F172A]">Identity Verification</p>
                    <MdVerified className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Government ID & Blue Verified Badge</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge(user?.kycStatus || (isVerified ? "approved" : "none"))}
                {(!isVerified && (user?.kycStatus === "none" || user?.kycStatus === "rejected")) && (
                  <Link to="/kyc">
                    <button className="h-10 px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs">
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
                    <span className="text-[10px] font-bold text-emerald-700 block">✓ Submitted</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 block">✓ Uploaded</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${user?.kycStatus === "rejected" ? "bg-red-500" : "bg-amber-500 animate-pulse"}`} />
                    <span className={`text-[10px] font-bold block ${user?.kycStatus === "rejected" ? "text-red-600" : "text-amber-700"}`}>
                      {user?.kycStatus === "rejected" ? "✖ Reviewed" : "⏳ Under Review"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${user?.kycStatus === "rejected" ? "bg-red-500" : "bg-slate-200"}`} />
                    <span className={`text-[10px] font-bold block ${user?.kycStatus === "rejected" ? "text-red-600" : "text-slate-400"}`}>
                      {user?.kycStatus === "rejected" ? "✖ Rejected" : "○ Pending"}
                    </span>
                  </div>
                </div>

                {user?.kycStatus === "rejected" && user?.documents?.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <HiXCircle className="w-4 h-4 text-red-600" /> Rejection Reason:
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
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200">
                  L3
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Founder Verification</p>
                  <p className="text-xs font-medium text-slate-500">Certificate of Incorporation & GST / CIN</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge(user?.companyVerificationStatus)}
                {user?.companyVerificationStatus !== "approved" && user?.companyVerificationStatus !== "pending" && (
                  <Link to="/kyc">
                    <button className="h-10 px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs">
                      <span className="text-white-force">Verify Company</span> <HiArrowRight className="w-3.5 h-3.5 text-white-force" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* L4 Row (Investor) */}
          {user?.role === "investor" && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
                  L4
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Investor Verification</p>
                  <p className="text-xs font-medium text-slate-500">Address Proof & Bank Account Verification</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge(user?.investmentVerificationStatus)}
                {user?.investmentVerificationStatus !== "approved" && user?.investmentVerificationStatus !== "pending" && (
                  <Link to="/kyc">
                    <button className="h-10 px-5 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs">
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
