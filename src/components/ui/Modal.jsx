import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} bg-card-bg border-2 border-gold/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between p-5 border-b border-gold/10 flex-shrink-0">
                {title && <h2 className="text-lg font-bold">{title}</h2>}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 -mr-2 hover:bg-dark-bg/60 rounded-lg text-gray-400 hover:text-white"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-5 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
