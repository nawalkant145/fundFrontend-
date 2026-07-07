import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiGlobe,
  HiOfficeBuilding,
  HiBriefcase,
  HiChatAlt2,
  HiPlay,
  HiHeart,
  HiEye,
  HiVideoCamera,
  HiPhotograph,
  HiArrowLeft,
} from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowButton from "../../components/monetization/FollowButton";
import FollowListModal from "../../components/dashboard/FollowListModal";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";
import { chatService } from "../../services/chatService";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("pitches");
  const [followModal, setFollowModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    userService
      .getPublicProfile(userId)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setProfile(data?.user || data);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));

    videoService
      .getUserPitches(userId)
      .then((res) => {
        const data = res?.data?.data;
        setPitches(data?.videos || data || []);
      })
      .catch(() => setPitches([]));

    postService
      .getUserPosts(userId)
      .then((res) => {
        const data = res?.data?.data;
        setPosts(data?.posts || data || []);
      })
      .catch(() => setPosts([]));
  }, [userId]);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (me?._id === userId) navigate("/app/profile", { replace: true });
  }, [me, userId, navigate]);

  const message = async () => {
    if (profile?.role !== "founder") {
      // Investor messaging founder — start chat with this founder
      try {
        await chatService.startChat(userId);
        navigate("/app/messages");
      } catch (err) {
        const msg = err?.response?.data?.message || "Could not start chat";
        toast.error(msg);
      }
    } else {
      // I'm an investor messaging a founder
      try {
        await chatService.startChat(userId);
        navigate("/app/messages");
      } catch (err) {
        const msg = err?.response?.data?.message || "Could not start chat";
        toast.error(msg);
      }
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Profile">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!profile) {
    return (
      <DashboardShell title="Profile">
        <div className="text-center py-20 text-gray-400">User not found.</div>
      </DashboardShell>
    );
  }

  const isFounder = profile.role === "founder";

  return (
    <DashboardShell title={null}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[#0A1F14]/65 hover:text-[#0F4A2E] mb-4 font-semibold"
      >
        <HiArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="relative bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden mb-6">
        <div className="h-28 sm:h-40 bg-gradient-to-br from-[#1B5E3F]/20 via-[#F5B942]/20 to-[#1B5E3F]/10" />
        <div className="px-4 sm:px-5 pb-5 -mt-10 sm:-mt-12">
          <img
            src={
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1B5E3F&color=fff&size=200`
            }
            alt={profile.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="flex items-end justify-between flex-wrap gap-3 mt-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[#0A1F14]">
                {profile.name}
                {profile.isVerified && (
                  <MdVerified className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5B942]" />
                )}
              </h2>
              <p className="text-sm text-[#0A1F14]/55">
                @{profile.username || "user"} ·{" "}
                <span className="capitalize">{profile.role}</span>
              </p>
              {profile.bio && (
                <p className="text-sm text-[#0A1F14]/75 mt-2 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <FollowButton userId={userId} />
              <button
                onClick={message}
                className="px-5 py-2.5 border-2 border-[#1B5E3F]/20 hover:border-[#1B5E3F]/50 text-[#0F4A2E] text-sm font-bold rounded-full flex items-center gap-2"
              >
                <HiChatAlt2 className="w-4 h-4" /> Message
              </button>
            </div>
          </div>

          {/* Counts */}
          <div className="flex gap-6 mt-4">
            {isFounder && (
              <div>
                <span className="font-black text-[#0A1F14]">
                  {pitches.length}
                </span>{" "}
                <span className="text-[#0A1F14]/55 text-sm">pitches</span>
              </div>
            )}
            <button
              onClick={() => setFollowModal("followers")}
              className="hover:opacity-70 transition-opacity"
            >
              <span className="font-black text-[#0A1F14]">
                {profile.followersCount || 0}
              </span>{" "}
              <span className="text-[#0A1F14]/55 text-sm">followers</span>
            </button>
            <button
              onClick={() => setFollowModal("following")}
              className="hover:opacity-70 transition-opacity"
            >
              <span className="font-black text-[#0A1F14]">
                {profile.followingCount || 0}
              </span>{" "}
              <span className="text-[#0A1F14]/55 text-sm">following</span>
            </button>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.companyName && (
              <Chip icon={HiOfficeBuilding}>{profile.companyName}</Chip>
            )}
            {profile.industry && (
              <Chip icon={HiBriefcase}>{profile.industry}</Chip>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                <Chip icon={HiGlobe}>
                  {profile.website.replace(/^https?:\/\//, "")}
                </Chip>
              </a>
            )}
            {profile.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noreferrer">
                <Chip icon={FaLinkedin}>LinkedIn</Chip>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="border-b border-[#1B5E3F]/12 mb-4 flex">
        <TabBtn
          active={tab === "pitches"}
          onClick={() => setTab("pitches")}
          icon={HiVideoCamera}
          label="Pitches"
          count={pitches.length}
        />
        <TabBtn
          active={tab === "posts"}
          onClick={() => setTab("posts")}
          icon={HiPhotograph}
          label="Posts"
          count={posts.length}
        />
      </div>

      {tab === "pitches" ? (
        pitches.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No pitches yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {pitches.map((p) => (
              <Link
                key={p._id}
                to={`/app/pitch?pitch=${p._id}`}
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black group"
              >
                <img
                  src={p.coverUrl || p.thumbnailUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <HiPlay className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-2 text-[10px] font-bold text-white">
                  <span className="flex items-center gap-0.5">
                    <HiHeart className="w-3 h-3" />
                    {p.likeCount ??
                      (Array.isArray(p.likes) ? p.likes.length : 0)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <HiEye className="w-3 h-3" />
                    {p.views || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/app/post/${p._id}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-[#FAFAF7] group"
            >
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-3 flex items-center text-xs text-[#0A1F14]/85">
                  <span className="line-clamp-6">{p.caption}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <FollowListModal
        open={!!followModal}
        onClose={() => setFollowModal(null)}
        userId={userId}
        mode={followModal}
      />
    </DashboardShell>
  );
}

function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors relative ${
        active ? "text-[#0F4A2E]" : "text-[#0A1F14]/55 hover:text-[#0F4A2E]"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAFAF7] text-[#0A1F14]/55">
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B5E3F]" />
      )}
    </button>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-full text-xs font-semibold text-[#0A1F14]/75">
      <Icon className="w-4 h-4 text-[#1B5E3F]" />
      {children}
    </span>
  );
}
