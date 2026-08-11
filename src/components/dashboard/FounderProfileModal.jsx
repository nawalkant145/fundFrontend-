import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiPlay,
  HiHeart,
  HiEye,
  HiGlobe,
  HiVideoCamera,
  HiUsers,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import Modal from "../ui/Modal";
import { videoService } from "../../services/videoService";

import { FOUNDER_PROFILES, MOCK_PITCHES } from "../../constants/mockData";

/**
 * Instagram-style founder profile preview.
 * Fetches the founder's real active pitches + follower counts.
 */
export default function FounderProfileModal({
  open,
  onClose,
  founder,
  isFollowing,
  onToggleFollow,
  onPickPitch,
}) {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !founder?._id) return;

    const fallbackPitches =
      FOUNDER_PROFILES[founder._id]?.pitches ||
      MOCK_PITCHES.filter(
        (p) => (p.founderId?._id || p.founderId) === founder._id,
      );
    setPitches(fallbackPitches);

    // Only fetch from API for real (Mongo ObjectId) founders
    if (!/^[a-f0-9]{24}$/i.test(founder._id)) {
      return;
    }

    setLoading(true);
    videoService
      .getUserPitches(founder._id)
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.videos || data || [];
        if (list.length > 0) setPitches(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, founder?._id]);

  if (!founder) return null;

  const website = founder.website;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={founder.name || "Founder Profile"}
      maxWidth="max-w-md sm:max-w-xl"
    >
      <div className="text-[#0A1F14]">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <img
            src={
              founder.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name || "U")}&background=1B5E3F&color=fff`
            }
            alt={founder.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#1B5E3F]/30 object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#0A1F14] flex items-center gap-1 mb-0.5 truncate">
              {founder.name}
              {founder.isVerified && (
                <MdVerified className="w-4 h-4 text-[#F5B942] flex-shrink-0" />
              )}
            </h2>
            {founder.companyName && (
              <p className="text-xs sm:text-sm text-[#1B5E3F] font-bold mb-0.5 truncate">
                {founder.companyName}
              </p>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1B5E3F] hover:underline flex items-center gap-1 truncate font-medium"
              >
                <HiGlobe className="w-3.5 h-3.5 flex-shrink-0" />
                {website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {founder.bio && (
          <p className="text-xs sm:text-sm text-[#0A1F14]/80 mb-4 leading-relaxed bg-[#FAFAF7] p-3 rounded-xl border border-[#1B5E3F]/10">
            {founder.bio}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <Stat icon={HiVideoCamera} label="Pitches" value={pitches.length} />
          <Stat
            icon={HiUsers}
            label="Followers"
            value={founder.followersCount || 0}
          />
          <Stat
            icon={HiUsers}
            label="Following"
            value={founder.followingCount || 0}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <motion.button
            onClick={onToggleFollow}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              isFollowing
                ? "bg-[#FAFAF7] border-2 border-[#1B5E3F]/30 text-[#0F4A2E]"
                : "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white-force shadow-md"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </motion.button>
        </div>

        {/* Pitches grid — Instagram profile feel */}
        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-[#0A1F14]/60 mb-2">
            Pitches ({pitches.length})
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-[#1B5E3F]/30 border-t-[#1B5E3F] animate-spin" />
            </div>
          ) : pitches.length === 0 ? (
            <p className="text-center text-[#0A1F14]/55 text-xs py-6">
              No pitches uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {pitches.map((p) => {
                const likeCount =
                  p.likeCount ?? (Array.isArray(p.likes) ? p.likes.length : 0);
                return (
                  <motion.button
                    key={p._id}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => onPickPitch?.(p)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black group"
                  >
                    <img
                      src={p.coverUrl || p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiPlay className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-2 text-[10px] font-bold text-white">
                      <span className="flex items-center gap-0.5">
                        <HiHeart className="w-3 h-3 text-[#F5B942]" />
                        {likeCount > 999
                          ? `${(likeCount / 1000).toFixed(1)}k`
                          : likeCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <HiEye className="w-3 h-3 text-[#F5B942]" />
                        {(p.views || 0) > 999
                          ? `${((p.views || 0) / 1000).toFixed(1)}k`
                          : p.views || 0}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="text-center bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-xl p-2 sm:p-2.5">
      <Icon className="w-4 h-4 mx-auto text-[#1B5E3F] mb-0.5" />
      <p className="font-black text-sm sm:text-base text-[#0A1F14]">
        {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
      </p>
      <p className="text-[9px] sm:text-[10px] text-[#0A1F14]/55 uppercase tracking-wide font-bold">
        {label}
      </p>
    </div>
  );
}
