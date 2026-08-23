import {
  HiCheckCircle,
  HiClock,
  HiLockClosed,
  HiExclamationCircle,
  HiChevronRight,
} from "react-icons/hi";

export default function ProfileCompletionItem({ section, onAction }) {
  const { title, description, weight, isCompleted, status, rejectionReason } = section;

  const renderBadgeAndButton = () => {
    if (isCompleted || status === "completed" || status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
          <HiCheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" /> Done (+{weight}%)
        </span>
      );
    }

    if (status === "pending") {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
            <HiClock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" /> Under Review
          </span>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <button
          onClick={() => onAction(section)}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white-force rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs shrink-0"
        >
          Fix & Resubmit (+{weight}%) <HiChevronRight className="shrink-0" />
        </button>
      );
    }

    if (status === "locked") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
          <HiLockClosed className="w-3.5 h-3.5 shrink-0" /> Locked
        </span>
      );
    }

    return (
      <button
        onClick={() => onAction(section)}
        className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white-force rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-xs shrink-0"
      >
        Complete (+{weight}%) <HiChevronRight className="shrink-0" />
      </button>
    );
  };

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all max-w-full overflow-hidden ${
        isCompleted
          ? "bg-emerald-50/30 border-emerald-100"
          : status === "rejected"
          ? "bg-red-50/30 border-red-200"
          : "bg-white border-[#E5E7EB] hover:border-[#166534]/30 shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-snug break-words">
              {title}
            </h4>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#166534] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
              +{weight}%
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-normal text-[#64748B] leading-relaxed break-words">
            {description}
          </p>

          {rejectionReason && (
            <p className="text-xs text-red-600 font-normal mt-1 flex items-center gap-1 break-words">
              <HiExclamationCircle className="flex-shrink-0 text-red-500" /> {rejectionReason}
            </p>
          )}
        </div>

        <div className="self-start sm:self-center shrink-0 mt-1 sm:mt-0">
          {renderBadgeAndButton()}
        </div>
      </div>
    </div>
  );
}
