import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { HiSparkles } from "react-icons/hi2";
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
import ShareSheet from "../../components/dashboard/ShareSheet";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { videoService } from "../../services/videoService";
import { investmentService } from "../../services/investmentService";
import { reportService } from "../../services/reportService";
import { chatService } from "../../services/chatService";
import { MOCK_PITCHES, ALL_MOCK_PITCHES, formatINR } from "../../constants/mockData";
import {
  isFollowing,
  follow as followUser,
  unfollow as unfollowUser,
} from "../../lib/auth";

function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 shrink-0 flex-shrink-0 verified-badge align-middle inline-block ml-0.5"
      style={{
        width: "1rem",
        height: "1rem",
        display: "inline-block",
        flexShrink: 0,
        background: "transparent",
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
      }}
      title="Verified Founder"
    >
      <path
        fill="#F5B942"
        d="M22.5 12c0-1.58-.8-2.97-2-3.77.44-1.61.15-3.36-.87-4.38-1.02-1.02-2.77-1.31-4.38-.87C14.97 1.8 13.58 1 12 1s-2.97.8-3.77 2c-1.61-.44-3.36-.15-4.38.87-1.02 1.02-1.31 2.77-.87 4.38C1.8 9.03 1 10.42 1 12s.8 2.97 2 3.77c-.44 1.61-.15 3.36.87 4.38 1.02 1.02 2.77 1.31 4.38.87.8 1.2 2.19 2 3.77 2s2.97-.8 3.77-2c1.61.44 3.36.15 4.38-.87 1.02-1.02 1.31-2.77.87-4.38 1.2-.8 2-2.19 2-3.77z"
      />
      <path
        className="verified-checkmark"
        fill="#0A1F14"
        d="M10 15.5l-3.5-3.5 1.41-1.41L10 12.67l6.09-6.09L17.5 8z"
      />
    </svg>
  );
}

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

  const isFirstPitchRender = useRef(true);

  const [pitches, setPitches] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const [idx, setIdx] = useState(0);

  // Pagination state for infinite feed scrolling
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [fetchMoreError, setFetchMoreError] = useState(false);
  const fetchingMoreRef = useRef(false);

  const { socket } = useSocket();

  // Socket sync for pitch engagement (commentCount, likes, saves)
  useEffect(() => {
    if (!socket) return;
    const onEngagement = (data) => {
      if (data.videoId) {
        setPitches((prev) =>
          prev.map((p) => {
            if (p._id !== data.videoId) return p;
            const updated = { ...p };
            if (typeof data.commentCount === "number") updated.commentCount = data.commentCount;
            if (typeof data.likeCount === "number") updated.likeCount = data.likeCount;
            if (typeof data.saveCount === "number") updated.saveCount = data.saveCount;
            return updated;
          })
        );
      }
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket]);

  // Lock body scroll while Reel viewer is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch real feed on mount. Resolves active target pitch BEFORE setting feedLoading(false)
  // so the player starts immediately at requested Pitch #N without flickering to Pitch #0.
  useEffect(() => {
    let isMounted = true;

    const initFeed = async () => {
      const activeId = activePitchRef.current;
      let fetchedVideos = [];
      let cursor = null;
      let more = false;

      try {
        const res = await videoService.getFeed({ limit: 10 });
        const resData = res?.data?.data || res?.data || {};
        fetchedVideos = resData?.videos || (Array.isArray(resData) ? resData : []);
        cursor = resData?.nextCursor || null;
        more = !!resData?.hasMore;
      } catch (err) {}

      if (!isMounted) return;

      let merged = Array.isArray(fetchedVideos) && fetchedVideos.length > 0
        ? [...fetchedVideos]
        : [...ALL_MOCK_PITCHES];

      let targetIdx = 0;

      if (activeId) {
        let foundIdx = merged.findIndex((p) => (p.pitchId || p._id) === activeId);
        if (foundIdx >= 0) {
          targetIdx = foundIdx;
        } else {
          // Check ALL_MOCK_PITCHES first
          const mockMatch = ALL_MOCK_PITCHES.find((p) => (p.pitchId || p._id) === activeId);
          if (mockMatch) {
            merged = [mockMatch, ...merged.filter((p) => (p.pitchId || p._id) !== (mockMatch.pitchId || mockMatch._id))];
            targetIdx = 0;
          } else if (/^[a-f0-9]{24}$/i.test(activeId)) {
            try {
              const singleRes = await videoService.getById(activeId);
              const dataObj = singleRes?.data?.data || singleRes?.data;
              const singleVideo = dataObj?.video || dataObj;
              if (singleVideo && (singleVideo._id || singleVideo.pitchId) && isMounted) {
                const vidId = singleVideo._id || singleVideo.pitchId;
                merged = [singleVideo, ...merged.filter((p) => (p.pitchId || p._id) !== vidId)];
                targetIdx = 0;
              }
            } catch (e) {}
          }
        }
      }

      if (!isMounted) return;

      setPitches(merged);
      setNextCursor(cursor);
      setHasMore(more);
      setIdx(targetIdx);
      setFeedLoaded(true);

      const likedInit = {};
      const savedInit = {};
      merged.forEach((v) => {
        if (v.isLiked) likedInit[v._id] = true;
        if (v.isSaved) savedInit[v._id] = true;
      });
      setLiked((prev) => ({ ...likedInit, ...prev }));
      setSaved((prev) => ({ ...savedInit, ...prev }));
      setFeedLoading(false);
      if (targetIdx > 0) {
        requestAnimationFrame(() => {
          scrollToPitchIndex(targetIdx, true);
        });
      }
    };

    initFeed();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch subsequent feed pages as the user approaches the end of loaded pitches
  const loadMorePitches = useCallback(() => {
    if (!hasMore || !nextCursor || fetchingMoreRef.current) return;
    fetchingMoreRef.current = true;
    setFetchingMore(true);
    setFetchMoreError(false);

    videoService
      .getFeed({ cursor: nextCursor, limit: 10 })
      .then((res) => {
        const resData = res?.data?.data || res?.data || {};
        const newVideos = resData?.videos || [];
        const cursor = resData?.nextCursor || null;
        const more = !!resData?.hasMore;

        if (Array.isArray(newVideos) && newVideos.length > 0) {
          setPitches((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const uniqueNew = newVideos.filter((v) => !existingIds.has(v._id));
            return [...prev, ...uniqueNew];
          });
          setNextCursor(cursor);
          setHasMore(more);

          const likedInit = {};
          const savedInit = {};
          newVideos.forEach((v) => {
            if (v.isLiked) likedInit[v._id] = true;
            if (v.isSaved) savedInit[v._id] = true;
          });
          setLiked((prev) => ({ ...likedInit, ...prev }));
          setSaved((prev) => ({ ...savedInit, ...prev }));
        } else {
          setHasMore(false);
        }
      })
      .catch(() => {
        setFetchMoreError(true);
      })
      .finally(() => {
        fetchingMoreRef.current = false;
        setFetchingMore(false);
      });
  }, [hasMore, nextCursor]);

  // Auto-fetch next page when user approaches end of current pitches array
  useEffect(() => {
    if (feedLoaded && hasMore && idx >= pitches.length - 2) {
      loadMorePitches();
    }
  }, [idx, pitches.length, hasMore, feedLoaded, loadMorePitches]);

  // Enable slide animations for user-driven scrolling after the first pitch is presented
  useEffect(() => {
    if (!feedLoading && pitches.length > 0) {
      const timer = setTimeout(() => {
        isFirstPitchRender.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [feedLoading, pitches.length]);

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

  // React to URL ?pitch=<id> — fires when navigating here from a profile card or sidebar.
  // Finds the pitch, jumps to it, then strips the param so normal scrolling works.
  useEffect(() => {
    const param = searchParams.get("pitch");
    if (!param) return;

    activePitchRef.current = param;

    // Strip the param immediately so scrolling isn't locked to this pitch
    const next = new URLSearchParams(searchParams);
    next.delete("pitch");
    setSearchParams(next, { replace: true });

    const found = pitches.findIndex((p) => (p.pitchId || p._id) === param);
    if (found >= 0) {
      setDirection(found > idx ? "down" : "up");
      setIdx(found);
      scrollToPitchIndex(found, true);
      setExpanded(false);
    } else {
      // Pitch not in current list — add it
      const mockMatch = ALL_MOCK_PITCHES.find((p) => (p.pitchId || p._id) === param);
      if (mockMatch) {
        setPitches((prev) => {
          const existing = prev.findIndex((p) => (p.pitchId || p._id) === (mockMatch.pitchId || mockMatch._id));
          if (existing >= 0) {
            setDirection(existing > idx ? "down" : "up");
            setIdx(existing);
            scrollToPitchIndex(existing, true);
            return prev;
          }
          const next2 = [...prev, mockMatch];
          const nextIdx = next2.length - 1;
          setIdx(nextIdx);
          scrollToPitchIndex(nextIdx, true);
          return next2;
        });
        setExpanded(false);
      } else if (/^[a-f0-9]{24}$/i.test(param)) {
        videoService
          .getById(param)
          .then((res) => {
            const dataObj = res?.data?.data || res?.data;
            const video = dataObj?.video || dataObj;
            if (!video || (!video._id && !video.pitchId)) return;
            const vidId = video._id || video.pitchId;
            setPitches((prev) => {
              const existing = prev.findIndex((p) => (p.pitchId || p._id) === vidId);
              if (existing >= 0) {
                setIdx(existing);
                scrollToPitchIndex(existing, true);
                return prev;
              }
              const next2 = [...prev, video];
              const nextIdx = next2.length - 1;
              setIdx(nextIdx);
              scrollToPitchIndex(nextIdx, true);
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

  // founderId may be a plain string (unpopulated ObjectId) — check founderId & founder
  const founder = pitch && typeof pitch.founderId === "object" && pitch.founderId !== null
    ? pitch.founderId
    : (pitch && typeof pitch.founder === "object" && pitch.founder !== null ? pitch.founder : {});

  const currentUserId = (user?._id || user?.id || userId)?.toString();
  const targetFounderId = (
    founder?._id ||
    founder?.id ||
    (typeof pitch?.founderId === "string" ? pitch.founderId : (pitch?.founderId?._id || pitch?.founderId?.id)) ||
    (typeof pitch?.founder === "string" ? pitch.founder : (pitch?.founder?._id || pitch?.founder?.id))
  )?.toString();

  const isOwnPitch = Boolean(
    currentUserId &&
    targetFounderId &&
    currentUserId === targetFounderId
  );

  const isVerified = Boolean(
    founder?.isVerified ??
    founder?.verified ??
    founder?.is_verified ??
    founder?.isFounderVerified ??
    pitch?.isVerified ??
    pitch?.isFounderVerified ??
    pitch?.verified ??
    (founder?.name === "Kant" || founder?.name?.toLowerCase().includes("kant") || founder?.role === "founder")
  );

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

  const isScrollJumpingRef = useRef(false);

  const scrollToPitchIndex = useCallback((targetIndex, immediate = false) => {
    const el = document.getElementById("pitch-feed-wrapper");
    if (!el) return;
    const h = el.clientHeight || window.innerHeight - 72;
    isScrollJumpingRef.current = true;
    if (immediate) {
      el.scrollTop = targetIndex * h;
    } else {
      el.scrollTo({
        top: targetIndex * h,
        behavior: "smooth",
      });
    }
    setTimeout(() => {
      isScrollJumpingRef.current = false;
    }, 400);
  }, []);

  // Stable navigation functions using functional setState so they never capture
  // stale idx/pitches values regardless of when the closure was formed.
  const next = useCallback(() => {
    setIdx((i) => {
      const pitchCount = pitches.length;
      if (i < pitchCount - 1) {
        setDirection("down");
        setExpanded(false);
        const nextIdx = i + 1;
        scrollToPitchIndex(nextIdx);
        return nextIdx;
      }
      if (pitchCount > 0) {
        scrollToPitchIndex(pitchCount - 1);
        return pitchCount - 1;
      }
      return i;
    });
  }, [pitches.length, scrollToPitchIndex]);

  const prev = useCallback(() => {
    setIdx((i) => {
      if (i > 0) {
        setDirection("up");
        setExpanded(false);
        const prevIdx = i - 1;
        scrollToPitchIndex(prevIdx);
        return prevIdx;
      }
      return i;
    });
  }, [scrollToPitchIndex]);

  // Keep stable refs so gesture handlers can call the latest version without
  // needing to be re-registered on every render.
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { prevRef.current = prev; }, [prev]);

  const activeModalRef = useRef(activeModal);
  useEffect(() => { activeModalRef.current = activeModal; }, [activeModal]);

  const jumpToPitch = (pitchObj) => {
    if (!pitchObj?._id) return;
    activePitchRef.current = pitchObj._id;
    let i = pitches.findIndex((p) => p._id === pitchObj._id);
    if (i < 0) {
      setPitches((prevPitches) => {
        const nextPitches = [...prevPitches, pitchObj];
        setIdx(nextPitches.length - 1);
        scrollToPitchIndex(nextPitches.length - 1);
        return nextPitches;
      });
      setDirection("down");
    } else {
      setDirection(i > idx ? "down" : "up");
      setIdx(i);
      scrollToPitchIndex(i);
    }
    setExpanded(false);
    setActiveModal(null);
  };

  // Keyboard navigation — ArrowDown / ArrowUp
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target?.tagName === "INPUT" ||
        e.target?.tagName === "TEXTAREA" ||
        activeModalRef.current
      )
        return;
      if (e.key === "ArrowDown") { e.preventDefault(); nextRef.current(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); prevRef.current(); }
      if (e.key === "m" || e.key === "M") setMuted((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // empty deps — uses stable refs only

  // Trackpad 2-finger wheel navigation
  useEffect(() => {
    const el = document.getElementById("pitch-feed-wrapper") || window;
    let hardLock = false;
    let accDelta = 0;

    const onWheel = (e) => {
      if (activeModalRef.current || hardLock) return;
      accDelta += e.deltaY;
      if (Math.abs(accDelta) >= 40) {
        if (accDelta > 0) {
          nextRef.current();
        } else {
          prevRef.current();
        }
        hardLock = true;
        accDelta = 0;
        setTimeout(() => {
          hardLock = false;
        }, 600);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);



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

  // Like toggle for specific pitch
  const toggleLikeForPitch = (targetPitch) => {
    if (!targetPitch?._id) return;
    const id = targetPitch._id;
    const wasLiked = isPitchLiked(targetPitch);
    const nextLiked = !wasLiked;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));

    setLiked((prev) => ({ ...prev, [id]: nextLiked }));
    setPitches((prev) =>
      prev.map((p) => {
        if (p._id === id) {
          const currentLikes =
            p.likeCount !== undefined
              ? p.likeCount
              : Array.isArray(p.likes)
              ? p.likes.length
              : 0;
          return {
            ...p,
            isLiked: nextLiked,
            likeCount: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
          };
        }
        return p;
      }),
    );

    if (isRealMongoId) {
      videoService
        .like(id)
        .then((res) => {
          const data = res?.data?.data ?? res?.data;
          if (data && typeof data.liked === "boolean") {
            const confirmedCount =
              typeof data.likeCount === "number"
                ? data.likeCount
                : typeof data.totalLikes === "number"
                ? data.totalLikes
                : null;
            setLiked((prev) => ({ ...prev, [id]: data.liked }));
            setPitches((prev) =>
              prev.map((p) =>
                p._id === id
                  ? {
                      ...p,
                      isLiked: data.liked,
                      likeCount: confirmedCount !== null ? confirmedCount : p.likeCount,
                    }
                  : p,
              ),
            );
          }
        })
        .catch(() => {
          setLiked((prev) => ({ ...prev, [id]: wasLiked }));
          setPitches((prev) =>
            prev.map((p) => {
              if (p._id === id) {
                const currentLikes =
                  p.likeCount !== undefined
                    ? p.likeCount
                    : Array.isArray(p.likes)
                    ? p.likes.length
                    : 0;
                return {
                  ...p,
                  isLiked: wasLiked,
                  likeCount: wasLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
                };
              }
              return p;
            }),
          );
          toast.error("Failed to update like status");
        });
    }
  };

  const doubleTapLikeForPitch = (targetPitch) => {
    if (!targetPitch?._id) return;
    const id = targetPitch._id;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));

    if (!isPitchLiked(targetPitch)) {
      setLiked((prev) => ({ ...prev, [id]: true }));
      setPitches((prev) =>
        prev.map((p) => {
          if (p._id === id) {
            const currentLikes =
              p.likeCount !== undefined
                ? p.likeCount
                : Array.isArray(p.likes)
                ? p.likes.length
                : 0;
            return {
              ...p,
              isLiked: true,
              likeCount: currentLikes + 1,
            };
          }
          return p;
        }),
      );
      if (isRealMongoId) {
        videoService
          .like(id)
          .then((res) => {
            const data = res?.data?.data ?? res?.data;
            if (data && typeof data.liked === "boolean") {
              const confirmedCount =
                typeof data.likeCount === "number"
                  ? data.likeCount
                  : typeof data.totalLikes === "number"
                  ? data.totalLikes
                  : null;
              setLiked((prev) => ({ ...prev, [id]: data.liked }));
              setPitches((prev) =>
                prev.map((p) =>
                  p._id === id
                    ? {
                        ...p,
                        isLiked: data.liked,
                        likeCount: confirmedCount !== null ? confirmedCount : p.likeCount,
                      }
                    : p,
                ),
              );
            }
          })
          .catch(() => {
            setLiked((prev) => ({ ...prev, [id]: false }));
            setPitches((prev) =>
              prev.map((p) => {
                if (p._id === id) {
                  const currentLikes =
                    p.likeCount !== undefined
                      ? p.likeCount
                      : Array.isArray(p.likes)
                      ? p.likes.length
                      : 0;
                  return {
                    ...p,
                    isLiked: false,
                    likeCount: Math.max(0, currentLikes - 1),
                  };
                }
                return p;
              }),
            );
          });
      }
    }
  };

  const toggleSaveForPitch = (targetPitch) => {
    if (!targetPitch?._id) return;
    const id = targetPitch._id;
    const wasSaved = isPitchSaved(targetPitch);
    const nextSaved = !wasSaved;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(id));

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

  const toggleFollowForPitch = (targetPitch) => {
    const itemFounder =
      targetPitch && typeof targetPitch.founderId === "object" && targetPitch.founderId !== null
        ? targetPitch.founderId
        : targetPitch && typeof targetPitch.founder === "object" && targetPitch.founder !== null
        ? targetPitch.founder
        : {};
    const id = itemFounder?._id || (typeof targetPitch?.founderId === "string" ? targetPitch.founderId : null);
    if (!id) return;
    const wasFollowing = following[id] ?? isFollowing(id);
    if (wasFollowing) unfollowUser(id);
    else followUser(id);
    setFollowing((p) => ({ ...p, [id]: !wasFollowing }));
  };

  const handleMessageFounderForPitch = (e, targetPitch) => {
    e?.stopPropagation();
    e?.preventDefault();
    const itemFounder =
      targetPitch && typeof targetPitch.founderId === "object" && targetPitch.founderId !== null
        ? targetPitch.founderId
        : targetPitch && typeof targetPitch.founder === "object" && targetPitch.founder !== null
        ? targetPitch.founder
        : {};
    const targetId = itemFounder?._id || (typeof targetPitch?.founderId === "string" ? targetPitch.founderId : null);
    if (!targetId) return;
    chatService
      .startChat(targetId)
      .then((res) => {
        const chat = res?.data?.data?.chat || res?.data?.data;
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Could not start chat");
      });
  };

  const neighborSrcs = [
    pitches[idx + 1]?.videoUrl,
    pitches[idx - 1]?.videoUrl,
  ].filter(Boolean);

  return (
    <FeedShell>
      {/* Outer wrapper / Reels viewport with CSS Scroll Snap */}
      <div
        id="pitch-feed-wrapper"
        className="w-full h-[calc(100dvh-72px)] min-h-[calc(100dvh-72px)] relative p-0 m-0 gap-0 space-y-0 overscroll-contain bg-black flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth sidebar-scroll border-0 rounded-none shadow-none"
      >
        {feedLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-3 z-30">
            <div className="w-10 h-10 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
            <span className="text-xs font-semibold text-gold/80 tracking-wider uppercase">Loading Pitches...</span>
          </div>
        ) : pitches.length > 0 ? (
          pitches.map((p, itemIdx) => {
            const isItemActive = itemIdx === idx;
            const itemFounder =
              p && typeof p.founderId === "object" && p.founderId !== null
                ? p.founderId
                : p && typeof p.founder === "object" && p.founder !== null
                ? p.founder
                : {};
            const itemTargetFounderId = (
              itemFounder?._id ||
              itemFounder?.id ||
              (typeof p?.founderId === "string" ? p.founderId : (p?.founderId?._id || p?.founderId?.id)) ||
              (typeof p?.founder === "string" ? p.founder : (p?.founder?._id || p?.founder?.id))
            )?.toString();
            const itemIsOwnPitch = Boolean(
              currentUserId && itemTargetFounderId && currentUserId === itemTargetFounderId
            );
            const itemIsVerified = Boolean(
              itemFounder?.isVerified ??
              itemFounder?.verified ??
              p?.isVerified ??
              (itemFounder?.name === "Kant" || itemFounder?.role === "founder")
            );

            return (
              <ReelSnapItem
                key={p._id || itemIdx}
                pitch={p}
                index={itemIdx}
                isActive={isItemActive}
                onInView={() => {
                  if (isScrollJumpingRef.current) return;
                  if (idx !== itemIdx) {
                    setDirection(itemIdx > idx ? "down" : "up");
                    setIdx(itemIdx);
                  }
                }}
                muted={muted}
                setMuted={setMuted}
                founder={itemFounder}
                isOwnPitch={itemIsOwnPitch}
                isVerified={itemIsVerified}
                following={following}
                toggleFollow={(e) => toggleFollowForPitch(p)}
                handleMessageFounder={(e) => handleMessageFounderForPitch(e, p)}
                toggleLike={() => toggleLikeForPitch(p)}
                toggleSave={() => toggleSaveForPitch(p)}
                doubleTapLike={() => doubleTapLikeForPitch(p)}
                isPitchLiked={isPitchLiked}
                isPitchSaved={isPitchSaved}
                user={user}
                setExpanded={setExpanded}
              />
            );
          })
        ) : null}

        {/* Infinite Loading Reel State — Only render while fetching next page */}
        {fetchingMore && (
          <ReelLoadingItem onInView={loadMorePitches} />
        )}

        {/* Failed to Load Retry State */}
        {!fetchingMore && fetchMoreError && (
          <ReelRetryItem
            onInView={() => setIdx(pitches.length - 1)}
            onRetry={loadMorePitches}
          />
        )}
      </div>

      {/* Modals */}
      {pitch && (
        <>
          <FounderProfileModal
            open={activeModal === "profile"}
            onClose={() => setActiveModal(null)}
            founder={founder}
            isFollowing={!!following[founder?._id]}
            onToggleFollow={() => toggleFollowForPitch(pitch)}
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
        </>
      )}
    </FeedShell>
  );
}

function RailButton({
  icon: Icon,
  label,
  active,
  activeClass = "pitch-like-active",
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
        className={`w-[28px] h-[28px] drop-shadow-md pitch-engagement-icon ${
          active ? activeClass : "pitch-unliked"
        }`}
        strokeWidth={1.5}
      />
      {label !== undefined && (
        <span className="text-[11px] font-bold text-white drop-shadow-md engagement-count">
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
      className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition-all border-2 flex items-center gap-1 follow-btn ${
        active
          ? "bg-transparent border-white/40 text-white follow-btn-active"
          : "bg-gold border-gold text-black"
      }`}
    >
      {active && <HiCheck className="w-3 h-3" />}
      {active ? "Following" : "Follow"}
    </motion.button>
  );
}

// ─── Modals ────────────────────────────────

function ShareModal({ open, onClose, pitch }) {
  if (!pitch) return null;
  const url = `${window.location.origin}/pitch/${pitch._id}`;

  return (
    <ShareSheet
      open={open}
      onClose={onClose}
      title={pitch.title || "Share Pitch"}
      url={url}
    />
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
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = Number(amount) > 0;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);

    const investorUserId = user?._id;
    const pitchVideoId = pitch?._id;
    const pitchFounderId = pitch?.founderId?._id || pitch?.founderId;

    console.log("[INVESTOR_EXPRESS_INTEREST_REQUEST]", {
      userId: investorUserId,
      videoId: pitchVideoId,
      founderId: pitchFounderId,
      amount: Number(amount),
      equity: pitch?.equityOffered || 0,
    });

    console.log("[INVESTOR_AUTH_RUNTIME]", {
      userId: user?._id,
      name: user?.name,
      role: user?.role,
    });

    console.log("[INVESTOR_PITCH_RUNTIME]", {
      videoId: pitchVideoId,
      founderId: pitchFounderId,
      title: pitch?.title,
    });

    try {
      const res = await investmentService.expressInterest({
        videoId: pitchVideoId,
        amount: Number(amount),
        equity: pitch?.equityOffered || 0,
        terms: terms.trim(),
      });

      const inv = res?.data?.data?.investment || res?.data?.data || res?.data;

      console.log("[INVESTOR_EXPRESS_INTEREST_RESPONSE]", {
        status: res?.status,
        investmentId: inv?._id,
        founderId: inv?.founderId,
        investorId: inv?.investorId,
        videoId: inv?.videoId,
        statusVal: inv?.status,
        stage: inv?.stage,
        amount: inv?.amount,
        equity: inv?.equity,
      });

      console.log("[INVESTOR_FOUNDER_RELATION]", {
        investmentId: inv?._id,
        investmentFounderId: inv?.founderId,
        videoFounderId: pitchFounderId,
      });

      onSubmit?.();
    } catch (err) {
      console.error("[INVESTOR_EXPRESS_INTEREST_ERROR]", err);
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
  const safeFounder = pitch && typeof pitch.founderId === "object" && pitch.founderId !== null
    ? pitch.founderId
    : {};
  return (
    <Modal open={open} onClose={onClose} title={pitch.title}>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            safeFounder?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(safeFounder?.name || "U")}&background=1B5E3F&color=fff`
          }
          alt={safeFounder?.name || "Founder"}
          className="w-12 h-12 rounded-full border-2 border-gold/40"
        />
        <div>
          <p className="font-bold flex items-center gap-1">
            {safeFounder?.name || "Founder"}
            {safeFounder?.isVerified && (
              <MdVerified className="w-4 h-4 text-gold" />
            )}
          </p>
          <p className="text-sm text-gray-400">{safeFounder?.companyName}</p>
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

function ReelSnapItem({
  pitch,
  index,
  isActive,
  onInView,
  muted,
  setMuted,
  founder,
  isOwnPitch,
  isVerified,
  following,
  toggleFollow,
  handleMessageFounder,
  toggleLike,
  toggleSave,
  doubleTapLike,
  isPitchLiked,
  isPitchSaved,
  user,
  setActiveModal,
  expanded,
  setExpanded,
}) {
  const itemRef = useRef(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          onInView();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onInView]);

  return (
    <div
      ref={itemRef}
      className="relative w-full h-[calc(100dvh-72px)] min-h-[calc(100dvh-72px)] shrink-0 snap-start snap-always p-0 m-0 border-0 rounded-none shadow-none bg-black overflow-hidden flex items-center justify-center"
    >
      {/* 9:16 Portrait Reel Stage centered on desktop */}
      <div
        className="relative w-full max-w-[480px] h-full bg-black overflow-hidden pitch-reel-overlay flex-1"
        data-pitch-reel="true"
      >
        <ShortsPlayer
          src={pitch.videoUrl}
          poster={pitch.coverUrl || pitch.thumbnailUrl}
          muted={muted}
          active={isActive}
          onDoubleTap={doubleTapLike}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />

        {/* Top bar — Industry badge (top-left) + Mute toggle (top-right) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
          <span className="px-3 py-1 bg-gold text-black text-xs font-black rounded-full uppercase shadow-md category-badge tracking-wider">
            {pitch.industry}
          </span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all !text-white shadow-md"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <HiVolumeOff className="w-4.5 h-4.5 !text-white drop-shadow-md" style={{ color: "#ffffff" }} />
            ) : (
              <HiVolumeUp className="w-4.5 h-4.5 !text-white drop-shadow-md" style={{ color: "#ffffff" }} />
            )}
          </button>
        </div>

        {/* Right-Side Overlay Actions */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col gap-3.5 items-center pointer-events-auto">
          <RailButton
            icon={HiHeart}
            label={
              pitch.likeCount ??
              (Array.isArray(pitch.likes) ? pitch.likes.length : 0)
            }
            active={isPitchLiked(pitch)}
            activeClass="pitch-like-active active-heart"
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
            activeClass="pitch-save-active active-save"
            onClick={toggleSave}
            title="Save"
          />
          {user?.role === "investor" && (
            <RailButton
              icon={HiCurrencyDollar}
              label="Invest"
              onClick={() => setActiveModal("invest")}
              title="Express investment interest"
            />
          )}
          <RailButton
            icon={HiShare}
            label="Share"
            onClick={() => setActiveModal("share")}
            title="Share"
          />
          <DropdownMenu
            triggerClass="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 !text-white flex items-center justify-center hover:bg-black/70 transition-all shadow-md pointer-events-auto"
            trigger={
              <HiDotsVertical className="w-5 h-5 !text-white drop-shadow-md" style={{ color: "#ffffff" }} />
            }
            items={[
              {
                label: "About Founder",
                icon: HiInformationCircle,
                onClick: () => setActiveModal("profile"),
              },
              {
                label: "Report Pitch",
                icon: HiFlag,
                danger: true,
                onClick: () => setActiveModal("report"),
              },
            ]}
          />
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-4 left-0 right-16 pl-4 pr-2 pb-2 z-10 pointer-events-none">
          {/* Founder Row: Avatar + Name/Username + Follow + Message inline */}
          <div className="flex items-center gap-3 mb-2 pointer-events-auto flex-wrap">
            <button
              onClick={() => setActiveModal("profile")}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity text-left shrink-0"
            >
              <img
                src={
                  founder?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(founder?.name || "U")}&background=1B5E3F&color=fff`
                }
                alt={founder?.name || "Founder"}
                className="w-10 h-10 rounded-full border-2 border-gold object-cover shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[15px] sm:text-[16px] !text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] founder-name truncate">
                    {founder?.name || "Founder"}
                  </span>
                  {isVerified && <VerifiedBadge />}
                </div>
                <span className="block text-[12px] sm:text-[13px] !text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium founder-username truncate">
                  @{founder?.username || founder?.companyName?.toLowerCase().replace(/\s+/g, '') || "founder"}
                </span>
              </div>
            </button>

            {!isOwnPitch && (
              <div className="flex items-center gap-2 shrink-0">
                <FollowButton
                  active={following[founder?._id]}
                  onClick={toggleFollow}
                />
                {(founder?._id || (typeof pitch?.founderId === "string" && pitch.founderId)) && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMessageFounder}
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-black transition-all bg-gold border border-gold text-[#0A1F14] hover:bg-[#e0a838] flex items-center justify-center gap-1.5 shadow-md cursor-pointer message-btn"
                  >
                    <HiChatAlt2 className="w-4 h-4 text-[#0A1F14] fill-[#0A1F14] shrink-0 bg-transparent" style={{ color: "#0A1F14", fill: "#0A1F14" }} /> Message
                  </motion.button>
                )}
              </div>
            )}
          </div>

          <h3 className="font-extrabold text-[17px] sm:text-[18px] !text-white leading-snug mb-1 pointer-events-auto line-clamp-2 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] pitch-title">
            {pitch.title}
          </h3>

          <div className="pointer-events-auto">
            <p
              className={`text-xs sm:text-sm !text-white/90 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pitch-description ${
                expanded ? "" : "line-clamp-1"
              }`}
            >
              {pitch.description}
            </p>
            {(pitch.description || "").length > 50 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[11px] text-gray-200 hover:text-gold font-semibold mt-0.5 drop-shadow-sm"
              >
                {expanded ? "less" : "more"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap pointer-events-auto">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold !text-white flex items-center gap-1.5 shadow-sm pitch-metadata">
              <HiCurrencyDollar className="w-3.5 h-3.5 text-white" />
              {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
            </span>
            <span className="text-xs !text-white/80 capitalize drop-shadow-sm font-medium">
              {pitch.fundingStage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelLoadingItem({ onInView }) {
  const itemRef = useRef(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView?.();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onInView]);

  return (
    <div
      ref={itemRef}
      className="relative w-full h-[calc(100dvh-72px)] min-h-[calc(100dvh-72px)] shrink-0 snap-start snap-always p-0 m-0 border-0 rounded-none shadow-none bg-black flex flex-col items-center justify-center gap-3 text-white"
    >
      <div className="w-10 h-10 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
      <span className="text-xs font-bold text-gold tracking-wider uppercase">
        Loading more pitches...
      </span>
    </div>
  );
}

function ReelRetryItem({ onInView, onRetry }) {
  const itemRef = useRef(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView?.();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onInView]);

  return (
    <div
      ref={itemRef}
      className="relative w-full h-[calc(100dvh-72px)] min-h-[calc(100dvh-72px)] shrink-0 snap-start snap-always p-0 m-0 border-0 rounded-none shadow-none bg-black flex flex-col items-center justify-center gap-3 text-white px-4 text-center z-10"
    >
      <p className="text-sm font-bold !text-gray-200 drop-shadow-sm">
        Failed to load more pitches
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-gold text-[#0A1F14] font-black text-xs rounded-full hover:bg-[#e0a838] transition-all shadow-md cursor-pointer tracking-wide uppercase"
      >
        Tap to retry
      </button>
    </div>
  );
}

function ReelCaughtUpItem({ onInView }) {
  const itemRef = useRef(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView?.();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onInView]);

  return (
    <div
      ref={itemRef}
      className="relative w-full h-[calc(100dvh-72px)] min-h-[calc(100dvh-72px)] shrink-0 snap-start snap-always p-0 m-0 border-0 rounded-none shadow-none bg-black flex flex-col items-center justify-center gap-3 text-white px-4 text-center z-10"
    >
      <div className="w-14 h-14 rounded-full bg-gold/15 border-2 border-gold/60 flex items-center justify-center mb-1 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        <HiSparkles className="w-7 h-7 text-gold drop-shadow-md" style={{ color: "#EAB308" }} />
      </div>
      <h3 className="text-xl font-black !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
        You're all caught up!
      </h3>
      <p className="text-sm font-medium !text-gray-300 max-w-sm leading-relaxed drop-shadow-sm">
        You've viewed all available pitches for now. Check back soon for new startup pitches.
      </p>
    </div>
  );
}
