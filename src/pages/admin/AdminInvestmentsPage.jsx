import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCurrencyDollar,
  HiLockClosed,
  HiLockOpen,
  HiRefresh,
  HiDownload,
  HiExclamationCircle,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import { formatINR } from "../../constants/mockData";

const statusColor = {
  pending: "bg-yellow-500/15 text-yellow-400",
  paid: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-gray-500/15 text-gray-400",
};

export default function AdminInvestmentsPage() {
  const toast = useToast();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suspicious, setSuspicious] = useState([]);
  const [freezing, setFreezing] = useState(null);
  const [refunding, setRefunding] = useState(null);

  const fetchDeals = () => {
    setLoading(true);
    adminService
      .listInvestments({ limit: 100 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.investments || data || [];
        setDeals(Array.isArray(list) ? list : []);
      })
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));

    adminService
      .getSuspiciousActivity()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setSuspicious(data?.suspicious || []);
      })
      .catch(() => setSuspicious([]));
  };

  useEffect(fetchDeals, []);

  const freeze = (id, reason) => {
    setDeals((p) =>
      p.map((d) => (d._id === id ? { ...d, isFrozen: true } : d)),
    );
    adminService.freezeInvestment(id, reason).catch(() => {});
    toast.warn("Deal frozen");
  };
  const unfreeze = (id) => {
    setDeals((p) =>
      p.map((d) => (d._id === id ? { ...d, isFrozen: false } : d)),
    );
    adminService.unfreezeInvestment(id).catch(() => {});
    toast.success("Deal unfrozen");
  };
  const refund = (id, reason) => {
    setDeals((p) =>
      p.map((d) => (d._id === id ? { ...d, status: "refunded" } : d)),
    );
    adminService.refundInvestment(id, reason).catch(() => {});
    toast.success("Investment refunded");
  };

  // Download CSV via the authenticated api client
  const exportCsv = async () => {
    try {
      const res = await api.get(adminService.exportInvestmentsUrl(), {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "investments.csv";
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <DashboardShell
      mode="admin"
      title="Investments oversight"
      subtitle={`${deals.length} deals`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-dark-bg/60 border border-gold/20 hover:border-gold rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={fetchDeals}
            className="px-4 py-2 bg-dark-bg/60 border border-gold/20 hover:border-gold rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Suspicious activity alert */}
      {suspicious.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm">
            <HiExclamationCircle className="w-5 h-5" />
            Suspicious activity detected (5+ deals in 24h)
          </div>
          <div className="space-y-1">
            {suspicious.map((s, i) => (
              <p key={i} className="text-xs text-gray-300">
                <span className="font-bold">{s.investor?.name}</span> —{" "}
                {s.count} deals · {formatINR(s.totalAmount)}
              </p>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiCurrencyDollar className="w-12 h-12 text-gold/40 mx-auto mb-3" />
          No investments yet.
        </div>
      ) : (
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-bg/60 border-b border-gold/10">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-bold">Investor → Founder</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Stage</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {deals.map((d) => (
                  <tr
                    key={d._id}
                    className={`hover:bg-dark-bg/40 ${d.isFrozen ? "bg-blue-500/5" : ""}`}
                  >
                    <td className="p-4">
                      <p className="font-bold">
                        {d.investorId?.name || "Investor"}
                      </p>
                      <p className="text-xs text-gray-400">
                        →{" "}
                        {d.founderId?.companyName ||
                          d.founderId?.name ||
                          "Founder"}
                      </p>
                    </td>
                    <td className="p-4 font-bold text-gold">
                      {formatINR(d.amount || 0)}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        {d.equity || 0}% equity
                      </span>
                    </td>
                    <td className="p-4 capitalize text-xs">{d.stage}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${statusColor[d.status] || statusColor.pending}`}
                      >
                        {d.status}
                      </span>
                      {d.isFrozen && (
                        <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/15 text-blue-400 uppercase">
                          Frozen
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {fmtDate(d.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu
                        items={[
                          d.isFrozen
                            ? {
                                label: "Unfreeze deal",
                                icon: HiLockOpen,
                                onClick: () => unfreeze(d._id),
                              }
                            : {
                                label: "Freeze deal",
                                icon: HiLockClosed,
                                onClick: () => setFreezing(d),
                              },
                          d.status === "paid" && {
                            label: "Refund",
                            icon: HiRefresh,
                            onClick: () => setRefunding(d),
                            danger: true,
                          },
                        ].filter(Boolean)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Freeze modal */}
      <ReasonModal
        item={freezing}
        title="Freeze this deal?"
        desc="The deal cannot proceed to payment while frozen. The investor is notified."
        confirmLabel="Freeze deal"
        confirmClass="bg-blue-600 hover:bg-blue-700"
        onClose={() => setFreezing(null)}
        onConfirm={(reason) => freeze(freezing._id, reason)}
      />

      {/* Refund modal */}
      <ReasonModal
        item={refunding}
        title="Refund this investment?"
        desc="Marks the investment as refunded and adjusts the investor's total."
        confirmLabel="Refund"
        confirmClass="bg-red-600 hover:bg-red-700"
        onClose={() => setRefunding(null)}
        onConfirm={(reason) => refund(refunding._id, reason)}
      />
    </DashboardShell>
  );
}

function ReasonModal({
  item,
  title,
  desc,
  confirmLabel,
  confirmClass,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  if (!item) return null;
  return (
    <Modal open={!!item} onClose={onClose} title={title}>
      <p className="text-sm text-gray-300 mb-3">{desc}</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason (logged in audit trail)…"
        className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm(reason);
            onClose();
          }}
          className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
