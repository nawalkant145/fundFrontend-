import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiHeart,
  HiOutlineHeart,
  HiBookmark,
  HiOutlineBookmark,
  HiChatAlt2,
  HiShare,
  HiChevronLeft,
  HiChevronRight,
  HiLink,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import CommentsPanel from "./CommentsPanel";
import ShareSheet from "./ShareSheet";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { postService } from "../../services/postService";

/**
 * Full-screen / popup overlay for viewing a post.
 * Allows liking, bookmarking, commenting, and sharing in a popup.
 */
export default function PostPreviewModal({ post: initialPost, onClose, onPostUpdated }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [post, setPost] = useState(initialPost);
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [activeSheet, setActiveSheet] = useState(null); // 'comments' | 'share'
  const overlayRef = useRef(null);

  const author =
    post?.authorId && typeof post.authorId === "object"
      ? post.authorId
      : {
          name: "Unknown",
          username: "unknown",
          avatar: "",
        };

  useEffect(() => {
    if (!post) return;
    const uid = user?._id;
    const isLiked =
      post.isLiked ??
      (Array.isArray(post.likes) && uid
        ? post.likes.some((id) => (id._id || id).toString() === uid.toString())
        : false);
    const isSaved =
      post.isSaved ??
      (Array.isArray(post.saves) && uid
        ? post.saves.some((id) => (id._id || id).toString() === uid.toString())
        : false);

    setLiked(isLiked);
    setLikeCount(
      typeof post.likeCount === "number"
        ? post.likeCount
        : Array.isArray(post.likes)
          ? post.likes.length
          : post.likes || 0
    );
    setSaved(isSaved);
    setSaveCount(
      typeof post.saveCount === "number"
        ? post.saveCount
        : Array.isArray(post.saves)
          ? post.saves.length
          : post.saves || 0
    );
    setCommentCount(post.commentCount || 0);
  }, [post?._id]);

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

  // Socket engagement listener
  useEffect(() => {
    if (!socket || !post?._id) return;
    const onEngagement = (data) => {
      if (data.postId === post._id) {
        let changed = false;
        let updatedPost = { ...post };

        if (typeof data.likeCount === "number" && data.likeCount !== likeCount) {
          setLikeCount(data.likeCount);
          updatedPost.likeCount = data.likeCount;
          changed = true;
        }
        if (typeof data.saveCount === "number" && data.saveCount !== saveCount) {
          setSaveCount(data.saveCount);
          updatedPost.saveCount = data.saveCount;
          changed = true;
        }
        if (typeof data.commentCount === "number" && data.commentCount !== commentCount) {
          setCommentCount(data.commentCount);
          updatedPost.commentCount = data.commentCount;
          changed = true;
        }

        if (changed) {
          onPostUpdated?.(updatedPost);
        }
      }
    };
    socket.on("post:engagement", onEngagement);
    return () => socket.off("post:engagement", onEngagement);
  }, [socket, post?._id, post, likeCount, saveCount, commentCount, onPostUpdated]);

  const toggleLike = () => {
    if (!post?._id) return;
    const next = !liked;
    const nextCount = Math.max(0, likeCount + (next ? 1 : -1));
    setLiked(next);
    setLikeCount(nextCount);
    onPostUpdated?.({
      ...post,
      isLiked: next,
      likeCount: nextCount,
    });
    postService
      .like(post._id)
      .then((res) => {
        const d = res?.data?.data || res?.data;
        if (d && typeof d.likeCount === "number") {
          setLikeCount(d.likeCount);
          onPostUpdated?.({
            ...post,
            isLiked: d.liked ?? next,
            likeCount: d.likeCount,
          });
        }
      })
      .catch(() => {
        const prevLiked = !next;
        const prevCount = Math.max(0, nextCount + (prevLiked ? 1 : -1));
        setLiked(prevLiked);
        setLikeCount(prevCount);
        onPostUpdated?.({
          ...post,
          isLiked: prevLiked,
          likeCount: prevCount,
        });
      });
  };

  const toggleSave = () => {
    if (!post?._id) return;
    const next = !saved;
    const nextCount = Math.max(0, saveCount + (next ? 1 : -1));
    setSaved(next);
    setSaveCount(nextCount);
    onPostUpdated?.({
      ...post,
      isSaved: next,
      saveCount: nextCount,
    });
    postService
      .save(post._id)
      .then((res) => {
        const d = res?.data?.data || res?.data;
        if (d && typeof d.saveCount === "number") {
          setSaveCount(d.saveCount);
          onPostUpdated?.({
            ...post,
            isSaved: d.saved ?? next,
            saveCount: d.saveCount,
          });
        }
      })
      .catch(() => {
        const prevSaved = !next;
        const prevCount = Math.max(0, nextCount + (prevSaved ? 1 : -1));
        setSaved(prevSaved);
        setSaveCount(prevCount);
        onPostUpdated?.({
          ...post,
          isSaved: prevSaved,
          saveCount: prevCount,
        });
      });
  };

  const handleOverlayClick = (e) => {
    if (activeSheet) return;
    if (e.target === overlayRef.current) onClose();
  };

  if (!post) return null;
  const images = post.images || [];

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        key="post-preview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6"
      >
        <motion.div
          key="post-preview-card"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white border border-[#1B5E3F]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90dvh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>

          {/* Left / Top: Media section */}
          {images.length > 0 ? (
            <div className="relative w-full md:w-3/5 bg-black flex items-center justify-center min-h-[280px] md:min-h-[480px]">
              <img
                src={images[imgIdx]}
                alt=""
                className="max-h-[50dvh] md:max-h-[85dvh] w-full object-contain"
              />

              {/* Carousel navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Right / Bottom: Post details & engagement */}
          <div className={`flex-1 flex flex-col ${images.length > 0 ? "w-full md:w-2/5" : "w-full"} overflow-hidden bg-white`}>
            {/* Author header */}
            <div className="p-4 border-b border-[#1B5E3F]/10 flex items-center gap-3">
              <img
                src={
                  author.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || "U")}&background=1B5E3F&color=fff`
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/15"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#0A1F14] inline-flex items-center gap-1 truncate">
                  {author.name}
                  {author.isVerified && <MdVerified className="w-4 h-4 text-[#F5B942]" />}
                </p>
                <p className="text-xs text-[#0A1F14]/55 truncate">@{author.username || "founder"}</p>
              </div>
            </div>

            {/* Caption & Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 text-sm text-[#0A1F14]">
              {post.caption && <p className="leading-relaxed whitespace-pre-wrap">{post.caption}</p>}

              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAFAF7] border border-[#1B5E3F]/15 text-xs font-bold text-[#1B5E3F] hover:underline"
                >
                  <HiLink className="w-3.5 h-3.5" />
                  {post.link.replace(/^https?:\/\//, "")}
                </a>
              )}

              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.hashtags.map((h) => (
                    <span key={h} className="text-xs font-bold text-[#1B5E3F]">
                      #{h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Engagement buttons */}
            <div className="p-4 border-t border-[#1B5E3F]/10 bg-[#FAFAF7]/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleLike}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#0A1F14] hover:opacity-75 transition-opacity"
                  >
                    {liked ? (
                      <HiHeart className="w-6 h-6 text-red-500" />
                    ) : (
                      <HiOutlineHeart className="w-6 h-6 text-[#0A1F14]/70" />
                    )}
                    <span>{likeCount.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={() => setActiveSheet("comments")}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#0A1F14] hover:opacity-75 transition-opacity"
                  >
                    <HiChatAlt2 className="w-6 h-6 text-[#0A1F14]/70" />
                    <span>{commentCount.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={() => setActiveSheet("share")}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#0A1F14] hover:opacity-75 transition-opacity"
                  >
                    <HiShare className="w-6 h-6 text-[#0A1F14]/70" />
                  </button>
                </div>

                <button
                  onClick={toggleSave}
                  className="text-[#0A1F14] hover:opacity-75 transition-opacity"
                >
                  {saved ? (
                    <HiBookmark className="w-6 h-6 text-[#1B5E3F]" />
                  ) : (
                    <HiOutlineBookmark className="w-6 h-6 text-[#0A1F14]/70" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments sheet */}
        <CommentsPanel
          open={activeSheet === "comments"}
          onClose={() => setActiveSheet(null)}
          postId={post._id}
          totalCount={commentCount}
          onCommentAdded={(newCount) => {
            const count = typeof newCount === "number" ? newCount : commentCount + 1;
            setCommentCount(count);
            onPostUpdated?.({ ...post, commentCount: count });
          }}
          onCommentDeleted={(newCount) => {
            const count = typeof newCount === "number" ? newCount : Math.max(0, commentCount - 1);
            setCommentCount(count);
            onPostUpdated?.({ ...post, commentCount: count });
          }}
        />

        {/* Share sheet */}
        <ShareSheet
          open={activeSheet === "share"}
          onClose={() => setActiveSheet(null)}
          title={post.caption ? post.caption.slice(0, 50) : "Post"}
          url={`${window.location.origin}/app/post/${post._id}`}
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
