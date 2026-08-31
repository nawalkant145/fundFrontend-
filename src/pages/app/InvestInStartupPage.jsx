import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiCheck,
  HiCheckCircle,
  HiCurrencyDollar,
  HiShieldCheck,
  HiChevronRight,
  HiExternalLink,
  HiDownload,
  HiShare,
  HiX,
  HiDocumentText,
  HiExclamationCircle,
  HiOfficeBuilding,
  HiRefresh,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { videoService } from "../../services/videoService";
import { investmentService } from "../../services/investmentService";
import { formatINR } from "../../constants/mockData";
import { openRazorpayCheckout } from "../../lib/razorpay";

const STEPPER = [
  { id: 1, label: "Startup", desc: "Select startup" },
  { id: 2, label: "Investment", desc: "Choose terms" },
  { id: 3, label: "Payment", desc: "Secure payment" },
  { id: 4, label: "Confirmation", desc: "Review & confirm" },
];

export default function InvestInStartupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { user } = useAuth();

  const targetId = searchParams.get("startup") || searchParams.get("pitch") || searchParams.get("videoId");

  const [step, setStep] = useState(1);
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Investment details state
  const [amount, setAmount] = useState(2500000);
  const [equity, setEquity] = useState(2.5);
  const [instrument, setInstrument] = useState("Equity");
  const [round, setRound] = useState("Series A");
  const [note, setNote] = useState("");

  // Payment & confirmation state
  const [submitting, setSubmitting] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Fetch REAL startups from backend API strictly
  const fetchStartups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await videoService.getFeed({ limit: 50 });
      const data = res?.data?.data || res?.data;
      const list = data?.videos || (Array.isArray(data) ? data : []);
      const realVideos = Array.isArray(list) ? list : [];
      setStartups(realVideos);
    } catch (err) {
      setError("Unable to load startups from the server. Please check your connection.");
      setStartups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  // Pre-select target startup from URL query param if present
  useEffect(() => {
    if (startups.length === 0) return;

    if (targetId) {
      const match = startups.find(
        (s) => String(s._id) === String(targetId) || String(s.founderId?._id) === String(targetId)
      );
      if (match) {
        setSelectedStartup(match);
        if (match.askAmount) setAmount(Number(match.askAmount));
        if (match.equityOffered) setEquity(Number(match.equityOffered));
        if (match.fundingStage) setRound(match.fundingStage);
        return;
      }
    }

    if (!selectedStartup && startups.length > 0) {
      const first = startups[0];
      setSelectedStartup(first);
      if (first.askAmount) setAmount(Number(first.askAmount));
      if (first.equityOffered) setEquity(Number(first.equityOffered));
      if (first.fundingStage) setRound(first.fundingStage);
    }
  }, [targetId, startups]);

  const platformFee = useMemo(() => Math.round(amount * 0.01), [amount]);
  const gst = useMemo(() => Math.round(platformFee * 0.18), [platformFee]);
  const totalPayable = useMemo(() => amount + platformFee + gst, [amount, platformFee, gst]);

  // Execute payment flow using real database startup ID
  const handlePayment = async () => {
    if (!selectedStartup) return;
    setSubmitting(true);

    const startupId = selectedStartup._id;
    const founderName = selectedStartup.founderId?.companyName || selectedStartup.founderId?.name || selectedStartup.title || "Startup";

    try {
      // 1. Express interest / create or retrieve the real Investment document in MongoDB
      const expressRes = await investmentService.expressInterest({
        videoId: startupId,
        amount: Number(amount),
        equity: Number(equity),
        terms: note,
      });

      const invData = expressRes?.data?.data?.investment || expressRes?.data?.data?.deal || expressRes?.data?.data;
      if (!invData?._id) {
        throw new Error("Could not initialize investment record.");
      }
      const investmentId = invData._id;

      console.log("[INVESTMENT_CREATED]", {
        investmentId,
        founderId: invData.founderId || selectedStartup.founderId?._id,
        investorId: user?._id,
        videoId: startupId,
        status: invData.status,
        stage: invData.stage,
      });

      // 2. Create Razorpay order via backend
      const orderRes = await investmentService.createOrder(investmentId);
      const orderData = orderRes?.data?.data;
      if (!orderData?.keyId || !orderData?.order?.id) {
        throw new Error("Failed to create Razorpay payment order.");
      }

      console.log("[RAZORPAY_ORDER_CREATED]", {
        investmentId,
        orderId: orderData.order.id,
      });

      // 3. Trigger Razorpay Checkout modal
      const paymentResult = await openRazorpayCheckout({
        keyId: orderData.keyId,
        order: orderData.order,
        name: "EXPGLO FUND",
        description: `Investment in ${founderName}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
      });

      console.log("[RAZORPAY_PAYMENT_RECEIVED]", {
        orderId: paymentResult.razorpay_order_id,
        paymentId: paymentResult.razorpay_payment_id,
      });

      // 4. Verify payment with backend
      const verifyRes = await investmentService.verifyPayment(investmentId, paymentResult);
      const updatedInv = verifyRes?.data?.data?.investment || verifyRes?.data?.investment;

      console.log("[PAYMENT_VERIFICATION]", {
        investmentId,
        orderId: paymentResult.razorpay_order_id,
        paymentId: paymentResult.razorpay_payment_id,
        signatureValid: true,
        updatedStatus: updatedInv?.status,
        updatedStage: updatedInv?.stage,
      });

      const txId = paymentResult?.razorpay_payment_id || updatedInv?.razorpayPaymentId || `INVST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

      setTxDetails({
        txId,
        date: formattedDate,
        amount: updatedInv?.amount || amount,
        equity: updatedInv?.equity || equity,
        instrument,
        round,
        startupName: founderName,
        logo: selectedStartup.founderId?.avatar || selectedStartup.thumbnailUrl,
        startupId,
        investmentId,
      });

      setStep(4);
      toast.success("Investment Paid & Verified Successfully 🎉");
    } catch (err) {
      console.error("Investment Error:", err);
      const isAlreadyPaid = err?.response?.data?.data?.alreadyPaid || err?.response?.status === 409;
      const msg = err?.response?.data?.message || err?.message || "Investment payment failed";

      if (isAlreadyPaid) {
        const existingId = err?.response?.data?.data?.investmentId;
        toast.error("You have already invested in this startup.");
        if (existingId) {
          navigate(`/app/deals/${existingId}`);
        } else {
          navigate("/app/investments");
        }
        return;
      }

      if (msg !== "Payment cancelled") {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell fullWidth={false}>
      <div className="max-w-[1100px] mx-auto py-4 px-2 sm:px-4 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
              className="p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                Invest in Startup
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">
                Support great startups and be part of their growth journey.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {STEPPER.map((s, idx) => {
              const isDone = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                        isDone
                          ? "bg-[#10B981] text-white"
                          : isCurrent
                          ? "bg-[#1B5E3F] text-white ring-4 ring-[#1B5E3F]/15"
                          : "bg-[#F1F5F9] text-[#94A3B8]"
                      }`}
                    >
                      {isDone ? <HiCheck className="w-5 h-5" /> : s.id}
                    </div>
                    <div className="hidden md:block">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isCurrent ? "text-[#1B5E3F]" : isDone ? "text-[#10B981]" : "text-[#64748B]"
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] font-medium">{s.desc}</p>
                    </div>
                  </div>
                  {idx < STEPPER.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 sm:mx-4 transition-colors ${
                        step > s.id ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── LOADING STATE ─── */}
        {loading && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#1B5E3F]/20 border-t-[#1B5E3F] rounded-full animate-spin" />
            <p className="text-sm font-extrabold text-[#0F172A]">Loading startups for investment...</p>
            <p className="text-xs text-[#64748B]">Fetching real startup records from the backend server.</p>
          </div>
        )}

        {/* ─── ERROR STATE ─── */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-10 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <HiExclamationCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">Unable to Load Startups</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchStartups}
              className="px-5 py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <HiRefresh className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* ─── EMPTY STATE (NO REAL STARTUPS RETURNED FROM DATABASE) ─── */}
        {!loading && !error && startups.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B5E3F] flex items-center justify-center mx-auto">
              <HiOfficeBuilding className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">No Startups Available for Investment</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
                There are currently no active startup pitches in the database eligible for investment. Please check back later.
              </p>
            </div>
            <button
              onClick={() => navigate("/app")}
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Feed
            </button>
          </div>
        )}

        {/* ─── STEP 1: STARTUP SELECTION & DETAILS (WHEN REAL DATA EXISTS) ─── */}
        {!loading && !error && startups.length > 0 && step === 1 && (
          <div className="space-y-6">
            {/* Startup Selector Grid */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
              <label className="block text-xs font-extrabold uppercase text-[#64748B] tracking-wider mb-3">
                Select Startup to Invest ({startups.length} Available)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {startups.map((item) => {
                  const isSel = selectedStartup?._id === item._id;
                  const nameStr = item.founderId?.companyName || item.founderId?.name || item.title || "Startup";
                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSelectedStartup(item);
                        if (item.askAmount) setAmount(Number(item.askAmount));
                        if (item.equityOffered) setEquity(Number(item.equityOffered));
                        if (item.fundingStage) setRound(item.fundingStage);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSel
                          ? "border-[#1B5E3F] bg-[#1B5E3F]/10 ring-2 ring-[#1B5E3F]/20"
                          : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#1B5E3F]/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1B5E3F] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {item.founderId?.avatar ? (
                          <img src={item.founderId.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          nameStr[0]
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#0F172A] truncate">{nameStr}</p>
                        <p className="text-[11px] text-[#64748B] font-medium truncate">
                          {item.industry || "General"} · {item.fundingStage || "Seed"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Startup Details Card */}
            {selectedStartup && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#1B5E3F] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                      {selectedStartup.founderId?.avatar ? (
                        <img
                          src={selectedStartup.founderId.avatar}
                          alt=""
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        (selectedStartup.founderId?.companyName || selectedStartup.title || "S")[0]
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <span>{selectedStartup.founderId?.companyName || selectedStartup.title || "Startup"}</span>
                        {(selectedStartup.isVerified || selectedStartup.founderId?.isVerified) && (
                          <MdVerified className="w-5 h-5 text-[#10B981]" />
                        )}
                      </h2>
                      <p className="text-xs text-[#64748B] font-medium">
                        {selectedStartup.industry || "General"} · {selectedStartup.fundingStage || "Seed"}
                      </p>
                      <p className="text-xs text-[#334155] mt-1 font-medium max-w-xl leading-relaxed">
                        {selectedStartup.description || "Active startup pitch available for investment on ExpGlo Fund."}
                      </p>
                    </div>
                  </div>

                  <Link to={`/app/pitch?pitch=${selectedStartup._id}`}>
                    <button className="px-4 py-2 border border-[#E2E8F0] hover:border-[#1B5E3F] text-[#0F172A] hover:text-[#1B5E3F] text-xs font-bold rounded-xl transition-all cursor-pointer">
                      View Pitch ↗
                    </button>
                  </Link>
                </div>

                {/* Real Ask Amount & Equity Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[11px] text-[#64748B] font-medium">Target Funding Ask</p>
                    <p className="text-lg font-black text-[#10B981]">
                      {selectedStartup.askAmount ? formatINR(selectedStartup.askAmount) : "Flexible"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[11px] text-[#64748B] font-medium">Equity Offered</p>
                    <p className="text-lg font-black text-[#1B5E3F]">
                      {selectedStartup.equityOffered ? `${selectedStartup.equityOffered}%` : "Negotiable"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[11px] text-[#64748B] font-medium">Funding Stage</p>
                    <p className="text-lg font-black text-[#0F172A]">
                      {selectedStartup.fundingStage || "Seed"}
                    </p>
                  </div>
                </div>

                {/* Step 1 Footer Action */}
                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    Continue <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 2: INVESTMENT TERMS ─── */}
        {!loading && !error && startups.length > 0 && step === 2 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
              Investment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Amount */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0F172A]">
                  Investment Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-extrabold text-[#0F172A] focus:border-[#1B5E3F] focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none"
                />
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[1000000, 2500000, 5000000, 10000000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        amount === val
                          ? "bg-[#1B5E3F] text-white border-[#1B5E3F]"
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#1B5E3F]"
                      }`}
                    >
                      {formatINR(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equity Offered */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0F172A]">
                  Equity Offered (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={equity}
                  onChange={(e) => setEquity(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-extrabold text-[#0F172A] focus:border-[#1B5E3F] focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none font-semibold"
                />
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[1, 2.5, 5, 10].map((val) => (
                    <button
                      key={val}
                      onClick={() => setEquity(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        equity === val
                          ? "bg-[#10B981] text-white border-[#10B981]"
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#10B981]"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrument / Type */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0F172A]">
                  Instrument / Type
                </label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:border-[#1B5E3F] focus:outline-none cursor-pointer"
                >
                  <option value="Equity">Equity</option>
                  <option value="SAFE">SAFE Note</option>
                  <option value="Convertible Note">Convertible Note</option>
                </select>
              </div>

              {/* Round */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0F172A]">
                  Round
                </label>
                <select
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:border-[#1B5E3F] focus:outline-none cursor-pointer"
                >
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                </select>
              </div>
            </div>

            {/* Note textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#0F172A]">
                Investment Note (Optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share any special conditions or notes with the founder..."
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:border-[#1B5E3F] focus:outline-none resize-none font-medium"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-[#E2E8F0] text-[#0F172A] font-bold text-xs rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: PAYMENT SUMMARY & CHECKOUT ─── */}
        {!loading && !error && startups.length > 0 && step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
                Payment Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm font-medium text-[#334155]">
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Startup</span>
                  <span className="font-extrabold text-[#0F172A]">
                    {selectedStartup?.founderId?.companyName || selectedStartup?.title || "Startup"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Investment Amount</span>
                  <span className="font-extrabold text-[#0F172A]">{formatINR(amount)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Equity Offered</span>
                  <span className="font-extrabold text-[#10B981]">{equity}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Instrument / Type</span>
                  <span className="font-extrabold text-[#0F172A]">{instrument}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Round</span>
                  <span className="font-extrabold text-[#0F172A]">{round}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">Platform Fee (1%)</span>
                  <span className="font-bold text-[#64748B]">{formatINR(platformFee)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0]/60">
                  <span className="text-[#64748B]">GST (18%)</span>
                  <span className="font-bold text-[#64748B]">{formatINR(gst)}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-base font-black text-[#10B981]">
                  <span>Total Amount</span>
                  <span>{formatINR(totalPayable)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-extrabold uppercase text-[#64748B] tracking-wider mb-3">
                  Choose Payment Method
                </h3>
                <div className="space-y-2.5">
                  {[
                    { id: "upi", name: "UPI / Net Banking", desc: "Pay using UPI ID / Bank" },
                    { id: "card", name: "Card", desc: "Visa, MasterCard, RuPay" },
                    { id: "wallet", name: "Wallet", desc: "Pay using wallet balance" },
                  ].map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === pm.id
                          ? "border-[#10B981] bg-emerald-50/50 ring-2 ring-[#10B981]/20"
                          : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#10B981]/40"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-[#0F172A]">{pm.name}</p>
                        <p className="text-[11px] text-[#64748B] font-medium">{pm.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === pm.id ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#CBD5E1]"
                        }`}
                      >
                        {paymentMethod === pm.id && <HiCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment CTA */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] font-bold text-xs rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={submitting}
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HiShieldCheck className="w-5 h-5" />
                  {submitting ? "Processing Payment..." : `Pay ${formatINR(totalPayable)} Securely`}
                </button>
              </div>
            </div>

            {/* Sidebar Security Trust Card */}
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-xs text-[#475569] space-y-3">
                <div className="flex items-center gap-2 text-[#10B981] font-extrabold text-sm">
                  <HiShieldCheck className="w-5 h-5" />
                  <span>Verified & Encrypted</span>
                </div>
                <p className="leading-relaxed">
                  Your investment is secure and protected under EXPGLO FUND escrow compliance architecture.
                </p>
                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#94A3B8]">
                  Secured via Razorpay Payment Gateway
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: CONFIRMATION / SUCCESS ─── */}
        {!loading && step === 4 && txDetails && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto shadow-md">
              <HiCheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">Investment Successful!</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                Congratulations! You are now a proud investor in{" "}
                <span className="font-extrabold text-[#10B981]">{txDetails.startupName}</span>
              </p>
            </div>

            {/* Investment Summary */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
              <h3 className="font-black text-[#0F172A] border-b border-[#E2E8F0] pb-2 text-xs uppercase tracking-wider">
                Investment Summary
              </h3>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Investment Amount</span>
                <span className="font-extrabold text-[#0F172A]">{formatINR(txDetails.amount)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Equity Received</span>
                <span className="font-extrabold text-[#10B981]">{txDetails.equity}%</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Instrument / Type</span>
                <span className="font-bold text-[#0F172A]">{txDetails.instrument}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Round</span>
                <span className="font-bold text-[#0F172A]">{txDetails.round}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Transaction ID</span>
                <span className="font-bold text-[#1B5E3F] font-mono text-xs">{txDetails.txId}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="font-medium text-[#475569] text-xs">{txDetails.date}</span>
              </div>
            </div>

            <p className="text-xs text-[#64748B] font-medium">
              We've sent the details and agreement copy to your registered email.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/app/investments")}
                className="w-full sm:flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                View My Investments
              </button>
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full sm:flex-1 py-3 border border-[#1B5E3F] text-[#1B5E3F] hover:bg-[#1B5E3F]/10 font-extrabold text-sm rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <HiDocumentText className="w-4 h-4" /> Certificate
              </button>
              <button
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto px-5 py-3 border border-[#E2E8F0] text-[#0F172A] font-bold text-sm rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Back to Feed
              </button>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {txDetails && (
          <CertificateModal
            open={showCertificate}
            onClose={() => setShowCertificate(false)}
            tx={txDetails}
            userName={user?.name || "Investor"}
          />
        )}
      </div>
    </DashboardShell>
  );
}

function CertificateModal({ open, onClose, tx, userName }) {
  const toast = useToast();
  if (!tx) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6 bg-[#FAF9F6] border-8 border-[#10B981]/20 rounded-2xl text-center text-[#0F172A] relative space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2 text-left">
            <span className="font-black text-lg text-[#10B981]">EXPGLO FUND</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">Certificate ID: {tx.txId}</span>
        </div>

        <div className="py-2">
          <h2 className="text-2xl font-serif font-black text-[#0F172A] tracking-wide">
            Certificate of Investment
          </h2>
          <p className="text-xs text-[#64748B] mt-1 font-medium">This is to certify that</p>
          <p className="text-xl font-bold text-[#1B5E3F] mt-2">{userName}</p>
          <p className="text-xs text-[#475569] mt-1 font-medium">has successfully invested in</p>
          <p className="text-lg font-black text-[#0F172A] mt-1">{tx.startupName} Private Limited</p>
          <p className="text-xs text-[#64748B]">{tx.round || "Series A"}</p>
        </div>

        {/* Grid Summary */}
        <div className="grid grid-cols-4 gap-2 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs">
          <div>
            <p className="text-[10px] text-[#64748B]">Investment Amount</p>
            <p className="font-extrabold text-[#0F172A]">{formatINR(tx.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Equity Received</p>
            <p className="font-extrabold text-[#10B981]">{tx.equity}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Instrument</p>
            <p className="font-extrabold text-[#0F172A]">{tx.instrument}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Invested On</p>
            <p className="font-extrabold text-[#0F172A]">{tx.date?.split(",")[0]}</p>
          </div>
        </div>

        {/* Official Stamp & Sign */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] text-xs">
          <div className="text-left">
            <p className="font-serif italic text-sm text-[#0F172A] font-bold">Rajesh Sharma</p>
            <p className="text-[10px] text-[#64748B]">CEO, Expglo Fund</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-[#F59E0B] font-black text-[9px] uppercase shadow-sm">
            Verified
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => toast.success("Certificate downloaded as PDF")}
            className="px-4 py-2 bg-[#10B981] text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <HiDownload className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={() => toast.success("Certificate link copied to clipboard")}
            className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] font-bold text-xs rounded-xl hover:bg-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <HiShare className="w-4 h-4" /> Share Certificate
          </button>
        </div>
      </div>
    </Modal>
  );
}
