import { useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiDocumentText, HiUserCircle } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const SEED = [
  {
    _id: "r1",
    investor: {
      name: "Vikram Patel",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      isVerified: true,
      bio: "Backing early-stage HealthTech and Climate founders.",
      portfolio: ["NovaMed AI", "GreenChain"],
    },
    message:
      "Loved your pitch — would love to dive into the financials. Sending an NDA along.",
    createdAt: "2 hr ago",
    status: "pending",
  },
  {
    _id: "r2",
    investor: {
      name: "Meera Kapoor",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      isVerified: true,
      bio: "Family office, ₹2-50Cr cheque size.",
      portfolio: ["EduForge"],
    },
    message: "Could you share more about the unit economics?",
    createdAt: "Yesterday",
    status: "approved",
  },
  {
    _id: "r3",
    investor: {
      name: "Karan Mehta",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      isVerified: false,
      bio: "Independent investor.",
      portfolio: [],
    },
    message: "Interested in learning more.",
    createdAt: "3 days ago",
    status: "denied",
  },
];

const pillCls = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  denied: "bg-red-500/15 text-red-400",
};

export default function DeckRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState(SEED);
  const [viewing, setViewing] = useState(null);

  const respond = (id, status) => {
    setRequests((r) => r.map((x) => (x._id === id ? { ...x, status } : x)));
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
      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No pending requests.
          </p>
        ) : (
          requests.map((r) => (
            <motion.div
              key={r._id}
              className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <img
                  src={r.investor.avatar}
                  alt={r.investor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold/30 cursor-pointer"
                  onClick={() => setViewing(r)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <button
                      onClick={() => setViewing(r)}
                      className="font-bold hover:text-gold transition-colors"
                    >
                      {r.investor.name}
                    </button>
                    {r.investor.isVerified && (
                      <MdVerified className="w-4 h-4 text-gold" />
                    )}
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${pillCls[r.status]}`}
                    >
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {r.createdAt}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">"{r.message}"</p>
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
          ))
        )}
      </div>

      {/* Investor profile modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Investor profile"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={viewing.investor.avatar}
                alt={viewing.investor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold/40"
              />
              <div>
                <p className="font-bold flex items-center gap-1 text-lg">
                  {viewing.investor.name}
                  {viewing.investor.isVerified && (
                    <MdVerified className="w-5 h-5 text-gold" />
                  )}
                </p>
                <p className="text-xs text-gray-400">Investor</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">{viewing.investor.bio}</p>
            {viewing.investor.portfolio.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                  Portfolio
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewing.investor.portfolio.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 bg-dark-bg/60 border border-gold/20 text-xs font-semibold rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
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
