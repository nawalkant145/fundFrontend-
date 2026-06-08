import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiArrowRight,
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiShare,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiLink,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowButton from "../../components/monetization/FollowButton";
import { MOCK_POSTS } from "../../constants/mockData";

/**
 * Instagram-style post detail page.
 * - Carousel of images with arrows + dots + keyboard nav
 * - Caption, link, hashtags, like / save / comment / share row
 * - Prev/next post navigation across the same author's posts
 */
export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const post = MOCK_POSTS.find((p) => p._id === postId) || MOCK_POSTS[0];
  const authorPosts = MOCK_POSTS.filter(
    (p) => p.authorId._id === post.authorId._id,
  );
  const idx = authorPosts.findIndex((p) => p._id === post._id);
  const prevPost = idx > 0 ? authorPosts[idx - 1] : null;
  const nextPost = idx < authorPosts.length - 1 ? authorPosts[idx + 1] : null;

  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset image index when navigating between posts
  useEffect(() => {
    setImgIdx(0);
  }, [postId]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") navigate(-1);
      if (e.key === "ArrowLeft") {
        if (post.images?.length > 1 && imgIdx > 0) setImgIdx(imgIdx - 1);
        else if (prevPost) navigate(`/app/post/${prevPost._id}`);
      }
      if (e.key === "ArrowRight") {
        if (post.images?.length > 1 && imgIdx < post.images.length - 1)
          setImgIdx(imgIdx + 1);
        else if (nextPost) navigate(`/app/post/${nextPost._id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imgIdx, post, prevPost, nextPost, navigate]);

  const isText = post.type === "text" || !post.images?.length;
  const totalImgs = post.images?.length || 0;

  return (
    <DashboardShell noPad>
      <div className="min-h-[100dvh] bg-[#FAFAF7] py-6 sm:py-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
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

            {/* RIGHT — author + caption + actions + comments */}
            <div className="flex flex-col">
              {/* Author */}
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
                <FollowButton userId={post.authorId._id} variant="outline" />
              </div>

              {/* Caption */}
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
                  onClick={() => setLiked((v) => !v)}
                  className={`p-2 rounded-full transition-colors ${
                    liked
                      ? "text-red-500"
                      : "text-[#0A1F14]/65 hover:text-red-500"
                  }`}
                >
                  <HiHeart className="w-7 h-7" />
                </button>
                <Link
                  to="#comments"
                  className="p-2 text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                >
                  <HiChatAlt2 className="w-7 h-7" />
                </Link>
                <button className="p-2 text-[#0A1F14]/65 hover:text-[#0F4A2E]">
                  <HiShare className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setSaved((v) => !v)}
                  className={`ml-auto p-2 rounded-full transition-colors ${
                    saved
                      ? "text-[#1B5E3F]"
                      : "text-[#0A1F14]/65 hover:text-[#1B5E3F]"
                  }`}
                >
                  <HiBookmark className="w-7 h-7" />
                </button>
              </div>

              {/* Stats */}
              <div className="px-5 py-3 text-sm">
                <p className="font-bold text-[#0A1F14]">
                  {(post.likes + (liked ? 1 : 0)).toLocaleString()} likes ·{" "}
                  {post.commentCount} comments
                </p>
                <p className="text-xs text-[#0A1F14]/55">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Comment input */}
              <div className="mt-auto p-4 border-t border-[#1B5E3F]/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a comment…"
                  className="flex-1 px-4 py-2.5 bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full text-sm focus:outline-none focus:border-[#1B5E3F]/40"
                />
                <button className="px-4 py-2 rounded-full text-sm font-bold text-[#1B5E3F]">
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Prev / next nav */}
          <div className="flex items-center justify-between mt-4 text-sm">
            {prevPost ? (
              <Link
                to={`/app/post/${prevPost._id}`}
                className="inline-flex items-center gap-1.5 font-bold text-[#0A1F14]/65 hover:text-[#0F4A2E]"
              >
                <HiArrowLeft className="w-4 h-4" /> Previous post
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link
                to={`/app/post/${nextPost._id}`}
                className="inline-flex items-center gap-1.5 font-bold text-[#0A1F14]/65 hover:text-[#0F4A2E]"
              >
                Next post <HiArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
