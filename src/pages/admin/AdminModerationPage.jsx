import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiShieldExclamation,
  HiCheck,
  HiTrash,
  HiX,
  HiVideoCamera,
  HiChatAlt2,
  HiPhotograph,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

const typeIcon = {
  video: HiVideoCamera,
  comment: HiChatAlt2,
  post: HiPhotograph,
};

function fmtTime(d) {
  if (!d) return "";
  const diff = Math.max(0, Date.now() - new Date(d).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function AdminModerationPage() {
  const toast = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchFlags = () => {
    setLoading(true);
    adminService
      .listFlags({ status: statusFilter, limit: 100 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.flags || data || [];
        setFlags(Array.isArray(list) ? list : []);
      })
      .catch(() => setFlags([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchFlags, [statusFilter]);

  const resolve = (id, action, label) => {
    setFlags((p) => p.filter((f) => f._id !== id));
    adminService.resolveFlag(id, action).catch(() => {});
    toast.success(label);
  };

  return (
    <DashboardShell
      mode="admin"
      title="Moderation queue"
      subtitle="Auto-flagged content awaiting review."
    >
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { v: "pending", l: "Pending" },
          { v: "approved", l: "Approved" },
          { v: "removed", l: "Removed" },
          { v: "dismissed", l: "Dismissed" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === f.v
                ? "bg-gold text-dark-navy"
                : "bg-dark-bg/60 text-gray-300 border border-gold/20 hover:border-gold/50"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : flags.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiShieldExclamation className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          {statusFilter === "pending"
            ? "Nothing flagged. The platform is clean."
            : `No ${statusFilter} items.`}
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => {
            const Icon = typeIcon[f.contentType] || HiShieldExclamation;
            const author = f.authorId || {};
            return (
              <motion.div
                key={f._id}
                className="bg-card-bg/60 border-2 border-red-500/30 rounded-2xl p-5"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-purple-500/15 text-purple-400">
                        {f.contentType}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-red-500/15 text-red-400">
                        {f.reason}
                      </span>
                      <span className="text-xs text-gray-400">
                        by {author.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {fmtTime(f.createdAt)}
                      </span>
                    </div>

                    {/* Original flagged text */}
                    <p className="text-sm text-gray-300 mb-2 bg-dark-bg/40 p-3 rounded-lg italic">
                      "{f.originalText}"
                    </p>

                    {/* Matched terms */}
                    {f.matchedTerms?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {f.matchedTerms.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[11px] font-bold rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {f.status === "pending" ? (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() =>
                            resolve(f._id, "approved", "Content approved")
                          }
                          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <HiCheck /> Approve (keep)
                        </button>
                        <button
                          onClick={() =>
                            resolve(f._id, "removed", "Content removed")
                          }
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <HiTrash /> Remove content
                        </button>
                        <button
                          onClick={() =>
                            resolve(f._id, "dismissed", "Flag dismissed")
                          }
                          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <HiX /> Dismiss flag
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 capitalize">
                        ● {f.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
