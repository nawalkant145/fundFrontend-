import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiVolumeUp,
  HiVolumeOff,
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiCurrencyDollar,
  HiShare,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import ShortsPlayer from "./ShortsPlayer";
import CommentsPanel from "./CommentsPanel";
import ShareSheet from "./ShareSheet";
import { formatINR } from "../../constants/mockData";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { videoService } from "../../services/videoService";
import { isFollowing, follow as followUser, unfollow as unfollowUser } from "../../lib/auth";

/**
 * Full-screen pitch preview modal.
 * Opens like an Instagram Reels overlay — click outside or press ✕ to close.
 * Accepts a pitch object directly (no routing needed).
 */
export default function PitchPreviewModal({ pitch: initialPitch, onClose, onPitchUpdated }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [pitch, setPitch] = useState(initialPitch);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'comments' | 'share'
  const [following, setFollowing] = useState(false);
  const overlayRef = useRef(null);

  const founder =
    pitch?.founderId && typeof pitch.founderId === "object"
      ? pitch.founderId
      : {};

  // Initialise like / save state from pitch object
  useEffect(() => {
    if (!pitch) return;
    const uid = user?._id;
    const isLiked =
      pitch.isLiked ??
      (Array.isArray(pitch.likes) && uid
        ? pitch.likes.some((id) => (id._id || id).toString() === uid.toString())
        : false);
    const isSaved =
      pitch.isSaved ??
      (Array.isArray(pitch.saves) && uid
        ? pitch.saves.some((id) => (id._id || id).toString() === uid.toString())
        : false);
    setLiked(isLiked);
    setLikeCount(pitch.likeCount ?? (Array.isArray(pitch.likes) ? pitch.likes.length : 0));
    setSaved(isSaved);
    setSaveCount(pitch.saveCount ?? (Array.isArray(pitch.saves) ? pitch.saves.length : 0));
    setFollowing(founder?._id ? isFollowing(founder._id) : false);
  }, [pitch?._id]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Socket listener for pitch engagement (likeCount, saveCount, commentCount)
  useEffect(() => {
    if (!socket || !pitch?._id) return;
    const onEngagement = (data) => {
      if (data.videoId === pitch._id) {
        let changed = false;
        let updatedPitch = { ...pitch };

        if (typeof data.likeCount === "number" && data.likeCount !== likeCount) {
          setLikeCount(data.likeCount);
          updatedPitch.likeCount = data.likeCount;
          changed = true;
        }
        if (typeof data.saveCount === "number" && data.saveCount !== saveCount) {
          setSaveCount(data.saveCount);
          updatedPitch.saveCount = data.saveCount;
          changed = true;
        }
        if (typeof data.commentCount === "number" && data.commentCount !== pitch.commentCount) {
          setPitch((p) => ({ ...p, commentCount: data.commentCount }));
          updatedPitch.commentCount = data.commentCount;
          changed = true;
        }

        if (changed) {
          onPitchUpdated?.(updatedPitch);
        }
      }
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket, pitch?._id, pitch, likeCount, saveCount, onPitchUpdated]);

  // Click outside (on dark backdrop) closes modal — but only if no sheet is open
  const handleOverlayClick = (e) => {
    if (activeSheet) return;
    if (e.target === overlayRef.current) onClose();
  };

  const toggleLike = () => {
    if (!pitch?._id) return;
    const next = !liked;
    const nextCount = Math.max(0, likeCount + (next ? 1 : -1));
    setLiked(next);
    setLikeCount(nextCount);
    onPitchUpdated?.({
      ...pitch,
      isLiked: next,
      likeCount: nextCount,
    });
    videoService
      .like(pitch._id)
      .then((res) => {
        const d = res?.data?.data || res?.data;
        if (d && typeof d.totalLikes === "number") {
          setLikeCount(d.totalLikes);
          onPitchUpdated?.({
            ...pitch,
            isLiked: d.liked ?? next,
            likeCount: d.totalLikes,
          });
        }
      })
      .catch(() => {
        const prevLiked = !next;
        const prevCount = Math.max(0, nextCount + (prevLiked ? 1 : -1));
        setLiked(prevLiked);
        setLikeCount(prevCount);
        onPitchUpdated?.({
          ...pitch,
          isLiked: prevLiked,
          likeCount: prevCount,
        });
      });
  };

  const toggleSave = () => {
    if (!pitch?._id) return;
    const next = !saved;
    const nextCount = Math.max(0, saveCount + (next ? 1 : -1));
    setSaved(next);
    setSaveCount(nextCount);
    onPitchUpdated?.({
      ...pitch,
      isSaved: next,
      saveCount: nextCount,
    });
    videoService
      .save(pitch._id)
      .then((res) => {
        const d = res?.data?.data || res?.data;
        if (d && typeof d.totalSaves === "number") {
          setSaveCount(d.totalSaves);
          onPitchUpdated?.({
            ...pitch,
            isSaved: d.saved ?? next,
            saveCount: d.totalSaves,
          });
        }
      })
      .catch(() => {
        const prevSaved = !next;
        const prevCount = Math.max(0, nextCount + (prevSaved ? 1 : -1));
        setSaved(prevSaved);
        setSaveCount(prevCount);
        onPitchUpdated?.({
          ...pitch,
          isSaved: prevSaved,
          saveCount: prevCount,
        });
      });
  };

  const toggleFollow = () => {
    const id = founder?._id;
    if (!id) return;
    if (following) unfollowUser(id);
    else followUser(id);
    setFollowing((f) => !f);
  };

  if (!pitch) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        key="pitch-preview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      >
        {/* ── Main card ── */}
        <motion.div
          key="pitch-preview-card"
          initial={{ scale: 0.92, opacity: 0, y: 32 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 32 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="relative flex flex-row w-full max-w-[480px] mx-4"
          style={{ height: "min(88vh, 860px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video container */}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-black">
            <ShortsPlayer
              src={pitch.videoUrl}
              poster={pitch.coverUrl || pitch.thumbnailUrl}
              muted={muted}
              active={!activeSheet}
            />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              <span className="px-2.5 py-0.5 bg-[#F5B942]/90 text-[#0A1F14] text-[11px] font-black rounded-full uppercase tracking-wide">
                {pitch.industry}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-all"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted
                    ? <HiVolumeOff className="w-4 h-4 text-white" />
                    : <HiVolumeUp className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-all"
                  title="Close"
                >
                  <HiX className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 pl-3 pr-16 pb-4 pt-2 z-10 pointer-events-none">
              {/* Founder row */}
              <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                <img
                  src={
                    founder?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(founder?.name || "U")}&background=1B5E3F&color=fff`
                  }
                  alt={founder?.name || "Founder"}
                  className="w-8 h-8 rounded-full border-2 border-[#F5B942] object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-[12px] text-white flex items-center gap-1 truncate leading-tight">
                    {founder?.name || "Founder"}
                    {founder?.isVerified && (
                      <MdVerified className="w-3.5 h-3.5 text-[#F5B942] flex-shrink-0" />
                    )}
                  </p>
                  <p className="text-[11px] text-gray-300 truncate leading-tight">
                    {founder?.companyName}
                  </p>
                </div>
                {founder?._id && (
                  <button
                    onClick={toggleFollow}
                    className={`ml-2 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all flex-shrink-0 ${
                      following
                        ? "border-white/40 text-white/70 bg-white/10"
                        : "border-[#F5B942] text-[#F5B942] bg-[#F5B942]/15 hover:bg-[#F5B942]/25"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              {/* Title */}
              <h3 className="font-black text-[15px] text-white leading-tight mb-0.5 pointer-events-auto line-clamp-2">
                {pitch.title}
              </h3>

              {/* Description */}
              <div className="pointer-events-auto">
                <p className={`text-[13px] text-gray-200 leading-snug ${expanded ? "" : "line-clamp-1"}`}>
                  {pitch.description}
                </p>
                {(pitch.description || "").length > 50 && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="text-[12px] text-gray-400 hover:text-[#F5B942] font-semibold mt-0.5"
                  >
                    {expanded ? "less" : "more"}
                  </button>
                )}
              </div>

              {/* Ask / stage pills */}
              <div className="flex items-center gap-2 mt-2 flex-wrap pointer-events-auto">
                <span className="px-2.5 py-1 bg-white/15 border border-white/30 rounded-full text-[11px] font-bold text-white flex items-center gap-1">
                  <HiCurrencyDollar className="w-3.5 h-3.5" />
                  {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
                </span>
                <span className="text-[11px] text-gray-300 capitalize">
                  {pitch.fundingStage}
                </span>
              </div>
            </div>
          </div>

          {/* ── Action rail (right of video) ── */}
          <div className="flex flex-col gap-5 items-center justify-end pb-6 pl-3">
            {/* Like */}
            <button
              onClick={toggleLike}
              className="flex flex-col items-center gap-0.5"
              title="Like"
            >
              <div className={`w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all ${liked ? "text-red-400" : "text-white"}`}>
                <HiHeart className="w-5 h-5" />
              </div>
              <span className="text-white text-[11px] font-semibold drop-shadow">{likeCount}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setActiveSheet("comments")}
              className="flex flex-col items-center gap-0.5"
              title="Comments"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all text-white">
                <HiChatAlt2 className="w-5 h-5" />
              </div>
              <span className="text-white text-[11px] font-semibold drop-shadow">
                {pitch.commentCount || 0}
              </span>
            </button>

            {/* Save */}
            <button
              onClick={toggleSave}
              className="flex flex-col items-center gap-0.5"
              title="Save"
            >
              <div className={`w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all ${saved ? "text-[#F5B942]" : "text-white"}`}>
                <HiBookmark className="w-5 h-5" />
              </div>
              <span className="text-white text-[11px] font-semibold drop-shadow">{saveCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setActiveSheet("share")}
              className="flex flex-col items-center gap-0.5"
              title="Share"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all text-white">
                <HiShare className="w-5 h-5" />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Comments sheet */}
        <CommentsPanel
          open={activeSheet === "comments"}
          onClose={() => setActiveSheet(null)}
          videoId={pitch._id}
          totalCount={pitch.commentCount}
          onCommentAdded={(newCount) => {
            const nextCount = typeof newCount === "number" ? newCount : (pitch.commentCount || 0) + 1;
            setPitch((p) => {
              const updated = { ...p, commentCount: nextCount };
              onPitchUpdated?.(updated);
              return updated;
            });
          }}
          onCommentDeleted={(newCount) => {
            const nextCount = typeof newCount === "number" ? newCount : Math.max(0, (pitch.commentCount || 0) - 1);
            setPitch((p) => {
              const updated = { ...p, commentCount: nextCount };
              onPitchUpdated?.(updated);
              return updated;
            });
          }}
        />

        {/* Share sheet */}
        <ShareSheet
          open={activeSheet === "share"}
          onClose={() => setActiveSheet(null)}
          pitch={pitch}
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
