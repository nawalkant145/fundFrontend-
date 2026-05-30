import { motion } from "framer-motion";
import { HiClipboardList } from "react-icons/hi";
import DashboardShell from "../../components/dashboard/DashboardShell";

const MOCK_AUDIT = [
  {
    _id: "a1",
    actor: "Admin Aarav",
    action: "BAN_USER",
    target: "Karan Mehta",
    metadata: "spam reports >5",
    time: "2 min ago",
  },
  {
    _id: "a2",
    actor: "Admin Aarav",
    action: "APPROVE_KYC",
    target: "Aisha Kamara",
    metadata: "PAN+Aadhar verified",
    time: "1 hr ago",
  },
  {
    _id: "a3",
    actor: "Admin Aarav",
    action: "REJECT_VIDEO",
    target: "Test pitch by Karan",
    metadata: "duplicate content",
    time: "3 hr ago",
  },
  {
    _id: "a4",
    actor: "Admin Aarav",
    action: "BOOST_VIDEO",
    target: "GreenChain pitch",
    metadata: "7 days",
    time: "Yesterday",
  },
  {
    _id: "a5",
    actor: "Admin Aarav",
    action: "REFUND_INVESTMENT",
    target: "Deal d_999",
    metadata: "fraud",
    time: "2 days ago",
  },
];

const actionColor = {
  BAN_USER: "bg-red-500/15 text-red-400",
  UNBAN_USER: "bg-emerald-500/15 text-emerald-400",
  APPROVE_KYC: "bg-emerald-500/15 text-emerald-400",
  REJECT_KYC: "bg-red-500/15 text-red-400",
  APPROVE_VIDEO: "bg-emerald-500/15 text-emerald-400",
  REJECT_VIDEO: "bg-red-500/15 text-red-400",
  BOOST_VIDEO: "bg-gold/15 text-gold",
  REFUND_INVESTMENT: "bg-yellow-500/15 text-yellow-400",
  default: "bg-gray-500/15 text-gray-400",
};

export default function AdminAuditPage() {
  return (
    <DashboardShell
      mode="admin"
      title="Audit log"
      subtitle="Every admin action is recorded here."
    >
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl divide-y divide-gold/10">
        {MOCK_AUDIT.map((a) => (
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
                <p className="font-bold text-sm">{a.target}</p>
              </div>
              <p className="text-xs text-gray-400">
                <span className="text-gray-300">{a.actor}</span> · {a.metadata}
              </p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {a.time}
            </span>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
