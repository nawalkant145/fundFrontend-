import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiDocumentText, HiEye } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

export default function AdminKycPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  useEffect(() => {
    adminService
      .getPendingDocuments()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.users || data || [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const approve = (userId) => {
    setItems((p) => p.filter((x) => x._id !== userId));
    adminService.approveDocuments(userId).catch(() => {});
    toast.success("KYC approved · user is now verified");
  };
  const reject = (userId, reason) => {
    setItems((p) => p.filter((x) => x._id !== userId));
    adminService.rejectDocuments(userId, reason).catch(() => {});
    toast.warn(`KYC rejected: ${reason || "reason given"}`);
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

  // Build a list of document labels from the user's documents object
  const docLabels = (user) => {
    const docs = user.documents || {};
    const labels = [];
    if (docs.idProof || docs.panUrl || docs.pan) labels.push("ID Proof");
    if (docs.addressProof || docs.aadhaarUrl || docs.aadhaar)
      labels.push("Address Proof");
    if (docs.selfie || docs.selfieUrl) labels.push("Selfie");
    if (docs.bankProof || docs.bankUrl) labels.push("Bank Proof");
    if (Array.isArray(docs.files))
      docs.files.forEach((_, i) => labels.push(`Doc ${i + 1}`));
    return labels.length ? labels : ["Documents submitted"];
  };

  return (
    <DashboardShell
      mode="admin"
      title="KYC review queue"
      subtitle={`${items.length} pending submissions`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          All caught up. The queue is empty.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((k) => {
            const docs = docLabels(k);
            return (
              <motion.div
                key={k._id}
                className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <img
                    src={
                      k.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(k.name || "U")}&background=1B5E3F&color=fff`
                    }
                    alt={k.name}
                    className="w-12 h-12 rounded-full object-cover border border-gold/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold">{k.name}</p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          k.role === "founder"
                            ? "bg-gold/15 text-gold"
                            : "bg-primary-green/15 text-primary-green"
                        }`}
                      >
                        {k.role}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Submitted{" "}
                        {fmtDate(k.documents?.submittedAt || k.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {k.email}
                      {k.companyName ? ` · ${k.companyName}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {docs.map((d, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-dark-bg/60 border border-gold/15 text-[11px] font-bold rounded-full flex items-center gap-1"
                        >
                          <HiDocumentText className="w-3.5 h-3.5 text-gold" />{" "}
                          {d}
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
            );
          })}
        </div>
      )}

      {/* Review modal */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`KYC docs — ${reviewing?.name}`}
        maxWidth="max-w-xl"
      >
        {reviewing && (
          <div className="space-y-3">
            {docLabels(reviewing).map((d, i) => {
              const docs = reviewing.documents || {};
              const url =
                docs.idProof ||
                docs.addressProof ||
                docs.selfie ||
                docs.bankProof ||
                docs.files?.[i] ||
                null;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-dark-bg/40 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="w-6 h-6 text-gold" />
                    <p className="font-bold text-sm">{d}</p>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold hover:text-bright-gold font-semibold"
                    >
                      View document →
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">No file</span>
                  )}
                </div>
              );
            })}
            <div className="flex gap-2 pt-3 border-t border-gold/10">
              <button
                onClick={() => {
                  setRejecting(reviewing);
                  setReviewing(null);
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
        {item.name} will be notified to resubmit.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason (e.g. ID not legible)…"
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
