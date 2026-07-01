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
    // Only fetch for real (Mongo ObjectId) founders
    if (!/^[a-f0-9]{24}$/i.test(founder._id)) {
      setPitches([]);
      return;
    }
    setLoading(true);
    videoService
      .getUserPitches(founder._id)
      .then((res) => {
        const data = res?.data?.data;
        setPitches(data?.videos || data || []);
      })
      .catch(() => setPitches([]))
      .finally(() => setLoading(false));
  }, [open, founder?._id]);

  if (!founder) return null;

  const website = founder.website;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      maxWidth="max-w-md sm:max-w-2xl"
    >
      <div>
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <img
            src={
              founder.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name || "U")}&background=1B5E3F&color=fff`
            }
            alt={founder.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gold/40 object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black flex items-center gap-1 mb-0.5">
              {founder.name}
              {founder.isVerified && (
                <MdVerified className="w-5 h-5 text-gold flex-shrink-0" />
              )}
            </h2>
            {founder.companyName && (
              <p className="text-sm text-gold font-bold mb-1">
                {founder.companyName}
              </p>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gold hover:underline flex items-center gap-1 truncate"
              >
                <HiGlobe className="w-3.5 h-3.5" />
                {website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {founder.bio && (
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            {founder.bio}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
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
        <div className="flex gap-2 mb-5">
          <motion.button
            onClick={onToggleFollow}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isFollowing
                ? "bg-transparent border-2 border-white/30 text-white"
                : "bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </motion.button>
        </div>

        {/* Pitches grid — Instagram profile feel */}
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">
            Pitches ({pitches.length})
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </div>
          ) : pitches.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No pitches uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {pitches.map((p) => {
                const likeCount =
                  p.likeCount ?? (Array.isArray(p.likes) ? p.likes.length : 0);
                return (
                  <motion.button
                    key={p._id}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => onPickPitch?.(p)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black group"
                  >
                    <img
                      src={p.coverUrl || p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiPlay className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-2 text-[10px] font-bold text-white">
                      <span className="flex items-center gap-0.5">
                        <HiHeart className="w-3 h-3" />
                        {likeCount > 999
                          ? `${(likeCount / 1000).toFixed(1)}k`
                          : likeCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <HiEye className="w-3 h-3" />
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
    <div className="text-center bg-dark-bg/40 rounded-xl p-2.5">
      <Icon className="w-4 h-4 mx-auto text-gold mb-1" />
      <p className="font-black text-base">
        {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
      </p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
        {label}
      </p>
    </div>
  );
}
