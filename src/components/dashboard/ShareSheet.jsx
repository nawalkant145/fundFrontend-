import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiShare } from "react-icons/hi";
import {
  FaLink,
  FaWhatsapp,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
  FaEnvelope,
} from "react-icons/fa";
import { useToast } from "../ui/Toast";

/**
 * Modern Instagram-style Share Sheet
 * - Mobile:  Portal bottom-sheet that sits above the bottom nav and hides it, with drag handle & body scroll lock.
 * - Desktop: Centered modal card.
 */
export default function ShareSheet({ open, onClose, title = "Share", url }) {
  const toast = useToast();

  // Escape key listener
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Mobile body scroll lock + bottom nav hiding
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    if (open) {
      document.body.classList.add("share-sheet-open");
    } else {
      document.body.classList.remove("share-sheet-open");
    }
    return () => {
      document.body.classList.remove("share-sheet-open");
    };
  }, [open]);

  if (!open) return null;

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl);
      toast?.success ? toast.success("Link copied to clipboard") : alert("Link copied!");
    } else {
      toast?.error ? toast.error("Could not copy link") : alert("Could not copy");
    }
    onClose?.();
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator
        .share({ title, url: shareUrl })
        .then(() => onClose?.())
        .catch(() => {});
    } else {
      copyLink();
    }
  };

  const socialButtons = [
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      style:
        "bg-[#25D366]/12 text-[#1E9E4B] border-[#25D366]/35 hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "X (Twitter)",
      icon: FaTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      style:
        "bg-[#1DA1F2]/12 text-[#1176B4] border-[#1DA1F2]/35 hover:bg-[#1DA1F2] hover:text-white",
    },
    {
      label: "LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      style:
        "bg-[#0A66C2]/12 text-[#0A66C2] border-[#0A66C2]/35 hover:bg-[#0A66C2] hover:text-white",
    },
    {
      label: "Telegram",
      icon: FaTelegramPlane,
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      style:
        "bg-[#0088cc]/12 text-[#0088cc] border-[#0088cc]/35 hover:bg-[#0088cc] hover:text-white",
    },
    {
      label: "Email",
      icon: FaEnvelope,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this: ${shareUrl}`)}`,
      style:
        "bg-[#EA4335]/12 text-[#C5221F] border-[#EA4335]/35 hover:bg-[#EA4335] hover:text-white",
    },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Render sheet content
  const content = (
    <AnimatePresence>
      <motion.div
        key="share-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <motion.div
          key="share-sheet-container"
          initial={isMobile ? { y: "100%" } : { y: 20, opacity: 0, scale: 0.96 }}
          animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
          exit={isMobile ? { y: "100%" } : { y: 20, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-full bg-white shadow-2xl border border-[#1B5E3F]/10 flex flex-col",
            // Mobile: fixed bottom drawer, rounded top, max height 85vh
            "fixed bottom-0 left-0 right-0 z-[80] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 sm:p-6",
            // Desktop: centered modal box
            "md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:w-[440px] md:rounded-3xl md:max-h-none",
          ].join(" ")}
          style={{
            paddingBottom: isMobile ? "calc(1.25rem + env(safe-area-inset-bottom, 0px))" : undefined,
          }}
        >
          {/* Mobile drag handle indicator */}
          <div className="md:hidden flex justify-center pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-1 border-b border-gray-100">
            <h3 className="font-black text-base text-[#0A1F14]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close share panel"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Copy link box */}
          <div className="bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-2xl p-3 mb-4 flex items-center gap-3">
            <span className="text-xs font-mono text-[#0A1F14]/75 truncate flex-1 select-all">
              {shareUrl}
            </span>
            <button
              onClick={copyLink}
              className="px-3.5 py-1.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white-force rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <FaLink className="w-3.5 h-3.5" /> Copy
            </button>
          </div>

          {/* Social buttons grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {socialButtons.map(({ label, icon: Icon, href, style }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className={`px-3 py-3 border rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${style}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </a>
            ))}
            <button
              onClick={nativeShare}
              className="px-3 py-3 bg-[#FAFAF7] text-[#0A1F14]/80 border border-[#1B5E3F]/15 hover:bg-gray-100 hover:border-[#1B5E3F]/30 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <HiShare className="w-4 h-4 shrink-0" />
              <span>More…</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Portal to document.body on mobile so it escapes overflow/stacking context
  return isMobile ? createPortal(content, document.body) : content;
}
