import { useState } from "react";
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

export default function PitchDetailModal({ pitch, open, onClose }) {
  const toast = useToast();
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
    <Modal open={open} onClose={onClose} size="xl">
      <div className="grid lg:grid-cols-[1fr_420px]">
        {/* Video / thumbnail */}
        <div className="relative bg-black aspect-[4/5] lg:aspect-auto min-h-[400px] lg:min-h-[600px]">
          <img
            src={pitch.thumbnailUrl}
            alt={pitch.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-transparent to-transparent" />

          <button
            onClick={() => setMuted((v) => !v)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-dark-navy/60 backdrop-blur border border-gold/30 flex items-center justify-center"
          >
            {muted ? (
              <HiVolumeOff className="w-5 h-5 text-gold" />
            ) : (
              <HiVolumeUp className="w-5 h-5 text-gold" />
            )}
          </button>

          <div className="absolute top-3 left-3 px-3 py-1 bg-gold/90 text-dark-navy text-[10px] font-black rounded-full uppercase">
            {pitch.industry}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-black mb-2">{pitch.title}</h2>
            <p className="text-sm text-gray-200 line-clamp-3">
              {pitch.description}
            </p>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col h-[600px] lg:h-[700px]">
          {/* Founder header */}
          <div className="p-4 border-b border-gold/10 flex items-center gap-3">
            <img
              src={f.avatar}
              alt={f.name}
              className="w-12 h-12 rounded-full border-2 border-gold/40 object-cover"
            />
            <div className="min-w-0">
              <p className="font-bold flex items-center gap-1 text-sm">
                {f.name}
                {f.isVerified && <MdVerified className="w-4 h-4 text-gold" />}
              </p>
              <p className="text-xs text-gray-400">{f.companyName}</p>
            </div>
            <button
              className="ml-auto px-4 py-1.5 bg-gold text-dark-navy text-xs font-black rounded-full"
              onClick={() => toast.success("Following founder")}
            >
              Follow
            </button>
          </div>

          {/* Action bar */}
          <div className="p-4 border-b border-gold/10 grid grid-cols-4 gap-2">
            <ActionPill
              icon={HiHeart}
              label={pitch.likes.length + (liked ? 1 : 0)}
              active={liked}
              activeClass="text-red-400 bg-red-500/10"
              onClick={() => {
                setLiked((v) => !v);
                toast.success(liked ? "Unliked" : "Liked!");
              }}
            />
            <ActionPill
              icon={HiBookmark}
              label={pitch.saves.length + (saved ? 1 : 0)}
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

          {/* Quick info */}
          <div className="p-4 border-b border-gold/10 grid grid-cols-3 gap-3 text-center">
            <Info label="Asking" value={formatINR(pitch.askAmount)} />
            <Info label="Equity" value={`${pitch.equityOffered}%`} />
            <Info label="Stage" value={pitch.fundingStage} />
          </div>

          <div className="p-4 border-b border-gold/10 grid grid-cols-3 gap-2">
            <SmallStat icon={HiEye} value={pitch.views} />
            <SmallStat icon={HiHeart} value={pitch.likes.length} />
            <SmallStat icon={HiChatAlt2} value={pitch.comments} />
          </div>

          {/* CTA buttons */}
          <div className="p-4 border-b border-gold/10 grid grid-cols-2 gap-2">
            <button
              onClick={() => toast.success("Investment interest sent")}
              className="px-3 py-2.5 bg-gradient-to-r from-gold to-bright-gold text-dark-navy text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-gold/20"
            >
              <HiCurrencyDollar className="w-4 h-4" /> Express Interest
            </button>
            <button
              onClick={() => toast.success("Deck access requested")}
              className="px-3 py-2.5 bg-dark-bg/60 border-2 border-gold/30 hover:border-gold text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <HiDocumentText className="w-4 h-4" /> Request Deck
            </button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
              Comments · {comments.length}
            </p>
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <img
                  src={c.user.avatar}
                  alt={c.user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-dark-bg/60 rounded-2xl rounded-tl-sm px-3 py-2">
                    <p className="text-xs font-bold">{c.user.name}</p>
                    <p className="text-sm text-gray-200">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-3 px-2 mt-1">
                    <span className="text-[10px] text-gray-500">
                      {c.createdAt}
                    </span>
                    <button className="text-[10px] text-gray-400 hover:text-red-400 font-semibold">
                      ♥ {c.likes}
                    </button>
                    <button className="text-[10px] text-gray-400 hover:text-white font-semibold">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <form
            onSubmit={submitComment}
            className="p-3 border-t border-gold/10 flex items-center gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 bg-dark-bg/60 border border-gold/15 rounded-xl text-sm focus:border-gold focus:outline-none"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-gradient-to-br from-gold to-bright-gold text-dark-navy rounded-xl"
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
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-dark-bg text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit report
        </button>
      </form>
    </Modal>
  );
}
