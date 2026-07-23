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
  HiSparkles,
  HiChevronLeft,
  HiChevronRight,
  HiVolumeUp,
  HiVolumeOff,
  HiX,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowButton from "../../components/monetization/FollowButton";
import ProUpgradeModal from "../../components/monetization/ProUpgradeModal";
import CommentsPanel from "../../components/dashboard/CommentsPanel";
import { useToast } from "../../components/ui/Toast";
import { FeedSkeleton } from "../../components/ui/PageLoader";
import { useAuth } from "../../context/AuthContext";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";
import { chatService } from "../../services/chatService";
import { MOCK_PITCHES, ALL_MOCK_PITCHES, MOCK_POSTS, formatINR } from "../../constants/mockData";
import { canStartChat, consumeFreeChat, getRole } from "../../lib/auth";

/**
 * LinkedIn / Instagram-style linear feed.
 * Mixes pitch cards and post cards into one chronological timeline.
 * Boosted pitches are pinned to the top.
 *
 * Used by both investors and founders. Founders skip their own content
 * (mocked as f_1) and don't see the "Express Interest" pill on pitches.
 */
export default function LinearFeed() {
  const role = getRole() || "investor";
  const isFounder = role === "founder";
  const { user } = useAuth();
  const userId = user?._id;

  const [paywall, setPaywall] = useState(false);
  const [realPitches, setRealPitches] = useState(null);
  const [realPosts, setRealPosts] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);

  // Fetch real pitches + posts on mount; fall back to mock data if API fails
  useEffect(() => {
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
  }, []);

  // Disable browser scroll-restoration so refresh always lands at the top
  // of the feed (Instagram/TikTok behaviour).
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

  // Shared mute state across all feed videos.
  // ALWAYS start muted on page load (browser autoplay policy requires it).
  // User can unmute by clicking — that persists until next page load.
  // Instagram does the same: videos always start muted on refresh.
  const [muted, setMuted] = useState(true);
  const setMutedPersistent = (next) => {
    setMuted(next);
  };

  const items = useMemo(() => {
    // Use actual logged-in user's ID (not hardcoded f_1)
    // Only filter out own content if user is a real logged-in founder with a known ID
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
      // Boosted always first
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      // Then most recent
      return b.ts - a.ts;
    });

    // Deduplicate by item ID to guarantee no duplicate cards
    const seen = new Set();
    return merged.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [isFounder, userId, realPitches, realPosts]);

  return (
    <DashboardShell>
      <div className="w-full max-w-[520px] mx-auto">
        {/* Composer for founders */}
        {isFounder && (
          <Link
            to="/app/post/new"
            className="block mb-5 bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 hover:border-[#1B5E3F]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff`
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
              />
              <span className="flex-1 text-sm text-[#0A1F14]/55">
                Share an update, lesson or photo…
              </span>
              <span className="px-3 py-1.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-xs font-bold rounded-full">
                Post
              </span>
            </div>
          </Link>
        )}

        {feedLoading ? (
          <FeedSkeleton count={3} />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <AnimatePresence>
              {items.map((item, idx) =>
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
      </div>

      <ProUpgradeModal
        open={paywall}
        onClose={() => setPaywall(false)}
        reason="free-quota-reached"
      />
    </DashboardShell>
  );
}

// ─── PITCH CARD ──────────────────────────────────
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

  // Log a view once when this pitch first comes into view (real pitches only)
  const logViewOnce = () => {
    if (viewLoggedRef.current) return;
    const id = pitch._id;
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) return; // skip mock ids
    viewLoggedRef.current = true;
    videoService.logView(id, {}).catch(() => {});
  };

  // Sync muted DOM property (React doesn't do this reliably)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // Single stable effect for IntersectionObserver — no deps that change
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const play = () => {
      const v = videoRef.current;
      if (!v) return;
      // Use current muted state from the DOM (already synced by the effect above)
      v.play().catch(() => {
        // If play fails (autoplay blocked), force mute and retry once
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

    // Tab visibility
    const onVis = () => {
      if (document.hidden) pause();
      else if (inViewRef.current) play();
    };
    document.addEventListener("visibilitychange", onVis);

    // Force initial play — covers hard refresh where card is already visible
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
            // Force mute and retry (autoplay policy)
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

  const startChat = () => {
    const check = canStartChat({ withUserId: pitch.founderId._id });
    if (!check.allowed) {
      onChatBlocked();
      return;
    }
    chatService
      .startChat(pitch.founderId._id)
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

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 p-4">
        <Link
          to={`/app/u/${pitch.founderId._id}`}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity"
        >
          <img
            src={pitch.founderId.avatar}
            alt=""
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm inline-flex items-center gap-1 truncate text-[#0A1F14]">
              {pitch.founderId.name}
              {pitch.founderId.isVerified && (
                <MdVerified className="w-4 h-4 text-[#F5B942] flex-shrink-0" />
              )}
            </p>
            <p className="text-xs text-[#0A1F14]/55 truncate">
              {pitch.founderId.companyName} · {pitch.industry}
            </p>
          </div>
        </Link>
        <FollowButton userId={pitch.founderId._id} variant="outline" />
      </div>

      {/* Boosted ribbon */}
      {boosted && (
        <div className="px-4 -mt-1 pb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#F5B942]">
          <HiSparkles className="w-3.5 h-3.5" />
          Boosted pitch · matches your interests
        </div>
      )}

      {/* Title + description */}
      <div className="px-4 pb-3">
        <h3 className="font-black text-lg text-[#0A1F14] leading-snug">
          {pitch.title}
        </h3>
        <p className="text-sm text-[#0A1F14]/75 mt-1 line-clamp-3">
          {pitch.description}
        </p>
      </div>

      {/* Auto-playing video preview — Instagram-style portrait stage */}
      <Link
        to={`/app/pitch?pitch=${pitch._id}`}
        className="block relative bg-black"
      >
        <div
          className="relative w-full mx-auto"
          style={{ aspectRatio: "5 / 7", maxHeight: "min(85vh, 760px)" }}
        >
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
          {/* Subtle gradient for legibility of overlays */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

          {/* Duration */}
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/55 text-white text-xs font-bold rounded backdrop-blur-sm">
            {Math.floor(pitch.duration / 60)}:
            {String(pitch.duration % 60).padStart(2, "0")}
          </span>

          {/* Mute toggle — synced across all feed videos */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleMuted?.();
            }}
            className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-[#0F4A2E] flex items-center justify-center hover:bg-white shadow-md transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <HiVolumeOff className="w-4 h-4" />
            ) : (
              <HiVolumeUp className="w-4 h-4" />
            )}
          </button>

          {/* Ask + equity pill (investor only) */}
          {!isFounder && (
            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#F5B942] text-[#0F4A2E] text-xs font-black rounded-full shadow-md inline-flex items-center gap-1">
              <HiCurrencyDollar className="w-3.5 h-3.5" />
              {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
            </span>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <ActionBtn
            active={liked}
            onClick={toggleLike}
            iconOff={HiOutlineHeart}
            iconOn={HiHeart}
            activeColor="text-red-500"
          />
          <ActionBtn
            iconOff={HiChatAlt2}
            onClick={() => setShowComments(true)}
          />
          <ActionBtn iconOff={HiShare} onClick={() => setShowShare(true)} />
          <ActionBtn
            active={saved}
            onClick={toggleSave}
            iconOff={HiOutlineBookmark}
            iconOn={HiBookmark}
            activeColor="text-[#1B5E3F]"
          />
        </div>
        {!isFounder && (
          <button
            onClick={startChat}
            className="btn-message px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/20 inline-flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <HiChatAlt2 className="w-3.5 h-3.5" /> Message
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 text-xs text-[#0A1F14]/65 font-semibold">
        {likeCount.toLocaleString()} likes ·{" "}
        <button
          onClick={() => setShowComments(true)}
          className="hover:underline"
        >
          {commentCount} comments
        </button>{" "}
        · {(pitch.views || 0).toLocaleString()} views
      </div>

      <CommentsPanel
        open={showComments}
        onClose={() => setShowComments(false)}
        videoId={pitch._id}
        totalCount={pitch.commentCount || pitch.comments}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        title={pitch.title}
        url={`${window.location.origin}/pitch/${pitch._id}`}
      />
    </motion.article>
  );
}

// ─── POST CARD ───────────────────────────────────
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

  // Safe author object — authorId may be null (deleted user) or a string
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/40 transition-shadow"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 p-4">
        <Link
          to={author._id ? `/app/u/${author._id}` : "#"}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity"
        >
          <img
            src={
              author.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=1B5E3F&color=fff`
            }
            alt=""
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm inline-flex items-center gap-1 truncate text-[#0A1F14]">
              {author.name}
              {author.isVerified && (
                <MdVerified className="w-4 h-4 text-[#F5B942] flex-shrink-0" />
              )}
            </p>
            <p className="text-xs text-[#0A1F14]/55 truncate">
              {author.companyName} · @{author.username}
            </p>
          </div>
        </Link>
        {author._id && <FollowButton userId={author._id} variant="outline" />}
      </div>

      {/* Caption (LinkedIn-style, before images) */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-[#0A1F14]/85 whitespace-pre-wrap leading-relaxed">
            {captionToShow}
          </p>
          {captionLong && !showFullCaption && (
            <button
              onClick={() => setShowFullCaption(true)}
              className="text-xs font-bold text-[#1B5E3F] mt-1"
            >
              See more
            </button>
          )}
          {post.hashtags?.length > 0 && (
            <p className="mt-2 text-xs font-semibold text-[#1B5E3F]">
              {post.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          )}
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1B5E3F] truncate max-w-full"
            >
              <HiLink className="w-3.5 h-3.5" /> {post.link}
            </a>
          )}
        </div>
      )}

      {/* Image carousel */}
      {totalImgs > 0 && (
        <Link
          to={`/app/post/${post._id}`}
          className="block relative bg-black"
          onClick={(e) => {
            // Stop propagation if user clicks the carousel arrows
            if (e.target.closest("button")) e.preventDefault();
          }}
        >
          <div className="relative aspect-square overflow-hidden">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F4A2E] flex items-center justify-center shadow-lg"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F4A2E] flex items-center justify-center shadow-lg"
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
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/55 text-white text-[10px] font-bold rounded">
                  {imgIdx + 1} / {totalImgs}
                </span>
              </>
            )}
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <ActionBtn
            active={liked}
            onClick={toggleLike}
            iconOff={HiOutlineHeart}
            iconOn={HiHeart}
            activeColor="text-red-500"
          />
          <ActionBtn
            iconOff={HiChatAlt2}
            onClick={() => setShowComments(true)}
          />
          <ActionBtn iconOff={HiShare} onClick={() => setShowShare(true)} />
          <ActionBtn
            active={saved}
            onClick={toggleSave}
            iconOff={HiOutlineBookmark}
            iconOn={HiBookmark}
            activeColor="text-[#1B5E3F]"
          />
        </div>
        {!isFounder && (
          <button
            onClick={startChat}
            className="btn-message px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/20 inline-flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <HiChatAlt2 className="w-3.5 h-3.5" /> Message
          </button>
        )}
      </div>

      {/* Stats */}
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
        onCommentAdded={() => setCommentCount((c) => c + 1)}
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
      className={`p-2 rounded-full transition-colors ${
        active
          ? activeColor
          : "text-[#0A1F14]/70 hover:text-[#0F4A2E] hover:bg-[#F0F5F2]"
      }`}
    >
      <Icon className="w-6 h-6 current-color" />
    </button>
  );
}

// ─── Instagram-style share sheet (bottom drawer on mobile, centered on desktop)
function ShareSheet({ open, onClose, title, url }) {
  const toast = useToast();
  if (!open) return null;

  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success("Link copied");
    onClose();
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator
        .share({ title, url })
        .then(() => onClose())
        .catch(() => {});
    } else {
      copy();
    }
  };

  const links = {
    WhatsApp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    Telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    Email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[80] flex items-end md:items-center justify-center"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0A1F14]">Share</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-xl p-3 mb-4 flex items-center gap-2">
            <span className="text-xs text-[#0A1F14]/65 truncate flex-1">
              {url}
            </span>
            <button
              onClick={copy}
              className="px-3 py-1.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white rounded-lg text-xs font-bold flex-shrink-0"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(links).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="px-3 py-2.5 bg-[#FAFAF7] border border-[#1B5E3F]/12 hover:border-[#1B5E3F]/35 rounded-xl text-xs font-semibold text-center text-[#0A1F14] transition-colors"
              >
                {label}
              </a>
            ))}
            <button
              onClick={nativeShare}
              className="px-3 py-2.5 bg-[#FAFAF7] border border-[#1B5E3F]/12 hover:border-[#1B5E3F]/35 rounded-xl text-xs font-semibold text-[#0A1F14] transition-colors"
            >
              More…
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
