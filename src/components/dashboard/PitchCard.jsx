import { useState } from "react";
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

/**
 * Grid pitch card. Clicking the card redirects to the feed with this pitch
 * pre-selected — same pattern Instagram uses on its profile/explore grids.
 * No inline video player here; the feed handles playback.
 */
export default function PitchCard({ pitch }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const f = pitch.founderId;

  const openInFeed = () => {
    // Navigate to /app/feed?pitch=<id> — the feed reads ?pitch and jumps to it
    navigate(`/app?pitch=${pitch._id}`);
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

  return (
    <motion.div
      onClick={openInFeed}
      className="group relative text-left bg-card-bg border-2 border-gold/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-all w-full cursor-pointer"
      whileHover={{ y: -6 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={pitch.coverUrl || pitch.thumbnailUrl}
          alt={pitch.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/30 to-transparent" />

        <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary-green text-white text-[11px] font-bold rounded-full">
          {pitch.industry}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className="px-2.5 py-1 bg-dark-navy/80 text-white text-[11px] font-bold rounded-full backdrop-blur">
            {pitch.duration}s
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu
              items={menu}
              triggerClass="p-1.5 rounded-full bg-dark-navy/80 backdrop-blur text-white hover:bg-dark-navy"
            />
          </div>
        </div>

        {/* Hover play indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center shadow-2xl">
            <HiPlay className="w-7 h-7 text-dark-navy ml-1" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <img
            src={f.avatar}
            alt={f.name}
            className="w-8 h-8 rounded-full border-2 border-gold/40"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate flex items-center gap-1">
              {f.name}
              {f.isVerified && <MdVerified className="w-3.5 h-3.5 text-gold" />}
            </p>
            <p className="text-[10px] text-gray-300 truncate">
              {f.companyName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold mb-1 line-clamp-1">{pitch.title}</h4>
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {pitch.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gold font-bold">
            {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10 text-xs text-gray-400">
          <Stat icon={HiEye} value={pitch.views} />
          <Stat
            icon={HiHeart}
            value={pitch.likes.length + (liked ? 1 : 0)}
            active={liked}
            onClick={(e) => {
              e.stopPropagation();
              setLiked((l) => !l);
              toast.success(liked ? "Unliked" : "Liked");
            }}
          />
          <Stat
            icon={HiBookmark}
            value={pitch.saves.length + (saved ? 1 : 0)}
            active={saved}
            onClick={(e) => {
              e.stopPropagation();
              setSaved((s) => !s);
              toast.success(saved ? "Unsaved" : "Saved");
            }}
          />
          <Stat icon={HiChatAlt2} value={pitch.comments} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 transition-colors ${
        active ? "text-gold" : "hover:text-white"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </button>
  );
}
