import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCheck,
  HiX,
  HiEye,
  HiShieldCheck,
  HiDocumentText,
  HiCreditCard,
  HiExclamation,
  HiBadgeCheck,
  HiExternalLink,
  HiDownload,
  HiClock,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { adminService } from "../../services/adminService";

export default function AdminKycPage() {
  const [activeQueueTab, setActiveQueueTab] = useState("personal"); // personal | founder | investor | risk
  const [kpis, setKpis] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewing, setReviewing] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchKpis = () => {
    adminService
      .getOperationalKpis()
      .then((res) => setKpis(res?.data?.data || res?.data))
      .catch(() => {});
  };

  const fetchQueueItems = () => {
    setLoading(true);
    adminService
      .getPendingQueues(activeQueueTab)
      .then((res) => {
        const payload = res?.data?.data || res?.data;
        const list = Array.isArray(payload) ? payload : (payload?.items || payload?.users || []);
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKpis();
    fetchQueueItems();
  }, [activeQueueTab]);

  const approveItem = (item, notes = "") => {
    const id = item._id;
    let promise;
    if (activeQueueTab === "founder") {
      promise = adminService.approveCompanyKyc(id);
    } else if (activeQueueTab === "investor") {
      promise = adminService.approveInvestorKyc(id);
    } else {
      promise = adminService.approveUserDocuments(item.userId?._id || item.founderId?._id || item.investorId?._id || item._id, notes);
    }

    promise
      .then(() => {
        fetchKpis();
        fetchQueueItems();
      })
      .catch(() => {});
  };

  const rejectItem = (item, reason, notes = "") => {
    const id = item._id;
    let promise;
    if (activeQueueTab === "founder") {
      promise = adminService.rejectCompanyKyc(id, reason);
    } else if (activeQueueTab === "investor") {
      promise = adminService.rejectInvestorKyc(id, reason);
    } else {
      promise = adminService.rejectUserDocuments(item.userId?._id || item.founderId?._id || item.investorId?._id || item._id, reason, notes);
    }

    promise
      .then(() => {
        fetchKpis();
        fetchQueueItems();
      })
      .catch(() => {});
  };

  const fmtTimeAgo = (d) => {
    if (!d) return "recently";
    const diff = Math.max(0, Date.now() - new Date(d).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} days ago`;
  };

  return (
    <DashboardShell title="Identity & KYC Operations Workspace">
      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Pending Personal ID Queue"
          value={kpis?.queues?.level2 ?? kpis?.pendingPersonalKyc ?? 0}
          icon={HiShieldCheck}
          color="text-[#F5B942]"
        />
        <KpiCard
          label="Pending Founder Queue"
          value={kpis?.queues?.level3 ?? kpis?.pendingFounderKyc ?? 0}
          icon={HiDocumentText}
          color="text-emerald-400"
        />
        <KpiCard
          label="Pending Investor Queue"
          value={kpis?.queues?.level4 ?? kpis?.pendingInvestorKyc ?? 0}
          icon={HiCreditCard}
          color="text-purple-400"
        />
        <KpiCard
          label="Total Verified Users"
          value={kpis?.totalVerifiedUsers || 0}
          icon={HiBadgeCheck}
          color="text-[#1B5E3F]"
        />
      </div>

      {/* Queue Selection Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#1B5E3F]/12 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveQueueTab("personal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "personal"
              ? "bg-[#1B5E3F] text-white"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiShieldCheck className="w-4 h-4" /> Personal Identity (Level 2)
        </button>

        <button
          onClick={() => setActiveQueueTab("founder")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "founder"
              ? "bg-emerald-600 text-white"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiDocumentText className="w-4 h-4" /> Founder Corporate (Level 3)
        </button>

        <button
          onClick={() => setActiveQueueTab("investor")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "investor"
              ? "bg-[#F5B942] text-[#0A1F14]"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiCreditCard className="w-4 h-4" /> Investor Transaction (Level 4)
        </button>

        <button
          onClick={() => setActiveQueueTab("risk")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "risk"
              ? "bg-rose-500 text-white"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiExclamation className="w-4 h-4" /> Risk & Compliance (Level 5)
        </button>
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#F5B942]/20 border-t-[#F5B942] animate-spin" />
          <p className="text-xs font-semibold text-gray-400">Loading documents...</p>
        </div>
      ) : !Array.isArray(items) || items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          Queue empty. No pending submissions in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(items) ? items : []).map((item) => {
            const user = item.userId || item.founderId || item.investorId || item;
            const refId = item.referenceId || user.documents?.referenceId || `KYC-20260805-${item._id?.slice(-5).toUpperCase()}`;
            const docTypeLabel = item.documentType ? String(item.documentType).toUpperCase() : "GOVT ID";

            return (
              <motion.div
                key={item._id}
                className="bg-card-bg/60 border-2 border-[#F5B942]/15 rounded-2xl p-5"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=1B5E3F&color=fff`
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#F5B942]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-white">{user.name || item.companyName}</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-[#F5B942]/15 text-[#F5B942]">
                        {user.role || "Level " + (user.verificationLevel || 1)}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-dark-bg border border-[#F5B942]/20 text-[#F5B942]">
                        {refId}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-amber-500/15 text-amber-400">
                        {item.verificationStatus || "under_review"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">
                      <strong className="text-gray-300">{docTypeLabel}:</strong> {item.documentNumber || "Attached"} · <HiClock className="inline w-3 h-3 text-gray-500 mb-0.5" /> Submitted {fmtTimeAgo(item.createdAt)}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setReviewing(item)}
                        className="px-4 py-2 bg-dark-bg/60 hover:bg-dark-bg/80 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <HiEye /> Review Documents
                      </button>
                      <button
                        onClick={() => setApproving(item)}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <HiCheck /> Approve
                      </button>
                      <button
                        onClick={() => setRejecting(item)}
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

      {/* Review & Document View Modal */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title="KYC Document Inspection & Review"
        maxWidth="max-w-2xl"
      >
        {reviewing && (
          <div className="space-y-5 text-sm text-gray-300">
            {/* User Metadata & Reference Header */}
            <div className="p-4 bg-dark-bg/50 rounded-xl space-y-2 border border-[#F5B942]/10">
              <div className="flex justify-between items-start flex-wrap gap-2 pb-2 border-b border-[#F5B942]/10">
                <div>
                  <p className="font-bold text-base text-white">{(reviewing.userId || reviewing.founderId || reviewing.investorId || reviewing).name}</p>
                  <p className="text-xs text-gray-400">{(reviewing.userId || reviewing.founderId || reviewing.investorId || reviewing).email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#F5B942] bg-dark-bg px-2.5 py-1 rounded border border-[#F5B942]/20 block">
                    {reviewing.referenceId || `KYC-20260805-${reviewing._id?.slice(-5).toUpperCase()}`}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 block mt-1">
                    Status: {reviewing.verificationStatus || "under_review"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {(reviewing.userId || reviewing.founderId || reviewing.investorId || reviewing).phone && (
                  <p><strong className="text-[#F5B942]">Phone:</strong> {(reviewing.userId || reviewing.founderId || reviewing.investorId || reviewing).phone}</p>
                )}
                {reviewing.documentType && <p><strong className="text-[#F5B942]">Document Type:</strong> {reviewing.documentType.toUpperCase()}</p>}
                {reviewing.documentNumber && <p><strong className="text-[#F5B942]">Document Number:</strong> {reviewing.documentNumber}</p>}
                <p><strong className="text-[#F5B942]">Submitted At:</strong> {new Date(reviewing.createdAt).toLocaleString()}</p>
                {reviewing.companyName && <p><strong className="text-[#F5B942]">Company:</strong> {reviewing.companyName}</p>}
                {reviewing.CIN && <p><strong className="text-[#F5B942]">CIN:</strong> {reviewing.CIN}</p>}
              </div>
            </div>

            {/* Viewable Uploaded Document Cards */}
            {(() => {
              const docFiles = [
                reviewing.documentFront || reviewing.documents?.panCard,
                reviewing.documentBack || reviewing.documents?.aadhar,
                reviewing.selfie,
                reviewing.documents?.businessReg,
                reviewing.registrationCertificate,
                reviewing.companyPAN,
                reviewing.startupIndiaCert,
                reviewing.addressProof?.docUrl,
                reviewing.bankAccount?.proofUrl,
                reviewing.incomeProofUrl,
              ].filter((u) => Boolean(u) && String(u).trim() !== "");

              const hasFiles = docFiles.length > 0;

              return (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Uploaded Verification Files ({docFiles.length})
                  </h4>

                  {!hasFiles ? (
                    <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-2">
                        <HiExclamation className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        No document files attached to this submission
                      </p>
                      <p className="text-xs text-amber-200/80">
                        This submission contains no valid document files. Approval is disabled until valid documents are inspected. Reject this submission to request the user to re-upload clear document files.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <DocumentPreviewCard
                        label="Document Front (PAN / ID)"
                        url={reviewing.documentFront || reviewing.documents?.panCard}
                      />
                      <DocumentPreviewCard
                        label="Document Back (Aadhaar / ID)"
                        url={reviewing.documentBack || reviewing.documents?.aadhar}
                      />
                      <DocumentPreviewCard
                        label="Selfie Verification Photo"
                        url={reviewing.selfie}
                      />
                      <DocumentPreviewCard
                        label="Business Registration Certificate"
                        url={reviewing.documents?.businessReg}
                      />
                      <DocumentPreviewCard
                        label="Registration Certificate"
                        url={reviewing.registrationCertificate}
                      />
                      <DocumentPreviewCard
                        label="Company PAN Card"
                        url={reviewing.companyPAN}
                      />
                      <DocumentPreviewCard
                        label="Startup India Certificate"
                        url={reviewing.startupIndiaCert}
                      />
                      <DocumentPreviewCard
                        label="Address Proof Document"
                        url={reviewing.addressProof?.docUrl}
                      />
                      <DocumentPreviewCard
                        label="Bank Proof (Cheque / Statement)"
                        url={reviewing.bankAccount?.proofUrl}
                      />
                      <DocumentPreviewCard
                        label="Income Proof Document"
                        url={reviewing.incomeProofUrl}
                      />
                    </div>
                  )}

                  {/* Audit History Timeline Section */}
                  {reviewing.history && reviewing.history.length > 0 && (
                    <div className="pt-3 border-t border-[#F5B942]/10 space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Audit Timeline History
                      </h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {reviewing.history.map((h, idx) => (
                          <div key={idx} className="p-2 bg-dark-bg/60 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-bold text-[#F5B942] uppercase">{h.action}</span>
                            <span className="text-gray-400">{h.reason ? `Reason: ${h.reason}` : h.notes || "Recorded"}</span>
                            <span className="text-[10px] text-gray-500">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Notes Textarea */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-gray-400 block mb-1">Admin Review Notes</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={2}
                      placeholder="Optional compliance review notes..."
                      className="w-full px-3 py-2 bg-dark-bg/60 border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-[#F5B942]/10">
                    <button
                      onClick={() => {
                        setRejecting(reviewing);
                        setReviewing(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-sm"
                    >
                      Reject Submission
                    </button>
                    <button
                      disabled={!hasFiles}
                      onClick={() => {
                        setApproving(reviewing);
                        setReviewing(null);
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        hasFiles
                          ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 cursor-pointer"
                          : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {hasFiles ? "Approve Verification" : "Approval Disabled (No Files)"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      {approving && (
        <ApproveConfirmModal
          item={approving}
          onClose={() => setApproving(null)}
          onConfirm={() => {
            approveItem(approving, reviewNotes);
            setApproving(null);
            setReviewNotes("");
          }}
        />
      )}

      {/* Reject Confirmation Modal */}
      {rejecting && (
        <RejectConfirmModal
          item={rejecting}
          onClose={() => setRejecting(null)}
          onConfirm={(reason, notes) => {
            rejectItem(rejecting, reason, notes);
            setRejecting(null);
          }}
        />
      )}
    </DashboardShell>
  );
}

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-card-bg/60 border border-[#1B5E3F]/12 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400">{label}</p>
        <p className="text-2xl font-black text-white mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl bg-dark-bg/60 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function DocumentPreviewCard({ label, url }) {
  if (!url) return null;
  const isImage =
    /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url) || url.startsWith("data:image");

  return (
    <div className="bg-dark-bg/80 border border-[#F5B942]/20 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#F5B942] uppercase truncate">{label}</span>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 flex-shrink-0"
          >
            Open <HiExternalLink />
          </a>
          <a
            href={url}
            download={`${label.replace(/\s+/g, "_")}.png`}
            className="text-[11px] font-bold text-[#F5B942] hover:underline inline-flex items-center gap-1 flex-shrink-0"
          >
            <HiDownload /> Download
          </a>
        </div>
      </div>
      {isImage ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative group overflow-hidden rounded-lg aspect-video bg-black/60 border border-[#F5B942]/10"
        >
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
            Click to View Fullscreen
          </div>
        </a>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-dark-bg border border-[#F5B942]/15 rounded-lg text-xs font-semibold text-gray-200 hover:border-[#F5B942] transition-colors flex items-center justify-between"
        >
          <span>View File (PDF/Doc)</span>
          <HiExternalLink className="text-[#F5B942]" />
        </a>
      )}
    </div>
  );
}

function ApproveConfirmModal({ item, onClose, onConfirm }) {
  const user = item?.userId || item?.founderId || item?.investorId || item;
  return (
    <Modal open={!!item} onClose={onClose} title="Confirm KYC Approval">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Are you sure you want to approve identity verification for <strong className="text-white">{user?.name}</strong>?
        </p>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
          <p className="font-bold">This action will:</p>
          <p>• Upgrade account to Level 2 Verification</p>
          <p>• Grant Blue Verified Badge on profile & search results</p>
          <p>• Trigger in-app & email approval notifications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm"
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RejectConfirmModal({ item, onClose, onConfirm }) {
  const [presetReason, setPresetReason] = useState("Image blurry");
  const [customNotes, setCustomNotes] = useState("");

  const presetOptions = [
    "Image blurry",
    "Document expired",
    "Face mismatch",
    "Wrong ID / PAN mismatch",
    "Illegible text",
    "Other",
  ];

  return (
    <Modal open={!!item} onClose={onClose} title="Reject Identity Verification">
      <div className="space-y-4 text-sm text-gray-300">
        <p>Select a mandatory rejection reason for the user:</p>

        {/* Preset Reason Selector */}
        <div className="grid grid-cols-2 gap-2">
          {presetOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setPresetReason(opt)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                presetReason === opt
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-dark-bg/60 border-gold/15 hover:border-gold/40 text-gray-400"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 block mb-1">Additional Compliance Notes (Optional)</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={2}
            placeholder="Specific instructions for the user (e.g. Please upload high-res photo in daylight)..."
            className="w-full px-4 py-2.5 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm text-white"
          >
            Cancel
          </button>
          <button
            disabled={!presetReason}
            onClick={() => onConfirm(presetReason, customNotes)}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </Modal>
  );
}
