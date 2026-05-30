import { useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiDocumentText, HiEye } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const SEED = [
  {
    _id: "k1",
    user: {
      name: "Sofia Chen",
      email: "sofia@eduforge.in",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      role: "founder",
      company: "EduForge",
    },
    submittedAt: "2 hr ago",
    docs: ["PAN", "Aadhaar", "Selfie"],
  },
  {
    _id: "k2",
    user: {
      name: "Karan Mehta",
      email: "karan@example.com",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      role: "investor",
      company: "—",
    },
    submittedAt: "Yesterday",
    docs: ["PAN", "Aadhaar", "Selfie", "Bank Proof"],
  },
];

export default function AdminKycPage() {
  const toast = useToast();
  const [items, setItems] = useState(SEED);
  const [reviewing, setReviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const approve = (id) => {
    setItems((p) => p.filter((x) => x._id !== id));
    toast.success("KYC approved · user is now verified");
  };
  const reject = (id, reason) => {
    setItems((p) => p.filter((x) => x._id !== id));
    toast.warn(`KYC rejected: ${reason || "reason given"}`);
  };

  return (
    <DashboardShell
      mode="admin"
      title="KYC review queue"
      subtitle={`${items.length} pending submissions`}
    >
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          All caught up. The queue is empty.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((k) => (
            <motion.div
              key={k._id}
              className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <img
                  src={k.user.avatar}
                  alt={k.user.name}
                  className="w-12 h-12 rounded-full object-cover border border-gold/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold">{k.user.name}</p>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        k.user.role === "founder"
                          ? "bg-gold/15 text-gold"
                          : "bg-primary-green/15 text-primary-green"
                      }`}
                    >
                      {k.user.role}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      Submitted {k.submittedAt}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    {k.user.email} · {k.user.company}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {k.docs.map((d) => (
                      <span
                        key={d}
                        className="px-2.5 py-1 bg-dark-bg/60 border border-gold/15 text-[11px] font-bold rounded-full flex items-center gap-1"
                      >
                        <HiDocumentText className="w-3.5 h-3.5 text-gold" /> {d}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setReviewing(k)}
                      className="px-4 py-2 bg-dark-bg/60 hover:bg-dark-bg/80 text-gray-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <HiEye /> Review docs
                    </button>
                    <button
                      onClick={() => approve(k._id)}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <HiCheck /> Approve
                    </button>
                    <button
                      onClick={() => setRejecting(k)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <HiX /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review modal */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`KYC docs — ${reviewing?.user.name}`}
        maxWidth="max-w-xl"
      >
        {reviewing && (
          <div className="space-y-3">
            {reviewing.docs.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between p-3 bg-dark-bg/40 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <HiDocumentText className="w-6 h-6 text-gold" />
                  <p className="font-bold text-sm">{d}</p>
                </div>
                <button className="text-xs text-gold hover:text-bright-gold font-semibold">
                  View document →
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-3 border-t border-gold/10">
              <button
                onClick={() => {
                  setReviewing(null);
                  setRejecting(reviewing);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  approve(reviewing._id);
                  setReviewing(null);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>

      <RejectModal
        item={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => reject(rejecting._id, reason)}
      />
    </DashboardShell>
  );
}

function RejectModal({ item, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  if (!item) return null;
  return (
    <Modal open={!!item} onClose={onClose} title="Reject KYC">
      <p className="text-sm text-gray-300 mb-3">
        {item.user.name} will be notified to resubmit.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason (e.g. Aadhaar not legible)…"
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
          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
        >
          Reject
        </button>
      </div>
    </Modal>
  );
}
