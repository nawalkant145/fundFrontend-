import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiShare,
  HiFlag,
  HiEye,
  HiCurrencyDollar,
  HiUserAdd,
  HiDocumentText,
  HiVolumeUp,
  HiVolumeOff,
  HiPaperAirplane,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";
import { formatINR } from "../../constants/mockData";
import { useAuth } from "../../context/AuthContext";
import { chatService } from "../../services/chatService";
import FollowButton from "../monetization/FollowButton";

export default function PitchDetailModal({ pitch, open, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?._id;
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [comments, setComments] = useState([
    {
      _id: "c1",
      user: {
        name: "Vikram Patel",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      },
      text: "Loved your traction numbers. What's your CAC right now?",
      createdAt: "2h",
      likes: 12,
    },
    {
      _id: "c2",
      user: {
        name: "Meera Kapoor",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      },
      text: "Following — would love to learn more about the unit economics.",
      createdAt: "5h",
      likes: 4,
    },
  ]);
  const [draft, setDraft] = useState("");

  if (!pitch) return null;
  const f = pitch.founderId;
  const founderId = f?._id || pitch?.founderId?._id || pitch?.founderId;

  const handleMessageFounder = () => {
    if (!founderId) return;
    chatService
      .startChat(founderId)
      .then((res) => {
        const chat = res?.data?.data?.chat || res?.data?.data;
        onClose?.();
        navigate(chat?._id ? `/app/messages/${chat._id}` : "/app/messages");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Could not start chat");
      });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((p) => [
      {
        _id: `c_${Date.now()}`,
        user: {
          name: "You",
          avatar:
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
        },
        text: draft.trim(),
        createdAt: "now",
        likes: 0,
      },
      ...p,
    ]);
    setDraft("");
    toast.success("Comment posted");
  };

  return (
    <Modal open={open} onClose={onClose} size="xl" title={pitch.title || "Pitch Details"} noPadding>
      <div className="flex flex-col lg:grid lg:grid-cols-[1.1fr_380px] max-h-[85dvh] lg:max-h-[720px] bg-[#0A1F14] text-white overflow-y-auto lg:overflow-hidden">
        {                       }
        <div className="relative bg-black aspect-video max-h-[32vh] sm:max-h-[40vh] lg:aspect-auto lg:max-h-none lg:min-h-[600px] w-full flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={pitch.coverUrl || pitch.thumbnailUrl}
            alt={pitch.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F14] via-transparent to-black/40 pointer-events-none" />

          <button
            onClick={() => setMuted((v) => !v)}
            className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dark-navy/70 backdrop-blur border border-gold/30 flex items-center justify-center z-10 transition-transform active:scale-95"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <HiVolumeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            ) : (
              <HiVolumeUp className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            )}
          </button>

          {pitch.industry && (
            <div className="absolute top-3 left-3 px-2.5 py-0.5 sm:py-1 bg-gold/90 text-dark-navy text-[10px] font-black rounded-full uppercase z-10">
              {pitch.industry}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10">
            <h2 className="text-lg sm:text-2xl font-black mb-1 sm:mb-2 line-clamp-1">{pitch.title}</h2>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 sm:line-clamp-3">
              {pitch.description}
            </p>
          </div>
        </div>

        {                }
        <div className="flex flex-col flex-1 min-w-0 bg-[#0F2D1E] text-white border-t lg:border-t-0 lg:border-l border-gold/15 lg:max-h-[720px] lg:h-[720px] overflow-hidden">
          {                    }
          <div className="p-3 sm:p-4 border-b border-gold/10 flex items-center gap-3 bg-[#0F2D1E] flex-shrink-0">
            <img
              src={
                f?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  f?.name || pitch.authorName || "Founder",
                )}&background=152820&color=d4af37`
              }
              alt={f?.name || "Founder"}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gold/40 object-cover bg-dark-navy flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  f?.name || "Founder",
                )}&background=152820&color=d4af37`;
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold flex items-center gap-1 text-xs sm:text-sm truncate">
                {f?.name || pitch.authorName || "Founder"}
                {f?.isVerified && <MdVerified className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold flex-shrink-0" />}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-300 truncate">
                {f?.companyName || pitch.companyName || ""}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <FollowButton userId={founderId} variant="compact" />
              {founderId && founderId.toString() !== userId?.toString() && (
                <button
                  className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#F5B942] border border-[#F5B942] text-black hover:bg-[#e0a838] text-xs font-black rounded-full transition-transform active:scale-95 flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-sm"
                  onClick={handleMessageFounder}
                >
                  <HiChatAlt2 className="w-3.5 h-3.5 text-black" /> Message
                </button>
              )}
            </div>
          </div>

          {                }
          <div className="p-2 sm:p-3 border-b border-gold/10 grid grid-cols-4 gap-1 sm:gap-2 flex-shrink-0">
            <ActionPill
              icon={HiHeart}
              label={pitch.likes ? (Array.isArray(pitch.likes) ? pitch.likes.length + (liked ? 1 : 0) : pitch.likes + (liked ? 1 : 0)) : (liked ? 1 : 0)}
              active={liked}
              activeClass="text-red-400 bg-red-500/10"
              onClick={() => {
                setLiked((v) => !v);
                toast.success(liked ? "Unliked" : "Liked!");
              }}
            />
            <ActionPill
              icon={HiBookmark}
              label={pitch.saves ? (Array.isArray(pitch.saves) ? pitch.saves.length + (saved ? 1 : 0) : pitch.saves + (saved ? 1 : 0)) : (saved ? 1 : 0)}
              active={saved}
              activeClass="text-gold bg-gold/10"
              onClick={() => {
                setSaved((v) => !v);
                toast.success(saved ? "Removed from saved" : "Saved");
              }}
            />
            <ActionPill
              icon={HiShare}
              label="Share"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `https://expglofund.com/pitch/${pitch._id}`,
                );
                toast.success("Link copied to clipboard");
              }}
            />
            <ActionPill
              icon={HiFlag}
              label="Report"
              onClick={() => setShowReport(true)}
            />
          </div>

          {                }
          <div className="p-3 sm:p-4 border-b border-gold/10 grid grid-cols-3 gap-2 text-center flex-shrink-0">
            <Info label="Asking" value={formatINR(pitch.askAmount)} />
            <Info label="Equity" value={`${pitch.equityOffered}%`} />
            <Info label="Stage" value={pitch.fundingStage} />
          </div>

          <div className="p-2.5 sm:p-3 border-b border-gold/10 grid grid-cols-3 gap-2 flex-shrink-0">
            <SmallStat icon={HiEye} value={pitch.views} />
            <SmallStat icon={HiHeart} value={Array.isArray(pitch.likes) ? pitch.likes.length : (pitch.likes || 0)} />
            <SmallStat
              icon={HiChatAlt2}
              value={pitch.commentCount || pitch.comments || 0}
            />
          </div>

          {                 }
          <div className="p-3 sm:p-4 border-b border-gold/10 grid grid-cols-2 gap-2 flex-shrink-0">
            <button
              onClick={() => toast.success("Investment interest sent")}
              className="px-2.5 sm:px-3 py-2.5 bg-gradient-to-r from-gold to-bright-gold text-dark-navy text-xs font-black rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg shadow-gold/20 truncate"
            >
              <HiCurrencyDollar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Express Interest</span>
            </button>
            <button
              onClick={() => toast.success("Deck access requested")}
              className="px-2.5 sm:px-3 py-2.5 bg-dark-bg/60 border-2 border-gold/30 hover:border-gold text-xs font-black rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all truncate text-white"
            >
              <HiDocumentText className="w-4 h-4 flex-shrink-0 text-gold" />
              <span className="truncate">Request Deck</span>
            </button>
          </div>

          {              }
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-[140px]">
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
              Comments · {comments.length}
            </p>
            {comments.map((c) => (
              <div key={c._id} className="flex gap-2.5">
                <img
                  src={c.user.avatar}
                  alt={c.user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-[#0A1F14]/70 rounded-xl rounded-tl-sm p-2.5">
                    <p className="text-xs font-bold text-gold">{c.user.name}</p>
                    <p className="text-xs sm:text-sm text-gray-200">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-3 px-1 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {c.createdAt}
                    </span>
                    <button className="text-[10px] text-gray-300 hover:text-red-400 font-semibold">
                      ♥ {c.likes}
                    </button>
                    <button className="text-[10px] text-gray-300 hover:text-white font-semibold">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {              }
          <form
            onSubmit={submitComment}
            className="p-2.5 sm:p-3 border-t border-gold/10 flex items-center gap-2 bg-[#0A1F14] flex-shrink-0"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 bg-[#0F2D1E] border border-gold/20 rounded-xl text-xs sm:text-sm text-white placeholder-gray-400 focus:border-gold focus:outline-none"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-gradient-to-br from-gold to-bright-gold text-dark-navy rounded-xl flex-shrink-0"
            >
              <HiPaperAirplane className="w-4 h-4 rotate-90" />
            </motion.button>
          </form>
        </div>
      </div>

      <ReportModal open={showReport} onClose={() => setShowReport(false)} />
    </Modal>
  );
}

function ActionPill({ icon: Icon, label, active, activeClass = "", onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-colors ${
        active
          ? activeClass
          : "text-gray-300 hover:bg-dark-bg/60 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
        {label}
      </p>
      <p className="text-sm font-black capitalize text-gold">{value}</p>
    </div>
  );
}

function SmallStat({ icon: Icon, value }) {
  return (
    <div className="bg-dark-bg/60 rounded-lg py-2 flex flex-col items-center gap-0.5">
      <Icon className="w-4 h-4 text-gold" />
      <span className="text-xs font-bold">
        {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
      </span>
    </div>
  );
}

function ReportModal({ open, onClose }) {
  const toast = useToast();
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!type) return;
    toast.success("Report submitted. Our team will review.");
    onClose();
    setType("");
    setDesc("");
  };
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Report this pitch">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "spam", l: "Spam" },
            { v: "fake", l: "Fake / Misleading" },
            { v: "inappropriate", l: "Inappropriate" },
            { v: "scam", l: "Scam" },
          ].map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setType(t.v)}
              className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                type === t.v
                  ? "bg-red-500/20 border-red-500/60 text-red-400"
                  : "bg-dark-bg/60 border-gold/15 text-gray-300 hover:border-gold/40"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Tell us more (optional)…"
          rows={3}
          className="w-full px-3 py-3 bg-dark-bg/60 border-2 border-gold/15 rounded-xl text-sm focus:border-gold focus:outline-none resize-none"
        />
        <button
          type="submit"
          disabled={!type}
          className={`w-full py-3 rounded-xl font-bold ${
            type
              ? "bg-red-500 hover:bg-red-600 text-white-force"
              : "bg-dark-bg text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit report
        </button>
      </form>
    </Modal>
  );
}
