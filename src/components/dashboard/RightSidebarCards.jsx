import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiSparkles,
  HiEye,
  HiCalendar,
  HiArrowRight,
  HiUserGroup,
  HiCheckCircle,
  HiFire,
  HiDocumentText,
  HiCurrencyDollar,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import Modal from "../ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { videoService } from "../../services/videoService";
import { deckAccessService } from "../../services/deckAccessService";
import { investmentService } from "../../services/investmentService";
import { notificationService } from "../../services/notificationService";
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import { useToast } from "../ui/Toast";

// Normalize funding stage strings for robust case-insensitive comparison
function normalizeStage(stageStr) {
  if (!stageStr) return "";
  return String(stageStr)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // e.g. "Pre-Seed" -> "preseed", "Series A" -> "seriesa"
}

// Helper to format currency amount to INR string (e.g. 18000000 -> "Up to ₹1.8 Cr")
function formatINR(val) {
  if (!val || isNaN(val)) return "Up to ₹50 L";
  const num = Number(val);
  if (num >= 10000000) {
    return `Up to ₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)} Cr`;
  }
  if (num >= 100000) {
    return `Up to ₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)} L`;
  }
  return `Up to ₹${num.toLocaleString("en-IN")}`;
}

// Helper to render real company logo or fallback initial avatar from REAL company name
function OpportunityLogo({ logo, name }) {
  const [error, setError] = useState(false);
  const initial = (name || "C")[0].toUpperCase();

  if (logo && !error) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setError(true)}
        className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#1B5E3F]/15 shadow-2xs"
      />
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#1B5E3F] text-[#F5B942] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs border border-[#1B5E3F]/20">
      {initial}
    </div>
  );
}

// Extract founder / user ID from opportunity object
function getProfileId(opp) {
  if (!opp) return null;
  const f = opp.founderId || opp.founder || opp.userId || opp.authorId || opp.companyId || opp.ownerId;
  if (f) {
    if (typeof f === "object" && f._id) return String(f._id);
    if (typeof f === "string" && f.length > 0) return f;
  }
  if (opp._id && typeof opp._id === "string") return String(opp._id);
  if (opp.id && typeof opp.id === "string") return String(opp.id);
  return null;
}

// Row item for each real Active Funding Opportunity
function FundingOpportunityItem({ opp }) {
  const companyName =
    opp.companyName ||
    opp.founderId?.companyName ||
    opp.founder?.companyName ||
    opp.name ||
    opp.founderId?.name ||
    opp.title ||
    "Startup";

  const logo =
    opp.logo ||
    opp.avatar ||
    opp.founderId?.avatar ||
    opp.founder?.avatar ||
    opp.thumbnailUrl ||
    opp.coverUrl;

  const stage =
    opp.fundingStage || opp.stage || opp.category || opp.tag || "Seed";

  const amount =
    opp.amount ||
    (typeof opp.askAmount === "number" && opp.askAmount > 0
      ? formatINR(opp.askAmount)
      : "Up to ₹50 L");

  const profileId = getProfileId(opp);
  const profileUrl = profileId ? `/app/u/${profileId}` : null;

  return (
    <div className="p-3 bg-[#FAFAF7] hover:bg-[#F3F2EF] border border-[#1B5E3F]/8 rounded-xl transition-colors group flex items-center gap-3">
      {/* 1. Real Company Logo / Initial Fallback — Clickable to Profile */}
      {profileUrl ? (
        <Link to={profileUrl} className="shrink-0 hover:opacity-85 transition-opacity cursor-pointer">
          <OpportunityLogo logo={logo} name={companyName} />
        </Link>
      ) : (
        <OpportunityLogo logo={logo} name={companyName} />
      )}

      {/* 2. Real Company Name + Real Funding Stage — Clickable to Profile */}
      <div className="min-w-0 flex-1">
        {profileUrl ? (
          <Link to={profileUrl} className="block group/link cursor-pointer">
            <p className="font-extrabold text-sm text-[#0A1F14] group-hover/link:text-[#1B5E3F] group-hover/link:underline transition-colors truncate">
              {companyName}
            </p>
            <p className="text-xs text-[#0A1F14]/60 font-medium truncate capitalize mt-0.5">
              {stage}
            </p>
          </Link>
        ) : (
          <div>
            <p className="font-extrabold text-sm text-[#0A1F14] truncate">
              {companyName}
            </p>
            <p className="text-xs text-[#0A1F14]/60 font-medium truncate capitalize mt-0.5">
              {stage}
            </p>
          </div>
        )}
      </div>

      {/* 3. Real Funding Amount */}
      <div className="text-right shrink-0">
        <span className="text-xs font-black text-[#1B5E3F] px-2.5 py-1 bg-[#1B5E3F]/8 group-hover:bg-[#1B5E3F]/12 rounded-full inline-block">
          {amount}
        </span>
      </div>
    </div>
  );
}

