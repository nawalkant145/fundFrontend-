import { motion } from "framer-motion";
import { HiExclamationCircle } from "react-icons/hi";
import Modal from "./Modal";

export default function Confirm({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action can't be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}) {
  const accent = destructive
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      hideClose
      maxWidth="max-w-md"
    >
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
            destructive ? "bg-red-500/15" : "bg-gold/15"
          }`}
        >
          <HiExclamationCircle
            className={`w-8 h-8 ${destructive ? "text-red-400" : "text-gold"}`}
          />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-gold/20 hover:border-gold/50 font-bold text-sm"
          >
            {cancelLabel}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg ${accent}`}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
