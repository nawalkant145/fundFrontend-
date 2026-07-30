import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiVideoCamera,
  HiPhotograph,
  HiLightningBolt,
  HiPlus,
  HiEye,
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiPlay,
  HiSparkles,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import BoostModal from "../../components/monetization/BoostModal";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";
import { boostService } from "../../services/boostService";
import { useAuth } from "../../context/AuthContext";
import { useUploadModal } from "../../context/UploadModalContext";
import { formatINR } from "../../constants/mockData";

/**
 * Combined "My Studio" page — replaces "My Pitches".
 * Sub-tabs: Pitches | Posts.
 */
export default function MyStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "posts" ? "posts" : "pitches";
  const [tab, setTab] = useState(initialTab);
  const [boostFor, setBoostFor] = useState(null);
  const { user } = useAuth();
  const { openPitchModal, openPostModal } = useUploadModal();

  // Fetch real pitches — show empty state if none uploaded yet
  const [myPitches, setMyPitches] = useState([]);
  const [pitchesLoading, setPitchesLoading] = useState(true);

  const loadPitches = () => {
    videoService
      .getMyPitches()
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data || [];
        setMyPitches(videos);
      })
      .catch(() => {
        setMyPitches([]);
      })
      .finally(() => setPitchesLoading(false));
  };

  const loadPosts = () => {
    postService
      .getMyPosts()
      .then((res) => {
        const data = res?.data?.data;
        const posts = data?.posts || data || [];
        setMyPosts(posts);
      })
      .catch(() => setMyPosts([]));
  };

  useEffect(() => {
    loadPitches();
    
    const handlePitchUploaded = () => {
      loadPitches();
    };
    window.addEventListener("pitch-uploaded", handlePitchUploaded);
    return () => window.removeEventListener("pitch-uploaded", handlePitchUploaded);
  }, []);

  // Fetch real posts
  const [myPosts, setMyPosts] = useState([]);
  useEffect(() => {
    loadPosts();

    const handlePostCreated = () => {
      loadPosts();
    };
    window.addEventListener("post-created", handlePostCreated);
    return () => window.removeEventListener("post-created", handlePostCreated);
  }, []);

  // Fetch the founder's currently-active boosts
  const [boosts, setBoosts] = useState([]);
  const loadBoosts = () => {
    boostService
      .getActiveBoosts()
      .then((res) => {
        const data = res?.data?.data;
        setBoosts(data?.boosts || []);
      })
      .catch(() => setBoosts([]));
  };
  useEffect(() => {
    loadBoosts();
  }, []);

  const activeBoost = (pitchId) =>
    boosts.find((b) => (b.videoId?._id || b.videoId) === pitchId);

  const switchTab = (next) => {
    setTab(next);
    setSearchParams(next === "posts" ? { tab: "posts" } : {});
  };

  return (
    <DashboardShell>
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 sm:mb-8">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff`
          }
          alt={user?.name || "User"}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-[#1B5E3F]/15 object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A1F14] inline-flex items-center gap-2 leading-tight">
            {user?.name || "User"}
            {user?.isVerified && (
              <MdVerified className="w-6 h-6 text-[#F5B942]" />
            )}
          </h1>
          <p className="text-sm text-[#0A1F14]/65">
            @{user?.username || "you"} ·{" "}
            <span className="capitalize">{user?.role || "founder"}</span>
          </p>
          <div className="flex justify-center sm:justify-start gap-5 mt-3 text-sm">
            <Stat label="Pitches" value={myPitches.length} />
            <Stat label="Posts" value={myPosts.length} />
            <Stat label="Followers" value={user?.followersCount ?? 0} />
            <Stat label="Following" value={user?.followingCount ?? 0} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openPitchModal}
            className="px-4 py-2 rounded-full font-bold text-xs bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white-force shadow-md shadow-[#1B5E3F]/25 inline-flex items-center gap-1.5 transition-all"
          >
            <HiVideoCamera className="w-4 h-4" /> New Pitch
          </button>
          <button
            onClick={openPostModal}
            className="px-4 py-2 rounded-full font-bold text-xs bg-white border border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40 text-[#0F4A2E] inline-flex items-center gap-1.5 transition-all"
          >
            <HiPhotograph className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1B5E3F]/12 mb-6">
        <div className="flex">
          <TabButton
            active={tab === "pitches"}
            onClick={() => switchTab("pitches")}
            icon={HiVideoCamera}
            label="Pitches"
            count={myPitches.length}
          />
          <TabButton
            active={tab === "posts"}
            onClick={() => switchTab("posts")}
            icon={HiPhotograph}
            label="Posts"
            count={myPosts.length}
          />
        </div>
      </div>

      {/* Tab content */}
      {tab === "pitches" ? (
        pitchesLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/15 border-t-[#1B5E3F] animate-spin" />
          </div>
        ) : myPitches.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myPitches.map((p) => (
              <PitchTile
                key={p._id}
                pitch={p}
                boost={activeBoost(p._id)}
                onBoost={() => setBoostFor(p)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HiVideoCamera}
            title="No pitches yet"
            cta="Upload your first pitch"
            onClick={openPitchModal}
          />
        )
      ) : myPosts.length ? (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {myPosts.map((p) => (
            <PostTile key={p._id} post={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HiPhotograph}
          title="No posts yet"
          cta="Create your first post"
          onClick={openPostModal}
        />
      )}

      {/* Boost modal */}
      <BoostModal
        open={!!boostFor}
        onClose={() => setBoostFor(null)}
        pitch={boostFor}
        onBoosted={() => {
          setBoostFor(null);
          loadBoosts();
          loadPitches();
        }}
      />
    </DashboardShell>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span className="font-black text-[#0A1F14]">{value}</span>{" "}
      <span className="text-[#0A1F14]/55">{label}</span>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors relative ${
        active ? "text-[#0F4A2E]" : "text-[#0A1F14]/55 hover:text-[#0F4A2E]"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active
            ? "bg-[#1B5E3F]/12 text-[#0F4A2E]"
            : "bg-[#FAFAF7] text-[#0A1F14]/55"
        }`}
      >
        {count}
      </span>
      {active && (
        <motion.span
          layoutId="studio-tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B5E3F]"
        />
      )}
    </button>
  );
}

function PitchTile({ pitch, boost, onBoost }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
    >
      <Link to={`/app?pitch=${pitch._id}`} className="block relative group">
        <div className="relative aspect-video overflow-hidden bg-[#0A1F14]">
          <img
            src={pitch.thumbnailUrl}
            alt={pitch.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-xs font-bold text-white-force drop-shadow inline-flex items-center gap-1">
              <HiPlay className="w-3.5 h-3.5" />
              {Math.floor(pitch.duration / 60)}:
              {String(pitch.duration % 60).padStart(2, "0")}
            </span>
            <span className="text-xs font-bold text-white-force drop-shadow inline-flex items-center gap-1">
              <HiEye className="w-3.5 h-3.5" />
              {(pitch.views || 0).toLocaleString()}
            </span>
          </div>
          {boost && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-br from-[#F5B942] to-[#FFD166] text-[#0F4A2E] text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
              <HiSparkles className="w-3 h-3" /> Boosted
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-[#0A1F14] line-clamp-1">
          {pitch.title}
        </h3>
        <p className="text-xs text-[#0A1F14]/55 line-clamp-2 mt-1 flex-1">
          {pitch.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#0A1F14]/65 mt-3">
          <span className="inline-flex items-center gap-1">
            <HiHeart className="w-3.5 h-3.5" />{" "}
            {pitch.likeCount ?? (pitch.likes?.length || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <HiBookmark className="w-3.5 h-3.5" />{" "}
            {pitch.saveCount ?? (pitch.saves?.length || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <HiChatAlt2 className="w-3.5 h-3.5" /> {pitch.commentCount || 0}
          </span>
          <span className="ml-auto font-bold text-[#0F4A2E]">
            {formatINR(pitch.askAmount)}
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/app?pitch=${pitch._id}`} className="flex-1">
            <button className="w-full py-2 rounded-full text-xs font-bold border border-[#1B5E3F]/15 text-[#0F4A2E] hover:bg-[#FAFAF7] transition-all">
              View
            </button>
          </Link>
          <button
            onClick={onBoost}
            className={`flex-1 py-2 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
              boost
                ? "bg-[#FFF6E0] text-[#0F4A2E] border border-[#F5B942]/40"
                : "bg-gradient-to-br from-[#F5B942] to-[#FFD166] text-[#0F4A2E] shadow-md shadow-[#F5B942]/25"
            }`}
          >
            <HiLightningBolt className="w-3.5 h-3.5" />
            {boost ? "Boost again" : "Boost"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PostTile({ post }) {
  const cover = post.images?.[0];
  return (
    <Link
      to={`/app/post/${post._id}`}
      className="relative aspect-square block rounded-md sm:rounded-lg overflow-hidden bg-[#FAFAF7] group"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full p-3 flex items-center text-xs text-[#0A1F14]/85 leading-relaxed bg-gradient-to-br from-[#FAFAF7] to-white border border-[#1B5E3F]/10">
          <span className="line-clamp-6">{post.caption}</span>
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white-force text-sm font-bold">
        <span className="inline-flex items-center gap-1">
          <HiHeart className="w-4 h-4 text-red-400" />{" "}
          {Array.isArray(post.likes) ? post.likes.length : post.likes || 0}
        </span>
        <span className="inline-flex items-center gap-1">
          <HiChatAlt2 className="w-4 h-4" /> {post.commentCount || 0}
        </span>
      </div>
      {post.images?.length > 1 && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/55 text-white-force text-[10px] font-bold rounded">
          {post.images.length}
        </span>
      )}
    </Link>
  );
}

function EmptyState({ icon: Icon, title, cta, onClick }) {
  return (
    <div className="text-center py-16 sm:py-20 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-3xl">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#1B5E3F]/15 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#1B5E3F]" />
      </div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <button
        onClick={onClick}
        className="px-5 py-2.5 rounded-full font-bold text-sm bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white-force shadow-md shadow-[#1B5E3F]/25 inline-flex items-center gap-1.5 transition-all"
      >
        <HiPlus className="w-4 h-4" /> {cta}
      </button>
    </div>
  );
}
