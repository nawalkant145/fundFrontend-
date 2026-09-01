import { useEffect, useState } from "react";
import { fundingService } from "../../services/fundingService";

/**
 * Dynamic Mobile-Optimized Funding Summary Bar with Responsive Progress Bar
 * Displays live funding metrics from backend API:
 * 💰 ₹970 Cr deployed · ↓ 80.0% MoM · 213 startups
 */
export default function FundingSummaryBar({ className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    setError(false);
    fundingService
      .getImpact()
      .then((res) => {
        const payload = res?.data?.data || res?.data;
        if (payload) {
          setData(payload);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch funding summary stats:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div
        className={`w-full max-w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-2xs animate-pulse space-y-2 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Graceful fallback
  }

  // 1. Total Amount Deployed
  const totalFundingCr = data.totalFundingCr ?? 0;
  let formattedDeployed = "";
  if (totalFundingCr >= 1000) {
    const inThousands = totalFundingCr / 1000;
    formattedDeployed = `₹${inThousands % 1 === 0 ? inThousands : inThousands.toFixed(1)}K Cr`;
  } else {
    formattedDeployed = `₹${totalFundingCr} Cr`;
  }

  // 2. Month-over-Month (MoM) Growth
  const momGrowth = data.monthOverMonthGrowth ?? 0;
  const isNegative = momGrowth < 0;
  const momValueFormatted = `${Math.abs(momGrowth).toFixed(1)}%`;

  // 3. Total Startups Funded
  const totalStartups =
    data.totalStartupsFunded ?? (data.currentMonth?.startupsFunded || 0);

  // 4. Dynamic Progress Calculation
  const targetCr = totalFundingCr >= 1000 ? Math.ceil(totalFundingCr / 1000) * 1000 : 1000;
  const rawProgress = (totalFundingCr / targetCr) * 100;
  const progressPercentage = Math.min(100, Math.max(12, Math.round(rawProgress)));

  return (
    <div
      className={`w-full max-w-full bg-white border border-[#E2E8F0] rounded-2xl px-2.5 sm:px-4 py-2.5 shadow-2xs overflow-hidden ${className}`}
    >
      {/* Top Metrics Row */}
      <div className="w-full flex items-center justify-between text-[11px] min-[360px]:text-xs sm:text-sm font-semibold text-[#0F172A] leading-tight">
        {/* 1. Deployed Amount */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs sm:text-base leading-none">💰</span>
          <span className="font-extrabold text-[#0F172A]">{formattedDeployed}</span>
          <span className="text-[#64748B] font-medium">deployed</span>
        </div>

        {/* Separator */}
        <span className="text-[#94A3B8] font-black shrink-0 px-0.5 sm:px-1">·</span>

        {/* 2. MoM Change */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <span
            className={`font-black flex items-center ${
              isNegative ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {isNegative ? "↓" : "↑"} {momValueFormatted}
          </span>
          <span className="text-[#64748B] font-medium">MoM</span>
        </div>

        {/* Separator */}
        <span className="text-[#94A3B8] font-black shrink-0 px-0.5 sm:px-1">·</span>

        {/* 3. Startups Count */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <span className="font-extrabold text-[#0F172A]">{totalStartups}</span>
          <span className="text-[#64748B] font-medium">startups</span>
        </div>
      </div>
    </div>
  );
}
