import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiCurrencyDollar,
  HiUser,
  HiArrowRight,
  HiExclamationCircle,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { notificationService } from "../../services/notificationService";
import { investmentService } from "../../services/investmentService";
import { formatINR } from "../../constants/mockData";

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(null);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);

    notificationService
      .getById(id)
      .then((res) => {
        const item = res?.data?.data?.notification || res?.data?.data || res?.data?.notification || res?.data;
        setNotif(item);

        if (item?.investment) {
          setDeal(item.investment);
          return null;
        }

        const dealId = item?.data?.investmentId;
        if (dealId) {
          return investmentService.getById(dealId);
        }
        return null;
      })
      .then((res) => {
        if (res) {
          const d = res?.data?.data?.investment || res?.data?.data || res?.data?.investment;
          if (d) setDeal(d);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load notification.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const metaData = notif?.data || {};
  const isPaid = metaData.status === "paid" || deal?.status === "paid" || deal?.stage === "completed";
  const titleText = notif?.title || (isPaid ? "New Investment Received" : "New Investment Interest");

  const investorName = metaData.investorName || deal?.investorId?.name || "Investor";
  const investorId = metaData.investorId || deal?.investorId?._id || deal?.investorId;
  const startupName = deal?.videoId?.title || deal?.founderId?.companyName || "Your Startup";
  const amount = metaData.amount || deal?.amount || 0;
  const equity = metaData.equity || deal?.equity || 0;
  const dealId = metaData.investmentId || deal?._id;
  const txnId = metaData.transactionId || deal?.razorpayPaymentId || (dealId ? `INVST-${dealId.slice(-6).toUpperCase()}` : "—");
  const dateStr = notif?.createdAt ? new Date(notif.createdAt).toLocaleString("en-IN") : "—";

  return (
    <DashboardShell title="Notification Detail" subtitle="Complete information for this alert.">
      <div className="max-w-3xl mx-auto space-y-6">
        {               }
        <button
          onClick={() => navigate("/app/notifications")}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#1B5E3F] hover:underline cursor-pointer"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Notifications
        </button>

        {loading ? (
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0A1F14]/60">Loading notification details...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-3">
            <HiExclamationCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#1B5E3F] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {                          }
            <div className="bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{titleText}</h2>
              <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                <span className="font-bold text-[#F5B942]">{investorName}</span>{" "}
                {isPaid ? (
                  <>
                    has successfully invested <span className="font-bold text-[#F5B942]">{formatINR(amount)}</span> in your startup.
                  </>
                ) : (
                  <>
                    is interested in investing <span className="font-bold text-[#F5B942]">{formatINR(amount)}</span> in your startup.
                  </>
                )}
              </p>
            </div>

            {                                      }
            <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0A1F14] border-b border-[#1B5E3F]/10 pb-3">
                Investment Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <DetailRow label="Startup" value={startupName} />
                <DetailRow label="Investor" value={investorName} />
                <DetailRow label="Investment Amount" value={formatINR(amount)} highlight />
                <DetailRow label="Equity" value={`${equity}%`} />
                <DetailRow label="Instrument" value="Equity Shares" />
                <DetailRow label="Round" value="Series A" />
                <DetailRow
                  label="Payment Status"
                  value={isPaid ? "Paid / Verified" : (deal?.status || "Pending")}
                  green={isPaid}
                />
                <DetailRow
                  label="Investment Status"
                  value={isPaid ? "Active / Funded" : (deal?.stage || "Interested")}
                  green={isPaid}
                />
                <DetailRow label="Transaction ID" value={txnId} mono />
                <DetailRow label="Investment Date" value={dateStr} />
              </div>
            </div>

            {                    }
            <div className="flex items-center gap-3 flex-wrap pt-2">
              {dealId && (
                <Link to={`/app/deals/${dealId}`} className="flex-1">
                  <button className="w-full py-3 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-black rounded-xl shadow transition-colors inline-flex items-center justify-center gap-2 cursor-pointer">
                    <HiCurrencyDollar className="w-4 h-4" /> View Deal
                  </button>
                </Link>
              )}

              {investorId && (
                <Link to={`/app/u/${investorId}`} className="flex-1">
                  <button className="w-full py-3 border border-[#1B5E3F]/30 hover:bg-[#FAFAF7] text-[#0F4A2E] text-xs font-black rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer">
                    <HiUser className="w-4 h-4" /> View Investor
                  </button>
                </Link>
              )}

              <Link to="/app/deals" className="flex-1">
                <button className="w-full py-3 bg-white border border-[#1B5E3F]/20 hover:border-[#1B5E3F] text-[#0A1F14] text-xs font-black rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer">
                  Go to Deals <HiArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardShell>
  );
}

function DetailRow({ label, value, highlight, green, mono }) {
  return (
    <div className="p-3 bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-xl flex justify-between items-center">
      <span className="text-[#0A1F14]/60 font-semibold">{label}</span>
      <span
        className={`font-bold ${
          highlight
            ? "text-[#1B5E3F] text-sm font-black"
            : green
            ? "text-emerald-700"
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
