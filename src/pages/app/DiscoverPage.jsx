import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiSearch, HiAdjustments, HiTrendingUp } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import PitchCard from "../../components/dashboard/PitchCard";
import { videoService } from "../../services/videoService";
import { MOCK_PITCHES } from "../../constants/mockData";
import { INDUSTRIES, FUNDING_STAGES } from "../../constants/options";

const TABS = [
  { value: "trending", label: "Trending", icon: HiTrendingUp },
  { value: "all", label: "All Pitches" },
  { value: "new", label: "New" },
];

export default function DiscoverPage() {
  const [tab, setTab] = useState("trending");
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [pitches, setPitches] = useState(MOCK_PITCHES);

  // Fetch real pitches — search/filter
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (industry) params.industry = industry;
    if (stage) params.stage = stage;
    if (tab === "trending") params.sort = "trending";
    else if (tab === "new") params.sort = "newest";

    videoService
      .search(params)
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data || [];
        if (videos.length > 0) setPitches(videos);
      })
      .catch(() => {});
  }, [query, industry, stage, tab]);

  const filtered = pitches.filter((p) => {
    if (
      query &&
      !`${p.title} ${p.description} ${p.founderId?.companyName || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    if (industry && p.industry !== industry) return false;
    if (stage && p.fundingStage !== stage) return false;
    return true;
  });

  return (
    <DashboardShell
      title="Discover"
      subtitle="Find pitches that match your thesis."
    >
      {/* Search + filters */}
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 mb-6">
        <div className="relative mb-3">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, founder, company…"
            className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="px-3 py-2 bg-dark-bg/60 border border-gold/20 rounded-lg text-sm focus:border-gold focus:outline-none"
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-3 py-2 bg-dark-bg/60 border border-gold/20 rounded-lg text-sm focus:border-gold focus:outline-none"
          >
            <option value="">All stages</option>
            {FUNDING_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {(industry || stage || query) && (
            <button
              onClick={() => {
                setQuery("");
                setIndustry("");
                setStage("");
              }}
              className="text-sm text-gold hover:text-bright-gold font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              tab === t.value
                ? "bg-gold text-dark-navy"
                : "bg-card-bg/60 text-gray-300 border border-gold/15 hover:border-gold/40"
            }`}
          >
            {t.icon && <t.icon className="w-4 h-4" />}
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiAdjustments className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No pitches match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <PitchCard key={p._id} pitch={p} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
