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
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#166534] flex items-center justify-center text-white-force shadow-xs">
                  <HiShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">Complete Your Profile</h2>
                  <p className="text-xs text-[#64748B]">Naukri-inspired smart completion engine</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-[#64748B] transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Progress Summary Card */}
              <div className="bg-[#166534] rounded-2xl p-6 text-white-force shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                    <HiSparkles className="w-4 h-4" /> {profileStrength}
                  </span>
                  <span className="text-3xl font-bold text-white-force">
                    {loading || completion === null ? "..." : `${completion}%`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${loading || completion === null ? 0 : completion}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-100 font-normal border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1">
                    <HiClock className="w-4 h-4 text-amber-300" /> ~{estimatedTime} mins remaining
                  </span>
                  <span>{missingSections.length} sections to complete</span>
                </div>
              </div>

              {/* Next Action Suggestion */}
              {nextRecommendedSection && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Next Step</span>
                    <p className="text-xs font-semibold text-amber-900">{nextRecommendedSection.title}</p>
                  </div>
                  <button
                    onClick={() => handleAction(nextRecommendedSection)}
                    className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white-force rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-xs"
                  >
                    Complete <HiArrowRight />
                  </button>
                </div>
              )}

              {/* Checklist */}
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-7 h-7 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
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
              <div className="p-4 border-t border-[#E5E7EB] bg-slate-50">
                <button
                  onClick={() => handleAction(nextRecommendedSection)}
                  className="w-full h-11 bg-[#166534] hover:bg-[#14532d] text-white-force rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  Complete Next Section ({nextRecommendedSection.title}) <HiArrowRight />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
