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

function KycPage() {
  const navigate = useNavigate();
  // In real app this comes from auth context. For static, let user toggle.
  const [role, setRole] = useState("founder");

  const [docs, setDocs] = useState({
    panCard: null,
    aadhar: null,
    selfie: null,
    businessReg: null, // founder
    bankProof: null, // investor
    incomeProof: null, // investor
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-3">
                <HiShieldCheck className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                Get your{" "}
                <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
                  blue tick
                </span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
                Submit ID proof for our team to review. Most approvals happen
                within 24 hours.
              </p>
            </div>

            {/* Role tabs (static toggle) */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-dark-bg/60 border border-gold/15 rounded-full p-1">
                {ROLE_TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setRole(t.value)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      role === t.value
                        ? "bg-gold text-dark-navy shadow-md shadow-gold/30"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    I'm a {t.label}
                  </button>
                ))}
              </div>
            </div>

            <InfoBanner />

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Skip for now
                </button>
                <motion.button
                  type="submit"
                  disabled={!requiredFilled}
                  className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30 hover:shadow-gold/50 ${
                    !requiredFilled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  whileHover={requiredFilled ? { scale: 1.02, y: -2 } : {}}
                  whileTap={requiredFilled ? { scale: 0.98 } : {}}
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
            className="text-center space-y-6 py-4"
          >
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <MdVerified className="w-14 h-14 text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Documents submitted
              </h2>
              <p className="text-gray-300 max-w-md mx-auto">
                Our verification team usually reviews submissions within 24
                hours. We'll email you the moment it's approved.
              </p>
            </div>
            <Link to="/">
              <motion.button
                className="px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30"
                whileHover={{ scale: 1.02, y: -2 }}
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
    <div className="bg-dark-bg/60 border border-gold/15 rounded-2xl p-4 flex gap-3">
      <HiInformationCircle className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold mb-2 text-white">
          Before you upload
        </p>
        <ul className="space-y-1 text-xs text-gray-300">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <HiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default KycPage;
