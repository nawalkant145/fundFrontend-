import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiTrash, HiRefresh, HiVideoCamera } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminTrashPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(null);

  useEffect(() => {
    adminService
      .listTrash({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.videos || data || [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const restore = (id) => {
    setItems((p) => p.filter((x) => x._id !== id));
    adminService.restoreVideo(id).catch(() => {});
    toast.success("Video restored — it's active again");
  };

  const purge = (id) => {
    setItems((p) => p.filter((x) => x._id !== id));
    adminService.purgeVideo(id).catch(() => {});
    toast.success("Permanently deleted from Cloudinary + DB");
  };

  return (
    <DashboardShell
      mode="admin"
      title="Trash bin"
      subtitle="Soft-deleted content. Restore or permanently purge."
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiTrash className="w-12 h-12 text-gold/40 mx-auto mb-3" />
          Trash is empty. Nothing to restore.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <motion.div
              key={v._id}
              className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 flex items-center gap-4"
              whileHover={{ y: -2 }}
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <HiVideoCamera className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{v.title}</p>
                <p className="text-xs text-gray-400">
                  {v.founderId?.name || "Unknown"} · Deleted{" "}
                  {fmtDate(v.deletedAt)}
                  {v.rejectionReason && ` · "${v.rejectionReason}"`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => restore(v._id)}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <HiRefresh className="w-4 h-4" /> Restore
                </button>
                <button
                  onClick={() => setPurging(v)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <HiTrash className="w-4 h-4" /> Purge
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Confirm
        open={!!purging}
        onClose={() => setPurging(null)}
        onConfirm={() => purge(purging._id)}
        title="Permanently delete?"
        message={`"${purging?.title}" will be removed from Cloudinary and DB forever. This cannot be undone.`}
        confirmLabel="Purge permanently"
        destructive
      />
    </DashboardShell>
  );
}
