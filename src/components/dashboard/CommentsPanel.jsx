import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { commentService } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getFullMockComments } from "../../constants/mockData";

                                                                                                                                                                                                                       
export default function CommentsPanel({
  open,
  onClose,
  videoId,
  postId,
  totalCount,
  onCommentAdded,
  onCommentDeleted,
}) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localLikes, setLocalLikes] = useState({});
  const [replyTo, setReplyTo] = useState(null);                          
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const targetId = videoId || postId;

                                                                      
  const fetchComments = (params) => {
    if (videoId) return commentService.list(videoId, params);
    if (postId) return commentService.listByPost(postId, params);
    return Promise.reject(new Error("No target id"));
  };

                                                        
  const getFallbackComments = (id, count) => {
    if (!id) return [];
    return getFullMockComments(id, count);
  };

                                     
  useEffect(() => {
    if (!open || !targetId) return;

    const isRealMongoId = /^[a-f0-9]{24}$/i.test(targetId);
    if (!isRealMongoId) {
      setComments(getFallbackComments(targetId, totalCount));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchComments({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data;
        const raw = data?.comments ?? (Array.isArray(data) ? data : []);
        setComments(
          raw.map((c) => ({
            ...c,
            _replies: [],
            _repliesLoaded: false,
            _repliesOpen: false,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, targetId]);

                                                       
  useEffect(() => {
    if (!socket || !open || !targetId) return;

    socket.emit("join_target", { videoId, postId });

    const onDeleted = (data) => {
      const match = videoId ? data.videoId === videoId : data.postId === postId;
      if (!match) return;

      if (data.parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === data.parentId
              ? {
                  ...c,
                  replyCount:
                    typeof data.replyCount === "number"
                      ? data.replyCount
                      : Math.max(0, (c.replyCount || 1) - 1),
                  _replies: (c._replies || []).filter(
                    (r) => r._id !== data.commentId,
                  ),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c._id !== data.commentId));
      }
      if (typeof data.commentCount === "number") {
        onCommentDeleted?.(data.commentCount);
      }
    };

    const onNew = (data) => {
      const match = videoId ? data.videoId === videoId : data.postId === postId;
      if (!match) return;

      if (data.parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id !== data.parentId) return c;
            const replies = c._replies || [];
            if (replies.some((r) => r._id === data.comment._id)) return c;

            const isOwn =
              (data.comment.userId?._id || data.comment.userId)?.toString() ===
              user?._id?.toString();

            if (isOwn) {
              const hasOptimistic = replies.some(
                (r) =>
                  typeof r._id === "string" &&
                  (r._id.startsWith("c_") || r._id.startsWith("temp_")) &&
                  r.text === data.comment.text,
              );
              if (hasOptimistic) {
                return {
                  ...c,
                  _replies: replies.map((r) =>
                    typeof r._id === "string" &&
                    (r._id.startsWith("c_") || r._id.startsWith("temp_")) &&
                    r.text === data.comment.text
                      ? { ...data.comment, _isOwn: true }
                      : r,
                  ),
                };
              }
            }

            return {
              ...c,
              replyCount:
                typeof data.replyCount === "number"
                  ? data.replyCount
                  : (c.replyCount || 0) + 1,
              _repliesOpen: true,
              _repliesLoaded: true,
              _replies: [...replies, data.comment],
            };
          }),
        );
      } else {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;

          const isOwn =
            (data.comment.userId?._id || data.comment.userId)?.toString() ===
            user?._id?.toString();

          if (isOwn) {
            const hasOptimistic = prev.some(
              (c) =>
                typeof c._id === "string" &&
                (c._id.startsWith("c_") || c._id.startsWith("temp_")) &&
                c.text === data.comment.text,
            );
            if (hasOptimistic) {
              return prev.map((c) =>
                typeof c._id === "string" &&
                (c._id.startsWith("c_") || c._id.startsWith("temp_")) &&
                c.text === data.comment.text
                  ? { ...data.comment, _isOwn: true }
                  : c,
              );
            }
          }

          return [data.comment, ...prev];
        });
      }
      if (typeof data.commentCount === "number") {
        onCommentAdded?.(data.commentCount);
      }
    };

    const onUpdated = (data) => {
      const match = videoId ? data.videoId === videoId : data.postId === postId;
      if (!match) return;

      setComments((prev) =>
        prev.map((c) => {
          if (c._id === data.commentId) {
            return { ...c, text: data.text, isEdited: true };
          }
          if (c._replies && c._replies.length > 0) {
            return {
              ...c,
              _replies: c._replies.map((r) =>
                r._id === data.commentId
                  ? { ...r, text: data.text, isEdited: true }
                  : r,
              ),
            };
          }
          return c;
        }),
      );
    };

    const onLiked = (data) => {
      const match = videoId ? data.videoId === videoId : data.postId === postId;
      if (!match) return;

      setComments((prev) =>
        prev.map((c) => {
          if (c._id === data.commentId) {
            return { ...c, likeCount: data.likeCount, count: data.likeCount };
          }
          if (c._replies && c._replies.length > 0) {
            return {
              ...c,
              _replies: c._replies.map((r) =>
                r._id === data.commentId
                  ? { ...r, likeCount: data.likeCount, count: data.likeCount }
                  : r,
              ),
            };
          }
          return c;
        }),
      );
    };

    socket.on("comment:deleted", onDeleted);
    socket.on("comment:new", onNew);
    socket.on("comment:updated", onUpdated);
    socket.on("comment:liked", onLiked);

    return () => {
      socket.emit("leave_target", { videoId, postId });
      socket.off("comment:deleted", onDeleted);
      socket.off("comment:new", onNew);
      socket.off("comment:updated", onUpdated);
      socket.off("comment:liked", onLiked);
    };
  }, [
    socket,
    open,
    targetId,
    videoId,
    postId,
    onCommentAdded,
    onCommentDeleted,
  ]);

                    
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

                                                                               
                                                                         
                                  
                                                                             
                                                                    
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    if (open) {
      document.body.classList.add("comments-sheet-open");
    } else {
      document.body.classList.remove("comments-sheet-open");
    }
    return () => {
      document.body.classList.remove("comments-sheet-open");
    };
  }, [open]);

                                                        
  const makeComment = (commentText, parentId = null) => ({
    _id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: {
      _id: user?._id,
      name: user?.name || "You",
      username: user?.username || "you",
      avatar: user?.avatar || "",
      isVerified: user?.isVerified || false,
    },
    text: commentText,
    parentId,
    createdAt: new Date().toISOString(),
    likes: [],
    replyCount: 0,
    _isOwn: true,
    _replies: [],
    _repliesLoaded: true,
    _repliesOpen: true,
  });

                              
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const parentId = replyTo?.parentId || null;
    const finalText = replyTo
      ? `@${replyTo.username} ${text.trim()}`
      : text.trim();

    const optimistic = makeComment(finalText, parentId);

    if (parentId) {
                                                             
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? {
                ...c,
                replyCount: (c.replyCount || 0) + 1,
                _repliesOpen: true,
                _repliesLoaded: true,
                _replies: [...(c._replies || []), optimistic],
              }
            : c,
        ),
      );
    } else {
      setComments((prev) => [optimistic, ...prev]);
      onCommentAdded?.();
    }

    setText("");
    setReplyTo(null);

                                                                                     
    const isRealMongoId = targetId && /^[a-f0-9]{24}$/i.test(targetId);
    if (isRealMongoId) {
      commentService
        .create({ videoId, postId, text: finalText, parentId })
        .then((res) => {
          const real = res?.data?.data?.comment || res?.data?.data;
          if (!real?._id) return;
          if (parentId) {
            setComments((prev) =>
              prev.map((c) => {
                if (c._id !== parentId) return c;
                const replies = c._replies || [];
                if (replies.some((r) => r._id === real._id)) {
                  return {
                    ...c,
                    _replies: replies.filter((r) => r._id !== optimistic._id),
                  };
                }
                return {
                  ...c,
                  _replies: replies.map((r) =>
                    r._id === optimistic._id ? { ...real, _isOwn: true } : r,
                  ),
                };
              }),
            );
          } else {
            setComments((prev) => {
              if (prev.some((c) => c._id === real._id)) {
                return prev.filter((c) => c._id !== optimistic._id);
              }
              return prev.map((c) =>
                c._id === optimistic._id
                  ? {
                      ...real,
                      _isOwn: true,
                      _replies: [],
                      _repliesLoaded: true,
                      _repliesOpen: false,
                    }
                  : c,
              );
            });
          }
        })
        .catch(() => {});
    }
  };

                                        
  const toggleReplies = (comment) => {
                                               
    if (comment._repliesLoaded) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id ? { ...c, _repliesOpen: !c._repliesOpen } : c,
        ),
      );
      return;
    }
                            
    fetchComments({ parentId: comment._id, limit: 50 })
      .then((res) => {
        const data = res?.data?.data;
        const replies = data?.comments ?? (Array.isArray(data) ? data : []);
        setComments((prev) =>
          prev.map((c) =>
            c._id === comment._id
              ? {
                  ...c,
                  _replies: replies,
                  _repliesLoaded: true,
                  _repliesOpen: true,
                }
              : c,
          ),
        );
      })
      .catch(() => {});
  };

  const handleLike = (commentId) => {
    setLocalLikes((p) => ({ ...p, [commentId]: !p[commentId] }));
    commentService.like(commentId).catch(() => {});
  };

                                          
  const handleDelete = (comment, parentId = null) => {
    const previous = comments;

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? {
                ...c,
                replyCount: Math.max(0, (c.replyCount || 1) - 1),
                _replies: (c._replies || []).filter(
                  (r) => r._id !== comment._id,
                ),
              }
            : c,
        ),
      );
    } else {
      setComments((prev) => prev.filter((c) => c._id !== comment._id));
    }
    onCommentDeleted?.();

    const isRealMongoId = comment._id && /^[a-f0-9]{24}$/i.test(comment._id);
    if (isRealMongoId) {
      commentService
        .remove(comment._id)
        .then((res) => {
          const d = res?.data?.data;
          if (d && typeof d.commentCount === "number") {
            onCommentDeleted?.(d.commentCount);
          }
        })
        .catch(() => {
                                                
          setComments(previous);
        });
    }
  };

                                                                                             
  const startReply = (comment, topLevelParentId = null) => {
    const author = comment.userId || {};
    const username =
      author.username ||
      (author.name || "user").toLowerCase().replace(/\s+/g, "_");
                                                                                       
    const parentId = topLevelParentId || comment._id;
    setReplyTo({ parentId, username });
    setText("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

                                                                                
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

                                                                                
  const panelContent = (
    <motion.aside
      key="comments-aside"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className={[
                                     
        "fixed z-[70] bg-white bottom-0 left-0 right-0",
                                           
        "md:left-auto md:right-0 md:top-0 md:w-[400px]",
                                                         
        "h-[75vh] md:h-full",
        "rounded-t-2xl md:rounded-none",
        "flex flex-col shadow-2xl",
      ].join(" ")}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {                        }
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {            }
      <div className="flex items-center justify-center relative px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-base text-gray-900">
          Comments {comments.length > 0 ? `(${comments.length})` : ""}
        </h2>
        <button
          onClick={onClose}
          className="absolute right-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {          }
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-gray-600 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-900 font-bold text-base mb-1">
              No comments yet
            </p>
            <p className="text-gray-400 text-sm">Start the conversation.</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="space-y-3">
              {                       }
              <Comment
                data={c}
                currentUserId={user?._id}
                isLikedLocal={localLikes[c._id]}
                onLike={() => handleLike(c._id)}
                onReply={() => startReply(c)}
                onDelete={() => handleDelete(c)}
              />

              {                                }
              {c.replyCount > 0 && (
                <button
                  onClick={() => toggleReplies(c)}
                  className="ml-12 flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="w-6 h-px bg-gray-300 inline-block" />
                  {c._repliesOpen
                    ? "Hide replies"
                    : `View ${c.replyCount === 1 ? "1 reply" : `all ${c.replyCount} replies`}`}
                </button>
              )}

              {                               }
              <AnimatePresence>
                {c._repliesOpen && c._replies?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-12 space-y-4 overflow-hidden"
                  >
                    {c._replies.map((r) => (
                      <Comment
                        key={r._id}
                        data={r}
                        isReply
                        currentUserId={user?._id}
                        isLikedLocal={localLikes[r._id]}
                        onLike={() => handleLike(r._id)}
                        onReply={() => startReply(r, c._id)}
                        onDelete={() => handleDelete(r, c._id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {               }
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Replying to{" "}
            <span className="font-bold text-gray-700">@{replyTo.username}</span>
          </p>
          <button
            onClick={() => setReplyTo(null)}
            className="text-xs font-bold text-blue-500"
          >
            ✕
          </button>
        </div>
      )}

      {              }
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-gray-100 flex items-center gap-3 bg-white"
      >
        <CommentAvatar src={user?.avatar} name={user?.name} size={32} />
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            replyTo ? `Reply to @${replyTo.username}…` : "Add a comment…"
          }
          className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className={`text-sm font-bold transition-colors ${
            text.trim() ? "text-blue-500" : "text-blue-500/30 cursor-default"
          }`}
        >
          Post
        </button>
      </form>
    </motion.aside>
  );

                                                                                
  const backdrop = (
    <motion.div
      key="comments-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[60]"
    />
  );

                                                                                
                                                                         
                                                                               
                                                                               
    
                                                                 
  return (
    <AnimatePresence>
      {open && (
        <>
          {isMobile ? (
            createPortal(
              <>
                {backdrop}
                {panelContent}
              </>,
              document.body,
            )
          ) : (
            <>
              {backdrop}
              {panelContent}
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

                                                                
function Comment({
  data,
  currentUserId,
  isLikedLocal,
  onLike,
  onReply,
  onDelete,
  isReply,
}) {
  const author = data.userId || {};
  const name = author.name || "User";
  const username = author.username || name.toLowerCase().replace(/\s+/g, "_");
  const avatar = author.avatar;
  const isVerified = author.isVerified || false;

  const isOwn =
    data._isOwn ||
    (currentUserId && String(author._id) === String(currentUserId));

  const baseLikes = Array.isArray(data.likes) ? data.likes.length : 0;
  const alreadyLikedByMe =
    currentUserId &&
    Array.isArray(data.likes) &&
    data.likes.some((id) => String(id) === String(currentUserId));

  const showLiked =
    isLikedLocal !== undefined ? isLikedLocal : alreadyLikedByMe;
  let displayLikes = baseLikes;
  if (isLikedLocal && !alreadyLikedByMe) displayLikes = baseLikes + 1;
  if (isLikedLocal === false && alreadyLikedByMe) displayLikes = baseLikes - 1;

  const avatarSize = isReply ? 28 : 36;

  return (
    <div className="flex gap-3 group">
      <CommentAvatar src={avatar} name={name} size={avatarSize} />

      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-[1.4] text-gray-900">
          <span className="font-bold mr-1 inline-flex items-center gap-0.5">
            {username}
            {isVerified && (
              <MdVerified className="w-3 h-3 text-[#3897f0] ml-0.5" />
            )}
          </span>
          <span className="font-normal">{data.text}</span>
        </p>

        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-medium">
          <span>{formatTimeAgo(data.createdAt)}</span>
          {displayLikes > 0 && (
            <span className="font-bold text-gray-500">
              {formatCount(displayLikes)}{" "}
              {displayLikes === 1 ? "like" : "likes"}
            </span>
          )}
          <button
            onClick={onReply}
            className="font-bold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Reply
          </button>
          {isOwn && (
            <button
              onClick={onDelete}
              className="font-bold text-gray-400 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <button onClick={onLike} className="self-start mt-1 flex-shrink-0 p-1">
        {showLiked ? (
          <HiHeart className="w-3 h-3 text-red-500" />
        ) : (
          <HiOutlineHeart className="w-3 h-3 text-gray-300 hover:text-gray-500 transition-colors" />
        )}
      </button>
    </div>
  );
}

                                                                
function CommentAvatar({ src, name, size = 36 }) {
  const style = { width: size, height: size, minWidth: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        style={style}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }

  const initials = (name || "U")
    .split(" ")
    .map((w) => w?.[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={style}
      className="rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white-force font-bold"
    >
      <span style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
}

                                                                
function formatTimeAgo(dateStr) {
  if (!dateStr) return "now";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function formatCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
