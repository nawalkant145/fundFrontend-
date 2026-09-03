import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { useUpload } from "../../context/UploadContext";

                                                                                                                                                                                                         
export default function UploadProgressBar() {
  const { uploadState, cancelUpload, dismissUpload } = useUpload();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!uploadState || !mounted) return null;

  const { status, progress, title, error } = uploadState;

  const statusLabel =
    status === "uploading"
      ? `Uploading… ${progress}%`
      : status === "processing"
        ? "Processing…"
        : status === "done"
          ? "Upload complete!"
          : "Upload failed";

  const statusColor =
    status === "done"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-[#F5B942]";

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="upload-progress-bar"
      >
        {                                                                           }
        <div className="hidden md:block fixed bottom-6 left-6 z-[100001] w-[290px] pointer-events-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#1B5E3F]/15 overflow-hidden">
            {                        }
            <div className="h-1.5 w-full bg-gray-100 relative">
              <motion.div
                className={`h-full ${statusColor} rounded-r-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${status === "done" || status === "error" ? 100 : progress}%`,
                }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>

            <div className="px-3.5 py-3 flex items-center gap-2.5">
              {                 }
              {status === "done" ? (
                <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : status === "error" ? (
                <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-[#1B5E3F]/30 border-t-[#1B5E3F] animate-spin" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0A1F14] truncate">
                  {title}
                </p>
                <p className="text-[10px] text-[#0A1F14]/60 font-semibold">{statusLabel}</p>
                {error && (
                  <p className="text-[10px] text-red-500 truncate">{error}</p>
                )}
              </div>

              {                           }
              <button
                onClick={status === "uploading" ? cancelUpload : dismissUpload}
                className="p-1 text-[#0A1F14]/40 hover:text-red-500 transition-colors flex-shrink-0"
                title={status === "uploading" ? "Cancel upload" : "Dismiss"}
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {                                                                   }
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-[100001] pointer-events-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#1B5E3F]/15 overflow-hidden">
            {                        }
            <div className="h-1.5 w-full bg-gray-100 relative">
              <motion.div
                className={`h-full ${statusColor} rounded-r-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${status === "done" || status === "error" ? 100 : progress}%`,
                }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>

            <div className="px-3.5 py-2.5 flex items-center gap-2.5">
              {status === "done" ? (
                <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : status === "error" ? (
                <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-[#1B5E3F]/30 border-t-[#1B5E3F] animate-spin" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0A1F14] truncate">
                  {title}
                </p>
                <p className="text-[10px] text-[#0A1F14]/60 font-semibold">{statusLabel}</p>
                {error && (
                  <p className="text-[10px] text-red-500 truncate">{error}</p>
                )}
              </div>

              <button
                onClick={status === "uploading" ? cancelUpload : dismissUpload}
                className="p-1 text-[#0A1F14]/40 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
