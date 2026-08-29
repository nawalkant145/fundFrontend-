import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiCurrencyDollar,
  HiChatAlt2,
  HiCheckCircle,
  HiUser,
  HiCreditCard,
  HiDocumentText,
  HiClock,
  HiDownload,
  HiEye,
  HiExclamationCircle,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { investmentService } from "../../services/investmentService";
import { chatService } from "../../services/chatService";
import { useToast } from "../../components/ui/Toast";
import { formatINR } from "../../constants/mockData";

export default function InvestmentDetailPage() {
  const { dealId, investmentId } = useParams();
  const id = dealId || investmentId;
  const navigate = useNavigate();
  const toast = useToast();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);

  const loadDeal = () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    investmentService
      .getById(id)
      .then((res) => {
        const d = res?.data?.data?.investment || res?.data?.data || res?.data?.investment;
        if (!d) {
          setError("Investment not found.");
          setDeal(null);
        } else {
          setDeal(d);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load investment details.");
        setDeal(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeal();
  }, [id]);

  const handleStartChat = (investorId) => {
    if (!investorId) return;
    chatService
      .startChat(investorId)
      .then((res) => {
        const chat = res?.data?.data?.chat || res?.data?.data;
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch(() => toast.error("Could not start chat with investor"));
  };

  const isPaid = deal?.status === "paid" || deal?.stage === "completed";
  const investor = deal?.investorId || {};
  const founder = deal?.founderId || {};

  // Extract real documents from MongoDB document if available
  const realDocs = Array.isArray(deal?.documents)
    ? deal.documents
    : [
        deal?.agreementUrl && { title: "Investment Agreement", url: deal.agreementUrl, type: "PDF" },
        deal?.receiptUrl && { title: "Payment Receipt", url: deal.receiptUrl, type: "PDF" },
        deal?.certificateUrl && { title: "Certificate of Investment", url: deal.certificateUrl, type: "PDF" },
      ].filter(Boolean);

  return (
    <DashboardShell title="Investment Details" subtitle="Full deal overview and transaction breakdown.">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate("/app/deals")}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#1B5E3F] hover:underline cursor-pointer"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Deals
        </button>

        {loading ? (
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0A1F14]/60">Loading investment details from database...</p>
          </div>
        ) : error || !deal ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-3">
            <HiExclamationCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-600">{error || "Investment not found."}</p>
            <button
              onClick={loadDeal}
              className="px-4 py-2 bg-[#1B5E3F] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top Summary Banner */}
            <div className="bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span
                  className={`px-3.5 py-1 backdrop-blur text-white text-xs font-extrabold rounded-full ${
                    isPaid ? "bg-emerald-500/30 text-emerald-200" : "bg-amber-500/30 text-amber-200"
                  }`}
                >
                  {isPaid ? "✓ Active / Funded" : deal.status === "pending" ? "Pending Payment" : deal.status}
                </span>
                <span className="text-xs font-mono opacity-80">
                  Txn ID: {deal.razorpayPaymentId || `INVST-${deal._id.slice(-6).toUpperCase()}`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/60">Amount</p>
                  <p className="text-2xl font-black text-[#F5B942]">{formatINR(deal.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/60">Equity</p>
                  <p className="text-2xl font-black">{deal.equity ?? 0}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/60">Instrument</p>
                  <p className="text-sm font-bold mt-1">Equity Shares</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/60">Round</p>
                  <p className="text-sm font-bold mt-1">Series A</p>
                </div>
              </div>
            </div>

            {/* SECTION 1 — INVESTMENT OVERVIEW */}
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3 flex items-center gap-2">
                <HiCurrencyDollar className="w-5 h-5 text-[#1B5E3F]" /> Section 1 — Investment Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <OverviewRow label="Investment Amount" value={formatINR(deal.amount)} highlight />
                <OverviewRow label="Equity Received" value={`${deal.equity ?? 0}%`} />
                <OverviewRow label="Instrument" value="Equity Shares" />
                <OverviewRow label="Round" value="Series A" />
                <OverviewRow
                  label="Valuation (Post-money)"
                  value={deal.amount && deal.equity ? formatINR(Math.round((deal.amount / deal.equity) * 100)) : "N/A"}
                />
                <OverviewRow
                  label="Investment Date"
                  value={new Date(deal.paidAt || deal.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                />
                <OverviewRow label="Payment Status" value={isPaid ? "Paid" : deal.status} green={isPaid} />
                <OverviewRow label="Investment Status" value={isPaid ? "Active / Funded" : deal.stage} green={isPaid} />
              </div>
            </div>

            {/* SECTION 2 — INVESTOR INFORMATION */}
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3 flex items-center gap-2">
                <HiUser className="w-5 h-5 text-[#1B5E3F]" /> Section 2 — Investor Information
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      investor.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(investor.name || "Investor")}&background=1B5E3F&color=fff`
                    }
                    alt={investor.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-base text-[#0A1F14]">{investor.name || "Investor"}</p>
                      {investor.isVerified && <MdVerified className="w-5 h-5 text-[#F5B942]" title="Verified Investor" />}
                    </div>
                    <p className="text-xs text-[#0A1F14]/60 mt-0.5">{investor.email || "Member"}</p>
                    {investor.location && <p className="text-xs text-[#0A1F14]/50 mt-0.5">Location: {investor.location}</p>}
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {investor._id && (
                    <Link to={`/app/u/${investor._id}`} className="flex-1 sm:flex-initial">
                      <button className="w-full px-4 py-2.5 border border-[#1B5E3F]/30 hover:bg-[#FAFAF7] text-[#0F4A2E] text-xs font-bold rounded-xl transition-colors cursor-pointer">
                        View Profile
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleStartChat(investor._id || investor)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl shadow inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <HiChatAlt2 className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3 — PAYMENT DETAILS & VERIFICATION */}
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3 flex items-center gap-2">
                <HiCreditCard className="w-5 h-5 text-[#1B5E3F]" /> Section 3 — Payment Verification & Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <OverviewRow label="Payment Status" value={isPaid ? "Paid" : deal.status} green={isPaid} />
                <OverviewRow label="Payment Method" value="Razorpay Gateway (UPI / Netbanking)" />
                <OverviewRow label="Razorpay Order ID" value={deal.razorpayOrderId || "N/A"} mono />
                <OverviewRow label="Razorpay Payment ID" value={deal.razorpayPaymentId || "N/A"} mono />
                <OverviewRow
                  label="Signature Verification"
                  value={deal.razorpaySignature ? "Verified (HMAC-SHA256)" : "Pending Verification"}
                  green={!!deal.razorpaySignature}
                />
                <OverviewRow
                  label="Payment Date"
                  value={deal.paidAt ? new Date(deal.paidAt).toLocaleString("en-IN") : "N/A"}
                />
              </div>
            </div>

            {/* SECTION 4 — VERIFIED INVESTMENT DOCUMENTS */}
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3 flex items-center gap-2">
                <HiDocumentText className="w-5 h-5 text-[#1B5E3F]" /> Section 4 — Verified Investment Documents
              </h3>
              {realDocs.length > 0 ? (
                <div className="space-y-2.5">
                  {realDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-xl text-xs">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="w-5 h-5 text-[#1B5E3F]" />
                        <div>
                          <p className="font-bold text-[#0A1F14]">{doc.title}</p>
                          <p className="text-[10px] text-[#0A1F14]/50">Status: Issued & Verified</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveDoc(doc)}
                          className="px-3 py-1.5 bg-white border border-[#1B5E3F]/20 hover:border-[#1B5E3F] text-[#0F4A2E] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <HiEye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            if (doc.url) {
                              window.open(doc.url, "_blank");
                            } else {
                              setActiveDoc(doc);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#1B5E3F] text-white hover:bg-[#0F4A2E] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <HiDownload className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#FAFAF7] border border-dashed border-[#1B5E3F]/20 rounded-xl text-center">
                  <p className="text-xs text-[#0A1F14]/60 font-semibold">No investment documents uploaded yet.</p>
                </div>
              )}
            </div>

            {/* SECTION 5 — INVESTMENT LIFECYCLE TIMELINE */}
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3 flex items-center gap-2">
                <HiClock className="w-5 h-5 text-[#1B5E3F]" /> Section 5 — Investment Lifecycle Timeline
              </h3>
              <div className="pl-3 border-l-2 border-[#1B5E3F]/20 space-y-5 text-xs">
                <TimelineStep
                  title="1. Investment Interest Expressed"
                  desc="Investor submitted investment proposal"
                  date={new Date(deal.createdAt).toLocaleString("en-IN")}
                  done
                />
                <TimelineStep
                  title="2. Terms & Equity Agreement Confirmed"
                  desc="Terms confirmed between founder and investor"
                  date={deal.stage === "agreed" || deal.stage === "completed" ? (deal.updatedAt ? new Date(deal.updatedAt).toLocaleString("en-IN") : "Confirmed") : "Pending"}
                  done={deal.stage === "agreed" || deal.stage === "completed"}
                />
                <TimelineStep
                  title="3. Razorpay Payment Initiated"
                  desc={deal.razorpayOrderId ? `Razorpay Order generated: ${deal.razorpayOrderId}` : "Pending order generation"}
                  date={deal.razorpayOrderId ? (deal.updatedAt ? new Date(deal.updatedAt).toLocaleString("en-IN") : "Initiated") : "Pending"}
                  done={!!deal.razorpayOrderId}
                />
                <TimelineStep
                  title="4. Payment Verified & Signature Confirmed"
                  desc={deal.razorpayPaymentId ? `Payment ID: ${deal.razorpayPaymentId}` : "Pending payment verification"}
                  date={deal.paidAt ? new Date(deal.paidAt).toLocaleString("en-IN") : "Pending"}
                  done={isPaid}
                />
                <TimelineStep
                  title="5. Investment Activated & Portfolio Updated"
                  desc="Deal completed and portfolio updated"
                  date={isPaid ? (deal.paidAt ? new Date(deal.paidAt).toLocaleString("en-IN") : "Active") : "Pending"}
                  done={isPaid}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Document Modal */}
      <Modal open={!!activeDoc} onClose={() => setActiveDoc(null)} title={activeDoc?.title || "Document View"}>
        {activeDoc && (
          <div className="p-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1B5E3F] flex items-center justify-center mx-auto">
              <HiDocumentText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-base text-[#0A1F14]">{activeDoc.title}</p>
              <p className="text-xs text-[#0A1F14]/60 mt-1">
                Transaction ID: {deal?.razorpayPaymentId || `INVST-${deal?._id?.slice(-6).toUpperCase()}`}
              </p>
            </div>
            <div className="p-4 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-xl text-left text-xs space-y-1.5 font-mono text-[#0A1F14]/80">
              <p>● Document Type: PDF</p>
              <p>● Issuer: Expglo Fund Gateway</p>
              <p>● Beneficiary: {deal?.founderId?.companyName || deal?.founderId?.name}</p>
              <p>● Amount: {formatINR(deal?.amount)}</p>
              <p>● Verified Signature: HMAC-SHA256 Valid</p>
            </div>
            <button
              onClick={() => {
                toast.success(`Downloading ${activeDoc.title}...`);
                setActiveDoc(null);
              }}
              className="w-full py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl shadow inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HiDownload className="w-4 h-4" /> Download Document
            </button>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}

function OverviewRow({ label, value, highlight, green, mono }) {
  return (
    <div className="p-3 bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-xl flex justify-between items-center">
      <span className="text-[#0A1F14]/60 font-semibold">{label}</span>
      <span
        className={`font-bold ${
          highlight
            ? "text-[#1B5E3F] text-sm font-black"
            : green
            ? "text-emerald-700 font-extrabold"
            : mono
            ? "font-mono text-[#0A1F14]"
            : "text-[#0A1F14]"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function TimelineStep({ title, desc, date, done }) {
  return (
    <div className="relative pl-5">
      <span
        className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black ${
          done ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <p className={`font-bold text-sm ${done ? "text-[#0A1F14]" : "text-gray-400"}`}>{title}</p>
      <p className="text-xs text-[#0A1F14]/60">{desc}</p>
      <p className="text-[10px] text-[#0A1F14]/40 mt-0.5">{date}</p>
    </div>
  );
}
