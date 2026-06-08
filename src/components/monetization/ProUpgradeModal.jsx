import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiSparkles,
  HiCheck,
  HiArrowRight,
  HiLightningBolt,
} from "react-icons/hi";
import Modal from "../ui/Modal";
import { getPlanForRole } from "../../constants/mockData";
import { getRole } from "../../lib/auth";

/**
 * Modal that pops up when a free user tries to do something Pro-gated.
 * Plan auto-resolves from the current user's role.
 */
export default function ProUpgradeModal({
  open,
  onClose,
  reason = "free-quota-reached",
}) {
  const role = getRole() || "investor";
  const plan = getPlanForRole(role);

  const copy =
    reason === "pro-required"
      ? {
          icon: HiLightningBolt,
          title: "Calls are a Pro feature",
          subtitle: `Upgrade to ${plan.name} to unlock unlimited audio and video calls.`,
        }
      : {
          icon: HiSparkles,
          title: "You've used your free chat for this month",
          subtitle: `Upgrade to ${plan.name} for unlimited conversations and calls.`,
        };

  const Icon = copy.icon;

  // Pull short bullets — strings only or labels of true features
  const bullets = plan.features
    .map((f) =>
      typeof f.pro === "string"
        ? `${f.label} — ${f.pro}`
        : f.pro === true
          ? f.label
          : null,
    )
    .filter(Boolean)
    .slice(0, 5);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg" hideClose>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5B942] to-[#FFD166] shadow-lg shadow-[#F5B942]/30 mb-4"
        >
          <Icon className="w-8 h-8 text-[#0F4A2E]" />
        </motion.div>

        <h2 className="text-2xl font-black mb-2 text-[#0A1F14]">
          {copy.title}
        </h2>
        <p className="text-sm text-[#0A1F14]/65 mb-6 max-w-sm mx-auto">
          {copy.subtitle}
        </p>

        <div className="bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] rounded-2xl p-5 text-left text-white mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F5B942]">
                {plan.name}
              </p>
              <p className="text-3xl font-black">
                ₹{plan.price}
                <span className="text-sm font-bold text-white/70">
                  /{plan.cycle}
                </span>
              </p>
            </div>
            <HiSparkles className="w-9 h-9 text-[#F5B942]" />
          </div>
          <ul className="space-y-1.5 text-sm">
            {bullets.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <HiCheck className="w-4 h-4 text-[#F5B942] flex-shrink-0 mt-0.5" />
                <span className="text-white/85">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 rounded-full font-bold border border-[#1B5E3F]/15 text-[#0F4A2E] bg-white hover:bg-[#FAFAF7] transition-all"
          >
            Maybe later
          </button>
          <Link to="/app/subscription">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 rounded-full font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/25 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              Upgrade
              <HiArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
