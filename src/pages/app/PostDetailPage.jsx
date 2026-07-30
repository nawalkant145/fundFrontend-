import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
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

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowButton from "../../components/monetization/FollowButton";
import CommentsPanel from "../../components/dashboard/CommentsPanel";
import { postService } from "../../services/postService";
import { MOCK_POSTS } from "../../constants/mockData";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

/**
 * Instagram-style post detail page.
 * Carousel + caption + real like / save / comment / share.
 */
export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const applyPost = (p) => {
    if (!p) return;
    const uid = user?._id;
    setPost(p);
    setLiked(
      !!(
        uid &&
        Array.isArray(p.likes) &&
        p.likes.some((id) => (id._id || id).toString() === uid)
      ),
    );
    setSaved(
      !!(
        uid &&
        Array.isArray(p.saves) &&
        p.saves.some((id) => (id._id || id).toString() === uid)
      ),
    );
    setLikeCount(Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === "number" ? p.likes : 0));
    setCommentCount(p.commentCount || 0);
  };

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !postId) return;
    const onEngagement = (data) => {
      if (data.postId === postId && typeof data.commentCount === "number") {
        setCommentCount(data.commentCount);
      }
    };
    socket.on("post:engagement", onEngagement);
    return () => socket.off("post:engagement", onEngagement);
  }, [socket, postId]);

  // Fetch the post — fall back to MOCK_POSTS if API returns nothing (demo mode)
  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    postService
      .getById(postId)
      .then((res) => {
        const data = res?.data?.data;
        const p = data?.post || data || null;
        if (p) {
          applyPost(p);
        } else {
          // API returned nothing — check MOCK_POSTS
          const mock = MOCK_POSTS.find((m) => m._id === postId) || null;
          applyPost(mock);
          if (!mock) setPost(null);
        }
      })
      .catch(() => {
        // API error — fall back to MOCK_POSTS
        const mock = MOCK_POSTS.find((m) => m._id === postId) || null;
        applyPost(mock);
        if (!mock) setPost(null);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Keyboard nav for image carousel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") navigate(-1);
      if (!post?.images?.length) return;
      if (e.key === "ArrowLeft" && imgIdx > 0) setImgIdx(imgIdx - 1);
      if (e.key === "ArrowRight" && imgIdx < post.images.length - 1)
        setImgIdx(imgIdx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imgIdx, post, navigate]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    postService
      .like(postId)
      .then((res) => {
        const d = res?.data?.data;
        if (d && typeof d.count === "number") setLikeCount(d.count);
        if (d && typeof d.liked === "boolean") setLiked(d.liked);
      })
      .catch(() => {
        setLiked(!next);
        setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      });
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    postService.save(postId).catch(() => setSaved(!next));
  };

  const share = async () => {
    const url = `${window.location.origin}/app/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this post", url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    navigator.clipboard?.writeText(url);
    toast.success("Link copied");
  };

  if (loading) {
    return (
      <DashboardShell title="Post">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!post) {
    return (
      <DashboardShell title="Post">
        <div className="text-center py-20 text-gray-400">Post not found.</div>
      </DashboardShell>
    );
  }

  const isText = post.type === "text" || !post.images?.length;
  const totalImgs = post.images?.length || 0;

  return (
    <DashboardShell noPad>
      <div className="min-h-[100dvh] bg-[#FAFAF7] py-6 sm:py-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1F14]/65 hover:text-[#0F4A2E] mb-4 transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white border border-[#1B5E3F]/12 rounded-3xl shadow-sm overflow-hidden grid lg:grid-cols-[1.2fr_1fr]">
            {/* LEFT — image / text canvas */}
            <div className="relative bg-black aspect-square lg:aspect-auto flex items-center justify-center">
              {!isText ? (
                <>
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={imgIdx}
                      src={post.images[imgIdx]}
                      alt=""
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full object-contain"
                    />
                  </AnimatePresence>

                  {totalImgs > 1 && (
                    <>
                      {imgIdx > 0 && (
                        <button
                          onClick={() => setImgIdx(imgIdx - 1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F4A2E] flex items-center justify-center shadow-lg transition-all"
                        >
                          <HiChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      {imgIdx < totalImgs - 1 && (
                        <button
                          onClick={() => setImgIdx(imgIdx + 1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0F4A2E] flex items-center justify-center shadow-lg transition-all"
                        >
                          <HiChevronRight className="w-5 h-5" />
                        </button>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {post.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              i === imgIdx
                                ? "w-6 bg-white"
                                : "w-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/55 text-white text-[10px] font-bold rounded">
                        {imgIdx + 1} / {totalImgs}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="p-8 sm:p-12 max-w-xl text-center">
                  <p className="text-lg sm:text-xl text-white leading-relaxed whitespace-pre-wrap">
                    {post.caption}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — author + caption + actions */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 p-5 border-b border-[#1B5E3F]/10">
                <img
                  src={post.authorId.avatar}
                  alt=""
                  className="w-11 h-11 rounded-full ring-2 ring-[#1B5E3F]/15 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm inline-flex items-center gap-1">
                    {post.authorId.name}
                    {post.authorId.isVerified && (
                      <MdVerified className="w-4 h-4 text-[#F5B942]" />
                    )}
                  </p>
                  <p className="text-xs text-[#0A1F14]/55">
                    @{post.authorId.username} · {post.authorId.companyName}
                  </p>
                </div>
                {post.authorId._id !== user?._id && (
                  <FollowButton userId={post.authorId._id} variant="outline" />
                )}
              </div>

              {!isText && post.caption && (
                <div className="p-5 border-b border-[#1B5E3F]/10">
                  <p className="text-sm text-[#0A1F14]/85 whitespace-pre-wrap leading-relaxed">
                    {post.caption}
                  </p>
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
                  {post.hashtags?.length > 0 && (
                    <p className="mt-2 text-xs font-semibold text-[#1B5E3F]">
                      {post.hashtags.map((h) => `#${h}`).join(" ")}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="p-5 border-b border-[#1B5E3F]/10 flex items-center gap-3">
                <button
                  onClick={toggleLike}
                  className={`p-2 rounded-full transition-colors ${
                    liked
                      ? "text-red-500"
                      : "text-[#0A1F14]/65 hover:text-red-500"
                  }`}
                >
                  {liked ? (
                    <HiHeart className="w-7 h-7" />
                  ) : (
                    <HiOutlineHeart className="w-7 h-7" />
                  )}
                </button>
                <button
                  onClick={() => setShowComments(true)}
                  className="p-2 text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                >
                  <HiChatAlt2 className="w-7 h-7" />
                </button>
                <button
                  onClick={share}
                  className="p-2 text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                >
                  <HiShare className="w-7 h-7" />
                </button>
                <button
                  onClick={toggleSave}
                  className={`ml-auto p-2 rounded-full transition-colors ${
                    saved
                      ? "text-[#1B5E3F]"
                      : "text-[#0A1F14]/65 hover:text-[#1B5E3F]"
                  }`}
                >
                  {saved ? (
                    <HiBookmark className="w-7 h-7" />
                  ) : (
                    <HiOutlineBookmark className="w-7 h-7" />
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="px-5 py-3 text-sm">
                <p className="font-bold text-[#0A1F14]">
                  {likeCount.toLocaleString()} likes ·{" "}
                  <button
                    onClick={() => setShowComments(true)}
                    className="hover:underline"
                  >
                    {commentCount} comments
                  </button>
                </p>
                <p className="text-xs text-[#0A1F14]/55">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Open comments */}
              <div className="mt-auto p-4 border-t border-[#1B5E3F]/10">
                <button
                  onClick={() => setShowComments(true)}
                  className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full text-sm text-[#0A1F14]/55 text-left hover:border-[#1B5E3F]/30 transition-colors"
                >
                  Add a comment…
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentsPanel
        open={showComments}
        onClose={() => setShowComments(false)}
        postId={postId}
        totalCount={commentCount}
        onCommentAdded={(newCount) =>
          setCommentCount((c) => (typeof newCount === "number" ? newCount : c + 1))
        }
        onCommentDeleted={(newCount) =>
          setCommentCount((c) =>
            typeof newCount === "number" ? newCount : Math.max(0, c - 1),
          )
        }
      />
    </DashboardShell>
  );
}
