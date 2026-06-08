import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiXCircle,
  HiX,
} from "react-icons/hi";

const ToastContext = createContext(null);

const ICONS = {
  success: {
    icon: HiCheckCircle,
    cls: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  },
  error: {
    icon: HiXCircle,
    cls: "text-red-400 bg-red-500/15 border-red-500/30",
  },
  info: {
    icon: HiInformationCircle,
    cls: "text-secondary-green bg-secondary-green/15 border-secondary-green/30",
  },
  warn: {
    icon: HiExclamationCircle,
    cls: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const api = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
    warn: (m) => push("warn", m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = ICONS[t.type] || ICONS.info;
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                className={`pointer-events-auto flex items-start gap-3 max-w-sm px-4 py-3 rounded-xl border-2 backdrop-blur-md bg-card-bg/90 ${meta.cls}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white flex-1">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider
    return { success: alert, error: alert, info: alert, warn: alert };
  }
  return ctx;
}
