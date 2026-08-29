import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiCurrencyDollar,
  HiChatAlt2,
  HiCheckCircle,
  HiExclamationCircle,
  HiEye,
  HiArrowRight,
  HiDocumentText,
  HiDownload,
  HiUser,
  HiCalendar,
  HiCreditCard,
  HiClock,
  HiMail,
  HiLocationMarker,
  HiPlus,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { investmentService } from "../../services/investmentService";
import { chatService } from "../../services/chatService";
import { useSocket } from "../../context/SocketContext";
import { formatINR } from "../../constants/mockData";

const TABS = [
  { id: "all", label: "All" },
  { id: "interested", label: "Interested" },
  { id: "negotiating", label: "Negotiating" },
  { id: "funded", label: "Funded" },
  { id: "closed", label: "Closed" },
];

export default function DealsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "all");
  const [stageDeal, setStageDeal] = useState(null);
  const [detailDeal, setDetailDeal] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);

  const { socket } = useSocket();

  const fetchDeals = () => {
    setLoading(true);
    setError(null);
    investmentService
      .getMyDeals()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.deals || data?.investments || (Array.isArray(data) ? data : []);
        setDeals(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        setError("We couldn't retrieve your investment deals right now.");
        setDeals([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Sync auto-open for specific deal from URL query param e.g. /app/deals?dealId=...
  useEffect(() => {
    const requestedId = searchParams.get("dealId");
    if (requestedId && deals.length > 0) {
      const match = deals.find((d) => d._id === requestedId);
      if (match) {
        setDetailDeal(match);
      }
    }
  }, [searchParams, deals]);

  // Listen to realtime notification for auto-refresh
  useEffect(() => {
    if (!socket) return;
    const onNotif = (notif) => {
      if (notif?.type === "investment") {
        fetchDeals();
      }
    };
    socket.on("notification", onNotif);
    return () => socket.off("notification", onNotif);
  }, [socket]);

  const updateStage = (id, stage) => {
    setDeals((d) => d.map((x) => (x._id === id ? { ...x, stage } : x)));
    investmentService
      .updateStage(id, stage)
      .then(() => toast.success(`Stage updated to ${stage}`))
      .catch(() => toast.error("Could not update stage"));
  };

  const handleStartChat = (investorId) => {
    if (!investorId) return;
    chatService
      .startChat(investorId)
      .then((res) => {
        const chat = res?.data?.data?.chat || res?.data?.data;
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch(() => toast.error("Could not start chat"));
  };

  // Real Database Summary Calculations
  const fundedDeals = useMemo(
    () => deals.filter((d) => d.status === "paid" || d.stage === "completed"),
    [deals]
  );

  const totalRaisedAmount = useMemo(
    () => fundedDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [fundedDeals]
  );

  const activeInvestorsCount = useMemo(() => {
    const unique = new Set(
      fundedDeals.map((d) => (d.investorId?._id || d.investorId || "").toString()).filter(Boolean)
    );
    return unique.size;
  }, [fundedDeals]);

  const pendingInterestsCount = useMemo(
    () => deals.filter((d) => d.stage === "interested" || d.stage === "negotiating" || d.status === "pending").length,
    [deals]
  );

  const totalEquityGiven = useMemo(
    () => fundedDeals.reduce((sum, d) => sum + (Number(d.equity) || 0), 0),
    [fundedDeals]
  );

  // Tab Filtering strictly based on backend fields
  const filteredDeals = deals.filter((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "funded") return d.status === "paid" || d.stage === "completed";
    if (activeTab === "interested") return d.stage === "interested";
    if (activeTab === "negotiating") return d.stage === "negotiating";
    if (activeTab === "closed") return d.status === "failed" || d.status === "refunded" || d.stage === "closed";
    return true;
  });

  return (
    <DashboardShell fullWidth={false}>
      <div className="max-w-[1150px] mx-auto py-4 px-2 sm:px-4 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1F14] tracking-tight">Deals</h1>
            <p className="text-xs sm:text-sm text-[#0A1F14]/60 font-medium mt-0.5">
              Manage investor interests, negotiations and confirmed investments.
            </p>
          </div>
          <Link to="/app/upload-pitch">
            <button className="px-5 py-2.5 bg-[#0F4A2E] hover:bg-[#1B5E3F] text-white text-xs font-black rounded-xl shadow transition-colors inline-flex items-center gap-1.5 cursor-pointer">
              <HiPlus className="w-4 h-4" /> Add New Deal
            </button>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#0A1F14]/60">Total Investments</p>
            <p className="text-xl sm:text-2xl font-black text-[#0F4A2E]">
              {totalRaisedAmount > 0 ? formatINR(totalRaisedAmount) : "₹0"}
            </p>
            <p className="text-[10px] text-[#0A1F14]/50 font-medium">Total amount raised</p>
          </div>

          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#0A1F14]/60">Active Investors</p>
            <p className="text-xl sm:text-2xl font-black text-[#0A1F14]">{activeInvestorsCount}</p>
            <p className="text-[10px] text-[#0A1F14]/50 font-medium">Investors in your startup</p>
          </div>

          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#0A1F14]/60">Pending Interests</p>
            <p className="text-xl sm:text-2xl font-black text-[#0A1F14]">{pendingInterestsCount}</p>
            <p className="text-[10px] text-[#0A1F14]/50 font-medium">Awaiting response</p>
          </div>

          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#0A1F14]/60">Total Equity Given</p>
            <p className="text-xl sm:text-2xl font-black text-[#0A1F14]">
              {totalEquityGiven > 0 ? `${totalEquityGiven}%` : "0%"}
            </p>
            <p className="text-[10px] text-[#0A1F14]/50 font-medium">Across all rounds</p>
          </div>
        </div>

        {/* 5 Filter Tabs with Green Underline */}
        <div className="border-b border-[#1B5E3F]/15 flex items-center gap-6 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSearchParams({ tab: t.id });
                }}
                className={`py-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-[#0F4A2E] text-[#0F4A2E]"
                    : "border-transparent text-[#0A1F14]/60 hover:text-[#0A1F14]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Loading State Skeletons */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-100 rounded w-48" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-3">
            <HiExclamationCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-extrabold text-base text-[#0A1F14]">Unable to Load Deals</h3>
            <p className="text-xs text-[#0A1F14]/60 max-w-sm mx-auto">{error}</p>
            <button
              onClick={fetchDeals}
              className="px-4 py-2 bg-[#0F4A2E] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDeals.length === 0 && (
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-12 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-[#0F4A2E] flex items-center justify-center mx-auto">
              <HiCurrencyDollar className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#0A1F14]">No deals yet</h3>
            <p className="text-xs text-[#0A1F14]/60 max-w-md mx-auto">
              Investment deals with investors will appear here once an investment is successfully completed.
            </p>
            <button
              onClick={() => navigate("/app")}
              className="px-5 py-2 bg-[#0F4A2E] hover:bg-[#1B5E3F] text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
            >
              Back to Feed
            </button>
          </div>
        )}

        {/* Deals List */}
        {!loading && !error && filteredDeals.length > 0 && (
          <div className="space-y-4">
            {filteredDeals.map((d) => (
              <DealCard
                key={d._id}
                deal={d}
                onView={() => navigate(`/app/deals/${d._id}`)}
                onUpdateStage={() => setStageDeal(d)}
                onStartChat={() => handleStartChat(d.investorId?._id || d.investorId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stage Update Modal */}
      <Modal open={!!stageDeal} onClose={() => setStageDeal(null)} title="Update Deal Stage">
        {stageDeal && (
          <div className="space-y-3 p-1">
            <p className="text-xs text-[#0A1F14]/70 mb-3 font-medium">
              Investor: <span className="font-bold text-[#0A1F14]">{stageDeal.investorId?.name || "Investor"}</span> —{" "}
              <span className="text-[#0F4A2E] font-black">{formatINR(stageDeal.amount)}</span>
            </p>
            {["interested", "negotiating", "agreed", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  updateStage(stageDeal._id, s);
                  setStageDeal(null);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                  stageDeal.stage === s
                    ? "border-[#0F4A2E] bg-emerald-50 text-[#0F4A2E] font-bold"
                    : "border-[#1B5E3F]/15 hover:border-[#0F4A2E]/40 bg-white text-[#0A1F14]"
                }`}
              >
                <span className="font-bold capitalize">{s}</span>
                {stageDeal.stage === s && <HiCheckCircle className="w-4 h-4 text-[#0F4A2E]" />}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}

function DealCard({ deal, onView, onUpdateStage, onStartChat }) {
  const isPaid = deal.status === "paid" || deal.stage === "completed";
  const investor = deal.investorId || {};

  return (
    <motion.div
      className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all space-y-4"
      whileHover={{ y: -1 }}
    >
      {/* Top Part */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Investor Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={
              investor.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(investor.name || "Investor")}&background=0F4A2E&color=fff`
            }
            alt={investor.name || "Investor"}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0F4A2E]/15 shrink-0"
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-base text-[#0A1F14] truncate">{investor.name || "Investor"}</p>
              <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                ✓ Verified Investor
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#0A1F14]/60 flex-wrap font-medium">
              <span className="flex items-center gap-1 truncate">
                <HiMail className="w-3.5 h-3.5 text-[#0F4A2E]/70" />
                {investor.email || "Verified Investor"}
              </span>
              <span className="flex items-center gap-1 truncate">
                <HiLocationMarker className="w-3.5 h-3.5 text-[#0F4A2E]/70" />
                {investor.location || "India"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Investment Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left md:text-left border-t md:border-t-0 border-[#1B5E3F]/8 pt-3 md:pt-0">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0A1F14]/50">Investment Amount</p>
            <p className="text-base font-black text-[#0A1F14]">{formatINR(deal.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0A1F14]/50">Equity</p>
            <p className="text-base font-black text-[#0A1F14]">{deal.equity ?? 0}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0A1F14]/50">Instrument</p>
            <p className="text-xs font-bold text-[#0A1F14] mt-0.5">Equity</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0A1F14]/50">Round</p>
            <p className="text-xs font-bold text-[#0A1F14] mt-0.5">Series A</p>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className="shrink-0 flex md:flex-col items-end justify-between">
          <span
            className={`px-3 py-1 text-xs font-extrabold rounded-full border inline-flex items-center gap-1.5 ${
              isPaid
                ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]"
                : deal.stage === "negotiating"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            ● {isPaid ? "Active / Funded" : deal.stage}
          </span>
        </div>
      </div>

      {/* Bottom Sub-row: Transaction Metadata & View Details */}
      <div className="pt-3 border-t border-[#1B5E3F]/8 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#0A1F14]/60 gap-3 font-medium">
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="flex items-center gap-1">
            <HiCalendar className="w-3.5 h-3.5 text-[#0F4A2E]" /> Invested On:{" "}
            <strong className="text-[#0A1F14]">
              {new Date(deal.paidAt || deal.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </span>
          <span>
            Transaction ID:{" "}
            <strong className="font-mono text-[#0A1F14]">
              {deal.razorpayPaymentId || `INVST-${deal._id.slice(-6).toUpperCase()}`}
            </strong>
          </span>
          <span>
            Payment ID:{" "}
            <strong className="font-mono text-[#0A1F14]">{deal.razorpayPaymentId || "N/A"}</strong>
          </span>
          <span>
            Order ID:{" "}
            <strong className="font-mono text-[#0A1F14]">{deal.razorpayOrderId || "N/A"}</strong>
          </span>
        </div>

        <button
          onClick={onView}
          className="text-xs font-extrabold text-[#0F4A2E] hover:text-[#1B5E3F] inline-flex items-center gap-1 cursor-pointer self-end sm:self-auto"
        >
          View Details →
        </button>
      </div>
    </motion.div>
  );
}
