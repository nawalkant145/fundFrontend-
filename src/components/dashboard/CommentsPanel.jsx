import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiHeart, HiOutlineHeart, HiEmojiHappy } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { commentService } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";

/**
 * Instagram-style comments bottom sheet.
 * Fetches from real API if videoId is provided; shows seed + local comments otherwise.
 */
export default function CommentsPanel({
  open,
  onClose,
  comments = [],
  onAdd,
  videoId,
}) {
  const [text, setText] = useState("");
  const [likes, setLikes] = useState({});
  const [realComments, setRealComments] = useState([]);
  const [loadedFromApi, setLoadedFromApi] = useState(false);
  const { user } = useAuth();

  // Fetch real comments when panel opens
  useEffect(() => {
    if (!open || !videoId) return;
    commentService
      .list(videoId, { limit: 30 })
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.comments || data || [];
        if (list.length > 0) {
          setRealComments(list);
          setLoadedFromApi(true);
        }
      })
      .catch(() => {});
  }, [open, videoId]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newComment = {
      _id: `c_${Date.now()}`,
      author: user?.name || "You",
      handle: user?.username || "you",
      avatar: user?.avatar || "",
      text: text.trim(),
      time: "now",
      isVerified: user?.isVerified || false,
      replies: 0,
      likes: 0,
    };
    // Optimistic — add to local list immediately
    setRealComments((prev) => [newComment, ...prev]);
    onAdd?.(newComment);
    setText("");
    // Fire API call in background
    if (videoId) {
      commentService.create({ videoId, text: newComment.text }).catch(() => {});
    }
  };

  const toggleLike = (id) => {
    setLikes((p) => ({ ...p, [id]: !p[id] }));
    commentService.like(id).catch(() => {});
  };

  const fakeSeed = [
    {
      _id: "f1",
      author: "Vikram Patel",
      handle: "vikram_capital",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      text: "Strong traction, would love to see CAC numbers 🚀",
      time: "2h",
      isVerified: true,
      likes: 124,
      replies: 8,
    },
    {
      _id: "f2",
      author: "Meera Kapoor",
      handle: "meera_invests",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
      text: "Brilliant pitch — what's the regulatory roadmap?",
      time: "5h",
      isVerified: true,
      likes: 56,
      replies: 3,
    },
    {
      _id: "f3",
      author: "Arjun Nair",
      handle: "arjun_n",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
      text: "Followed. Excited to see where this goes.",
      time: "1d",
      isVerified: false,
      likes: 21,
      replies: 0,
    },
    {
      _id: "f4",
      author: "Karan Mehta",
      handle: "karan_m",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
      text: "How do you handle data privacy with the diagnostic AI?",
      time: "2d",
      isVerified: false,
      likes: 18,
      replies: 2,
    },
  ];
  const all = loadedFromApi
    ? [...realComments]
    : [...fakeSeed, ...comments, ...realComments];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />

          {/* Bottom sheet (mobile) / side panel (desktop) */}
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed z-[70] bg-white
                       bottom-0 left-0 right-0
                       md:left-auto md:right-0 md:top-0 md:w-[420px]
                       h-[70vh] md:h-full
                       rounded-t-2xl md:rounded-none
                       flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-9 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-center relative px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-[15px] text-gray-900">Comments</h2>
              <button
                onClick={onClose}
                className="absolute right-4 p-1 text-gray-400 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
              {all.map((c) => (
                <CommentRow
                  key={c._id}
                  c={c}
                  isLiked={!!likes[c._id]}
                  onToggleLike={() => toggleLike(c._id)}
                />
              ))}
              {all.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-gray-400 text-sm">No comments yet</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Start the conversation.
                  </p>
                </div>
              )}
            </div>

            {/* Composer — Instagram style */}
            <form
              onSubmit={submit}
              className="px-4 py-3 border-t border-gray-100 flex items-center gap-3"
            >
              <img
                src={user?.avatar || ""}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className={`text-sm font-bold transition-colors ${
                  text.trim()
                    ? "text-[#1B5E3F]"
                    : "text-[#1B5E3F]/30 cursor-not-allowed"
                }`}
              >
                Post
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CommentRow({ c, isLiked, onToggleLike }) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <img
        src={c.avatar}
        alt=""
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-gray-900 leading-snug">
          <span className="font-semibold inline-flex items-center gap-1">
            {c.handle || c.author.toLowerCase().replace(/\s/g, "_")}
            {c.isVerified && <MdVerified className="w-3 h-3 text-blue-500" />}
          </span>{" "}
          {c.text}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
          <span>{c.time}</span>
          {c.likes > 0 && (
            <span className="font-semibold">
              {c.likes + (isLiked ? 1 : 0)} likes
            </span>
          )}
          <button className="font-semibold hover:text-gray-600 transition-colors">
            Reply
          </button>
        </div>
        {c.replies > 0 && (
          <button className="text-[11px] text-gray-400 font-semibold mt-2 flex items-center gap-2">
            <span className="w-6 h-px bg-gray-300" />
            View {c.replies} {c.replies === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Like button */}
      <button
        onClick={onToggleLike}
        className="self-start mt-1 flex-shrink-0 p-1"
      >
        {isLiked ? (
          <HiHeart className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <HiOutlineHeart className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
    </div>
  );
}
