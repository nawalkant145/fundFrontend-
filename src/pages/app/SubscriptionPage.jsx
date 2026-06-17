import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiCheck,
  HiSparkles,
  HiArrowRight,
  HiLightningBolt,
  HiX,
  HiCurrencyDollar,
  HiBookmark,
} from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import {
  getSubscription,
  isPro,
  activatePro,
  cancelPro,
  getRole,
} from "../../lib/auth";
import { getPlanForRole, CURRENT_USER } from "../../constants/mockData";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const sub = getSubscription();
  const pro = isPro();

  const role = getRole() || "investor";
  const plan = getPlanForRole(role);
  const isInvestor = role === "investor";

  const handleSubscribe = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    activatePro();
    setSubmitting(false);
    toast?.success(
      isInvestor
        ? "Unlimited chats and calls unlocked 🎉"
        : "Pitch boosts and analytics unlocked 🎉",
    );
    navigate("/app");
  };

  const handleCancel = () => {
    cancelPro();
    toast?.info("Subscription cancelled — perks end at next billing cycle.");
  };

  return (
    <DashboardShell title="Subscription" subtitle={`${plan.name} for ${role}s`}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#0F4A2E] via-[#1B5E3F] to-[#0F4A2E] text-white rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#F5B942]/20 rounded-full blur-[120px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-3 backdrop-blur">
              {isInvestor ? (
                <HiCurrencyDollar className="w-4 h-4 text-[#F5B942]" />
              ) : (
                <IoRocketSharp className="w-4 h-4 text-[#F5B942]" />
              )}
              <span className="text-xs font-bold tracking-wider uppercase">
                {pro ? `You're on ${plan.name}` : `Plans for ${role}s`}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              {pro
                ? isInvestor
                  ? "Unlimited chats. Unlimited calls."
                  : "Boosted reach. Deeper analytics."
                : plan.tagline}
            </h2>
            {pro && sub.expiresAt && (
              <p className="text-sm text-white/75 mt-2">
                Renews on{" "}
                <span className="font-bold text-[#F5B942]">
                  {new Date(sub.expiresAt).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
          {pro && (
            <button
              onClick={handleCancel}
              className="self-start px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/15 text-sm font-bold rounded-full transition-all"
            >
              Cancel Pro
            </button>
          )}
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-[#1B5E3F]/12 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A1F14]/55 mb-2">
            FREE
          </p>
          <p className="text-4xl font-black text-[#0A1F14]">₹0</p>
          <p className="text-sm text-[#0A1F14]/60 mb-5">forever</p>
          <ul className="space-y-2 mb-6 flex-1">
            {plan.features.map((f) => (
              <li
                key={f.label}
                className="flex items-start gap-2 text-sm text-[#0A1F14]/85"
              >
                {f.free === false ? (
                  <HiX className="w-4 h-4 text-[#0A1F14]/35 flex-shrink-0 mt-0.5" />
                ) : (
                  <HiCheck className="w-4 h-4 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                )}
                <span>
                  {f.label}
                  {typeof f.free === "string" && (
                    <span className="text-[#0A1F14]/55 font-semibold">
                      {" "}
                      — {f.free}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {!pro ? (
            <button
              disabled
              className="w-full py-3 rounded-full font-bold text-sm border border-[#1B5E3F]/15 text-[#0A1F14]/55 bg-[#FAFAF7]"
            >
              Current plan
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-full font-bold text-sm border border-[#1B5E3F]/15 text-[#0F4A2E] bg-white hover:bg-[#FAFAF7] transition-all"
            >
              Downgrade to Free
            </button>
          )}
        </motion.div>

        {/* Pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-[#1B5E3F]/25 overflow-hidden flex flex-col"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F5B942]/20 rounded-full blur-[80px]" />
          <span className="relative inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F5B942] mb-2">
            <HiSparkles className="w-3.5 h-3.5" /> {plan.name} · Most Popular
          </span>
          <p className="relative text-4xl font-black">
            ₹{plan.price}
            <span className="text-base font-bold text-white/65">
              /{plan.cycle}
            </span>
          </p>
          <p className="relative text-sm text-white/65 mb-5">
            Cancel anytime. No hidden fees.
          </p>
          <ul className="relative space-y-2 mb-6 flex-1">
            {plan.features.map((f) => (
              <li
                key={f.label}
                className="flex items-start gap-2 text-sm text-white/85"
              >
                <HiCheck className="w-4 h-4 text-[#F5B942] flex-shrink-0 mt-0.5" />
                <span>
                  {f.label}
                  {typeof f.pro === "string" && (
                    <span className="text-[#F5B942] font-semibold">
                      {" "}
                      — {f.pro}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {pro ? (
            <div className="relative w-full py-3 rounded-full font-bold text-sm bg-[#F5B942] text-[#0F4A2E] text-center">
              Active
            </div>
          ) : (
            <motion.button
              whileHover={!submitting ? { y: -2 } : {}}
              whileTap={!submitting ? { scale: 0.97 } : {}}
              disabled={submitting}
              onClick={handleSubscribe}
              className={`relative w-full py-3 rounded-full font-bold text-sm bg-[#F5B942] hover:bg-[#FFD166] text-[#0F4A2E] shadow-lg shadow-[#F5B942]/30 inline-flex items-center justify-center gap-2 transition-all ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                "Processing…"
              ) : (
                <>
                  Subscribe to {plan.name}
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-[#1B5E3F]/12 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-[#FAFAF7] border-b border-[#1B5E3F]/10">
          <div className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#0A1F14]/65">
            Compare features
          </div>
          <div className="p-4 sm:p-5 text-center text-xs font-bold uppercase tracking-wider text-[#0A1F14]/65">
            Free
          </div>
          <div className="p-4 sm:p-5 text-center text-xs font-bold uppercase tracking-wider text-[#1B5E3F] flex items-center justify-center gap-1.5">
            <HiSparkles className="w-3.5 h-3.5 text-[#F5B942]" /> {plan.name}
          </div>
        </div>

        {plan.features.map((f, i) => (
          <div
            key={f.label}
            className={`grid grid-cols-[1.4fr_1fr_1fr] items-center ${
              i % 2 === 1 ? "bg-[#FAFAF7]/50" : ""
            }`}
          >
            <div className="p-4 sm:p-5 text-sm font-semibold text-[#0A1F14]">
              {f.label}
            </div>
            <FeatureCell value={f.free} />
            <FeatureCell value={f.pro} pro />
          </div>
        ))}
      </div>

      {/* Boost callout — founders only */}
      {!isInvestor && (
        <div className="mt-8 bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD] border border-[#F5B942]/40 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#F5B942] flex items-center justify-center shadow-md shadow-[#F5B942]/40 flex-shrink-0">
            <HiLightningBolt className="w-7 h-7 text-[#0F4A2E]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-[#0F4A2E]">
              Want to skip the queue?
            </h3>
            <p className="text-sm text-[#0A1F14]/75">
              Boost a single pitch from ₹499. Goes to the top of matching
              investors' feeds — instantly.
            </p>
          </div>
          <button
            onClick={() => navigate("/app/studio")}
            className="px-6 py-3 rounded-full bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold shadow-md shadow-[#1B5E3F]/25 inline-flex items-center gap-2"
          >
            Boost a pitch
            <HiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Saved hint — investors only */}
      {isInvestor && (
        <div className="mt-8 bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD] border border-[#F5B942]/40 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#F5B942] flex items-center justify-center shadow-md shadow-[#F5B942]/40 flex-shrink-0">
            <HiBookmark className="w-7 h-7 text-[#0F4A2E]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-[#0F4A2E]">
              Save now, decide later
            </h3>
            <p className="text-sm text-[#0A1F14]/75">
              Bookmark pitches and posts you want to revisit. Pro unlocks
              unlimited chats so you can move fast when you're ready.
            </p>
          </div>
          <button
            onClick={() => navigate("/app/saved")}
            className="px-6 py-3 rounded-full bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold shadow-md shadow-[#1B5E3F]/25 inline-flex items-center gap-2"
          >
            Open Saved
            <HiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </DashboardShell>
  );
}

function FeatureCell({ value, pro }) {
  if (value === true) {
    return (
      <div className="p-4 sm:p-5 text-center">
        <HiCheck
          className={`w-5 h-5 mx-auto ${pro ? "text-[#1B5E3F]" : "text-[#1B5E3F]"}`}
        />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="p-4 sm:p-5 text-center">
        <HiX className="w-5 h-5 mx-auto text-[#0A1F14]/35" />
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-5 text-center">
      <span
        className={`text-xs font-bold ${pro ? "text-[#1B5E3F]" : "text-[#0A1F14]/65"}`}
      >
        {value}
      </span>
    </div>
  );
}
