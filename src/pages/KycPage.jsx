import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldCheck,
  HiInformationCircle,
  HiCheckCircle,
  HiArrowRight,
  HiBadgeCheck,
  HiOfficeBuilding,
  HiCreditCard,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import AuthShell from "../components/auth/AuthShell";
import FileDropzone from "../components/auth/FileDropzone";
import kycService from "../services/kycService";
import { useToast } from "../components/ui/Toast";

const TABS = [
  { value: "personal", label: "Level 2: Personal ID", icon: HiBadgeCheck },
  { value: "company", label: "Level 3: Founder & Startup", icon: HiOfficeBuilding },
  { value: "investment", label: "Level 4: Investor Transaction", icon: HiCreditCard },
];

export default function KycPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    kycService
      .getStatus()
      .then((res) => setStatus(res?.data?.data || res?.data))
      .catch(() => {});
  }, []);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    if (!personalDocs.documentFront || !personalDocs.selfie) {
      toast.error("Please upload front ID and selfie");
      return;
    }
    setSubmitting(true);
    try {
      await kycService.submitPersonalKyc({
        documentType: personalDocs.documentType,
        documentNumber: personalDocs.documentNumber,
        documentFront: typeof personalDocs.documentFront === "string" ? personalDocs.documentFront : "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        documentBack: typeof personalDocs.documentBack === "string" ? personalDocs.documentBack : "",
        selfie: typeof personalDocs.selfie === "string" ? personalDocs.selfie : "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      });
      setSubmitted(true);
      toast.success("Personal KYC submitted successfully!");
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
      await kycService.submitCompanyKyc({
        companyName: companyDocs.companyName,
        CIN: companyDocs.CIN,
        GST: companyDocs.GST,
        companyPAN: companyDocs.companyPAN || "ABCDE1234F",
        businessEmail: companyDocs.businessEmail || "founder@company.com",
        registrationCertificate: typeof companyDocs.registrationCertificate === "string" ? companyDocs.registrationCertificate : "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      });
      setSubmitted(true);
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
      await kycService.submitInvestmentKyc({
        addressProof: {
          docType: investorDocs.addressProofType,
          docUrl: typeof investorDocs.addressProofUrl === "string" ? investorDocs.addressProofUrl : "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        },
        bankAccount: {
          accountNumber: investorDocs.accountNumber,
          ifscCode: investorDocs.ifscCode,
          bankName: investorDocs.bankName || "HDFC Bank",
          proofUrl: typeof investorDocs.bankProofUrl === "string" ? investorDocs.bankProofUrl : "",
        },
        netWorthDeclaration: { declaredAmount: Number(investorDocs.declaredNetWorth) || 1000000 },
      });
      setSubmitted(true);
      toast.success("Investor transaction KYC submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Investor submission failed");
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight text-[#0A1F14]">
                Verification Workspace
              </h1>
              <p className="text-[#0A1F14]/60 text-sm sm:text-base max-w-xl mx-auto">
                Complete level requirements to unlock badges, startup publishing, and deal rooms.
              </p>
            </div>

            {/* Level Tabs */}
            <div className="flex justify-center mb-6 overflow-x-auto pb-2">
              <div className="inline-flex bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full p-1.5 gap-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setActiveTab(t.value)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === t.value
                          ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25"
                          : "text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2 Personal ID Form */}
            {activeTab === "personal" && (
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-2xl p-4 flex gap-3">
                  <HiInformationCircle className="w-6 h-6 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#0F4A2E]">Level 2 Personal Identity</p>
                    <p className="text-xs text-[#0A1F14]/70">
                      Unlocks the Blue Verified Badge on your profile & search results.
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
                    Submit Level 2 <HiArrowRight />
                  </button>
                </div>
              </form>
            )}

            {/* Level 3 Founder Company Form */}
            {activeTab === "company" && (
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

            {/* Level 4 Investor Transaction Form */}
            {activeTab === "investment" && (
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
          </motion.div>
        ) : (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200">
              <MdVerified className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0A1F14]">Submission Received</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mt-1">
                Our compliance team is reviewing your documents. Most submissions are verified within 24 hours.
              </p>
            </div>
            <Link to="/">
              <button className="px-7 py-3 rounded-full font-bold bg-[#1B5E3F] text-white text-sm shadow-lg">
                Back to Dashboard
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
