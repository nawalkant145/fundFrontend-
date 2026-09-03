import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiDocumentText, HiUserCircle } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { deckAccessService } from "../../services/deckAccessService";

const pillCls = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  denied: "bg-red-500/15 text-red-400",
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

export default function DeckRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    deckAccessService
      .incoming()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setRequests(data?.requests || []);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const respond = (id, status) => {
    setRequests((r) => r.map((x) => (x._id === id ? { ...x, status } : x)));
    deckAccessService.respond(id, status === "approved").catch(() => {});
    toast.success(
      status === "approved"
        ? "Access approved — investor can now view your deck"
        : "Request denied",
    );
  };

  return (
    <DashboardShell
      title="Pitch deck requests"
      subtitle="Investors asking for full access to your deck."
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No pending requests.
            </p>
          ) : (
            requests.map((r) => {
              const inv = r.investorId || {};
              return (
                <motion.div
                  key={r._id}
                  className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <img
                      src={
                        inv.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.name || "U")}&background=1B5E3F&color=fff`
                      }
                      alt={inv.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gold/30 cursor-pointer"
                      onClick={() => setViewing(r)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <button
                          onClick={() => setViewing(r)}
                          className="font-bold hover:text-gold transition-colors"
                        >
                          {inv.name || "Investor"}
                        </button>
                        {inv.isVerified && (
                          <MdVerified className="w-4 h-4 text-gold" />
                        )}
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${pillCls[r.status]}`}
                        >
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {fmtTime(r.createdAt)}
                        </span>
                      </div>
                      {r.message && (
                        <p className="text-sm text-gray-300 mb-3">
                          "{r.message}"
                        </p>
                      )}
                      {r.status === "pending" && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => respond(r._id, "approved")}
                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <HiCheck /> Approve
                          </button>
                          <button
                            onClick={() => respond(r._id, "denied")}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <HiX /> Deny
                          </button>
                          <button
                            onClick={() => setViewing(r)}
                            className="px-4 py-2 border-2 border-gold/20 hover:border-gold rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            <HiUserCircle className="w-4 h-4" /> View profile
                          </button>
                        </div>
                      )}
                      {r.status === "approved" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <HiDocumentText className="w-4 h-4" />
                          Investor can now view your deck
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {                            }
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Investor profile"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  viewing.investorId?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(viewing.investorId?.name || "U")}&background=1B5E3F&color=fff`
                }
                alt={viewing.investorId?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold/40"
              />
              <div>
                <p className="font-bold flex items-center gap-1 text-lg">
                  {viewing.investorId?.name || "Investor"}
                  {viewing.investorId?.isVerified && (
                    <MdVerified className="w-5 h-5 text-gold" />
                  )}
                </p>
                <p className="text-xs text-gray-400">Investor</p>
              </div>
            </div>
            {viewing.message && (
              <p className="text-sm text-gray-300">"{viewing.message}"</p>
            )}
            {viewing.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    respond(viewing._id, "denied");
                    setViewing(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <HiX /> Deny request
                </button>
                <button
                  onClick={() => {
                    respond(viewing._id, "approved");
                    setViewing(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <HiCheck /> Approve access
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
