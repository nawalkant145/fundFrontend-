import { useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiFlag, HiBan, HiTrash } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const SEED = [
  {
    _id: "r1",
    type: "spam",
    description: "Constantly DMing without context, feels like a scammer.",
    createdAt: "2 hr ago",
    status: "pending",
    reportedBy: "Vikram Patel",
    target: "Karan Mehta",
    targetType: "user",
  },
  {
    _id: "r2",
    type: "fake",
    description: "Numbers in the pitch don't match their LinkedIn or website.",
    createdAt: "Yesterday",
    status: "pending",
    reportedBy: "Meera Kapoor",
    target: "EduForge — Personalized Tutors",
    targetType: "video",
  },
  {
    _id: "r3",
    type: "scam",
    description: "Asked for upfront payment for early-bird investment.",
    createdAt: "3 days ago",
    status: "resolved",
    reportedBy: "Arjun Nair",
    target: "Karan Mehta",
    targetType: "user",
  },
];

const typeColor = {
  spam: "bg-yellow-500/15 text-yellow-400",
  fake: "bg-orange-500/15 text-orange-400",
  scam: "bg-red-500/15 text-red-400",
  inappropriate: "bg-purple-500/15 text-purple-400",
  other: "bg-gray-500/15 text-gray-400",
};

export default function AdminReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState(SEED);
  const [viewing, setViewing] = useState(null);

  const resolve = (id, action) => {
    setReports((p) =>
      p.map((r) => (r._id === id ? { ...r, status: "resolved", action } : r)),
    );
    toast.success(`Report resolved · ${action}`);
  };
  const dismiss = (id) => {
    setReports((p) =>
      p.map((r) => (r._id === id ? { ...r, status: "dismissed" } : r)),
    );
    toast.info("Report dismissed");
  };

  return (
    <DashboardShell
      mode="admin"
      title="Reports queue"
      subtitle={`${reports.filter((r) => r.status === "pending").length} pending`}
    >
      <div className="space-y-3">
        {reports.map((r) => (
          <motion.div
            key={r._id}
            className={`bg-card-bg/60 border-2 rounded-2xl p-5 ${
              r.status === "pending" ? "border-red-500/30" : "border-gold/15"
            }`}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <HiFlag className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${typeColor[r.type]}`}
                  >
                    {r.type}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {r.targetType}: {r.target}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {r.createdAt}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">"{r.description}"</p>
                <p className="text-xs text-gray-500 mb-3">
                  Reported by {r.reportedBy}
                </p>
                {r.status === "pending" ? (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setViewing(r)}
                      className="px-4 py-2 border-2 border-gold/20 hover:border-gold rounded-lg text-xs font-bold"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => resolve(r._id, "no action needed")}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <HiCheck /> Resolve
                    </button>
                    <button
                      onClick={() => dismiss(r._id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <HiX /> Dismiss
                    </button>
                    <DropdownMenu
                      items={[
                        {
                          label: "Resolve · ban user",
                          icon: HiBan,
                          onClick: () => resolve(r._id, "user banned"),
                          danger: true,
                        },
                        {
                          label: "Resolve · remove content",
                          icon: HiTrash,
                          onClick: () => resolve(r._id, "content removed"),
                          danger: true,
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      r.status === "dismissed"
                        ? "text-gray-500"
                        : "text-emerald-400"
                    }`}
                  >
                    ●{" "}
                    {r.status === "dismissed"
                      ? "Dismissed"
                      : `Resolved · ${r.action || "handled"}`}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Report details"
      >
        {viewing && (
          <div className="space-y-3">
            <Field label="Type" value={viewing.type} />
            <Field
              label="Target"
              value={`${viewing.targetType}: ${viewing.target}`}
            />
            <Field label="Reported by" value={viewing.reportedBy} />
            <Field label="Submitted" value={viewing.createdAt} />
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="bg-dark-bg/40 p-3 rounded-xl text-sm">
                {viewing.description}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  resolve(viewing._id, "no action needed");
                  setViewing(null);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm"
              >
                Resolve
              </button>
              <button
                onClick={() => {
                  dismiss(viewing._id);
                  setViewing(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-sm"
              >
                Dismiss
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
      <span className="font-bold capitalize text-sm">{value}</span>
    </div>
  );
}
