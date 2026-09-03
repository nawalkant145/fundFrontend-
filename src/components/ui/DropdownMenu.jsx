import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiDotsVertical } from "react-icons/hi";

                                                                                                                                                                                                                                                                                                                                                                                                                                                       
export default function DropdownMenu({
  items = [],
  trigger,
  align = "right",
  placement = "auto",
  triggerClass = "",
}) {
  const [open, setOpen] = useState(false);
  const [actualPlacement, setActualPlacement] = useState("bottom");
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

                                            
  useEffect(() => {
    if (!open) return;
    if (placement === "top" || placement === "bottom") {
      setActualPlacement(placement);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
                                                       
    const estHeight = Math.min(items.length * 44 + 16, 320);
    if (spaceBelow < estHeight && spaceAbove > spaceBelow) {
      setActualPlacement("top");
    } else {
      setActualPlacement("bottom");
    }
  }, [open, placement, items.length]);

  const positionClass =
    actualPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={
          triggerClass ||
          "p-2 rounded-lg hover:bg-[#FAFAF7] text-[#0A1F14]/60 hover:text-[#0F4A2E] transition-colors"
        }
      >
        {trigger || <HiDotsVertical className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: actualPlacement === "top" ? 8 : -8,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: actualPlacement === "top" ? 8 : -8,
              scale: 0.96,
            }}
            transition={{ duration: 0.15 }}
            data-dropdown-menu="true"
            className={`absolute z-[60] min-w-[200px] bg-white border border-[#1B5E3F]/15 rounded-xl shadow-2xl shadow-[#0F4A2E]/15 overflow-hidden ${positionClass} ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="h-px bg-[#1B5E3F]/10 my-1" />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    item.onClick?.();
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-colors disabled:opacity-50 ${
                    item.danger
                      ? "text-red-500 hover:bg-red-50 danger-item"
                      : "text-[#0A1F14]/85 hover:bg-[#FAFAF7] hover:text-[#0F4A2E]"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        item.danger ? "text-red-500" : "text-[#0A1F14]/55"
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
