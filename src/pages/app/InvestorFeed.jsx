import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiVolumeUp,
  HiVolumeOff,
  HiX,
  HiCurrencyDollar,
  HiShare,
  HiFlag,
  HiCheck,
  HiDotsVertical,
  HiInformationCircle,
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

import FeedShell from "../../components/dashboard/FeedShell";
import ShortsPlayer from "../../components/dashboard/ShortsPlayer";
import FeedHint from "../../components/dashboard/FeedHint";
import FounderProfileModal from "../../components/dashboard/FounderProfileModal";
import CommentsPanel from "../../components/dashboard/CommentsPanel";
import Modal from "../../components/ui/Modal";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { videoService } from "../../services/videoService";
import { investmentService } from "../../services/investmentService";
import { reportService } from "../../services/reportService";
import { MOCK_PITCHES, ALL_MOCK_PITCHES, formatINR } from "../../constants/mockData";
import {
  isFollowing,
  follow as followUser,
  unfollow as unfollowUser,
} from "../../lib/auth";

export default function InvestorFeed() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?._id;

  // Tracks the active pitch ID across array replacements.
  // Initialised from the URL param so the correct pitch is shown on first render.
  const activePitchRef = useRef(
    new URLSearchParams(window.location.search).get("pitch") || null,
  );

  const [pitches, setPitches] = useState(ALL_MOCK_PITCHES);
  const [feedLoaded, setFeedLoaded] = useState(false);

  const [idx, setIdx] = useState(() => {
    const id = activePitchRef.current;
    if (id) {
      const i = ALL_MOCK_PITCHES.findIndex((p) => p._id === id);
      if (i >= 0) return i;
    }
    return 0;
  });

  const { socket } = useSocket();

  // Socket sync for pitch engagement (commentCount, likes, saves)
  useEffect(() => {
    if (!socket) return;
    const onEngagement = (data) => {
      if (data.videoId && typeof data.commentCount === "number") {
        setPitches((prev) =>
          prev.map((p) =>
            p._id === data.videoId ? { ...p, commentCount: data.commentCount } : p
          )
        );
      }
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket]);

  // Fetch real feed on mount. After the array is replaced we re-anchor idx by
  // pitch ID so the active pitch never changes unexpectedly.
  useEffect(() => {
    videoService
      .getFeed({ limit: 20 })
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data;
        if (videos?.length > 0) {
          const merged = [...videos];
          ALL_MOCK_PITCHES.forEach((mp) => {
            if (!merged.some((v) => v._id === mp._id)) merged.push(mp);
          });

          // Re-anchor idx to keep the same pitch visible after array is replaced
          const activeId = activePitchRef.current;
          const newIdx = activeId
            ? Math.max(0, merged.findIndex((p) => p._id === activeId))
            : 0;

          setPitches(merged);
          setIdx(newIdx);
          setFeedLoaded(true);

          const likedInit = {};
          const savedInit = {};
          videos.forEach((v) => {
            if (v.isLiked) likedInit[v._id] = true;
            if (v.isSaved) savedInit[v._id] = true;
          });
          // MERGE — don't replace — so any toggles the user made while the
          // feed was loading are preserved, not wiped.
          setLiked((prev) => ({ ...likedInit, ...prev }));
          setSaved((prev) => ({ ...savedInit, ...prev }));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember user's mute choice across sessions — Instagram does this too.
  // First-time users still start muted (browser autoplay policy requires it),
  // but a returning user who unmuted previously gets sound right away.
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("expglo:feedMuted");
    return saved === null ? true : saved === "1";
  });
  useEffect(() => {
    try {
      localStorage.setItem("expglo:feedMuted", muted ? "1" : "0");
    } catch {}
  }, [muted]);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [following, setFollowing] = useState({});
  const [localCommentCount, setLocalCommentCount] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const [direction, setDirection] = useState("down"); // 'up' | 'down' for slide animation

  // React to URL ?pitch=<id> — fires when navigating here from a profile card.
  // Finds the pitch, jumps to it, then strips the param so normal scrolling works.
  useEffect(() => {
    const param = searchParams.get("pitch");
    if (!param) return;

    activePitchRef.current = param;

    // Strip the param immediately so scrolling isn't locked to this pitch
    const next = new URLSearchParams(searchParams);
    next.delete("pitch");
    setSearchParams(next, { replace: true });

    const found = pitches.findIndex((p) => p._id === param);
    if (found >= 0) {
      setDirection(found > idx ? "down" : "up");
      setIdx(found);
      setExpanded(false);
    } else {
      // Pitch not in current list — add it
      const mockMatch = ALL_MOCK_PITCHES.find((p) => p._id === param);
      if (mockMatch) {
        setPitches((prev) => {
          const existing = prev.findIndex((p) => p._id === mockMatch._id);
          if (existing >= 0) {
            setDirection(existing > idx ? "down" : "up");
            setIdx(existing);
            return prev;
          }
          const next2 = [...prev, mockMatch];
          setIdx(next2.length - 1);
          return next2;
        });
        setExpanded(false);
      } else if (/^[a-f0-9]{24}$/i.test(param)) {
        videoService
          .getById(param)
          .then((res) => {
            const video = res?.data?.data;
            if (!video) return;
            setPitches((prev) => {
              const existing = prev.findIndex((p) => p._id === video._id);
              if (existing >= 0) {
                setIdx(existing);
                return prev;
              }
              const next2 = [...prev, video];
              setIdx(next2.length - 1);
              return next2;
            });
            setExpanded(false);
          })
          .catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pitch = pitches[idx];

  // Update activePitchRef whenever active pitch changes (only after feed has loaded)
  useEffect(() => {
    if (feedLoaded && pitch?._id) {
      activePitchRef.current = pitch._id;
    }
  }, [pitch?._id, feedLoaded]);

  // Log a view when a pitch becomes active (once per pitch per session).
  // Fires after 1.5s on the pitch so quick scroll-throughs don't count.
  const viewedRef = useRef(new Set());
  useEffect(() => {
    if (!pitch?._id) return;
    const isRealId = /^[a-f0-9]{24}$/i.test(pitch._id);
    if (!isRealId || viewedRef.current.has(pitch._id)) return;

    const timer = setTimeout(() => {
      viewedRef.current.add(pitch._id);
      videoService.logView(pitch._id, {}).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [pitch?._id]);

  const next = () => {
    if (idx < pitches.length - 1) {
      setDirection("down");
      setIdx(idx + 1);
      setExpanded(false);
    }
  };
  const prev = () => {
    if (idx > 0) {
      setDirection("up");
      setIdx(idx - 1);
      setExpanded(false);
    }
  };

  const jumpToPitch = (pitchObj) => {
    if (!pitchObj?._id) return;
    activePitchRef.current = pitchObj._id;
    let i = pitches.findIndex((p) => p._id === pitchObj._id);
    if (i < 0) {
      setPitches((prev) => {
        const nextPitches = [...prev, pitchObj];
        setIdx(nextPitches.length - 1);
        return nextPitches;
      });
      setDirection("down");
    } else {
      setDirection(i > idx ? "down" : "up");
      setIdx(i);
    }
    setExpanded(false);
    setActiveModal(null);
  };
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target?.tagName === "INPUT" ||
        e.target?.tagName === "TEXTAREA" ||
        activeModal
      )
        return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "m" || e.key === "M") setMuted((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, [idx, activeModal]);

  // Wheel scroll navigation (desktop) — Instagram-style sensitivity handling.
  //
  // Three layers of defense against trackpad inertia chaining multiple navigations:
  //   1. Hard lock for 700ms after a navigation — totally ignore wheel events.
  //   2. Accumulate deltaY across events; only commit when total swipe exceeds 50px.
  //   3. Reset accumulator after 200ms of no wheel events (lifted fingers).
  useEffect(() => {
    const el = document.getElementById("shorts-feed-container");
    if (!el) return;

    let hardLock = false; // true during animation + cooldown
    let accDelta = 0; // accumulated deltaY for current gesture
    let lastEventAt = 0; // timestamp of last wheel event
    let silenceTimer = null;

    const navigate = (dir) => {
      hardLock = true;
      accDelta = 0;
      if (dir > 0) next();
      else prev();
      // Cooldown long enough to swallow any trackpad inertia tail
      setTimeout(() => {
        hardLock = false;
        accDelta = 0;
      }, 700);
    };

    const onWheel = (e) => {
      if (activeModal || hardLock) return;
      const now = Date.now();

      // If user paused (lifted fingers), reset the accumulator
      if (now - lastEventAt > 200) accDelta = 0;
      lastEventAt = now;

      accDelta += e.deltaY;

      // Need 50px of accumulated swipe to commit to a navigation
      if (Math.abs(accDelta) >= 50) {
        navigate(accDelta);
        return;
      }

      // Reset accumulator if user stops scrolling
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        accDelta = 0;
      }, 120);
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(silenceTimer);
    };
    // eslint-disable-next-line
  }, [idx, activeModal]);

  // Touch swipe navigation (mobile) — also prevents pull-to-refresh
  useEffect(() => {
    const el = document.getElementById("shorts-feed-container");
    if (!el) return;
    let startY = 0;
    let lock = false;
    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      // Block native vertical scroll so the browser never triggers
      // pull-to-refresh or rubber-band bounce on this surface.
      e.preventDefault();
    };
    const onTouchEnd = (e) => {
      if (lock || activeModal) return;
      const dy = (e.changedTouches[0]?.clientY || 0) - startY;
      if (Math.abs(dy) < 50) return;
      lock = true;
      if (dy < 0) next();
      else prev();
      setTimeout(() => (lock = false), 600);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line
  }, [idx, activeModal]);

  const isPitchLiked = (p) => {
    if (!p?._id) return false;
    if (liked[p._id] !== undefined) return liked[p._id];
    if (p.isLiked !== undefined) return p.isLiked;
    if (Array.isArray(p.likes) && userId) {
      return p.likes.some((id) => (id._id || id).toString() === userId.toString());
    }
    return false;
  };

  const isPitchSaved = (p) => {
    if (!p?._id) return false;
    if (saved[p._id] !== undefined) return saved[p._id];
    if (p.isSaved !== undefined) return p.isSaved;
    if (Array.isArray(p.saves) && userId) {
      return p.saves.some((id) => (id._id || id).toString() === userId.toString());
    }
    return false;
  };

  const toggleLike = () => {
    if (!pitch?._id) return;
    const id = pitch._id;
    const wasLiked = isPitchLiked(pitch);
    const nextLiked = !wasLiked;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));

    // Update both the dictionary AND the pitch object in the array
    setLiked((prev) => ({ ...prev, [id]: nextLiked }));
    setPitches((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isLiked: nextLiked } : p)),
    );

    if (isRealMongoId) {
      videoService
        .like(id)
        .then((res) => {
          const data = res?.data?.data ?? res?.data;
          if (data && typeof data.liked === "boolean") {
            setLiked((prev) => ({ ...prev, [id]: data.liked }));
            setPitches((prev) =>
              prev.map((p) =>
                p._id === id ? { ...p, isLiked: data.liked } : p,
              ),
            );
          }
        })
        .catch(() => {
          setLiked((prev) => ({ ...prev, [id]: wasLiked }));
          setPitches((prev) =>
            prev.map((p) => (p._id === id ? { ...p, isLiked: wasLiked } : p)),
          );
          toast.error("Failed to update like status");
        });
    }
  };

  // Double-tap on the video — Instagram only LIKES (never unlikes) on double-tap
  const doubleTapLike = () => {
    if (!pitch?._id) return;
    const id = pitch._id;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));
    if (!isPitchLiked(pitch)) {
      setLiked((prev) => ({ ...prev, [id]: true }));
      setPitches((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isLiked: true } : p)),
      );
      if (isRealMongoId) {
        videoService.like(id).catch(() => {});
      }
    }
  };

  const toggleSave = () => {
    if (!pitch?._id) return;
    const id = pitch._id;
    const wasSaved = isPitchSaved(pitch);
    const nextSaved = !wasSaved;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));

    // Update both the dictionary AND the pitch object in the array so
    // isPitchSaved() always returns the right value even after scrolling away
    setSaved((prev) => ({ ...prev, [id]: nextSaved }));
    setPitches((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              isSaved: nextSaved,
              saveCount: nextSaved
                ? (p.saveCount || 0) + 1
                : Math.max(0, (p.saveCount || 0) - 1),
            }
          : p,
      ),
    );

    if (isRealMongoId) {
      videoService
        .save(id)
        .then((res) => {
          const data = res?.data?.data ?? res?.data;
          const confirmedSaved =
            data && typeof data.saved === "boolean" ? data.saved : nextSaved;
          const confirmedCount =
            data && typeof data.totalSaves === "number"
              ? data.totalSaves
              : null;

          setSaved((prev) => ({ ...prev, [id]: confirmedSaved }));
          setPitches((prev) =>
            prev.map((p) =>
              p._id === id
                ? {
                    ...p,
                    isSaved: confirmedSaved,
                    saveCount:
                      confirmedCount !== null ? confirmedCount : p.saveCount,
                  }
                : p,
            ),
          );

          if (confirmedSaved) {
            toast.success("Saved to bookmarks");
          } else {
            toast.info("Removed from saved pitches");
          }
        })
        .catch(() => {
          // Revert both dictionary and pitch object
          setSaved((prev) => ({ ...prev, [id]: wasSaved }));
          setPitches((prev) =>
            prev.map((p) =>
              p._id === id
                ? {
                    ...p,
                    isSaved: wasSaved,
                    saveCount: wasSaved
                      ? (p.saveCount || 0) + 1
                      : Math.max(0, (p.saveCount || 0) - 1),
                  }
                : p,
            ),
          );
          toast.error("Failed to save pitch. Please try again.");
        });
    } else {
      if (nextSaved) {
        toast.success("Saved to bookmarks");
      } else {
        toast.info("Removed from saved pitches");
      }
    }
  };

  const toggleFollow = () => {
    const id = pitch.founderId._id;
    const wasFollowing = following[id] ?? isFollowing(id);
    if (wasFollowing) unfollowUser(id);
    else followUser(id);
    setFollowing((p) => ({ ...p, [id]: !wasFollowing }));
  };

  const skip = () => {
    next();
  };

  const moreMenu = useMemo(
    () => [
      { label: "Share", icon: HiShare, onClick: () => setActiveModal("share") },
      { label: "Not interested", icon: HiX, onClick: skip },
      {
        label: "View details",
        icon: HiInformationCircle,
        onClick: () => setActiveModal("details"),
      },
      { divider: true },
      {
        label: "Report",
        icon: HiFlag,
        onClick: () => setActiveModal("report"),
        danger: true,
      },
    ],
    // eslint-disable-next-line
    [idx],
  );

  // Preload neighbor videos so the next/prev slide-in is instant
  const neighborSrcs = [
    pitches[idx + 1]?.videoUrl,
    pitches[idx - 1]?.videoUrl,
  ].filter(Boolean);

  return (
    <FeedShell>
      {/* Outer wrapper fills the entire main area absolutely. */}
      <div className="absolute inset-0 flex items-stretch md:items-end md:justify-center md:gap-3 lg:gap-4">
        {/* Video stage */}
        <div
          id="shorts-feed-container"
          className="shorts-feed-stage relative bg-black overflow-hidden border-gold/15 shadow-2xl shadow-black/40"
        >
          <FeedHint />

          {/* Hidden preloaders for adjacent videos */}
          {neighborSrcs.map((src) => (
            <video
              key={src}
              src={src}
              preload="auto"
              muted
              playsInline
              className="hidden"
            />
          ))}

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={pitch._id}
              custom={direction}
              variants={{
                enter: (dir) => ({
                  y: dir === "down" ? "100%" : "-100%",
                }),
                center: { y: 0 },
                exit: (dir) => ({
                  y: dir === "down" ? "-100%" : "100%",
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.32,
                ease: [0.32, 0.72, 0, 1], // matches Instagram's spring-out feel
              }}
              className="absolute inset-0 bg-black"
            >
              <ShortsPlayer
                src={pitch.videoUrl}
                poster={pitch.coverUrl || pitch.thumbnailUrl}
                muted={muted}
                active={true}
                onDoubleTap={doubleTapLike}
              />

              {/* Bottom gradient — only behind text area */}
              <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

              {/* Top bar — industry tag (left) + mute toggle (right) */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                <span className="px-2.5 py-0.5 bg-gold/90 text-dark-navy feed-fluid-text-xs font-black rounded-full uppercase">
                  {pitch.industry}
                </span>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="w-9 h-9 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-all"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <HiVolumeOff className="w-4 h-4 text-white" />
                  ) : (
                    <HiVolumeUp className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* Bottom info — lifted above the floating tab bar on mobile,
                  padded right to clear the action rail */}
              <div className="absolute bottom-16 md:bottom-0 left-0 right-0 pl-3 pr-20 md:pr-4 pb-3 pt-2 z-10 pointer-events-none">
                <div className="flex items-center gap-2 mb-2.5 pointer-events-auto">
                  <button
                    onClick={() => setActiveModal("profile")}
                    className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={
                        pitch.founderId.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.founderId.name || "U")}&background=1B5E3F&color=fff`
                      }
                      alt={pitch.founderId.name}
                      className="w-8 h-8 rounded-full border-2 border-gold object-cover flex-shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-[12px] md:text-sm flex items-center gap-1 truncate leading-tight">
                        {pitch.founderId.name}
                        {pitch.founderId.isVerified && (
                          <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] md:text-xs text-gray-300 truncate leading-tight">
                        {pitch.founderId.companyName}
                      </p>
                    </div>
                  </button>
                  <FollowButton
                    active={following[pitch.founderId._id]}
                    onClick={toggleFollow}
                  />
                </div>

                <h3 className="font-black text-[15px] md:text-[17px] leading-tight mb-0.5 pointer-events-auto line-clamp-2">
                  {pitch.title}
                </h3>

                <div className="pointer-events-auto">
                  <p
                    className={`text-[13px] md:text-sm text-gray-200 leading-snug ${
                      expanded ? "" : "line-clamp-1"
                    }`}
                  >
                    {pitch.description}
                  </p>
                  {(pitch.description || "").length > 50 && (
                    <button
                      onClick={() => setExpanded((v) => !v)}
                      className="text-[12px] md:text-xs text-gray-300 hover:text-gold font-semibold mt-0.5"
                    >
                      {expanded ? "less" : "more"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap pointer-events-auto">
                  {user?.role === "investor" ? (
                    <button
                      onClick={() => setActiveModal("invest")}
                      className="px-2.5 py-1 bg-gold/25 hover:bg-gold/35 border border-gold/40 rounded-full feed-fluid-text-xs font-bold text-gold flex items-center gap-1 transition-all"
                    >
                      <HiCurrencyDollar className="w-3.5 h-3.5" />
                      {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-white/15 border border-white/30 rounded-full feed-fluid-text-xs font-bold text-white flex items-center gap-1">
                      <HiCurrencyDollar className="w-3.5 h-3.5" />
                      {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
                    </span>
                  )}
                  <span className="feed-fluid-text-xs text-gray-300 capitalize">
                    {pitch.fundingStage}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ACTION RAIL — overlays video on mobile (right side, above caption),
            sits in flex row next to it on desktop */}
        <div
          className="absolute right-2 bottom-24 z-20 flex flex-col gap-4 items-center
                     md:static md:mb-6 md:gap-5 md:right-auto md:bottom-auto"
        >
          <RailButton
            icon={HiHeart}
            label={
              pitch.likeCount ??
              (Array.isArray(pitch.likes) ? pitch.likes.length : 0)
            }
            active={isPitchLiked(pitch)}
            activeClass="text-red-400"
            onClick={toggleLike}
            title="Like"
          />
          <RailButton
            icon={HiChatAlt2}
            label={pitch.commentCount || pitch.comments || 0}
            onClick={() => setActiveModal("comments")}
            title="Comments"
          />
          <RailButton
            icon={HiBookmark}
            label={
              pitch.saveCount ??
              (Array.isArray(pitch.saves) ? pitch.saves.length : 0)
            }
            active={isPitchSaved(pitch)}
            activeClass="text-gold"
            onClick={toggleSave}
            title="Save"
          />
          {user?.role === "investor" && (
            <RailButton
              icon={HiCurrencyDollar}
              onClick={() => setActiveModal("invest")}
              title="Express investment interest"
            />
          )}
          <RailButton
            icon={HiShare}
            onClick={() => setActiveModal("share")}
            title="Share"
          />
          <DropdownMenu
            items={moreMenu}
            placement="top"
            trigger={
              <HiDotsVertical className="w-5 h-5 md:w-6 md:h-6 text-white" />
            }
            triggerClass="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all"
          />
        </div>
      </div>

      {/* Modals */}
      <FounderProfileModal
        open={activeModal === "profile"}
        onClose={() => setActiveModal(null)}
        founder={pitch.founderId}
        isFollowing={!!following[pitch.founderId._id]}
        onToggleFollow={toggleFollow}
        onPickPitch={jumpToPitch}
      />

      <CommentsPanel
        open={activeModal === "comments"}
        onClose={() => setActiveModal(null)}
        videoId={pitch._id}
        totalCount={pitch.commentCount || pitch.comments}
        onCommentAdded={(newCount) => {
          if (typeof newCount === "number") {
            setPitches((prev) =>
              prev.map((p) => (p._id === pitch._id ? { ...p, commentCount: newCount } : p))
            );
          } else {
            setPitches((prev) =>
              prev.map((p) =>
                p._id === pitch._id
                  ? { ...p, commentCount: (p.commentCount || p.comments || 0) + 1 }
                  : p,
              ),
            );
          }
        }}
        onCommentDeleted={(newCount) => {
          if (typeof newCount === "number") {
            setPitches((prev) =>
              prev.map((p) => (p._id === pitch._id ? { ...p, commentCount: newCount } : p))
            );
          } else {
            setPitches((prev) =>
              prev.map((p) =>
                p._id === pitch._id
                  ? { ...p, commentCount: Math.max(0, (p.commentCount || p.comments || 0) - 1) }
                  : p,
              ),
            );
          }
        }}
      />

      <ShareModal
        open={activeModal === "share"}
        onClose={() => setActiveModal(null)}
        pitch={pitch}
      />

      <ReportModal
        open={activeModal === "report"}
        onClose={() => setActiveModal(null)}
        pitch={pitch}
      />

      <InvestModal
        open={activeModal === "invest"}
        onClose={() => setActiveModal(null)}
        pitch={pitch}
        onSubmit={() => {
          setActiveModal(null);
          toast.success("Interest expressed — chat unlocked");
          navigate("/app/messages");
        }}
      />

      <DetailsModal
        open={activeModal === "details"}
        onClose={() => setActiveModal(null)}
        pitch={pitch}
      />
    </FeedShell>
  );
}

function RailButton({
  icon: Icon,
  label,
  active,
  activeClass = "",
  onClick,
  title,
}) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      whileTap={{ scale: 0.85 }}
      className="flex flex-col items-center gap-0.5 transition-opacity"
    >
      <Icon
        className={`w-[28px] h-[28px] ${active ? activeClass : "text-white"}`}
        strokeWidth={1.5}
      />
      {label !== undefined && (
        <span className="text-[11px] font-medium text-white">
          {label > 999 ? `${(label / 1000).toFixed(1)}k` : label}
        </span>
      )}
    </motion.button>
  );
}

function FollowButton({ active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition-all border-2 flex items-center gap-1 ${
        active
          ? "bg-transparent border-white/40 text-white"
          : "bg-gold border-gold text-dark-navy"
      }`}
    >
      {active && <HiCheck className="w-3 h-3" />}
      {active ? "Following" : "Follow"}
    </motion.button>
  );
}

