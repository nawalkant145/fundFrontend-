import { motion } from "framer-motion";
import { HiExclamation } from "react-icons/hi";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto ${
            danger ? "bg-red-500/15 text-red-400" : "bg-gold/15 text-gold"
          }`}
        >
          <HiExclamation className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
        {message && (
          <p className="text-sm text-gray-300 text-center mb-6">{message}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 rounded-xl font-bold border-2 border-gold/20 hover:border-gold/50 transition-all"
          >
            {cancelLabel}
          </button>
          <motion.button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`py-3 rounded-xl font-bold shadow-lg transition-all ${
              danger
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
                : "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30"
            }`}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
