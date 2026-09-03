import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCurrencyDollar as IconCurrency,
  HiTrendingUp as IconUp,
  HiTrendingDown as IconDown,
  HiArrowRight as IconArrow,
  HiShieldCheck as IconShield,
  HiRefresh as IconRefresh,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { fundingService } from "../../services/fundingService";

export default function FundingImpactCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchImpact = () => {
    setLoading(true);
    setError(false);
    fundingService
      .getImpact()
      .then((res) => {
        const payload = res?.data?.data || res?.data;
        setData(payload);
      })
      .catch((err) => {
        console.error("Failed to load funding impact", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-emerald-100 rounded w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-28 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-sm text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          !
        </div>
        <p className="text-sm font-semibold text-gray-700">Unable to load funding impact.</p>
        <button
          onClick={fetchImpact}
          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B5E3F]/10 hover:bg-[#1B5E3F]/20 text-[#0F4A2E] text-xs font-bold rounded-lg transition-colors"
        >
          <IconRefresh className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const current = data?.currentMonth;
  const growth = data?.monthOverMonthGrowth ?? 0;
  const totalCr = data?.totalFundingCr ?? 0;
  const startupsFunded = current?.startupsFunded ?? 0;
  const trend = data?.trend || [];
  const lastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const hasNoData = !current && trend.length === 0;

                         
  const maxFunding = trend.reduce((m, p) => Math.max(m, p.fundingAmountCr || 0), 10);
  const chartHeight = 90;
  const chartWidth = 280;
  const paddingX = 20;
  const paddingY = 15;

  const points = trend.map((p, idx) => {
    const x =
      trend.length > 1
        ? paddingX + (idx / (trend.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      ((p.fundingAmountCr || 0) / (maxFunding * 1.15)) * (chartHeight - paddingY * 2);
    return { ...p, x, y };
  });

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
          ""
        )
      : "";

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - 5} L ${points[0].x} ${chartHeight - 5} Z`
      : "";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {            }
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0">
            <IconCurrency className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#0F172A] leading-tight">
              Expglo Funding Impact
            </h3>
            <p className="text-[11px] text-[#64748B] font-medium">Verified Startup Capital</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
          <MdVerified className="w-3 h-3 text-emerald-600" />
          Verified by ExpGlo
        </span>
      </div>

      {hasNoData ? (
        <div className="py-8 text-center text-xs text-[#64748B] font-medium">
          <p className="font-semibold text-[#334155]">No funding data available yet.</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Data will update automatically as investments are recorded.
          </p>
        </div>
      ) : (
        <>
          {                    }
          <div className="grid grid-cols-2 gap-2.5 my-4">
            {                }
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                This Month
              </p>
              <p className="text-lg font-black text-[#10B981] mt-0.5">
                ₹{current ? current.fundingAmountCr : 0} Cr
              </p>
              <p className="text-[10px] text-[#64748B] font-medium">Funded this month</p>
            </div>

            {                   }
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                vs Last Month
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {growth >= 0 ? (
                  <IconUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <IconDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-lg font-black ${
                    growth >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {growth >= 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`}
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-medium">MoM Growth</p>
            </div>

            {                     }
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Startups Funded
              </p>
              <p className="text-lg font-black text-[#0F172A] mt-0.5">
                {startupsFunded}
              </p>
              <p className="text-[10px] text-[#64748B] font-medium">This Month</p>
            </div>

            {                   }
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Total Funding
              </p>
              <p className="text-lg font-black text-[#F59E0B] mt-0.5">
                ₹{totalCr} Cr
              </p>
              <p className="text-[10px] text-[#64748B] font-medium">All Time</p>
            </div>
          </div>

          {                                 }
          {trend.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Monthly Funding Trend (₹ Cr)
                </span>
                {hoveredPoint && (
                  <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                    {hoveredPoint.monthName} {hoveredPoint.year}: ₹
                    {hoveredPoint.fundingAmountCr} Cr
                  </span>
                )}
              </div>

              <div className="w-full relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-24 overflow-visible"
                >
                  <defs>
                    <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {                           }
                  <line
                    x1={paddingX}
                    y1={paddingY}
                    x2={chartWidth - paddingX}
                    y2={paddingY}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={paddingX}
                    y1={chartHeight / 2}
                    x2={chartWidth - paddingX}
                    y2={chartHeight / 2}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />

                  {               }
                  {areaD && <path d={areaD} fill="url(#impactGradient)" />}

                  {          }
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {                 }
                  {points.map((pt, i) => (
                    <g key={pt._id || i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint?._id === pt._id ? "5" : "3.5"}
                        fill={hoveredPoint?._id === pt._id ? "#F59E0B" : "#10B981"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {                         }
                <div className="flex justify-between px-2 mt-1 text-[10px] font-semibold text-[#64748B]">
                  {points.map((pt, i) => (
                    <span
                      key={pt._id || i}
                      className="truncate max-w-[40px] text-center"
                    >
                      {pt.monthName ? pt.monthName.slice(0, 3) : `M${pt.month}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {            }
      <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
        <span>
          {lastUpdated ? `Last updated: ${lastUpdated}` : "Updated regularly"}
        </span>
        <button
          onClick={() => {
            fetchImpact();
          }}
          className="font-bold text-[#10B981] hover:text-[#059669] inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          View details <IconArrow className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
