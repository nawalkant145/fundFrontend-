import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiClipboardList, HiDownload, HiFilter } from "react-icons/hi";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import api from "../../services/api";

const actionColor = {
  BAN_USER: "bg-red-500/15 text-red-400",
  UNBAN_USER: "bg-emerald-500/15 text-emerald-400",
  SUSPEND_USER: "bg-orange-500/15 text-orange-400",
  UNSUSPEND_USER: "bg-emerald-500/15 text-emerald-400",
  APPROVE_KYC: "bg-emerald-500/15 text-emerald-400",
  REJECT_KYC: "bg-red-500/15 text-red-400",
  APPROVE_VIDEO: "bg-emerald-500/15 text-emerald-400",
  REJECT_VIDEO: "bg-red-500/15 text-red-400",
  BOOST_VIDEO: "bg-gold/15 text-gold",
  REMOVE_BOOST: "bg-gray-500/15 text-gray-400",
  REFUND_INVESTMENT: "bg-yellow-500/15 text-yellow-400",
  FREEZE_INVESTMENT: "bg-blue-500/15 text-blue-400",
  UNFREEZE_INVESTMENT: "bg-emerald-500/15 text-emerald-400",
  PROMOTE_ADMIN: "bg-purple-500/15 text-purple-400",
  DEMOTE_ADMIN: "bg-orange-500/15 text-orange-400",
  HARD_DELETE_USER: "bg-red-500/15 text-red-400",
  FORCE_DELETE_VIDEO: "bg-red-500/15 text-red-400",
  BROADCAST: "bg-blue-500/15 text-blue-400",
  default: "bg-gray-500/15 text-gray-400",
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function AdminAuditPage() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [actionFilter, setActionFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchLogs = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (actionFilter) params.action = actionFilter;
    if (from) params.from = from;
    if (to) params.to = to;
    adminService
      .getAuditLogs(params)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.logs || data?.auditLogs || data || [];
        setLogs(Array.isArray(list) ? list : []);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminService
      .getAuditActions()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setActions(data?.actions || []);
      })
      .catch(() => {});
  }, []);

  useEffect(fetchLogs, [actionFilter, from, to]);

  const exportCsv = async () => {
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get(adminService.auditExportUrl(), {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "audit-log.csv";
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Audit log exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const clearFilters = () => {
    setActionFilter("");
    setFrom("");
    setTo("");
  };

  return (
    <DashboardShell
      mode="admin"
      title="Audit log"
      subtitle="Every admin action is recorded here."
    >
      {             }
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-300">
          <HiFilter className="w-4 h-4 text-gold" /> Filters
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-400 mb-1 block">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
            >
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border-2 border-gold/20 hover:border-gold rounded-xl text-xs font-bold"
          >
            Clear
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-gold text-dark-navy rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No matching audit entries.
        </div>
      ) : (
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl divide-y divide-gold/10">
          {logs.map((a) => {
            const actor = a.actorId?.name || "Admin";
            const target =
              a.targetId?.name ||
              a.targetId?.title ||
              a.metadata?.name ||
              a.metadata?.email ||
              a.targetType ||
              "—";
            const meta =
              a.metadata?.reason ||
              a.metadata?.newRole ||
              (a.metadata?.days ? `${a.metadata.days} days` : "") ||
              (a.metadata?.recipients
                ? `${a.metadata.recipients} recipients`
                : "") ||
              "";
            return (
              <motion.div
                key={a._id}
                className="flex items-center gap-4 p-4 hover:bg-dark-bg/40 transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 rounded-xl bg-dark-bg/60 flex items-center justify-center flex-shrink-0">
                  <HiClipboardList className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${actionColor[a.action] || actionColor.default}`}
                    >
                      {a.action}
                    </span>
                    <p className="font-bold text-sm truncate">{target}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    <span className="text-gray-300">{actor}</span>
                    {meta && ` · ${meta}`}
                  </p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimeAgo(a.createdAt)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
