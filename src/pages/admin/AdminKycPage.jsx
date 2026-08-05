import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCheck,
  HiX,
  HiDocumentText,
  HiEye,
  HiShieldCheck,
  HiClock,
  HiExclamation,
  HiBadgeCheck,
  HiOfficeBuilding,
  HiCreditCard,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

export default function AdminKycPage() {
  const toast = useToast();
  const [activeQueueTab, setActiveQueueTab] = useState("personal");
  const [kpis, setKpis] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const fetchKpisAndQueue = (tab) => {
    setLoading(true);
    Promise.all([
      adminService.getOperationalKpis().catch(() => null),
      adminService.getPendingQueues(tab).catch(() => null),
    ])
      .then(([kpiRes, queueRes]) => {
        if (kpiRes?.data?.data) {
          setKpis(kpiRes.data.data.kpis || kpiRes.data.data);
        }
        const queueList = queueRes?.data?.data?.items || queueRes?.data?.items || queueRes?.data?.users || [];
        setItems(Array.isArray(queueList) ? queueList : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKpisAndQueue(activeQueueTab);
  }, [activeQueueTab]);

  const approveItem = (item) => {
    setItems((p) => p.filter((x) => x._id !== item._id));
    if (activeQueueTab === "founder") {
      adminService.approveCompanyKyc(item._id).catch(() => {});
      toast.success("Company KYC approved · Founder is now Level 3 Verified");
    } else if (activeQueueTab === "investor") {
      adminService.approveInvestorKyc(item._id).catch(() => {});
      toast.success("Investor Transaction KYC approved · Level 4 Unlocked");
    } else {
      adminService.approveDocuments(item._id || item.userId).catch(() => {});
      toast.success("Personal Identity approved · Level 2 Blue Badge awarded");
    }
  };

  const rejectItem = (item, reason) => {
    setItems((p) => p.filter((x) => x._id !== item._id));
    if (activeQueueTab === "founder") {
      adminService.rejectCompanyKyc(item._id, reason).catch(() => {});
    } else if (activeQueueTab === "investor") {
      adminService.rejectInvestorKyc(item._id, reason).catch(() => {});
    } else {
      adminService.rejectDocuments(item._id || item.userId, reason).catch(() => {});
    }
    toast.warn(`Verification rejected: ${reason || "Action logged"}`);
  };

  return (
    <DashboardShell
      mode="admin"
      title="KYC & Compliance Operations"
      subtitle="Multi-level verification queue management and operational KPIs"
    >
      {/* Top Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-bg/60 border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <HiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpis?.pendingPersonalKyc || 0}</p>
            <p className="text-xs text-gray-400">Pending Identity Queue</p>
          </div>
        </div>

        <div className="bg-card-bg/60 border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <HiOfficeBuilding className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpis?.pendingFounderKyc || 0}</p>
            <p className="text-xs text-gray-400">Pending Founder Queue</p>
          </div>
        </div>

        <div className="bg-card-bg/60 border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpis?.pendingInvestorKyc || 0}</p>
            <p className="text-xs text-gray-400">Pending Investor Queue</p>
          </div>
        </div>

        <div className="bg-card-bg/60 border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <HiBadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpis?.totalVerifiedUsers || 0}</p>
            <p className="text-xs text-gray-400">Total Verified Accounts</p>
          </div>
        </div>
      </div>

      {/* 5-Tab Workspace Selection */}
      <div className="flex gap-2 mb-6 border-b border-gold/15 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveQueueTab("personal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "personal"
              ? "bg-gold text-dark-bg"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiBadgeCheck className="w-4 h-4" /> Personal Identity (Level 2)
        </button>

        <button
          onClick={() => setActiveQueueTab("founder")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "founder"
              ? "bg-gold text-dark-bg"
              : "bg-dark-bg/60 text-gray-400 hover:text-white"
          }`}
        >
          <HiOfficeBuilding className="w-4 h-4" /> Founder & Company (Level 3)
        </button>

        <button
          onClick={() => setActiveQueueTab("investor")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeQueueTab === "investor"
              ? "bg-gold text-dark-bg"
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
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          Queue empty. No pending submissions in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const user = item.founderId || item.investorId || item.userId || item;
            return (
              <motion.div
                key={item._id}
                className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=1B5E3F&color=fff`
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-gold/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-white">{user.name || item.companyName}</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-gold/15 text-gold">
                        {user.role || "Level " + (user.verificationLevel || 1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {user.email}
                      {item.companyName ? ` · CIN: ${item.CIN}` : ""}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setReviewing(item)}
                        className="px-4 py-2 bg-dark-bg/60 hover:bg-dark-bg/80 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <HiEye /> Review Details
                      </button>
                      <button
                        onClick={() => approveItem(item)}
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

      {/* Review Modal */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title="Verification Details Review"
        maxWidth="max-w-xl"
      >
        {reviewing && (
          <div className="space-y-4 text-sm text-gray-300">
            <div className="p-3 bg-dark-bg/50 rounded-xl space-y-2">
              <p><strong className="text-gold">Submitted By:</strong> {reviewing.founderId?.name || reviewing.investorId?.name || reviewing.name}</p>
              {reviewing.companyName && <p><strong className="text-gold">Company:</strong> {reviewing.companyName}</p>}
              {reviewing.CIN && <p><strong className="text-gold">CIN:</strong> {reviewing.CIN}</p>}
              {reviewing.GST && <p><strong className="text-gold">GST:</strong> {reviewing.GST}</p>}
              {reviewing.bankAccount && <p><strong className="text-gold">Bank Account:</strong> {reviewing.bankAccount.accountNumber} ({reviewing.bankAccount.ifscCode})</p>}
            </div>

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
                  approveItem(reviewing);
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

      {/* Reject Modal */}
      {rejecting && (
        <RejectModal
          item={rejecting}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => rejectItem(rejecting, reason)}
        />
      )}
    </DashboardShell>
  );
}

function RejectModal({ item, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={!!item} onClose={onClose} title="Reject Verification">
      <p className="text-sm text-gray-300 mb-3">
        User will be notified to resubmit clear documents.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason for rejection (e.g. CIN mismatch, illegible document)..."
        className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm text-white"
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
          Confirm Reject
        </button>
      </div>
    </Modal>
  );
}
