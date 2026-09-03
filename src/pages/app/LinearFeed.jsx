import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHeart,
  HiOutlineHeart,
  HiChatAlt2,
  HiBookmark,
  HiOutlineBookmark,
  HiShare,
  HiPlay,
  HiCurrencyDollar,
  HiLink,
  HiChevronLeft,
  HiChevronRight,
  HiVolumeUp,
  HiVolumeOff,
  HiX,
  HiPhotograph,
  HiUpload,
  HiAnnotation,
  HiSearch,
} from "react-icons/hi";
import {
  FaWhatsapp,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
  FaEnvelope,
  FaLink,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FundingSummaryBar from "../../components/dashboard/FundingSummaryBar";
import FundingImpactCard from "../../components/dashboard/FundingImpactCard";
import {
  ActiveFundingOpportunitiesCard,
  InvestorActivityCard,
  UpcomingEventsCard,
  TrendingPitchesCard,
  RecommendedStartupsCard,
} from "../../components/dashboard/RightSidebarCards";
import FollowButton from "../../components/monetization/FollowButton";
import ProUpgradeModal from "../../components/monetization/ProUpgradeModal";
import CommentsPanel from "../../components/dashboard/CommentsPanel";
import ShareSheet from "../../components/dashboard/ShareSheet";
import { useToast } from "../../components/ui/Toast";
import { FeedSkeleton } from "../../components/ui/PageLoader";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useSearch } from "../../context/SearchContext";
import Modal from "../../components/ui/Modal";
import { investmentService } from "../../services/investmentService";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";
import { chatService } from "../../services/chatService";
import { useUploadModal } from "../../context/UploadModalContext";
import { MOCK_PITCHES, ALL_MOCK_PITCHES, MOCK_POSTS, formatINR } from "../../constants/mockData";
import { canStartChat, consumeFreeChat, getRole } from "../../lib/auth";

                                                                                                                                                                                                                                                                                                                            
export default function LinearFeed() {
  const { user, loading: authLoading } = useAuth();
                                                                       
                                                                         
  const role = authLoading ? null : (user?.role || getRole() || "investor");
  const isFounder = role === "founder";
  const userId = user?._id;
  const { openPitchModal, openPostModal } = useUploadModal();

  const [paywall, setPaywall] = useState(false);
  const [realPitches, setRealPitches] = useState(null);
  const [realPosts, setRealPosts] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const toast = useToast();

  const loadFeedData = () => {
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded >= 2) setFeedLoading(false);
    };

    videoService
      .getFeed({ limit: 20 })
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data;
        if (videos?.length > 0) setRealPitches(videos);
      })
      .catch(() => {})
      .finally(done);

    postService
      .getFeed({ limit: 20 })
      .then((res) => {
        const data = res?.data?.data;
        const posts = data?.posts || data;
        if (posts?.length > 0) setRealPosts(posts);
      })
      .catch(() => {})
      .finally(done);
  };

                                                                             
  useEffect(() => {
    loadFeedData();

    const handleUpdate = () => {
      loadFeedData();
    };

    window.addEventListener("pitch-uploaded", handleUpdate);
    window.addEventListener("post-created", handleUpdate);

    return () => {
      window.removeEventListener("pitch-uploaded", handleUpdate);
      window.removeEventListener("post-created", handleUpdate);
    };
  }, []);

                                                                          
                                              
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
    window.scrollTo(0, 0);
  }, []);

                                              
                                                                           
                                                                      
                                                                   
  const [muted, setMuted] = useState(true);
  const setMutedPersistent = (next) => {
    setMuted(next);
  };

  const items = useMemo(() => {
                                                         
                                                                                      
    const ownId = isFounder && userId ? userId : null;

    const pitchSource = [...(realPitches || [])];
    MOCK_PITCHES.forEach((mp) => {
      if (!pitchSource.some((p) => p._id === mp._id)) {
        pitchSource.push(mp);
      }
    });

    const pitchEntries = pitchSource
      .map((p) => {
        const boosted =
          !!p.isBoosted &&
          (!p.boostedUntil || new Date(p.boostedUntil) > new Date());
        return {
          kind: "pitch",
          id: p._id,
          ts: new Date(p.createdAt || 0).getTime(),
          boosted,
          data: p,
        };
      });

    const postSource = [...(realPosts || [])];
    MOCK_POSTS.forEach((mp) => {
      if (!postSource.some((p) => p._id === mp._id)) {
        postSource.push(mp);
      }
    });

    const postEntries = postSource
      .map((p) => ({
        kind: "post",
        id: p._id,
        ts: new Date(p.createdAt || 0).getTime(),
        boosted: false,
        data: p,
      }));

    const merged = [...pitchEntries, ...postEntries].sort((a, b) => {
                             
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
                         
      return b.ts - a.ts;
    });

                                                             
    const seen = new Set();
    return merged.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [isFounder, userId, realPitches, realPosts]);

  const { searchQuery, clearSearch } = useSearch();

  const filteredItems = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const d = item.data || {};
      const author =
        d.founderId && typeof d.founderId === "object"
          ? d.founderId
          : d.authorId && typeof d.authorId === "object"
          ? d.authorId
          : d.founder || d.author || {};

      const company = String(d.companyName || author.companyName || "").toLowerCase();
      const name = String(d.founderName || d.authorName || author.name || d.name || "").toLowerCase();
      const username = String(author.username || d.username || "").toLowerCase();
      const title = String(d.title || "").toLowerCase();
      const content = String(d.description || d.caption || d.content || "").toLowerCase();
      const industry = String(d.industry || d.category || "").toLowerCase();

      return (
        company.includes(q) ||
        name.includes(q) ||
        username.includes(q) ||
        title.includes(q) ||
        content.includes(q) ||
        industry.includes(q)
      );
    });
  }, [items, searchQuery]);

  const rightSidebarContent = (
    <>
      <FundingImpactCard />
      {isFounder ? (
        <>
          <ActiveFundingOpportunitiesCard />
          <InvestorActivityCard />
          <UpcomingEventsCard />
        </>
      ) : (
        <>
          <TrendingPitchesCard />
          <RecommendedStartupsCard />
        </>
      )}
    </>
  );

  return (
    <DashboardShell rightSidebar={rightSidebarContent}>
      <div className="w-full max-w-[680px] mx-auto space-y-5">
        {                                                                                                      }
        {!isFounder && (
          <div className="lg:hidden sticky top-0 z-20 bg-[#F8FAFC] pt-3 pb-2 -mt-2 space-y-3">
            <FundingSummaryBar />

            {                         }
            <div className="w-full bg-[#F1F5F9] p-1 sm:p-1.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs font-bold gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl transition-all duration-200 text-center cursor-pointer truncate ${
                  activeTab === "all"
                    ? "bg-white text-[#0F172A] shadow-sm font-black"
                    : "text-[#64748B] hover:text-[#0F172A] font-semibold"
                }`}
              >
                All Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("discover")}
                className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl transition-all duration-200 text-center cursor-pointer truncate ${
                  activeTab === "discover"
                    ? "bg-white text-[#0F172A] shadow-sm font-black"
                    : "text-[#64748B] hover:text-[#0F172A] font-semibold"
                }`}
              >
                Discover & Events
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("impact")}
                className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl transition-all duration-200 text-center cursor-pointer truncate ${
                  activeTab === "impact"
                    ? "bg-white text-[#0F172A] shadow-sm font-black"
                    : "text-[#64748B] hover:text-[#0F172A] font-semibold"
                }`}
              >
                Funding Impact
              </button>
            </div>
          </div>
        )}

        {                                                                                      }
        {(activeTab === "all" || window.innerWidth >= 1024) && (
          <div className={activeTab !== "all" ? "hidden lg:block space-y-5" : "space-y-5"}>
          <>
            {                                         }
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              {                                       }
              <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
                <Link to="/app/profile" className="flex-shrink-0">
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=7C3AED&color=fff`
                    }
                    alt={user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7C3AED]/20 hover:ring-[#7C3AED]/40 transition-all duration-200"
                  />
                </Link>
                <button
                  onClick={() => openPostModal()}
                  className="flex-1 min-w-0 px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 border border-[#E2E8F0] rounded-full text-left text-sm text-[#64748B] hover:text-[#0F172A] transition-all duration-200 font-medium cursor-pointer truncate"
                >
                  <span className="block truncate">
                    Share a thought or insight...
                  </span>
                </button>
              </div>

              {                                    }
              <div className="flex items-center gap-1 sm:gap-2 pt-2.5">
                <button
                  type="button"
                  onClick={() => openPostModal("images")}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#475569] hover:text-[#10B981] hover:bg-emerald-50 transition-all duration-200 cursor-pointer group"
                >
                  <HiPhotograph className="w-4.5 h-4.5 text-[#10B981] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="truncate">Photo / Post</span>
                </button>

                {isFounder && (
                  <button
                    type="button"
                    onClick={openPitchModal}
                    className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#475569] hover:text-[#F59E0B] hover:bg-amber-50 transition-all duration-200 cursor-pointer group"
                  >
                    <HiUpload className="w-4.5 h-4.5 text-[#F59E0B] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                    <span className="truncate">Upload Pitch</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openPostModal("text")}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#475569] hover:text-[#1B5E3F] hover:bg-[#1B5E3F]/10 transition-all duration-200 cursor-pointer group"
                >
                  <HiAnnotation className="w-4.5 h-4.5 text-[#1B5E3F] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="truncate">Thoughts</span>
                </button>
              </div>
            </div>

            {feedLoading ? (
              <FeedSkeleton count={3} />
            ) : filteredItems.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center shadow-sm my-4">
                <div className="w-12 h-12 rounded-full bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center mx-auto mb-3">
                  <HiSearch className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">
                  No results found
                </h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto font-medium">
                  Try searching for another startup, person, or pitch.
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                <AnimatePresence>
                  {filteredItems.map((item, idx) =>
                    item.kind === "pitch" ? (
                      <PitchFeedCard
                        key={item.id}
                        pitch={item.data}
                        boosted={item.boosted}
                        isFounder={isFounder}
                        userId={userId}
                        muted={muted}
                        onToggleMuted={() => setMutedPersistent(!muted)}
                        onChatBlocked={() => setPaywall(true)}
                      />
                    ) : (
                      <PostFeedCard
                        key={item.id}
                        post={item.data}
                        isFounder={isFounder}
                        userId={userId}
                        onChatBlocked={() => setPaywall(true)}
                      />
                    ),
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
          </div>
        )}

        {                              }
        {activeTab === "discover" && (
          <div className="space-y-5">
            <TrendingPitchesCard />
            <RecommendedStartupsCard />
            <ActiveFundingOpportunitiesCard />
            <UpcomingEventsCard />
          </div>
        )}

        {                           }
        {activeTab === "impact" && (
          <div className="space-y-5">
            <FundingImpactCard />
          </div>
        )}
      </div>

      <ProUpgradeModal
        open={paywall}
        onClose={() => setPaywall(false)}
        reason="free-quota-reached"
      />
    </DashboardShell>
  );
}

                                                    
function PitchFeedCard({
  pitch,
  boosted,
  isFounder,
  userId,
  muted,
  onToggleMuted,
  onChatBlocked,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(() => !!pitch.isLiked);
  const [saved, setSaved] = useState(() => !!pitch.isSaved);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [likeCount, setLikeCount] = useState(() =>
    typeof pitch.likeCount === "number"
      ? pitch.likeCount
      : Array.isArray(pitch.likes)
        ? pitch.likes.length
        : pitch.likes || 0,
  );
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const inViewRef = useRef(false);
  const viewLoggedRef = useRef(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [commentCount, setCommentCount] = useState(
    () => pitch.commentCount || pitch.comments || 0,
  );

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    if (pitch._id && /^[a-f0-9]{24}$/i.test(pitch._id)) {
      videoService
        .like(pitch._id)
        .then((res) => {
          const d = res?.data?.data;
          if (d && typeof d.totalLikes === "number") setLikeCount(d.totalLikes);
          if (d && typeof d.liked === "boolean") setLiked(d.liked);
        })
        .catch(() => {
          setLiked(!next);
          setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
        });
    }
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    if (pitch._id && /^[a-f0-9]{24}$/i.test(pitch._id)) {
      videoService.save(pitch._id).catch(() => setSaved(!next));
    }
  };

                                                                              
  const logViewOnce = () => {
    if (viewLoggedRef.current) return;
    const id = pitch._id;
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) return;                 
    viewLoggedRef.current = true;
    videoService.logView(id, {}).catch(() => {});
  };

                                                             
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

                                                                        
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const play = () => {
      const v = videoRef.current;
      if (!v) return;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    };

    const pause = () => {
      videoRef.current?.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
        inViewRef.current = visible;
        if (visible) {
          play();
          logViewOnce();
        } else pause();
      },
      { threshold: [0, 0.4, 0.8] },
    );
    observer.observe(node);

                     
    const onVis = () => {
      if (document.hidden) pause();
      else if (inViewRef.current) play();
    };
    document.addEventListener("visibilitychange", onVis);

    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      const v = videoRef.current;
      if (!v) return;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const isVisible = r.top < vh * 0.85 && r.bottom > vh * 0.15;
      if (isVisible) {
        inViewRef.current = true;
        v.play()
          .then(() => clearInterval(interval))
          .catch(() => {
            v.muted = true;
            v.play()
              .then(() => clearInterval(interval))
              .catch(() => {});
          });
      }
    }, 100);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(interval);
    };
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !pitch._id) return;
    const onEngagement = (data) => {
      if (data.videoId !== pitch._id) return;
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
      if (typeof data.commentCount === "number") setCommentCount(data.commentCount);
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket, pitch._id]);

  const founderObj = pitch.founderId || pitch.founder || {};

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {                }
      <div className="flex items-center gap-3 p-4">
        <Link
          to={founderObj._id ? `/app/u/${founderObj._id}` : "#"}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-[#7C3AED] text-white font-black text-sm flex items-center justify-center shrink-0 ring-2 ring-[#7C3AED]/20">
            {founderObj.avatar ? (
              <img
                src={founderObj.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (founderObj.name ? founderObj.name[0] : "T")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm inline-flex items-center gap-1.5 truncate text-[#0F172A]">
              <span>{founderObj.name || pitch.title}</span>
              {(founderObj.isVerified || pitch.isVerified) && (
                <MdVerified className="w-4 h-4 text-[#10B981] flex-shrink-0" />
              )}
            </p>
            <p className="text-xs text-[#64748B] font-medium truncate">
              {pitch.industry || "AI"} · {pitch.fundingStage || "Seed"} · 3h ago
            </p>
          </div>
        </Link>
        {founderObj._id && <FollowButton userId={founderObj._id} variant="outline" />}
      </div>

      {                         }
      <div className="px-4 pb-3">
        <h3 className="font-black text-base sm:text-lg text-[#0F172A] leading-snug">
          {pitch.title}
        </h3>
        <p className="text-sm text-[#334155] mt-1 line-clamp-3 leading-relaxed">
          {pitch.description}
        </p>
      </div>

      {                                                               }
      <Link
        to={`/app/pitch?pitch=${pitch._id}`}
        className="block relative bg-black rounded-xl overflow-hidden mx-4 group cursor-pointer"
      >
        <div className="relative w-full aspect-video overflow-hidden bg-black rounded-xl">
          <video
            ref={videoRef}
            src={pitch.videoUrl}
            poster={pitch.thumbnailUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {                                              }
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-[#0F172A] group-hover:scale-110 transition-transform duration-200">
              <HiPlay className="w-6 h-6 ml-0.5 text-[#0F172A]" />
            </div>
          </div>

          {                    }
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold rounded-md shadow-sm">
            {pitch.duration ? `${Math.floor(pitch.duration / 60)}:${String(pitch.duration % 60).padStart(2, "0")}` : "0:28"}
          </span>

          {                 }
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleMuted?.();
            }}
            className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-[#0F172A] flex items-center justify-center hover:bg-white shadow-md transition-colors cursor-pointer"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <HiVolumeOff className="w-4 h-4" />
            ) : (
              <HiVolumeUp className="w-4 h-4" />
            )}
          </button>

          {                       }
          {!isFounder && pitch.askAmount && (
            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white-force text-white text-xs font-bold rounded-full shadow-md inline-flex items-center gap-1" style={{ color: "#ffffff" }}>
              <HiCurrencyDollar className="w-3.5 h-3.5 text-[#F5B942] shrink-0" style={{ color: "#F5B942" }} />
              <span className="text-white-force text-white font-bold" style={{ color: "#ffffff" }}>
                {formatINR(pitch.askAmount)} · {pitch.equityOffered || 0}%
              </span>
            </span>
          )}
        </div>
      </Link>

      {                 }
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap border-t border-[#E2E8F0] mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            {liked ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5 text-[#64748B]" />
            )}
            <span>Like {likeCount > 0 ? likeCount : ""}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <HiChatAlt2 className="w-5 h-5 text-[#64748B]" />
            <span>Comment {commentCount > 0 ? commentCount : ""}</span>
          </button>

          <button
            onClick={toggleSave}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            {saved ? (
              <HiBookmark className="w-5 h-5 text-[#7C3AED]" />
            ) : (
              <HiOutlineBookmark className="w-5 h-5 text-[#64748B]" />
            )}
            <span>Save</span>
          </button>
        </div>

        {                                                              }
        {!isFounder && (
          <button
            onClick={() => setShowInvestModal(true)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer shadow-2xs ${
              interestSent
                ? "bg-purple-50 border-[#7C3AED] text-[#7C3AED]"
                : "border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF]"
            }`}
          >
            {interestSent ? "Interest Sent" : "Express Interest"}
          </button>
        )}
      </div>

      <CommentsPanel
        open={showComments}
        onClose={() => setShowComments(false)}
        videoId={pitch._id}
        totalCount={pitch.commentCount || pitch.comments}
        onCommentAdded={(newCount) =>
          setCommentCount((c) => (typeof newCount === "number" ? newCount : c + 1))
        }
        onCommentDeleted={(newCount) =>
          setCommentCount((c) =>
            typeof newCount === "number" ? newCount : Math.max(0, c - 1),
          )
        }
      />
      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        title={pitch.title}
        url={`${window.location.origin}/pitch/${pitch._id}`}
      />
      <InvestModal
        open={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        pitch={pitch}
        onSubmit={() => {
          setInterestSent(true);
          setShowInvestModal(false);
          toast?.success("Interest expressed — founder will be notified!");
        }}
      />
    </motion.article>
  );
}

                                                    
function PostFeedCard({ post, isFounder, userId, onChatBlocked }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(() => !!post.isLiked);
  const [saved, setSaved] = useState(() => !!post.isSaved);
  const [likeCount, setLikeCount] = useState(() =>
    typeof post.likeCount === "number"
      ? post.likeCount
      : Array.isArray(post.likes)
        ? post.likes.length
        : post.likes || 0,
  );
  const [imgIdx, setImgIdx] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [commentCount, setCommentCount] = useState(
    () => post.commentCount || 0,
  );

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    if (post._id && /^[a-f0-9]{24}$/i.test(post._id)) {
      postService
        .like(post._id)
        .then((res) => {
          const d = res?.data?.data;
          if (d && typeof d.count === "number") setLikeCount(d.count);
          if (d && typeof d.liked === "boolean") setLiked(d.liked);
        })
        .catch(() => {
          setLiked(!next);
          setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
        });
    }
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    if (post._id && /^[a-f0-9]{24}$/i.test(post._id)) {
      postService.save(post._id).catch(() => setSaved(!next));
    }
  };

  const captionLong = post.caption?.length > 220;
  const captionToShow =
    showFullCaption || !captionLong
      ? post.caption
      : `${post.caption.slice(0, 220)}…`;

  const totalImgs = post.images?.length || 0;

                                                                         
  const author =
    post.authorId && typeof post.authorId === "object"
      ? post.authorId
      : {
          _id: typeof post.authorId === "string" ? post.authorId : "",
          name: "Unknown",
          username: "unknown",
          avatar: "",
          companyName: "",
          isVerified: false,
        };

  const startChat = () => {
    const check = canStartChat({ withUserId: author._id });
    if (!check.allowed) {
      onChatBlocked();
      return;
    }
    chatService
      .startChat(author._id)
      .then((res) => {
        if (check.isFreeChat) consumeFreeChat();
        const chat = res?.data?.data?.chat || res?.data?.data;
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "";
        if (err?.response?.status === 403 && /upgrade|pro/i.test(msg)) {
          onChatBlocked();
        } else {
          toast?.error(msg || "Could not start chat");
        }
      });
  };

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !post._id) return;
    const onEngagement = (data) => {
      if (data.postId !== post._id) return;
                                                                                               
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
      if (typeof data.commentCount === "number") setCommentCount(data.commentCount);
                                                                                  
    };
    socket.on("post:engagement", onEngagement);
    return () => socket.off("post:engagement", onEngagement);
  }, [socket, post._id]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {                }
      <div className="flex items-center gap-3 p-4">
        <Link
          to={author._id ? `/app/u/${author._id}` : "#"}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity"
        >
          <img
            src={
              author.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || "U")}&background=7C3AED&color=fff`
            }
            alt=""
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#7C3AED]/20"
          />
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm inline-flex items-center gap-1.5 truncate text-[#0F172A]">
              <span>{author.name}</span>
              {author.isVerified && (
                <MdVerified className="w-4 h-4 text-[#10B981] flex-shrink-0" />
              )}
            </p>
            <p className="text-xs text-[#64748B] font-medium truncate">
              {author.companyName || "Founder"} · @{author.username || "user"}
            </p>
          </div>
        </Link>
        {author._id && <FollowButton userId={author._id} variant="outline" />}
      </div>

      {             }
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">
            {captionToShow}
          </p>
          {captionLong && !showFullCaption && (
            <button
              onClick={() => setShowFullCaption(true)}
              className="text-xs font-bold text-[#7C3AED] mt-1 hover:underline"
            >
              See more
            </button>
          )}
          {post.hashtags?.length > 0 && (
            <p className="mt-2 text-xs font-semibold text-[#7C3AED]">
              {post.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          )}
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] hover:underline truncate max-w-full"
            >
              <HiLink className="w-3.5 h-3.5" /> {post.link}
            </a>
          )}
        </div>
      )}

      {                    }
      {totalImgs > 0 && (
        <Link
          to={`/app/post/${post._id}`}
          className="block relative bg-black rounded-xl overflow-hidden mx-4"
          onClick={(e) => {
            if (e.target.closest("button")) e.preventDefault();
          }}
        >
          <div className="relative w-full aspect-video overflow-hidden bg-black rounded-xl">
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={imgIdx}
                src={post.images[imgIdx]}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {totalImgs > 1 && (
              <>
                {imgIdx > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImgIdx(imgIdx - 1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {imgIdx < totalImgs - 1 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImgIdx(imgIdx + 1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === imgIdx ? "w-6 bg-white" : "w-1.5 bg-white/55"
                      }`}
                    />
                  ))}
                </div>
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-md">
                  {imgIdx + 1} / {totalImgs}
                </span>
              </>
            )}
          </div>
        </Link>
      )}

      {             }
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap border-t border-[#E2E8F0] mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            {liked ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5 text-[#64748B]" />
            )}
            <span>Like {likeCount > 0 ? likeCount : ""}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <HiChatAlt2 className="w-5 h-5 text-[#64748B]" />
            <span>Comment {commentCount > 0 ? commentCount : ""}</span>
          </button>

          <button
            onClick={toggleSave}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            {saved ? (
              <HiBookmark className="w-5 h-5 text-[#7C3AED]" />
            ) : (
              <HiOutlineBookmark className="w-5 h-5 text-[#64748B]" />
            )}
            <span>Save</span>
          </button>
        </div>

        {!isFounder && (
          <button
            onClick={startChat}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold border border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
          >
            <HiChatAlt2 className="w-3.5 h-3.5" /> Message
          </button>
        )}
      </div>

      {           }
      <div className="px-4 pb-4 text-xs text-[#0A1F14]/65 font-semibold">
        {likeCount.toLocaleString()} likes ·{" "}
        <button
          onClick={() => setShowComments(true)}
          className="hover:underline"
        >
          {commentCount} comments
        </button>
      </div>

      <CommentsPanel
        open={showComments}
        onClose={() => setShowComments(false)}
        postId={post._id}
        totalCount={post.commentCount || post.comments}
        onCommentAdded={(newCount) =>
          setCommentCount((c) => (typeof newCount === "number" ? newCount : c + 1))
        }
        onCommentDeleted={(newCount) =>
          setCommentCount((c) =>
            typeof newCount === "number" ? newCount : Math.max(0, c - 1),
          )
        }
      />
      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        title={post.caption?.slice(0, 80) || "Check out this post"}
        url={`${window.location.origin}/app/post/${post._id}`}
      />
    </motion.article>
  );
}

function ActionBtn({
  active,
  onClick,
  iconOff: IconOff,
  iconOn: IconOn,
  activeColor,
}) {
  const Icon = active && IconOn ? IconOn : IconOff;
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors cursor-pointer ${
        active
          ? activeColor
          : "text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F3E8FF]"
      }`}
    >
      <Icon className="w-5 h-5 current-color" />
    </button>
  );
}

function InvestModal({ open, onClose, pitch, onSubmit }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = Number(amount) > 0;

  if (!pitch) return null;

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await investmentService.expressInterest({
        videoId: pitch._id,
        amount: Number(amount),
        equity: pitch.equityOffered || 0,
        terms: terms.trim(),
      });
      setSent(true);
      onSubmit?.();
    } catch (err) {
      setSent(true);
      onSubmit?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { setSent(false); onClose(); }} title={sent ? "Interest Sent!" : `Express Interest in ${pitch.title || "Startup"}`}>
      {sent ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
            <MdVerified className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Interest Sent to Founder</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Your investment proposal has been shared with the founder. You can now proceed to the full investment flow.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/app/invest?startup=${pitch._id}`);
              }}
              className="invest-now-btn w-full py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white-force font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HiCurrencyDollar className="w-4.5 h-4.5 text-[#F5B942]" />
              <span className="text-white-force" style={{ color: "#ffffff" }}>Proceed to Invest Now →</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (pitch.founderId?._id) navigate(`/app/u/${pitch.founderId._id}`);
              }}
              className="w-full py-2.5 border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] font-bold text-xs rounded-xl cursor-pointer"
            >
              View Startup Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          <p className="text-xs sm:text-sm text-[#475569]">
            Founder is asking{" "}
            <span className="font-extrabold text-[#1B5E3F]">
              {formatINR(pitch.askAmount)}
            </span>{" "}
            for {pitch.equityOffered || 0}% equity.
          </p>

          <div>
            <label className="block text-xs font-extrabold mb-1.5 text-[#0F172A]">
              Proposed Investment Amount (INR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500000"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1B5E3F] focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1.5 text-[#0F172A]">
              Notes / Terms (Optional)
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              placeholder="e.g. Excited about your vision! Let's schedule a call to discuss."
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1B5E3F] focus:ring-2 focus:ring-[#1B5E3F]/20 focus:outline-none resize-none font-medium"
            />
          </div>

          <button
            disabled={!valid || submitting}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              valid && !submitting
                ? "bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white shadow-[#1B5E3F]/25"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? "Sending Interest..." : "Send Interest"}
          </button>
        </div>
      )}
    </Modal>
  );
}


