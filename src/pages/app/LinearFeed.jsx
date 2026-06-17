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
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowButton from "../../components/monetization/FollowButton";
import ProUpgradeModal from "../../components/monetization/ProUpgradeModal";
import { useToast } from "../../components/ui/Toast";
import { videoService } from "../../services/videoService";
import {
  MOCK_PITCHES,
  MOCK_POSTS,
  MOCK_BOOSTS,
  CURRENT_USER,
  formatINR,
} from "../../constants/mockData";
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

  const [paywall, setPaywall] = useState(false);
  const [realPitches, setRealPitches] = useState(null);

  // Fetch real pitches on mount; fall back to mock data if API fails
  useEffect(() => {
    videoService
      .getFeed({ limit: 20 })
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data;
        if (videos?.length > 0) setRealPitches(videos);
      })
      .catch(() => {});
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
    const ownId = isFounder ? "f_1" : null;
    const pitchSource = realPitches || MOCK_PITCHES;

    const boostedPitchIds = new Set(
      MOCK_BOOSTS.filter((b) => b.status === "active").map((b) => b.pitchId),
    );

    const pitchEntries = pitchSource
      .filter((p) => {
        const fId = p.founderId?._id || p.founderId;
        return fId !== ownId;
      })
      .map((p) => ({
        kind: "pitch",
        id: p._id,
        ts: new Date(p.createdAt).getTime(),
        boosted: boostedPitchIds.has(p._id),
        data: p,
      }));

    const postEntries = MOCK_POSTS.filter((p) => p.authorId._id !== ownId).map(
      (p) => ({
        kind: "post",
        id: p._id,
        ts: new Date(p.createdAt).getTime(),
        boosted: false,
        data: p,
      }),
    );

    const merged = [...pitchEntries, ...postEntries].sort((a, b) => {
      // Boosted always first
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      // Then most recent
      return b.ts - a.ts;
    });

    return merged;
  }, [isFounder, realPitches]);

  return (
    <DashboardShell>
      <div className="max-w-[520px] mx-auto">
        {/* Composer for founders */}
        {isFounder && (
          <Link
            to="/app/post/new"
            className="block mb-5 bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 hover:border-[#1B5E3F]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={CURRENT_USER.avatar}
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

        <div className="space-y-5 sm:space-y-6">
          <AnimatePresence>
            {items.map((item, idx) =>
              item.kind === "pitch" ? (
                <PitchFeedCard
                  key={item.id}
                  pitch={item.data}
                  boosted={item.boosted}
                  isFounder={isFounder}
                  muted={muted}
                  onToggleMuted={() => setMutedPersistent(!muted)}
                  onChatBlocked={() => setPaywall(true)}
                />
              ) : (
                <PostFeedCard
                  key={item.id}
                  post={item.data}
                  isFounder={isFounder}
                  onChatBlocked={() => setPaywall(true)}
                />
              ),
            )}
          </AnimatePresence>
        </div>
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
  muted,
  onToggleMuted,
  onChatBlocked,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const inViewRef = useRef(false);

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
        if (visible) play();
        else pause();
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
    if (check.isFreeChat) consumeFreeChat();
    toast?.success(`Chat opened with ${pitch.founderId.name}`);
    navigate("/app/messages");
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
        <img
          src={pitch.founderId.avatar}
          alt=""
          className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm inline-flex items-center gap-1 truncate">
            {pitch.founderId.name}
            {pitch.founderId.isVerified && (
              <MdVerified className="w-4 h-4 text-[#F5B942] flex-shrink-0" />
            )}
          </p>
          <p className="text-xs text-[#0A1F14]/55 truncate">
            {pitch.founderId.companyName} · {pitch.industry}
          </p>
        </div>
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
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ActionBtn
            active={liked}
            onClick={() => setLiked((v) => !v)}
            iconOff={HiOutlineHeart}
            iconOn={HiHeart}
            activeColor="text-red-500"
          />
          <ActionBtn
            active={saved}
            onClick={() => setSaved((v) => !v)}
            iconOff={HiOutlineBookmark}
            iconOn={HiBookmark}
            activeColor="text-[#1B5E3F]"
          />
          <ActionBtn iconOff={HiShare} />
        </div>
        <button
          onClick={startChat}
          className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/20 inline-flex items-center gap-1.5 transition-all"
        >
          <HiChatAlt2 className="w-3.5 h-3.5" /> Message
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 text-xs text-[#0A1F14]/65 font-semibold">
        {(pitch.likes.length + (liked ? 1 : 0)).toLocaleString()} likes ·{" "}
        {pitch.comments} comments · {pitch.views.toLocaleString()} views
      </div>
    </motion.article>
  );
}

// ─── POST CARD ───────────────────────────────────
function PostFeedCard({ post, isFounder, onChatBlocked }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const captionLong = post.caption?.length > 220;
  const captionToShow =
    showFullCaption || !captionLong
      ? post.caption
      : `${post.caption.slice(0, 220)}…`;

  const totalImgs = post.images?.length || 0;

  const startChat = () => {
    const check = canStartChat({ withUserId: post.authorId._id });
    if (!check.allowed) {
      onChatBlocked();
      return;
    }
    if (check.isFreeChat) consumeFreeChat();
    toast?.success(`Chat opened with ${post.authorId.name}`);
    navigate("/app/messages");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={post.authorId.avatar}
          alt=""
          className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm inline-flex items-center gap-1 truncate">
            {post.authorId.name}
            {post.authorId.isVerified && (
              <MdVerified className="w-4 h-4 text-[#F5B942] flex-shrink-0" />
            )}
          </p>
          <p className="text-xs text-[#0A1F14]/55 truncate">
            {post.authorId.companyName} · @{post.authorId.username}
          </p>
        </div>
        <FollowButton userId={post.authorId._id} variant="outline" />
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
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ActionBtn
            active={liked}
            onClick={() => setLiked((v) => !v)}
            iconOff={HiOutlineHeart}
            iconOn={HiHeart}
            activeColor="text-red-500"
          />
          <Link to={`/app/post/${post._id}`}>
            <ActionBtn iconOff={HiChatAlt2} />
          </Link>
          <ActionBtn iconOff={HiShare} />
          <ActionBtn
            active={saved}
            onClick={() => setSaved((v) => !v)}
            iconOff={HiOutlineBookmark}
            iconOn={HiBookmark}
            activeColor="text-[#1B5E3F]"
          />
        </div>
        <button
          onClick={startChat}
          className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md shadow-[#1B5E3F]/20 inline-flex items-center gap-1.5 transition-all"
        >
          <HiChatAlt2 className="w-3.5 h-3.5" /> Message
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 text-xs text-[#0A1F14]/65 font-semibold">
        {(post.likes + (liked ? 1 : 0)).toLocaleString()} likes ·{" "}
        {post.commentCount} comments
      </div>
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
          : "text-[#0A1F14]/65 hover:text-[#0F4A2E] hover:bg-[#FAFAF7]"
      }`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
