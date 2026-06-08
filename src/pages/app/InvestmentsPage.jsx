import { motion } from "framer-motion";
import { HiCurrencyDollar, HiTrendingUp } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { MOCK_DEALS, formatINR } from "../../constants/mockData";

const stageColor = {
  interested: "bg-primary-green/15 text-primary-green border-primary-green/30",
  negotiating: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  agreed: "bg-gold/15 text-gold border-gold/40",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function InvestmentsPage() {
  const total = MOCK_DEALS.filter((d) => d.status === "paid").reduce(
    (s, d) => s + d.amount,
    0,
  );
  const active = MOCK_DEALS.filter((d) => d.status === "pending").length;
  const completed = MOCK_DEALS.filter((d) => d.status === "paid").length;

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
        <StatCard label="Completed" value={completed} accent="gold" />
        <StatCard label="Companies" value={completed} accent="blue" />
      </div>

      <div className="space-y-3">
        {MOCK_DEALS.map((d) => (
          <motion.div
            key={d._id}
            className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
            whileHover={{ y: -2 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold/10 flex items-center justify-center font-black text-gold text-base sm:text-lg flex-shrink-0">
              {d.founderId.companyName?.[0] || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base truncate">
                {d.founderId.companyName}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {d.founderId.name}
              </p>
              <span
                className={`mt-1 inline-block sm:hidden px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${stageColor[d.stage]}`}
              >
                {d.stage}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gold text-sm sm:text-base">
                {formatINR(d.amount)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {d.equity}% equity
              </p>
            </div>
            <span
              className={`hidden sm:inline-block px-3 py-1 text-[10px] uppercase font-bold rounded-full border flex-shrink-0 ${stageColor[d.stage]}`}
            >
              {d.stage}
            </span>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
