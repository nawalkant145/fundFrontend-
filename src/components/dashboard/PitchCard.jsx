import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiPlay,
  HiEye,
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiShare,
  HiFlag,
  HiCurrencyDollar,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { formatINR } from "../../constants/mockData";
import Modal from "../ui/Modal";
import DropdownMenu from "../ui/DropdownMenu";
import { useToast } from "../ui/Toast";

export default function PitchCard({ pitch }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const f = pitch.founderId;

  const menu = [
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
    <>
      <motion.div
        className="group relative text-left bg-card-bg border-2 border-gold/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-all w-full cursor-pointer"
        whileHover={{ y: -6 }}
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={pitch.thumbnailUrl}
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

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center">
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
                {f.isVerified && (
                  <MdVerified className="w-3.5 h-3.5 text-gold" />
                )}
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={pitch.title}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="aspect-[9/16] max-h-[60vh] mx-auto rounded-2xl overflow-hidden bg-black">
            <video
              src={pitch.videoUrl || "/pitchvideo.mp4"}
              controls
              autoPlay
              className="w-full h-full object-cover"
              poster={pitch.thumbnailUrl}
            />
          </div>
          <div className="flex items-center gap-3">
            <img
              src={f.avatar}
              alt={f.name}
              className="w-11 h-11 rounded-full border-2 border-gold/40"
            />
            <div>
              <p className="font-bold flex items-center gap-1">
                {f.name}
                {f.isVerified && <MdVerified className="w-4 h-4 text-gold" />}
              </p>
              <p className="text-xs text-gray-400">{f.companyName}</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">{pitch.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Detail label="Industry" value={pitch.industry} />
            <Detail label="Stage" value={pitch.fundingStage} />
            <Detail label="Asking" value={formatINR(pitch.askAmount)} />
            <Detail label="Equity" value={`${pitch.equityOffered}%`} />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setLiked((l) => !l)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                liked
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "border-gold/20 hover:border-gold/50"
              }`}
            >
              <HiHeart className="w-4 h-4" /> {liked ? "Liked" : "Like"}
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                saved
                  ? "bg-gold/20 border-gold/40 text-gold"
                  : "border-gold/20 hover:border-gold/50"
              }`}
            >
              <HiBookmark className="w-4 h-4" /> {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => toast.success("Interest expressed")}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center justify-center gap-1.5"
            >
              <HiCurrencyDollar className="w-4 h-4" /> Invest
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-dark-bg/40 rounded-lg p-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold capitalize text-sm">{value}</p>
    </div>
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
