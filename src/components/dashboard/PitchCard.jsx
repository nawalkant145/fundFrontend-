import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiPlay,
  HiEye,
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiShare,
  HiFlag,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { formatINR } from "../../constants/mockData";
import DropdownMenu from "../ui/DropdownMenu";
import { useToast } from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { videoService } from "../../services/videoService";
import { chatService } from "../../services/chatService";
import FollowButton from "../monetization/FollowButton";

/**
 * Grid pitch card. Clicking the card redirects to the feed with this pitch
 * pre-selected — same pattern Instagram uses on its profile/explore grids.
 * No inline video player here; the feed handles playback.
 */
export default function PitchCard({ pitch }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?._id;

  const isInitiallyLiked = Boolean(
    Array.isArray(pitch?.likes) &&
      userId &&
      pitch.likes.some(
        (id) => (id?._id || id)?.toString() === userId.toString(),
      ),
  );

  const isInitiallySaved = Boolean(
    Array.isArray(pitch?.saves) &&
      userId &&
      pitch.saves.some(
        (id) => (id?._id || id)?.toString() === userId.toString(),
      ),
  );

  const [liked, setLiked] = useState(isInitiallyLiked);
  const [saved, setSaved] = useState(isInitiallySaved);
  const [likesCount, setLikesCount] = useState(
    Array.isArray(pitch?.likes)
      ? pitch.likes.length
      : Number(pitch?.likes || 0),
  );
  const [savesCount, setSavesCount] = useState(
    Array.isArray(pitch?.saves)
      ? pitch.saves.length
      : Number(pitch?.saves || 0),
  );
  const [commentCount, setCommentCount] = useState(
    () => pitch?.commentCount || pitch?.comments || 0,
  );

  useEffect(() => {
    setLiked(isInitiallyLiked);
    setSaved(isInitiallySaved);
    setLikesCount(
      Array.isArray(pitch?.likes)
        ? pitch.likes.length
        : Number(pitch?.likes || 0),
    );
    setSavesCount(
      Array.isArray(pitch?.saves)
        ? pitch.saves.length
        : Number(pitch?.saves || 0),
    );
    setCommentCount(pitch?.commentCount || pitch?.comments || 0);
  }, [pitch, userId]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !pitch?._id) return;
    const onEngagement = (data) => {
      if (data.videoId === pitch._id && typeof data.commentCount === "number") {
        setCommentCount(data.commentCount);
      }
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket, pitch?._id]);

  if (!pitch) return null;

  // Handle founderId being an object, a string ID, or null/undefined
  const f =
    typeof pitch.founderId === "object" && pitch.founderId !== null
      ? pitch.founderId
      : {};

  const founderName = f.name || pitch.authorName || "Founder";
  const founderCompany =
    f.companyName || pitch.companyName || pitch.industry || "";

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    founderName,
  )}&background=152820&color=d4af37`;

  const avatarUrl = f.avatar || defaultAvatar;

  const founderId =
    typeof pitch.founderId === "object" && pitch.founderId !== null
      ? pitch.founderId._id
      : pitch.founderId || pitch.userId || pitch.authorId;

  const handleProfileClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (founderId) {
      navigate(`/app/u/${founderId}`);
    }
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!founderId) return;
    chatService
      .startChat(founderId)
      .then((res) => {
        const chat = res?.data?.data?.chat || res?.data?.data;
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Could not start chat");
      });
  };

  const openInFeed = () => {
    // Navigate to /app/pitch?pitch=<id> — the feed reads ?pitch and jumps to it
    navigate(`/app/pitch?pitch=${pitch._id}`);
  };

  const menu = [
    {
      label: "Open in feed",
      icon: HiPlay,
      onClick: openInFeed,
    },
    {
      label: "Share",
      icon: HiShare,
      onClick: () => {
        navigator.clipboard?.writeText(
          `${window.location.origin}/pitch/${pitch._id}`,
        );
        toast.success("Link copied");
      },
    },
    {
      label: "Not interested",
      icon: HiFlag,
      onClick: () => toast.info("We won't show this again"),
    },
    {
      label: "Report",
      icon: HiFlag,
      danger: true,
      onClick: () => toast.warn("Reported. Our team will review."),
    },
  ];

  const handleLikeClick = (e) => {
    e.stopPropagation();
    const next = !liked;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(pitch._id));

    setLiked(next);
    setLikesCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    if (isRealMongoId) {
      videoService
        .like(pitch._id)
        .then(() => {
          toast.success(next ? "Liked pitch" : "Unliked pitch");
        })
        .catch(() => {
          setLiked(!next);
          setLikesCount((c) => (next ? Math.max(0, c - 1) : c + 1));
          toast.error("Failed to update like status");
        });
    } else {
      toast.success(next ? "Liked pitch" : "Unliked pitch");
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    const next = !saved;
    const isRealMongoId = /^[a-f0-9]{24}$/i.test(String(pitch._id));

    setSaved(next);
    setSavesCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    if (isRealMongoId) {
      videoService
        .save(pitch._id)
        .then(() => {
          toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
        })
        .catch(() => {
          setSaved(!next);
          setSavesCount((c) => (next ? Math.max(0, c - 1) : c + 1));
          toast.error("Failed to update save status");
        });
    } else {
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    }
  };

  return (
    <motion.div
      onClick={openInFeed}
      className="group relative text-left bg-card-bg border-2 border-gold/10 rounded-2xl overflow-visible hover:border-gold/40 transition-all w-full cursor-pointer"
      whileHover={{ y: -6 }}
    >
      {/* 3-dot menu — outside overflow-hidden so dropdown isn't clipped */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {pitch.duration > 0 && (
          <span className="px-2.5 py-1 bg-dark-navy/80 text-white-force text-[11px] font-bold rounded-full backdrop-blur">
            {pitch.duration}s
          </span>
        )}
        <DropdownMenu
          items={menu}
          triggerClass="p-1.5 rounded-full bg-dark-navy/80 backdrop-blur text-white-force hover:bg-dark-navy"
        />
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-dark-bg">
        <img
          src={pitch.coverUrl || pitch.thumbnailUrl}
          alt={pitch.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = "0.5";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {pitch.industry && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary-green text-white-force text-[11px] font-bold rounded-full z-10">
            {pitch.industry}
          </div>
        )}

        {/* Hover play indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center shadow-2xl">
            <HiPlay className="w-7 h-7 text-dark-navy ml-1" />
          </div>
        </div>

        {/* Founder avatar, info, and action buttons on image overlay */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between gap-1.5 sm:gap-2 z-20 text-white-force min-w-0">
          <div
            onClick={handleProfileClick}
            className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 cursor-pointer group/author"
          >
            <img
              src={avatarUrl}
              alt={founderName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gold/40 object-cover bg-dark-navy group-hover/author:border-gold transition-colors shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-bold text-white-force truncate flex items-center gap-1 group-hover/author:underline">
                <span className="truncate">{founderName}</span>
                {f.isVerified && (
                  <MdVerified className="w-3.5 h-3.5 text-gold shrink-0" />
                )}
              </p>
              {founderCompany && (
                <p className="text-[9px] sm:text-[10px] text-white-force/80 truncate">
                  {founderCompany}
                </p>
              )}
            </div>
          </div>
          <div
            className="flex items-center gap-1 sm:gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <FollowButton userId={founderId} variant="compact" />
            {founderId && founderId.toString() !== userId?.toString() && (
              <button
                onClick={handleMessageClick}
                className="px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold rounded-full inline-flex items-center gap-1 transition-all bg-[#F5B942] text-black border border-[#F5B942] hover:bg-[#e0a838] active:scale-95 shrink-0 shadow-sm"
              >
                <HiChatAlt2 className="w-3 h-3 text-black" /> <span className="hidden sm:inline">Message</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-sm mb-1 line-clamp-1 text-[#0A1F14]">
          {pitch.title}
        </h4>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {pitch.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gold font-bold">
            {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10 text-xs text-gray-500 gap-1.5 min-w-0">
          <Stat icon={HiEye} value={pitch.views || 0} />
          <Stat
            icon={HiHeart}
            value={likesCount}
            active={liked}
            onClick={handleLikeClick}
          />
          <Stat
            icon={HiBookmark}
            value={savesCount}
            active={saved}
            onClick={handleSaveClick}
          />
          <Stat
            icon={HiChatAlt2}
            value={commentCount}
          />
        </div>
      </div>
    </motion.div>
  );
}

function formatViewsCount(num) {
  const val = Number(num) || 0;
  if (val < 1000) return `${val}`;
  if (val < 1000000) {
    const k = val / 1000;
    return k % 1 === 0 ? `${k}K` : `${Number(k.toFixed(1))}K`;
  }
  const m = val / 1000000;
  return m % 1 === 0 ? `${m}M` : `${Number(m.toFixed(1))}M`;
}

function Stat({ icon: Icon, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 min-w-0 transition-colors ${
        active ? "text-gold" : "hover:text-[#0A1F14]"
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{formatViewsCount(value)}</span>
    </button>
  );
}