// ─── Modals ────────────────────────────────

function ShareModal({ open, onClose, pitch }) {
  const toast = useToast();
  if (!pitch) return null;
  const url = `${window.location.origin}/pitch/${pitch._id}`;

  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success("Link copied to clipboard");
    onClose();
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: pitch.title,
          text: pitch.description?.slice(0, 100),
          url,
        })
        .then(() => onClose())
        .catch(() => {});
    } else {
      copy();
    }
  };

  const socialButtons = [
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${pitch.title} ${url}`)}`,
      style:
        "bg-[#25D366]/10 text-[#1E9E4B] border-[#25D366]/30 hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "X (Twitter)",
      icon: FaTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(pitch.title)}&url=${encodeURIComponent(url)}`,
      style:
        "bg-[#1DA1F2]/10 text-[#0C7ABF] border-[#1DA1F2]/30 hover:bg-[#1DA1F2] hover:text-white",
    },
    {
      label: "LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      style:
        "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2] hover:text-white",
    },
    {
      label: "Telegram",
      icon: FaTelegramPlane,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(pitch.title)}`,
      style:
        "bg-[#0088cc]/10 text-[#0088cc] border-[#0088cc]/30 hover:bg-[#0088cc] hover:text-white",
    },
    {
      label: "Email",
      icon: FaEnvelope,
      href: `mailto:?subject=${encodeURIComponent(pitch.title)}&body=${encodeURIComponent(`Check out this pitch: ${url}`)}`,
      style:
        "bg-[#EA4335]/10 text-[#C5221F] border-[#EA4335]/30 hover:bg-[#EA4335] hover:text-white",
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Share Pitch">
      <p className="text-sm font-bold text-[#0A1F14]/80 mb-4 line-clamp-1">
        {pitch.title}
      </p>

      {/* Copy link box */}
      <div className="bg-[#FAFAF7] border border-[#1B5E3F]/20 rounded-2xl p-3 mb-5 flex items-center gap-3 shadow-inner">
        <span className="text-xs font-mono font-bold text-[#1B5E3F] truncate flex-1 select-all">
          {url}
        </span>
        <button
          onClick={copy}
          className="px-3.5 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          <FaLink className="w-3.5 h-3.5 text-[#F5B942]" /> Copy
        </button>
      </div>

      {/* Social grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {socialButtons.map(({ label, icon: Icon, href, style }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className={`px-3.5 py-3 border rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${style}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </a>
        ))}
        <button
          onClick={nativeShare}
          className="px-3.5 py-3 bg-[#FAFAF7] text-[#0A1F14] border border-[#1B5E3F]/15 hover:bg-[#1B5E3F]/10 hover:border-[#1B5E3F]/30 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <HiShare className="w-4 h-4 shrink-0 text-[#1B5E3F]" />
          <span>More…</span>
        </button>
      </div>
    </Modal>
  );
}

function ReportModal({ open, onClose, pitch }) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Report this pitch">
      <p className="text-sm text-gray-300 mb-4">"{pitch.title}"</p>
      <div className="space-y-2">
        {[
          "Spam",
          "Misleading content",
          "Inappropriate",
          "Scam",
          "Copyright violation",
          "Other",
        ].map((r) => (
          <button
            key={r}
            onClick={() => {
              reportService
                .create({
                  reportedVideo: pitch._id,
                  reportedUser: pitch.founderId?._id || pitch.founderId,
                  type: r.toLowerCase().replace(/\s+/g, "_"),
                  description: `Reported pitch "${pitch.title}" as: ${r}`,
                })
                .catch(() => {});
              onClose();
              toast.success(`Reported as "${r}". We'll review within 24h.`);
            }}
            className="w-full p-3 text-left bg-dark-bg/40 hover:bg-dark-bg/80 border-2 border-gold/15 hover:border-red-500/40 rounded-xl text-sm font-semibold transition-all"
          >
            {r}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function InvestModal({ open, onClose, pitch, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = Number(amount) > 0;

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
      onSubmit?.();
    } catch (err) {
      // If already expressed interest, still treat as success
      onSubmit?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Express investment interest">
      <p className="text-sm text-gray-300 mb-4">
        Founder is asking{" "}
        <span className="text-gold font-bold">
          {formatINR(pitch.askAmount)}
        </span>{" "}
        for {pitch.equityOffered}% equity.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-300">
            Your proposed amount (INR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2500000"
            className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-300">
            Notes / terms (optional)
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            placeholder="e.g. interested as lead, want a board seat…"
            className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none"
          />
        </div>
        <button
          disabled={!valid || submitting}
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
            valid && !submitting
              ? "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30"
              : "bg-dark-bg/60 text-gray-500 cursor-not-allowed"
          }`}
        >
          {submitting ? "Sending…" : "Send interest"}
        </button>
      </div>
    </Modal>
  );
}

function DetailsModal({ open, onClose, pitch }) {
  return (
    <Modal open={open} onClose={onClose} title={pitch.title}>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            pitch.founderId.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.founderId.name || "U")}&background=1B5E3F&color=fff`
          }
          alt={pitch.founderId.name}
          className="w-12 h-12 rounded-full border-2 border-gold/40"
        />
        <div>
          <p className="font-bold flex items-center gap-1">
            {pitch.founderId.name}
            {pitch.founderId.isVerified && (
              <MdVerified className="w-4 h-4 text-gold" />
            )}
          </p>
          <p className="text-sm text-gray-400">{pitch.founderId.companyName}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-4">{pitch.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Detail label="Industry" value={pitch.industry} />
        <Detail label="Stage" value={pitch.fundingStage} />
        <Detail label="Asking" value={formatINR(pitch.askAmount)} />
        <Detail label="Equity" value={`${pitch.equityOffered}%`} />
        <Detail label="Duration" value={`${pitch.duration}s`} />
        <Detail label="Views" value={(pitch.views || 0).toLocaleString()} />
      </div>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-dark-bg/40 rounded-lg p-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold capitalize">{value}</p>
    </div>
  );
}
