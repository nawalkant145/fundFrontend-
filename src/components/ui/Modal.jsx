import { useEffect } from "react";
import ReactDOM from "react-dom";
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
  noPadding = false,
  bodyClassName = "",
}) {
  const widthClass = maxWidth || SIZE_MAP[size] || "max-w-lg";
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-none"
        >
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            data-light-app="true"
            className={`w-full ${widthClass} bg-white border border-[#1B5E3F]/15 rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#0F4A2E]/30 overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]`}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1B5E3F]/10 flex-shrink-0">
                {title ? (
                  <h2 className="text-base sm:text-lg font-bold text-[#0A1F14] truncate pr-2">{title}</h2>
                ) : (
                  <div />
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 -mr-1 hover:bg-[#FAFAF7] rounded-lg text-[#0A1F14]/55 hover:text-[#0F4A2E] transition-colors"
                    aria-label="Close modal"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className={`overflow-y-auto overscroll-contain flex-1 ${noPadding ? "" : "p-4 sm:p-5"} ${bodyClassName}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
