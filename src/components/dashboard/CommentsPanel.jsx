import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiHeart, HiOutlineHeart, HiEmojiHappy } from "react-icons/hi";
import { MdVerified } from "react-icons/md";

/**
 * Instagram-style side panel for comments.
 *   - Desktop: slides in from the right next to the video, video keeps playing
 *   - Mobile: bottom sheet that slides up from the bottom (Insta mobile pattern)
 */
export default function CommentsPanel({ open, onClose, comments = [], onAdd }) {
  const [text, setText] = useState("");
  const [likes, setLikes] = useState({});

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      _id: `c_${Date.now()}`,
      author: "You",
      handle: "you",
      text: text.trim(),
      time: "now",
      isVerified: false,
      replies: 0,
      likes: 0,
    });
    setText("");
  };

  const toggleLike = (id) => setLikes((p) => ({ ...p, [id]: !p[id] }));

  const fakeSeed = [
    {
      _id: "f1",
      author: "Vikram Patel",
      handle: "vikram_capital",
      text: "Strong traction, would love to see CAC numbers. 🚀",
      time: "2h",
      isVerified: true,
      likes: 124,
      replies: 8,
    },
    {
      _id: "f2",
      author: "Meera Kapoor",
      handle: "meera_invests",
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
      text: "How do you handle data privacy with the diagnostic AI?",
      time: "2d",
      isVerified: false,
      likes: 18,
      replies: 2,
    },
  ];
  const all = [...fakeSeed, ...comments];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile backdrop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed z-[70] bg-card-bg border-l-2 border-gold/15 shadow-2xl shadow-black/60
                       bottom-0 right-0
                       w-full md:w-[400px] lg:w-[440px]
                       h-[80vh] md:h-screen
                       md:top-0
                       rounded-t-3xl md:rounded-none
                       flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/10">
              <h2 className="font-bold text-base">
                Comments{" "}
                <span className="text-gray-400 text-sm font-normal">
                  ({all.length})
                </span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-dark-bg/60 rounded-lg text-gray-400 hover:text-white"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile drag handle */}
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {all.map((c) => (
                <CommentRow
                  key={c._id}
                  c={c}
                  isLiked={!!likes[c._id]}
                  onToggleLike={() => toggleLike(c._id)}
                />
              ))}
              {all.length === 0 && (
                <p className="text-center text-gray-400 py-12 text-sm">
                  No comments yet. Be the first.
                </p>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={submit}
              className="p-3 border-t border-gold/10 flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gold transition-colors"
              >
                <HiEmojiHappy className="w-5 h-5" />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2 bg-dark-bg/60 border border-gold/15 rounded-full text-white placeholder-gray-500 focus:border-gold focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  text.trim()
                    ? "text-gold hover:text-bright-gold"
                    : "text-gray-500 cursor-not-allowed"
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
      <div className="w-9 h-9 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-sm flex-shrink-0">
        {c.author[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-bold text-sm flex items-center gap-1">
            {c.handle || c.author.toLowerCase().replace(/\s/g, "_")}
            {c.isVerified && <MdVerified className="w-3.5 h-3.5 text-gold" />}
          </span>
          <span className="text-xs text-gray-500">{c.time}</span>
        </div>
        <p className="text-sm text-gray-100 leading-snug mt-0.5">{c.text}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
          {c.likes > 0 && (
            <span className="font-semibold">
              {c.likes + (isLiked ? 1 : 0)} like
              {c.likes + (isLiked ? 1 : 0) === 1 ? "" : "s"}
            </span>
          )}
          <button className="font-semibold hover:text-white transition-colors">
            Reply
          </button>
        </div>
        {c.replies > 0 && (
          <button className="text-xs text-gray-400 hover:text-white font-semibold mt-1.5 flex items-center gap-1">
            <span className="w-6 h-px bg-gray-600" />
            View {c.replies} {c.replies === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>
      <button onClick={onToggleLike} className="self-start mt-1 flex-shrink-0">
        {isLiked ? (
          <HiHeart className="w-4 h-4 text-red-500" />
        ) : (
          <HiOutlineHeart className="w-4 h-4 text-gray-400 hover:text-white" />
        )}
      </button>
    </div>
  );
}
