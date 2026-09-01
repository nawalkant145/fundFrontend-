import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  HiSearch,
  HiAdjustments,
  HiTrendingUp,
  HiUserGroup,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import PitchCard from "../../components/dashboard/PitchCard";
import FollowButton from "../../components/monetization/FollowButton";
import { videoService } from "../../services/videoService";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { ALL_MOCK_PITCHES, generateMockUsersList } from "../../constants/mockData";
import { INDUSTRIES, FUNDING_STAGES } from "../../constants/options";

const TABS = [
  { value: "startups", label: "Recommended Startups", icon: HiUserGroup },
  { value: "trending", label: "Trending Pitches", icon: HiTrendingUp },
  { value: "all", label: "All Pitches" },
  { value: "people", label: "People", icon: HiUserGroup },
];

// Static demo people catalog (founders + investors)
const DEMO_PEOPLE = [
  {
    _id: "p_aisha",
    name: "Aisha Kamara",
    username: "aisha_builds",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    role: "founder",
    companyName: "NovaMed AI",
    industry: "HealthTech",
    bio: "Building diagnostic AI for under-resourced clinics across South Asia.",
    isVerified: true,
    isOnline: true,
    followersCount: 1240,
  },
  {
    _id: "p_rahul",
    name: "Rahul Mehta",
    username: "rahul_chains",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    role: "founder",
    companyName: "GreenChain",
    industry: "Climate",
    bio: "Tokenizing verified carbon offsets for verifiable climate action.",
    isVerified: true,
    isOnline: false,
    followersCount: 3210,
  },
  {
    _id: "p_sofia",
    name: "Sofia Chen",
    username: "sofia_edtech",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    role: "founder",
    companyName: "EduForge",
    industry: "EdTech",
    bio: "Personalized AI tutors in 8 Indian languages. 12k students.",
    isVerified: false,
    isOnline: false,
    followersCount: 540,
  },
  {
    _id: "p_vikram",
    name: "Vikram Patel",
    username: "vikram_invests",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    role: "investor",
    companyName: "Altva Capital",
    industry: "HealthTech",
    bio: "Backing early-stage founders in HealthTech, Climate, and AI.",
    isVerified: true,
    isOnline: true,
    followersCount: 4820,
  },
  {
    _id: "p_meera",
    name: "Meera Kapoor",
    username: "meera_vc",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    role: "investor",
    companyName: "Surge Ventures",
    industry: "FinTech",
    bio: "Partner at Surge Ventures. Writing cheques for bold ideas.",
    isVerified: true,
    isOnline: false,
    followersCount: 2901,
  },
  {
    _id: "p_omar",
    name: "Omar Farooq",
    username: "omar_supply",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    role: "founder",
    companyName: "SupplySync",
    industry: "Logistics",
    bio: "Real-time supply chain visibility for Indian SMBs.",
    isVerified: true,
    isOnline: true,
    followersCount: 1820,
  },
  {
    _id: "p_priya",
    name: "Priya Rajan",
    username: "priya_agri",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    role: "founder",
    companyName: "AgriGrow AI",
    industry: "AgriTech",
    bio: "AI-powered crop yield predictions for 50k+ farmers.",
    isVerified: false,
    isOnline: false,
    followersCount: 780,
  },
  {
    _id: "p_arjun",
    name: "Arjun Nair",
    username: "arjun_peak",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    role: "investor",
    companyName: "Peak Equity",
    industry: "Climate",
    bio: "Climate-first investor. Series A to B stage.",
    isVerified: true,
    isOnline: true,
    followersCount: 6100,
  },
  ...generateMockUsersList(12, "disc_person").map((u, i) => ({
    ...u,
    isOnline: i % 4 === 0, // only 1 in 4 generated users is online
  })),
];