export function ActiveFundingOpportunitiesCard({
  opportunities: propOpportunities,
  preferredStages: propPreferredStages,
}) {
  const { user } = useAuth();
  const [realItems, setRealItems] = useState([]);
  const [loading, setLoading] = useState(!propOpportunities || propOpportunities.length === 0);
  const [error, setError] = useState(false);

  // User's REAL preferred funding stages
  const userPreferredStages =
    propPreferredStages ||
    user?.preferredStages ||
    user?.preferredFundingStages ||
    [];

  const fetchOpportunities = useCallback(() => {
    if (propOpportunities && propOpportunities.length > 0) {
      setRealItems(propOpportunities);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    videoService
      .getFeed({ limit: 20 })
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.videos || (Array.isArray(data) ? data : []);
        setRealItems(list);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propOpportunities]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter REAL opportunities by user's REAL preferred funding stages
  const filteredList = useMemo(() => {
    if (!Array.isArray(realItems) || realItems.length === 0) {
      return [];
    }

    if (!Array.isArray(userPreferredStages) || userPreferredStages.length === 0) {
      return realItems;
    }

    const normalizedPreferred = userPreferredStages
      .map(normalizeStage)
      .filter(Boolean);

    if (normalizedPreferred.length === 0) return realItems;

    return realItems.filter((item) => {
      const itemStage = normalizeStage(
        item.fundingStage || item.stage || item.category || item.tag
      );
      return normalizedPreferred.includes(itemStage);
    });
  }, [realItems, userPreferredStages]);

  const hasPreferredStages =
    Array.isArray(userPreferredStages) && userPreferredStages.length > 0;

  return (
    <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-[#1B5E3F]/8">
        <h3 className="font-bold text-sm text-[#0A1F14] flex items-center gap-2">
          <HiSparkles className="w-4 h-4 text-[#F5B942]" />
          Active Funding Opportunities
        </h3>
        <Link
          to="/app/pitch"
          className="text-xs font-bold text-[#1B5E3F] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
          <span className="font-medium text-[#0A1F14]/70">
            Loading funding opportunities...
          </span>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center">
          <p className="font-bold text-[#0A1F14]">Unable to load funding opportunities.</p>
          <button
            onClick={fetchOpportunities}
            className="mt-2.5 px-3.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Try again
          </button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#0A1F14]/60">
          <p className="font-bold text-[#0A1F14]">
            {hasPreferredStages && realItems.length > 0
              ? "No matching funding opportunities"
              : "No active funding opportunities"}
          </p>
          <p className="text-[11px] text-[#0A1F14]/55 mt-1 max-w-xs mx-auto">
            {hasPreferredStages && realItems.length > 0
              ? "No active opportunities match your selected funding stages."
              : "There are no funding opportunities available right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-3 max-h-[360px] overflow-y-auto pr-1">
          {filteredList.map((opp, idx) => (
            <FundingOpportunityItem key={opp._id || opp.id || idx} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}

// Format relative time (e.g. 2h ago, 5h ago, 1d ago, just now)
function formatTimeAgo(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

// Avatar component with fallback initial
function InvestorAvatar({ avatar, name }) {
  const [error, setError] = useState(false);
  const initial = (name || "I")[0].toUpperCase();

  if (avatar && !error) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setError(true)}
        className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#1B5E3F]/15 shadow-2xs"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] font-bold text-xs flex items-center justify-center shrink-0 border border-[#1B5E3F]/15">
      {initial}
    </div>
  );
}

// Dedicated Modal for Investor Profile Views
export function InvestorProfileViewsModal({ open, onClose }) {
  const [viewers, setViewers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchViewers = useCallback(() => {
    if (!open) return;
    setLoading(true);
    setError(false);

    userService
      .getProfileViewers({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.viewers || data?.views || (Array.isArray(data) ? data : []);
        setViewers(Array.isArray(list) ? list : []);
        const total = typeof data?.totalCount === "number" ? data.totalCount : (typeof data?.count === "number" ? data.count : (Array.isArray(list) ? list.length : 0));
        setCount(total);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  useEffect(() => {
    fetchViewers();
  }, [fetchViewers]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Investor Profile Views"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Header Subtitle & Count */}
        <div className="pb-2 border-b border-[#1B5E3F]/10">
          <p className="text-xs text-[#0A1F14]/65 font-medium">
            Investors who recently viewed your profile
          </p>
          {!loading && !error && (
            <p className="text-sm font-bold text-[#1B5E3F] mt-1 flex items-center gap-1.5">
              <HiEye className="w-4 h-4" />
              <span>{count} {count === 1 ? "investor" : "investors"} viewed your profile</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
            <span className="font-medium text-[#0A1F14]/70">Loading investor profile views...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center">
            <p className="font-bold text-[#0A1F14]">Unable to load investor profile views.</p>
            <button
              onClick={fetchViewers}
              className="mt-2.5 px-3.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Try again
            </button>
          </div>
        ) : viewers.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#0A1F14]/55">
            <p className="font-bold text-[#0A1F14]">No investors have viewed your profile yet.</p>
            <p className="text-[11px] font-medium text-[#0A1F14]/50 mt-1">
              Complete your profile and share pitch deck to attract investors.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {viewers.map((item, idx) => {
              const u = item.viewer || item.viewerId || item;
              const viewedAt = item.viewedAt || item.latestViewedAt;
              const displayName = u.name || u.username || "Investor";
              const company = u.companyName || u.investorType || (u.username ? `@${u.username}` : "Investor");

              return (
                <div
                  key={item._id || u._id || idx}
                  className="flex items-center justify-between p-3 bg-[#FAFAF7] hover:bg-[#F3F2EF] border border-[#1B5E3F]/8 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <InvestorAvatar avatar={u.avatar} name={displayName} />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0A1F14] truncate flex items-center gap-1">
                        {displayName}
                        {u.isVerified && (
                          <MdVerified className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-[#0A1F14]/60 truncate font-medium">
                        {company}
                        {viewedAt && (
                          <span className="text-[10px] text-[#0A1F14]/45 ml-2 font-normal">
                            • Viewed {formatTimeAgo(viewedAt)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/app/u/${u._id}`}
                    onClick={onClose}
                    className="shrink-0 ml-2"
                  >
                    <button className="px-3 py-1.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs">
                      View Profile →
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function InvestorActivityCard({ activities: propActivities }) {
  const { user } = useAuth();
  const [activityRows, setActivityRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const fetchRealActivities = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Fetch profile viewers, deck requests, investment interest, and notifications concurrently
      const [profileViewsRes, deckRes, dealsRes, notifRes] = await Promise.allSettled([
        userService.getProfileViewers({ limit: 50 }),
        deckAccessService.incoming(),
        investmentService.getMyDeals(),
        notificationService.list({ limit: 20 }),
      ]);

      const profileData = profileViewsRes.status === "fulfilled" ? profileViewsRes.value?.data?.data : null;
      const profileViewers = profileData?.viewers || profileData?.views || (Array.isArray(profileData) ? profileData : []);
      const profileViewsCount = typeof profileData?.totalCount === "number" ? profileData.totalCount : (typeof profileData?.count === "number" ? profileData.count : profileViewers.length);

      const deckRequests = deckRes.status === "fulfilled" ? (deckRes.value?.data?.data?.requests || deckRes.value?.data?.data || []) : [];
      const deals = dealsRes.status === "fulfilled" ? (dealsRes.value?.data?.data?.deals || dealsRes.value?.data?.data || []) : [];
      const notifications = notifRes.status === "fulfilled" ? (notifRes.value?.data?.data?.notifications || notifRes.value?.data?.data || []) : [];

      const rows = [];

      // 1. UNIQUE investors who viewed the founder's PROFILE
      let latestProfileViewTime = null;
      profileViewers.forEach((v) => {
        const t = v.viewedAt || v.createdAt;
        if (t && (!latestProfileViewTime || new Date(t) > new Date(latestProfileViewTime))) {
          latestProfileViewTime = t;
        }
      });

      if (profileViewsCount > 0) {
        rows.push({
          id: "act_profile_views",
          icon: HiEye,
          count: profileViewsCount,
          text: `${profileViewsCount} ${profileViewsCount === 1 ? "investor" : "investors"} viewed your profile`,
          time: formatTimeAgo(latestProfileViewTime || new Date()),
          isProfileModal: true,
          timestamp: new Date(latestProfileViewTime || 0).getTime(),
        });
      }

      // 2. Deck Requests
      const deckInvestorIds = new Set();
      let latestDeckTime = null;

      (Array.isArray(deckRequests) ? deckRequests : []).forEach((req) => {
        const invId = req.investorId?._id || req.investorId || req.userId;
        if (invId) deckInvestorIds.add(String(invId));
        if (req.createdAt && (!latestDeckTime || new Date(req.createdAt) > new Date(latestDeckTime))) {
          latestDeckTime = req.createdAt;
        }
      });

      notifications.forEach((n) => {
        if (["deal_room_request", "deck"].includes(n.type) || (n.title || "").toLowerCase().includes("deck")) {
          const invId = n.data?.senderId || n.data?.investorId;
          if (invId) deckInvestorIds.add(String(invId));
          if (n.createdAt && (!latestDeckTime || new Date(n.createdAt) > new Date(latestDeckTime))) {
            latestDeckTime = n.createdAt;
          }
        }
      });

      const deckCount = deckInvestorIds.size || (Array.isArray(deckRequests) ? deckRequests.length : 0);

      if (deckCount > 0) {
        rows.push({
          id: "act_deck",
          icon: HiDocumentText,
          count: deckCount,
          text: `${deckCount} ${deckCount === 1 ? "investor" : "investors"} requested your deck`,
          time: formatTimeAgo(latestDeckTime || new Date()),
          link: "/app/deck-requests",
          timestamp: new Date(latestDeckTime || 0).getTime(),
        });
      }

      // 3. Investment Interest from real database records (matches Deals page)
      const dealsList = Array.isArray(deals) ? deals : [];
      let latestInterestTime = null;

      dealsList.forEach((d) => {
        const t = d.updatedAt || d.createdAt;
        if (t && (!latestInterestTime || new Date(t) > new Date(latestInterestTime))) {
          latestInterestTime = t;
        }
      });

      const totalInterest = dealsList.length;

      if (totalInterest > 0) {
        rows.push({
          id: "act_interest",
          icon: HiCurrencyDollar,
          count: totalInterest,
          text: `${totalInterest} new investment ${totalInterest === 1 ? "interest" : "interests"}`,
          time: formatTimeAgo(latestInterestTime || new Date()),
          link: "/app/deals",
          timestamp: new Date(latestInterestTime || 0).getTime(),
        });
      }

      // Sort rows by most recent activity timestamp
      rows.sort((a, b) => b.timestamp - a.timestamp);

      setActivityRows(rows);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealActivities();
  }, [fetchRealActivities]);

  return (
    <>
      <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-[#1B5E3F]/8">
          <h3 className="font-bold text-sm text-[#0A1F14] flex items-center gap-2">
            <HiEye className="w-4 h-4 text-[#1B5E3F]" />
            Investor Activity
          </h3>
          <Link
            to="/app/notifications"
            className="text-xs font-bold text-[#1B5E3F] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
            <span className="font-medium text-[#0A1F14]/70">
              Loading investor activity...
            </span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center">
            <p className="font-bold text-[#0A1F14]">Unable to load investor activity.</p>
            <button
              onClick={fetchRealActivities}
              className="mt-2.5 px-3.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Try again
            </button>
          </div>
        ) : activityRows.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#0A1F14]/55">
            <p className="font-bold text-[#0A1F14]">No investor activity yet.</p>
            <p className="text-[11px] text-[#0A1F14]/55 mt-1 max-w-xs mx-auto">
              Upload or boost your pitch to increase investor views.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-3 max-h-[360px] overflow-y-auto pr-1">
            {activityRows.map((row) => {
              const content = (
                <div className="flex items-center gap-3 p-2.5 hover:bg-[#FAFAF7] rounded-xl transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center shrink-0 group-hover:bg-[#1B5E3F]/20 transition-colors">
                    <row.icon className="w-4 h-4 text-[#1B5E3F]" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#0A1F14] group-hover:text-[#1B5E3F] transition-colors truncate">
                      {row.text}
                    </p>
                    <span className="text-[10px] text-[#0A1F14]/50 shrink-0 font-medium">
                      {row.time}
                    </span>
                  </div>
                </div>
              );

              if (row.isProfileModal) {
                return (
                  <div key={row.id} onClick={() => setProfileModalOpen(true)}>
                    {content}
                  </div>
                );
              }

              return (
                <Link key={row.id} to={row.link}>
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Investor Profile Views */}
      <InvestorProfileViewsModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}

// Format event date (e.g. "2026-05-24" -> "24 May 2026")
function formatEventDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UpcomingEventsCard({ events: propEvents }) {
  const toast = useToast();
  const [realEvents, setRealEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const fetchUpcomingEvents = useCallback(() => {
    if (propEvents && propEvents.length > 0) {
      setRealEvents(propEvents);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    eventService
      .getUpcoming({ limit: 3 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.events || (Array.isArray(data) ? data : []);
        setRealEvents(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError(true);
        setRealEvents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propEvents]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  const handleRegister = async (eventId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setRegisteringId(eventId);

    try {
      const res = await eventService.register(eventId);
      const data = res?.data?.data || res?.data;

      setRealEvents((prev) =>
        prev.map((ev) =>
          (ev._id || ev.id) === eventId ? { ...ev, isRegistered: true } : ev
        )
      );

      if (data?.alreadyRegistered) {
        toast?.info?.("You are already registered for this event.");
      } else {
        toast?.success?.("Successfully registered for event!");
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Registration failed";
      toast?.error?.(errMsg);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-[#1B5E3F]/8">
        <h3 className="font-bold text-sm text-[#0A1F14] flex items-center gap-2">
          <HiCalendar className="w-4 h-4 text-[#F5B942]" />
          Upcoming Events
        </h3>
        <Link
          to="/app/events"
          className="text-xs font-bold text-[#1B5E3F] hover:underline cursor-pointer"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
          <span className="font-medium text-[#0A1F14]/70">
            Loading upcoming events...
          </span>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center">
          <p className="font-bold text-[#0A1F14]">Unable to load upcoming events.</p>
          <button
            onClick={fetchUpcomingEvents}
            className="mt-2.5 px-3.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Try again
          </button>
        </div>
      ) : realEvents.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#0A1F14]/55">
          <p className="font-bold text-[#0A1F14]">No upcoming events</p>
          <p className="text-[11px] text-[#0A1F14]/55 mt-1 max-w-xs mx-auto">
            Check back soon for new events.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-3 max-h-[360px] overflow-y-auto pr-1">
          {realEvents.map((ev) => {
            const dateStr = formatEventDate(ev.startDate);
            const locationStr = ev.location || "Online";
            const dateLocLabel = dateStr ? `${dateStr} · ${locationStr}` : locationStr;

            return (
              <div
                key={ev._id || ev.id}
                className="p-3 bg-[#FAFAF7] hover:bg-[#F3F2EF] border border-[#1B5E3F]/8 rounded-xl flex items-center justify-between gap-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#0A1F14] truncate">{ev.title}</p>
                  <p className="text-[11px] text-[#0A1F14]/60 mt-0.5 font-medium truncate">
                    {dateLocLabel}
                  </p>
                </div>

                {ev.isRegistered ? (
                  <span className="px-2.5 py-1 bg-[#1B5E3F]/10 text-[#1B5E3F] text-[11px] font-bold rounded-lg shrink-0 flex items-center gap-1 border border-[#1B5E3F]/20">
                    <HiCheckCircle className="w-3.5 h-3.5" /> Registered
                  </span>
                ) : ev.isFull ? (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg shrink-0 border border-gray-200">
                    Full
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleRegister(ev._id || ev.id, e)}
                    disabled={registeringId === (ev._id || ev.id)}
                    className="
                      register-event-btn
                      px-3 py-1.5
                      bg-[#0B3D2E]
                      hover:bg-[#145A42]
                      !text-white
                      text-xs font-semibold
                      rounded-lg
                      flex items-center gap-1.5
                      border border-[#D4A017]/40
                      shadow-2xs
                      hover:shadow-xs
                      transition-all duration-300
                      shrink-0
                      cursor-pointer
                      disabled:opacity-50
                    "
                    style={{ color: "#ffffff" }}
                  >
                    {registeringId === (ev._id || ev.id) ? (
                      <span className="register-event-label !text-white" style={{ color: "#ffffff" }}>
                        Registering...
                      </span>
                    ) : (
                      <>
                        <span className="register-event-label !text-white" style={{ color: "#ffffff" }}>
                          Register
                        </span>
                        <HiArrowRight className="w-3.5 h-3.5 !text-[#D4AF37]" style={{ color: "#D4AF37" }} />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TrendingPitchesCard({ pitches: propPitches }) {
  const [realPitches, setRealPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrendingPitches = useCallback(() => {
    if (propPitches && propPitches.length > 0) {
      setRealPitches(propPitches);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    videoService
      .getTrending({ limit: 3 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.videos || (Array.isArray(data) ? data : []);
        setRealPitches(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError(true);
        setRealPitches([]);
      })
      .finally(() => setLoading(false));
  }, [propPitches]);

  useEffect(() => {
    fetchTrendingPitches();
  }, [fetchTrendingPitches]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
        <h3 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
          🔥 Trending Pitches
        </h3>
        <Link
          to="/app/discover"
          className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-0.5"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[#64748B] flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED]/20 border-t-[#7C3AED] animate-spin" />
          <span className="font-medium text-[#64748B]">Loading trending pitches...</span>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-[#64748B] flex flex-col items-center justify-center">
          <p className="font-bold text-[#0F172A]">Unable to load trending pitches.</p>
          <button
            onClick={fetchTrendingPitches}
            className="mt-2.5 px-3.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Try again
          </button>
        </div>
      ) : realPitches.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#64748B]">
          <p className="font-semibold text-[#0F172A]">No trending pitches yet.</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Check back soon for active startup pitches.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-3.5 max-h-[360px] overflow-y-auto pr-1">
          {realPitches.map((item, idx) => {
            const companyName =
              item.companyName ||
              item.founderId?.companyName ||
              item.name ||
              item.founderId?.name ||
              item.title ||
              "Startup";

            const avatarUrl =
              item.logo ||
              item.avatar ||
              item.founderId?.avatar ||
              item.thumbnailUrl;

            const industryStr = item.industry || "Tech";
            const stageStr = item.fundingStage || item.stage || "Seed";

            const growthBadgeText =
              typeof item.viewGrowthPercent === "number" && item.viewGrowthPercent > 0
                ? `↑ ${item.viewGrowthPercent}% views`
                : item.views > 0
                ? `↑ ${item.views} views`
                : "🔥 Trending";

            const targetPitchId = item.pitchId || item._id || item.id;

            return (
              <Link
                key={targetPitchId || idx}
                to={`/app/pitch?pitch=${targetPitchId}`}
                className="flex items-center justify-between p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={companyName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{companyName[0]?.toUpperCase() || "S"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#7C3AED] transition-colors truncate">
                      {companyName}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-medium truncate">
                      {industryStr} · {stageStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold rounded-md">
                    {growthBadgeText}
                  </span>
                  <span className="text-[#94A3B8] text-xs font-bold ml-0.5">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RecommendedStartupsCard({ startups: propStartups }) {
  const [realStartups, setRealStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRecommendedStartups = useCallback(() => {
    if (propStartups && propStartups.length > 0) {
      setRealStartups(propStartups);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    userService
      .getRecommendedStartups({ limit: 3 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.startups || (Array.isArray(data) ? data : []);
        setRealStartups(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError(true);
        setRealStartups([]);
      })
      .finally(() => setLoading(false));
  }, [propStartups]);

  useEffect(() => {
    fetchRecommendedStartups();
  }, [fetchRecommendedStartups]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
        <h3 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
          Recommended Startups
        </h3>
        <Link
          to="/app/discover?tab=startups"
          className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-0.5"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[#64748B] flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED]/20 border-t-[#7C3AED] animate-spin" />
          <span className="font-medium text-[#64748B]">Loading recommendations...</span>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-[#64748B] flex flex-col items-center justify-center">
          <p className="font-bold text-[#0F172A]">Unable to load recommended startups.</p>
          <button
            onClick={fetchRecommendedStartups}
            className="mt-2.5 px-3.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Try again
          </button>
        </div>
      ) : realStartups.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#64748B]">
          <p className="font-semibold text-[#0F172A]">No recommended startups.</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Browse pitches on the feed to discover new startups.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-3.5 max-h-[360px] overflow-y-auto pr-1">
          {realStartups.map((item, idx) => {
            const startupId = item.startupId || item._id || item.id;
            const companyName = item.companyName || item.name || "Startup";
            const avatarUrl = item.avatar || item.logo;
            const industryStr = item.industry || "Tech";
            const stageStr = item.fundingStage || item.stage || "Seed";

            const profileRoute = startupId
              ? `/app/u/${startupId}`
              : item.pitchId
              ? `/app/pitch?pitch=${item.pitchId}`
              : "/app/discover";

            return (
              <div
                key={startupId || idx}
                className="flex items-center justify-between p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={companyName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{companyName[0]?.toUpperCase() || "S"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#0F172A] truncate">
                      {companyName}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-medium truncate">
                      {industryStr} · {stageStr}
                    </p>
                  </div>
                </div>

                <Link to={profileRoute}>
                  <button className="px-3.5 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#7C3AED] text-[#0F172A] hover:text-[#7C3AED] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs">
                    View
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
