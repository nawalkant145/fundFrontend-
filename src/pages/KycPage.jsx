import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldCheck,
  HiInformationCircle,
  HiCheckCircle,
  HiArrowRight,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import AuthShell from "../components/auth/AuthShell";
import FileDropzone from "../components/auth/FileDropzone";

const ROLE_TABS = [
  { value: "founder", label: "Founder" },
  { value: "investor", label: "Investor" },
];

export default function KycPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("founder");

  const [docs, setDocs] = useState({
    panCard: null,
    aadhar: null,
    selfie: null,
    businessReg: null,
    bankProof: null,
    incomeProof: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (key, file) => setDocs((p) => ({ ...p, [key]: file }));
  const requiredFilled = docs.panCard && docs.aadhar && docs.selfie;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requiredFilled) return;
    setSubmitted(true);
  };

  return (
    <AuthShell maxWidth="max-w-4xl">
      <AnimatePresence mode="wait">
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
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                Get your{" "}
                <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
                  blue tick
                </span>
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base max-w-xl mx-auto">
                Submit ID proof for our team to review. Most approvals happen
                within 24 hours.
              </p>
            </div>

            {/* Role tabs */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full p-1">
                {ROLE_TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setRole(t.value)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      role === t.value
                        ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25"
                        : "text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                    }`}
                  >
                    I'm a {t.label}
                  </button>
                ))}
              </div>
            </div>

            <InfoBanner />

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <FileDropzone
                label="PAN Card"
                description="Image of your PAN card · JPG, PNG or PDF · max 10MB"
                value={docs.panCard}
                onChange={(f) => update("panCard", f)}
                required
              />

              <FileDropzone
                label="Aadhaar Card"
                description="Front + back image (or PDF) · max 10MB"
                value={docs.aadhar}
                onChange={(f) => update("aadhar", f)}
                required
              />

              <FileDropzone
                label="Selfie holding your ID"
                description="Clear photo of your face holding your PAN or Aadhaar · max 10MB"
                accept="image/*"
                value={docs.selfie}
                onChange={(f) => update("selfie", f)}
                required
              />

              {role === "founder" && (
                <FileDropzone
                  label="Business registration (optional)"
                  description="Certificate of Incorporation, GST cert, or similar · PDF / image"
                  value={docs.businessReg}
                  onChange={(f) => update("businessReg", f)}
                  hint="Required only if you're investing through a registered company"
                />
              )}

              {role === "investor" && (
                <>
                  <FileDropzone
                    label="Bank account proof"
                    description="Cancelled cheque or bank statement · PDF / image"
                    value={docs.bankProof}
                    onChange={(f) => update("bankProof", f)}
                    hint="Required for investments above ₹2,00,000"
                  />
                  <FileDropzone
                    label="Income proof / ITR (optional)"
                    description="Last year's ITR or salary slip · PDF"
                    accept="application/pdf,image/*"
                    value={docs.incomeProof}
                    onChange={(f) => update("incomeProof", f)}
                    hint="Helps establish accredited-investor status"
                  />
                </>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-[#0A1F14]/55 hover:text-[#1B5E3F] font-semibold transition-colors"
                >
                  Skip for now
                </button>
                <motion.button
                  type="submit"
                  disabled={!requiredFilled}
                  whileHover={requiredFilled ? { y: -2 } : {}}
                  whileTap={requiredFilled ? { scale: 0.98 } : {}}
                  className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-[#1B5E3F]/30 ${
                    !requiredFilled
                      ? "opacity-50 cursor-not-allowed shadow-none"
                      : ""
                  }`}
                >
                  Submit for review <HiArrowRight />
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center space-y-6 py-2"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <MdVerified className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                Documents submitted
              </h2>
              <p className="text-[#0A1F14]/65 max-w-md mx-auto">
                Our verification team usually reviews submissions within 24
                hours. We'll email you the moment it's approved.
              </p>
            </div>
            <Link to="/">
              <motion.button
                whileHover={{ y: -2 }}
                className="px-7 py-3.5 rounded-full font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 transition-all"
              >
                Back to home
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

function InfoBanner() {
  const items = [
    "Files are encrypted in transit and stored privately.",
    "Mask the first 8 digits of Aadhaar if visible.",
    "Selfie must clearly show your face and the ID.",
  ];
  return (
    <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-4 flex gap-3">
      <HiInformationCircle className="w-6 h-6 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold mb-2 text-[#0F4A2E]">
          Before you upload
        </p>
        <ul className="space-y-1 text-xs text-[#0A1F14]/70">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <HiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
