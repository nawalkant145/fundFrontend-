import { motion } from "framer-motion";
import { HiCurrencyDollar, HiTrendingUp } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import StatCard from "../../components/dashboard/StatCard";
import { MOCK_DEALS, formatINR } from "../../constants/mockData";

const stageColor = {
  interested: "bg-blue-500/15 text-blue-400 border-blue-500/30",
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
            className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5 flex items-center gap-4 flex-wrap"
            whileHover={{ y: -2 }}
          >
            <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center font-black text-gold text-lg">
              {d.founderId.companyName?.[0] || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold">{d.founderId.companyName}</p>
              <p className="text-sm text-gray-400">{d.founderId.name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gold">{formatINR(d.amount)}</p>
              <p className="text-xs text-gray-400">{d.equity}% equity</p>
            </div>
            <span
              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${stageColor[d.stage]}`}
            >
              {d.stage}
            </span>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
