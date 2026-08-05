import { Link } from "react-router-dom";
import { HiShieldCheck, HiArrowRight, HiLockClosed } from "react-icons/hi";
import Modal from "./Modal";

export default function VerificationGateModal({ open, onClose, requiredLevel = 3, title, message }) {
  if (!open) return null;

  const levelTitles = {
    2: "Level 2 Identity Verification Required",
    3: "Level 3 Founder Verification Required",
    4: "Level 4 Investor Transaction KYC Required",
    5: "Account Compliance Hold",
  };

  const levelSubtitles = {
    2: "Upload your government ID to get your Blue Verified Badge and unlock platform trust.",
    3: "Submit Certificate of Incorporation and CIN/GST to publish startups & pitch videos.",
    4: "Complete address & bank verification to initiate investments and sign deals.",
    5: "Your account is under compliance review. Contact support to resolve.",
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center space-y-5 p-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] shadow-lg shadow-[#1B5E3F]/25">
          <HiShieldCheck className="w-8 h-8 text-[#F5B942]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-[#1B5E3F]/10 text-[#1B5E3F] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <HiLockClosed className="w-3.5 h-3.5" /> Level {requiredLevel} Privilege
          </span>
          <h2 className="text-xl font-black text-[#0A1F14]">
            {title || levelTitles[requiredLevel] || "Verification Required"}
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            {message || levelSubtitles[requiredLevel] || "Please complete verification to proceed."}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link to="/kyc" onClick={onClose}>
            <button className="w-full py-3.5 bg-gradient-to-r from-[#1B5E3F] to-[#0F4A2E] text-white rounded-2xl font-bold text-sm shadow-md shadow-[#1B5E3F]/25 hover:from-[#2D7A4F] hover:to-[#1B5E3F] transition-all flex items-center justify-center gap-2">
              Complete Verification Now <HiArrowRight />
            </button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 font-semibold"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
