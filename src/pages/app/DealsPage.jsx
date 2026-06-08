import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiCurrencyDollar,
  HiChatAlt2,
  HiCheckCircle,
  HiExclamationCircle,
  HiEye,
  HiArrowRight,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { useToast } from "../../components/ui/Toast";
import { MOCK_DEALS, formatINR } from "../../constants/mockData";

const stages = ["interested", "negotiating", "agreed", "completed"];
const stageColor = {
  interested: "bg-primary-green/15 text-primary-green border-primary-green/30",
  negotiating: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  agreed: "bg-gold/15 text-gold border-gold/40",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function DealsPage() {
  const toast = useToast();
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [stageDeal, setStageDeal] = useState(null);
  const [detailDeal, setDetailDeal] = useState(null);

  const updateStage = (id, stage) => {
    setDeals((d) => d.map((x) => (x._id === id ? { ...x, stage } : x)));
    toast.success(`Stage updated to ${stage}`);
  };

  return (
    <DashboardShell title="Deals" subtitle="Track your investor pipeline.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stages.map((s) => {
          const count = deals.filter((d) => d.stage === s).length;
          return (
            <div
              key={s}
              className={`bg-card-bg/60 border-2 ${stageColor[s].split(" ")[2]} rounded-2xl p-5`}
            >
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                {s}
              </p>
              <p className="text-3xl font-black">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {deals.map((d) => (
          <DealRow
            key={d._id}
            deal={d}
            onView={() => setDetailDeal(d)}
            onUpdateStage={() => setStageDeal(d)}
          />
        ))}
      </div>

      {/* Stage update modal */}
      <Modal
        open={!!stageDeal}
        onClose={() => setStageDeal(null)}
        title="Update deal stage"
      >
        {stageDeal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-300 mb-4">
              {stageDeal.investorId.name} —{" "}
              <span className="text-gold font-bold">
                {formatINR(stageDeal.amount)}
              </span>
            </p>
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => {
                  updateStage(stageDeal._id, s);
                  setStageDeal(null);
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  stageDeal.stage === s
                    ? "border-gold bg-gold/10"
                    : "border-gold/15 hover:border-gold/40"
                }`}
              >
                <span className="font-bold capitalize">{s}</span>
                {stageDeal.stage === s && (
                  <HiCheckCircle className="w-5 h-5 text-gold" />
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detailDeal}
        onClose={() => setDetailDeal(null)}
        title="Deal details"
      >
        {detailDeal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={detailDeal.investorId.avatar}
                alt={detailDeal.investorId.name}
                className="w-14 h-14 rounded-full border-2 border-gold/40"
              />
              <div>
                <p className="font-bold">{detailDeal.investorId.name}</p>
                <p className="text-xs text-gray-400">Investor</p>
              </div>
            </div>
            <Field label="Amount" value={formatINR(detailDeal.amount)} />
            <Field label="Equity offered" value={`${detailDeal.equity}%`} />
            <Field label="Stage" value={detailDeal.stage} />
            <Field label="Status" value={detailDeal.status} />
            <Field label="Last updated" value={detailDeal.updatedAt} />
            <div className="flex gap-2 pt-2">
              <Link to="/app/messages" className="flex-1">
                <button className="w-full px-4 py-2.5 rounded-xl border-2 border-gold/20 hover:border-gold/50 font-bold text-sm flex items-center justify-center gap-2">
                  <HiChatAlt2 className="w-4 h-4" /> Open chat
                </button>
              </Link>
              <button
                onClick={() => {
                  setDetailDeal(null);
                  setStageDeal(detailDeal);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-bright-gold text-dark-navy font-bold text-sm shadow-lg shadow-gold/30 flex items-center justify-center gap-2"
              >
                Update stage <HiArrowRight />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between p-3 bg-dark-bg/40 rounded-xl">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-bold capitalize">{value}</span>
    </div>
  );
}

function DealRow({ deal, onView, onUpdateStage }) {
  const menuItems = [
    { label: "View details", icon: HiEye, onClick: onView },
    {
      label: "Open chat",
      icon: HiChatAlt2,
      onClick: () => (window.location.href = "/app/messages"),
    },
    { divider: true },
    { label: "Update stage", icon: HiArrowRight, onClick: onUpdateStage },
  ];

  return (
    <motion.div
      className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 sm:p-5 hover:border-gold/40 transition-all"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
        <img
          src={deal.investorId.avatar}
          alt={deal.investorId.name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gold/30 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-sm sm:text-base">
              {deal.investorId.name}
            </p>
            <span
              className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full border ${stageColor[deal.stage]}`}
            >
              {deal.stage}
            </span>
            {deal.status === "paid" && (
              <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold">
                <HiCheckCircle /> Paid
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            {formatINR(deal.amount)} for {deal.equity}% equity ·{" "}
            {deal.updatedAt}
          </p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto sm:justify-end overflow-x-auto">
          <Link to="/app/messages" className="flex-shrink-0">
            <button className="px-3 py-2 border-2 border-gold/20 hover:border-gold rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
              <HiChatAlt2 className="w-4 h-4" /> Chat
            </button>
          </Link>
          {deal.stage === "agreed" && deal.status === "pending" && (
            <button className="px-3 py-2 bg-gold/20 text-gold rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
              <HiExclamationCircle className="w-4 h-4" /> Pay
            </button>
          )}
          {deal.stage !== "completed" && (
            <button
              onClick={onUpdateStage}
              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <HiCurrencyDollar className="w-4 h-4" /> Stage
            </button>
          )}
          <DropdownMenu items={menuItems} />
        </div>
      </div>
    </motion.div>
  );
}
