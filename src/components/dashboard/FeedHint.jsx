import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";

const STORAGE_KEY = "expglo:feedHintShown";

                                                                                                                                              
export default function FeedHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setShow(true);
    const timer = setTimeout(dismiss, 4000);

    const onAnyInteraction = () => dismiss();
    window.addEventListener("keydown", onAnyInteraction, { once: true });
    window.addEventListener("wheel", onAnyInteraction, { once: true });
    window.addEventListener("touchstart", onAnyInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onAnyInteraction);
      window.removeEventListener("wheel", onAnyInteraction);
      window.removeEventListener("touchstart", onAnyInteraction);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="absolute inset-0 z-30 bg-black/55 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center px-6"
          >
            <motion.div
              animate={{ y: [0, -16, 0, -16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 border-2 border-gold/40 mb-4"
            >
              <HiArrowUp className="w-8 h-8 text-gold" />
            </motion.div>
            <p className="text-white font-bold text-lg mb-2">
              Swipe up for next pitch
            </p>
            <p className="text-gray-300 text-sm mb-3">
              Use ↑ / ↓ keys, scroll, or tap the screen to pause / play
            </p>
            <motion.div
              animate={{ y: [0, 12, 0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20"
            >
              <HiArrowDown className="w-5 h-5 text-white" />
            </motion.div>
            <p className="text-xs text-gray-400 mt-4">
              Tap anywhere to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
