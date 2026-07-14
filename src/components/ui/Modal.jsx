import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth,
  size,
  hideClose = false,
}) {
  const widthClass = maxWidth || SIZE_MAP[size] || "max-w-lg";
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
            data-light-app="true"
            className={`w-full ${widthClass} bg-white border border-[#1B5E3F]/15 rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#0F4A2E]/30 overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between p-5 border-b border-[#1B5E3F]/10 flex-shrink-0">
                {title && (
                  <h2 className="text-lg font-bold text-[#0A1F14]">{title}</h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 -mr-2 hover:bg-[#FAFAF7] rounded-lg text-[#0A1F14]/55 hover:text-[#0F4A2E]"
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