export default function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || searchParams.get("type") || "startups";

  const { searchQuery, setSearchQuery } = useSearch();
  const query = searchQuery;
  const setQuery = setSearchQuery;

  const [tab, setTab] = useState(initialTab);
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [pitches, setPitches] = useState(ALL_MOCK_PITCHES);
  const [people, setPeople] = useState(DEMO_PEOPLE);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState(""); // "" | "founder" | "investor"

  const [startups, setStartups] = useState([]);
  const [startupsLoading, setStartupsLoading] = useState(false);

  useEffect(() => {
    const requestedTab = searchParams.get("tab") || searchParams.get("type");
    if (requestedTab) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  // Fetch recommended startups on startups tab
  useEffect(() => {
    if (tab !== "startups") return;
    setStartupsLoading(true);
    userService
      .getRecommendedStartups({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.startups || (Array.isArray(data) ? data : []);
        setStartups(Array.isArray(list) ? list : []);
      })
      .catch(() => setStartups([]))
      .finally(() => setStartupsLoading(false));
  }, [tab]);

  // Fetch pitches on pitch tabs
  useEffect(() => {
    if (tab === "people" || tab === "startups") return;
    const params = {};
    if (query) params.q = query;
    if (industry) params.industry = industry;
    if (stage) params.stage = stage;
    if (tab === "trending") params.sort = "trending";

    videoService
      .search(params)
      .then((res) => {
        const data = res?.data?.data;
        const apiVideos = data?.videos || data || [];
        const mergedMap = new Map();
        if (Array.isArray(apiVideos)) {
          apiVideos.forEach((v) => { if (v?._id) mergedMap.set(String(v._id), v); });
        }
        ALL_MOCK_PITCHES.forEach((v) => {
          if (v?._id && !mergedMap.has(String(v._id))) mergedMap.set(String(v._id), v);
        });
        setPitches(Array.from(mergedMap.values()));
      })
      .catch(() => setPitches(ALL_MOCK_PITCHES));
  }, [query, industry, stage, tab]);

  // Fetch people on people tab
  useEffect(() => {
    if (tab !== "people") return;
    setPeopleLoading(true);
    const params = {};
    if (query) params.q = query;
    if (roleFilter) params.role = roleFilter;

    userService
      .search(params)
      .then((res) => {
        const data = res?.data?.data;
        const apiUsers = data?.users || data || [];
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          // Merge API users with demo, deduplicate by _id
          const mergedMap = new Map();
          apiUsers.forEach((u) => { if (u?._id) mergedMap.set(String(u._id), u); });
          DEMO_PEOPLE.forEach((u) => {
            if (u?._id && !mergedMap.has(String(u._id))) mergedMap.set(String(u._id), u);
          });
          setPeople(Array.from(mergedMap.values()));
        } else {
          setPeople(DEMO_PEOPLE);
        }
      })
      .catch(() => setPeople(DEMO_PEOPLE))
      .finally(() => setPeopleLoading(false));
  }, [tab, query, roleFilter]);

  const getTrendingScore = (p) => {
    const views = p.views || 0;
    const likes = Array.isArray(p.likes) ? p.likes.length : Number(p.likes || 0);
    const saves = Array.isArray(p.saves) ? p.saves.length : Number(p.saves || 0);
    const comments = Number(p.comments || p.commentCount || 0);
    const boosted = p.isBoosted ? 100 : 0;
    return views + likes * 5 + saves * 10 + comments * 8 + boosted;
  };

  const filteredPitches = pitches
    .filter((p) => {
      const founder = typeof p.founderId === "object" ? p.founderId : {};
      const searchTarget = `${p.title || ""} ${p.description || ""} ${
        founder.name || p.authorName || ""
      } ${founder.companyName || p.companyName || ""}`.toLowerCase();
      if (query && !searchTarget.includes(query.toLowerCase())) return false;
      if (industry && p.industry !== industry) return false;
      if (stage && p.fundingStage !== stage) return false;
      return true;
    })
    .sort((a, b) => {
      if (tab === "trending") return getTrendingScore(b) - getTrendingScore(a);
      return 0;
    });

  const filteredPeople = people.filter((u) => {
    const searchTarget = `${u.name || ""} ${u.companyName || ""} ${u.industry || ""} ${u.bio || ""} ${u.username || ""}`.toLowerCase();
    if (query && !searchTarget.includes(query.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <DashboardShell
      title="Discover"
      subtitle="Find pitches and people that match your thesis."
    >
      {/* Search + filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 mb-5 shadow-2xs">
        <div className="relative mb-3">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#64748B] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === "people"
                ? "Search by name, company, bio…"
                : "Search by title, founder, company…"
            }
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#64748B] focus:border-[#1B5E3F] focus:bg-white focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none transition-all font-medium"
          />
        </div>

        {/* Pitch filters — only visible on pitch tabs */}
        {tab !== "people" && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#0F172A] focus:border-[#1B5E3F] focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All industries</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#0F172A] focus:border-[#1B5E3F] focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All stages</option>
              {FUNDING_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {(industry || stage || query) && (
              <button
                onClick={() => { setQuery(""); setIndustry(""); setStage(""); }}
                className="text-xs sm:text-sm text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors cursor-pointer ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* People filters — only visible on People tab */}
        {tab === "people" && (
          <div className="flex items-center gap-2 flex-wrap">
            {["", "founder", "investor"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all capitalize cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#1B5E3F] text-white shadow-2xs"
                    : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
                }`}
              >
                {r === "" ? "All" : r === "founder" ? "🚀 Founders" : "💼 Investors"}
              </button>
            ))}
            {(query || roleFilter) && (
              <button
                onClick={() => { setQuery(""); setRoleFilter(""); }}
                className="text-xs sm:text-sm text-[#1B5E3F] hover:text-[#0F4A2E] font-bold transition-colors cursor-pointer ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs - Smooth Mobile Horizontal Scrollable Pills with No Overflow or Bold Line */}
      <div className="w-full max-w-full flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none py-1 whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setQuery(""); }}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all cursor-pointer ${
              tab === t.value
                ? "bg-[#F5B942] text-[#0F172A] shadow-sm font-black border border-[#F5B942]"
                : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] hover:border-[#F5B942]/40"
            }`}
          >
            {t.icon && <t.icon className="w-4 h-4" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Startups grid ── */}
      {tab === "startups" && (
        startupsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#1B5E3F]/12 rounded-2xl">
            <HiUserGroup className="w-12 h-12 text-[#1B5E3F]/40 mx-auto mb-3" />
            <p className="font-bold text-base text-[#0A1F14]">No recommended startups found</p>
            <p className="text-xs text-[#0A1F14]/60 mt-1 max-w-sm mx-auto">
              Browse pitches on the feed to discover new startups and train your recommendation engine.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {startups.map((s) => (
              <PersonCard
                key={s.startupId || s._id}
                user={{
                  _id: s.startupId || s._id,
                  name: s.founderName || s.name,
                  companyName: s.companyName || s.name,
                  avatar: s.avatar,
                  industry: s.industry,
                  fundingStage: s.fundingStage,
                  isVerified: s.isVerified,
                  bio: s.bio,
                  role: "founder",
                }}
              />
            ))}
          </div>
        )
      )}

      {/* ── Pitch grid ── */}
      {tab !== "people" && tab !== "startups" && (
        filteredPitches.length === 0 ? (
          <div className="text-center py-16">
            <HiAdjustments className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No pitches match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredPitches.map((p) => (
              <PitchCard key={p._id} pitch={p} />
            ))}
          </div>
        )
      )}

      {/* ── People grid ── */}
      {tab === "people" && (
        peopleLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-16">
            <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No people found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredPeople.map((u) => (
              <PersonCard key={u._id} user={u} />
            ))}
          </div>
        )
      )}
    </DashboardShell>
  );
}

/* ── Avatar Initials Fallback ── */
function AvatarInitials({ name, size = 80 }) {
  const initials = (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  // Pick one of several brand-harmonious colors based on name char code
  const palettes = [
    { bg: "#1B5E3F", fg: "#FFFFFF" }, // brand green
    { bg: "#0F4A2E", fg: "#F5B942" }, // dark green + gold
    { bg: "#2D7A4F", fg: "#FFFFFF" }, // mid green
    { bg: "#5C3D1E", fg: "#F5D97A" }, // warm brown + gold
    { bg: "#1A3A5C", fg: "#A0C4E8" }, // navy blue
    { bg: "#4A1B5E", fg: "#DFB3F5" }, // purple
  ];
  const idx = (name?.charCodeAt(0) || 0) % palettes.length;
  const { bg, fg } = palettes[idx];
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.35,
        fontWeight: 900,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: "0.03em",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

/* ── Person Card ── */
function PersonCard({ user }) {
  const { user: authUser } = useAuth();
  const [imgError, setImgError] = useState(false);
  const showInitials = !user.avatar || imgError;
  const isFounder = user.role === "founder";

  // Check if card belongs to the currently logged in user viewing the app
  const isSelf = Boolean(
    authUser &&
      ((user._id && authUser._id && String(user._id) === String(authUser._id)) ||
        (user.username &&
          authUser.username &&
          user.username.toLowerCase() === authUser.username.toLowerCase()) ||
        (user.email &&
          authUser.email &&
          user.email.toLowerCase() === authUser.email.toLowerCase()))
  );

  const isOnlineNow = isSelf ? true : Boolean(user.isOnline || user.isLive);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-[#FEFCF7] border border-[#E8E0D0] rounded-2xl overflow-hidden flex flex-col items-center text-center shadow-sm"
      style={{ minWidth: 0 }}
    >
      {/* Avatar area — warm gradient top strip */}
      <div className="w-full pt-6 pb-3 px-5 flex flex-col items-center bg-gradient-to-b from-[#FFF8EC] to-[#FEFCF7]">
        <Link to={`/app/u/${user._id}`}>
          <div className="relative">
            <div
              className="rounded-full border-[3px] border-white shadow-md overflow-hidden"
              style={{ width: 80, height: 80 }}
            >
              {showInitials ? (
                <AvatarInitials name={user.name} size={80} />
              ) : (
                <img
                  src={user.avatar}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Green online dot indicator — renders when user is online or isSelf */}
            {isOnlineNow && (
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-1 ring-emerald-500/30"
                title={isSelf ? "You are online" : "Online now"}
              />
            )}
          </div>
        </Link>
      </div>

      {/* Info area */}
      <div className="w-full px-5 pb-5 flex flex-col items-center gap-0.5">
        {/* Name + verified */}
        <Link
          to={`/app/u/${user._id}`}
          className="flex items-center justify-center gap-1.5 mt-1"
        >
          <span className="font-black text-[15px] text-[#1A1A1A] leading-tight hover:underline">
            {user.name}
          </span>
          {user.isVerified && (
            <MdVerified className="w-4 h-4 text-[#F5B942] shrink-0" />
          )}
        </Link>

        {/* Company / org */}
        {user.companyName && (
          <p className="text-[12px] text-[#6B6B6B] font-medium mt-0.5 truncate w-full">
            {user.companyName}
          </p>
        )}

        {/* Role pill + industry tag */}
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          <span
            className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-[3px] rounded-full ${
              isFounder
                ? "bg-[#FFF0C2] text-[#A07800] border border-[#F5D97A]"
                : "bg-[#E8F5EF] text-[#1B5E3F] border border-[#B3D9C6]"
            }`}
          >
            {isFounder ? "Founder" : "Investor"}
          </span>
          {user.industry && (
            <span className="text-[11px] text-[#6B6B6B] font-medium">
              {user.industry}
              {user.companyName ? ` / ${user.companyName.split(" ")[0]}` : ""}
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-[12px] text-[#555] leading-relaxed line-clamp-2 mt-2.5 text-left w-full">
            {user.bio}
          </p>
        )}

        {/* Follower count */}
        {user.followersCount > 0 && (
          <p className="text-[11px] text-[#888] mt-1.5">
            <span className="font-bold text-[#333]">
              {user.followersCount >= 1000
                ? `${(user.followersCount / 1000).toFixed(1)}k`
                : user.followersCount}
            </span>{" "}
            followers
          </p>
        )}

        {/* Follow button — centered gold pill button matching reference image */}
        <div className="w-full mt-4 flex justify-center">
          <FollowButton userId={user._id} variant="outline" />
        </div>
      </div>
    </motion.div>
  );
}
