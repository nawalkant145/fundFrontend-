import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCurrencyDollar, HiTrendingUp, HiCheckCircle, HiUserGroup } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { investmentService } from "../../services/investmentService";
import { formatINR } from "../../constants/mockData";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";

const stageColor = {
  interested: "bg-primary-green/15 text-primary-green border-primary-green/30",
  negotiating: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  agreed: "bg-gold/15 text-gold border-gold/40",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function InvestmentsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadDeals = () => {
    investmentService
      .getMyDeals()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.deals || data?.investments || data || [];
        const arr = Array.isArray(list) ? list : [];
        setDeals(arr);
        console.log("[INVESTOR_MY_INVESTMENTS]", {
          authenticatedInvestorId: user?._id,
          endpoint: "GET /api/v1/investment/my-deals",
          responseCount: arr.length,
          deals: arr.map((d) => ({
            id: d._id,
            founderId: d.founderId?._id || d.founderId,
            investorId: d.investorId?._id || d.investorId,
            videoId: d.videoId?._id || d.videoId,
            status: d.status,
            stage: d.stage,
          })),
        });
      })
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handlePay = async (deal) => {
    setPayingId(deal._id);
    try {
      const res = await investmentService.createOrder(deal._id);
      const data = res?.data?.data || {};
      const payment = await openRazorpayCheckout({
        keyId: data.keyId,
        order: data.order,
        name: "EXPGLO FUND",
        description: `Investment in ${deal.founderId?.companyName || "startup"}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
      });
      await investmentService.verifyPayment(deal._id, payment);
      toast.success("Payment successful — investment completed 🎉");
      loadDeals();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Payment failed";
      if (msg !== "Payment cancelled") toast.error(msg);
    } finally {
      setPayingId(null);
    }
  };

  const isPaid = (d) => d.status === "paid" || d.status === "completed";
  const total = deals.filter(isPaid).reduce((s, d) => s + (d.amount || 0), 0);
  const active = deals.filter(
    (d) => d.status === "pending" || d.stage === "negotiating",
  ).length;
  const completed = deals.filter(isPaid).length;

  return (
    <DashboardShell
      title="My investments"
      subtitle="Your portfolio at a glance."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiCurrencyDollar}
          label="Total invested"
          value={formatINR(total)}
        />
        <StatCard
          icon={HiTrendingUp}
          label="Active deals"
          value={active}
          accent="green"
        />
     <StatCard icon={HiCheckCircle} label="Completed" value={completed} accent="gold" />
        <StatCard icon={HiUserGroup} label="Companies" value={deals.length} accent="blue" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20">
          <HiCurrencyDollar className="w-12 h-12 text-gold/40 mx-auto mb-4" />
          <p className="text-gray-400 mb-1">No investments yet.</p>
          <p className="text-sm text-gray-500">
            Express interest on a pitch to start a deal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((d) => {
            const founder = d.founderId || {};
            const company = founder.companyName || founder.name || "Company";
            return (
              <motion.div
                key={d._id}
                className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold/10 flex items-center justify-center font-black text-gold text-base sm:text-lg flex-shrink-0">
                  {company[0] || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base truncate">
                    {company}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {founder.name || ""}
                  </p>
                  {d.stage && (
                    <span
                      className={`mt-1 inline-block sm:hidden px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${stageColor[d.stage] || stageColor.interested}`}
                    >
                      {d.stage}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gold text-sm sm:text-base">
                    {formatINR(d.amount || 0)}
                  </p>
                  {d.equity != null && (
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      {d.equity}% equity
                    </p>
                  )}
                </div>
                {d.stage === "agreed" && d.status === "pending" && (
                  <button
                    onClick={() => handlePay(d)}
                    disabled={payingId === d._id}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-md shadow-gold/30 ${
                      payingId === d._id ? "opacity-60" : ""
                    }`}
                  >
                    <HiCurrencyDollar className="w-4 h-4" />
                    {payingId === d._id ? "Processing…" : "Pay now"}
                  </button>
                )}
                {d.stage && (
                  <span
                    className={`hidden sm:inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-full border flex-shrink-0 ${stageColor[d.stage] || stageColor.interested}`}
                  >
                    {d.stage}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
