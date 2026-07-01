import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiCheck,
  HiLightningBolt,
  HiSparkles,
  HiArrowRight,
} from "react-icons/hi";
import Modal from "../ui/Modal";
import { BOOST_TIERS } from "../../constants/mockData";
import { useToast } from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { boostService } from "../../services/boostService";
import { openRazorpayCheckout } from "../../lib/razorpay";

/**
 * Modal that lets a founder buy a boost for their pitch.
 * 3 tier cards (Mini / Pro / Mega) → real Razorpay checkout.
 * In dev (no gateway keys), the backend activates the boost immediately.
 */
export default function BoostModal({ open, onClose, pitch, onBoosted }) {
  const [selected, setSelected] = useState("pro");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const tier = BOOST_TIERS.find((t) => t.id === selected);

  const handlePay = async () => {
    if (!pitch?._id) {
      toast?.error("No pitch selected to boost");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create the boost order on the server
      const res = await boostService.createOrder({
        videoId: pitch._id,
        tier: selected,
      });
      const data = res?.data?.data || {};

      // 2. Dev fallback — backend activated it without a gateway
      if (data.activated) {
        toast?.success(`${tier.name} activated for ${tier.duration}`);
        onBoosted?.(data.boost);
        onClose();
        return;
      }

      // 3. Open the real Razorpay checkout
      const payment = await openRazorpayCheckout({
        keyId: data.keyId,
        order: data.order,
        name: "EXPGLO FUND",
        description: `${tier.name} · ${pitch.title || "Pitch"}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
      });

      // 4. Verify the signature server-side, then mark active
      await boostService.verifyPayment(data.boost._id, payment);
      toast?.success(`${tier.name} activated for ${tier.duration}`);
      onBoosted?.(data.boost);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Boost payment failed";
      if (msg !== "Payment cancelled") toast?.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title="Boost this pitch"
    >
      <p className="text-sm text-[#0A1F14]/65 mb-5">
        Get your pitch in front of more investors — instantly. Boosted pitches
        appear at the top of the feed for matching-industry investors.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {BOOST_TIERS.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`relative text-left rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                active
                  ? "border-[#1B5E3F] bg-gradient-to-br from-[#FAFAF7] to-white shadow-lg shadow-[#1B5E3F]/15"
                  : "border-[#1B5E3F]/12 bg-white hover:border-[#1B5E3F]/30"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#F5B942] text-[#0F4A2E] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    t.id === "mega"
                      ? "bg-gradient-to-br from-[#F5B942] to-[#FFD166] shadow-md shadow-[#F5B942]/30"
                      : "bg-[#1B5E3F]/10"
                  }`}
                >
                  {t.id === "mega" ? (
                    <HiSparkles className="w-5 h-5 text-[#0F4A2E]" />
                  ) : (
                    <HiLightningBolt className="w-5 h-5 text-[#1B5E3F]" />
                  )}
                </span>
                {active && (
                  <span className="w-6 h-6 rounded-full bg-[#1B5E3F] flex items-center justify-center">
                    <HiCheck className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
              <p className="font-black text-base text-[#0A1F14]">{t.name}</p>
              <p className="text-2xl font-black text-[#0F4A2E] mt-1">
                ₹{t.price.toLocaleString()}
              </p>
              <p className="text-xs text-[#0A1F14]/55 font-semibold mb-3">
                {t.duration}
              </p>
              <ul className="space-y-1">
                {t.perks.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-1.5 text-xs text-[#0A1F14]/75"
                  >
                    <HiCheck className="w-3.5 h-3.5 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-xl p-4 mb-4 text-xs text-[#0A1F14]/65">
        <p className="font-bold text-[#0F4A2E] mb-1">How targeting works</p>
        Investors who selected{" "}
        <strong>{pitch?.industry || "your industry"}</strong> as a favourite see
        your pitch first. Each investor sees the boost slot once — after they
        swipe past, it returns to normal feed rotation.
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <p className="text-xs text-[#0A1F14]/55 sm:text-left text-center">
          Secure payment via Razorpay · Cancel anytime before activation
        </p>
        <motion.button
          whileHover={!submitting ? { y: -2 } : {}}
          whileTap={!submitting ? { scale: 0.98 } : {}}
          disabled={submitting}
          onClick={handlePay}
          className={`w-full sm:w-auto px-7 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/25 inline-flex items-center justify-center gap-2 transition-all ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? (
            "Processing…"
          ) : (
            <>
              Pay ₹{tier.price.toLocaleString()} & boost
              <HiArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </Modal>
  );
}
