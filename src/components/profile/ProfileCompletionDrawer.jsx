import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiShieldCheck,
  HiClock,
  HiArrowRight,
  HiCheckCircle,
  HiSparkles,
} from "react-icons/hi";

import ProfileCompletionItem from "./ProfileCompletionItem";
import { useCompletionRouter } from "./CompletionModalRouter";
import useProfileCompletion from "../../hooks/useProfileCompletion";

export default function ProfileCompletionDrawer({
  open,
  onClose,
  user,
  onOpenEditProfile,
}) {
  const {
    completion,
    profileStrength,
    completedSections,
    missingSections,
    estimatedTime,
    nextRecommendedSection,
    loading,
  } = useProfileCompletion();

  const { handleRouteAction } = useCompletionRouter({ onOpenEditProfile });

  if (!open) return null;

  const handleAction = (section) => {
    onClose();
    handleRouteAction(section);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Panel: Desktop Right Drawer / Mobile Bottom Sheet */}
        <div className="fixed inset-y-0 right-0 w-full max-w-full sm:max-w-md flex justify-end">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#166534] flex items-center justify-center text-white-force shadow-xs shrink-0">
                  <HiShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] truncate">
                    Complete Your Profile
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#64748B] truncate">
                    Naukri-inspired smart completion engine
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-[#64748B] transition-colors shrink-0"
              >
                <HiX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Progress Summary Card */}
              <div className="bg-[#166534] rounded-2xl p-4 sm:p-6 text-white-force shadow-md max-w-full">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1 min-w-0 truncate">
                    <HiSparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">{profileStrength}</span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-white-force shrink-0">
                    {loading || completion === null ? "..." : `${completion}%`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 sm:h-3 bg-white/20 rounded-full overflow-hidden mb-3 sm:mb-4">
                  <motion.div
                    className="h-full bg-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${loading || completion === null ? 0 : completion}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs text-emerald-100 font-normal border-t border-white/10 pt-2.5 sm:pt-3">
                  <span className="flex items-center gap-1 min-w-0">
                    <HiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                    <span className="truncate">~{estimatedTime} mins remaining</span>
                  </span>
                  <span className="shrink-0">{missingSections.length} sections to complete</span>
                </div>
              </div>

              {/* Next Action Suggestion */}
              {nextRecommendedSection && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-full">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Next Step
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-amber-900 truncate">
                      {nextRecommendedSection.title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction(nextRecommendedSection)}
                    className="w-full sm:w-auto h-9 sm:h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white-force rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-xs shrink-0"
                  >
                    <span>Complete</span> <HiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Checklist */}
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-7 h-7 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  {missingSections.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Remaining Sections ({missingSections.length})
                      </h3>
                      {missingSections.map((sec) => (
                        <ProfileCompletionItem
                          key={sec.id}
                          section={sec}
                          onAction={handleAction}
                        />
                      ))}
                    </div>
                  )}

                  {completedSections.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1">
                        <HiCheckCircle className="text-[#16A34A]" /> Completed Sections ({completedSections.length})
                      </h3>
                      {completedSections.map((sec) => (
                        <ProfileCompletionItem
                          key={sec.id}
                          section={sec}
                          onAction={handleAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Primary Action Footer */}
            {nextRecommendedSection && (
              <div className="p-3.5 sm:p-4 border-t border-[#E5E7EB] bg-slate-50 pb-[calc(1rem+env(safe-area-inset-bottom,0))]">
                <button
                  onClick={() => handleAction(nextRecommendedSection)}
                  className="w-full h-10 sm:h-11 bg-[#166534] hover:bg-[#14532d] text-white-force rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="truncate">Complete Next Section ({nextRecommendedSection.title})</span> <HiArrowRight className="shrink-0" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
