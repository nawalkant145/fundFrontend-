import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  HiPencilAlt,
  HiGlobe,
  HiOfficeBuilding,
  HiBriefcase,
  HiShieldCheck,
  HiUpload,
  HiChartBar,
  HiCurrencyDollar,
  HiDocumentText,
  HiSearch,
  HiBell,
  HiSparkles,
  HiCog,
  HiLogout,
  HiChevronRight,
  HiVideoCamera,
  HiPhotograph,
  HiPlay,
  HiHeart,
  HiEye,
  HiChatAlt2,
  HiAcademicCap,
} from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowListModal from "../../components/dashboard/FollowListModal";
import AvatarProgressRing from "../../components/profile/AvatarProgressRing";
import ProfileCompletionDrawer from "../../components/profile/ProfileCompletionDrawer";
import VerificationStatusCard from "../../components/dashboard/VerificationStatusCard";
import PitchPreviewModal from "../../components/dashboard/PitchPreviewModal";
import PostPreviewModal from "../../components/dashboard/PostPreviewModal";
import useProfileCompletion from "../../hooks/useProfileCompletion";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";

const FOUNDER_MENU = [
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/courses", label: "Courses", icon: HiAcademicCap },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Studio Pro", icon: HiSparkles },
  { to: "/app/settings", label: "Settings", icon: HiCog },
];

const INVESTOR_MENU = [
  { to: "/app/discover", label: "Discover", icon: HiSearch },
  { to: "/app/investments", label: "Investments", icon: HiCurrencyDollar },
  { to: "/app/notifications", label: "Notifications", icon: HiBell },
  { to: "/app/subscription", label: "Investor Pro", icon: HiSparkles },
  { to: "/app/settings", label: "Settings", icon: HiCog },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const role = user?.role || "founder";
  const menu = role === "investor" ? INVESTOR_MENU : FOUNDER_MENU;
  const isFounder = role === "founder";

  // Single Source of Truth Completion Hook
  const { completion } = useProfileCompletion();

  const [pitches, setPitches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("pitches");
  const [followModal, setFollowModal] = useState(null); // "followers" | "following"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewPitch, setPreviewPitch] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);

  // Founders show their own pitches + posts
  useEffect(() => {
    if (!isFounder) return;
    videoService
      .getMyPitches()
      .then((res) => {
        const data = res?.data?.data;
        setPitches(data?.videos || data || []);
      })
      .catch(() => setPitches([]));
    postService
      .getMyPosts()
      .then((res) => {
        const data = res?.data?.data;
        setPosts(data?.posts || data || []);
      })
      .catch(() => setPosts([]));
  }, [isFounder]);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 640
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Real-time socket sync for pitch metrics
  useEffect(() => {
    if (!socket) return;
    const onEngagement = (data) => {
      if (data.videoId) {
        setPitches((prev) =>
          prev.map((p) => {
            if (p._id !== data.videoId) return p;
            const updated = { ...p };
            if (typeof data.commentCount === "number") updated.commentCount = data.commentCount;
            if (typeof data.likeCount === "number") updated.likeCount = data.likeCount;
            if (typeof data.saveCount === "number") updated.saveCount = data.saveCount;
            return updated;
          })
        );
      }
    };
    socket.on("pitch:engagement", onEngagement);
    return () => socket.off("pitch:engagement", onEngagement);
  }, [socket]);

  // Real-time socket sync for post metrics
  useEffect(() => {
    if (!socket) return;
    const onPostEngagement = (data) => {
      if (data.postId) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id !== data.postId) return p;
            const updated = { ...p };
            if (typeof data.commentCount === "number") updated.commentCount = data.commentCount;
            if (typeof data.likeCount === "number") updated.likeCount = data.likeCount;
            if (typeof data.saveCount === "number") updated.saveCount = data.saveCount;
            return updated;
          })
        );
      }
    };
    socket.on("post:engagement", onPostEngagement);
    return () => socket.off("post:engagement", onPostEngagement);
  }, [socket]);

  if (!user) return null;

  return (
    <DashboardShell title="My profile">
      {/* 1. Cover Header Card matching User Reference Image */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 shadow-xs max-w-full">
        {/* Soft Warm Gradient Banner Top */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-emerald-50/80 via-amber-50/40 to-slate-50" />

        <div className="px-3.5 sm:px-6 pb-4 sm:pb-6 -mt-10 sm:-mt-16 space-y-4 sm:space-y-5 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Avatar + User Details Block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto min-w-0">
              <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                <AvatarProgressRing
                  user={user}
                  percentage={completion}
                  size={isMobile ? 80 : 116}
                  onClick={() => setDrawerOpen(true)}
                />

                <div className="flex-1 min-w-0 pt-1 sm:pt-3">
                  <h2 className="text-xl sm:text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{user.name}</span>
                    {(user.isVerified || user.verifiedBadge) && (
                      <MdVerified className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F4A2E] shrink-0" />
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 truncate">
                    @{user.username || "user"} · <span className="capitalize">{role}</span>
                  </p>
                </div>
              </div>

              {/* Responsive Stats Bar */}
              <div className="flex items-center justify-around sm:justify-start w-full sm:w-auto gap-2 sm:gap-6 py-2.5 sm:py-0 my-1 sm:my-0 border-y border-slate-100 sm:border-0 sm:mt-3">
                {isFounder && (
                  <>
                    <div className="text-center min-w-0 px-1">
                      <div className="font-bold text-[#0F172A] text-sm sm:text-base leading-tight">
                        {pitches.length || user.pitchesCount || 0}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Pitches</div>
                    </div>
                    <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0" />
                  </>
                )}

                <div className="text-center min-w-0 px-1">
                  <div className="font-bold text-[#0F172A] text-sm sm:text-base leading-tight">
                    {posts.length || user.postsCount || 0}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Posts</div>
                </div>

                <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0" />

                <button
                  onClick={() => setFollowModal("followers")}
                  className="text-center hover:opacity-75 transition-opacity min-w-0 px-1"
                >
                  <div className="font-bold text-[#0F172A] text-sm sm:text-base leading-tight">
                    {user.followersCount || 0}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Followers</div>
                </button>

                <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0" />

                <button
                  onClick={() => setFollowModal("following")}
                  className="text-center hover:opacity-75 transition-opacity min-w-0 px-1"
                >
                  <div className="font-bold text-[#0F172A] text-sm sm:text-base leading-tight">
                    {user.followingCount || 0}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Following</div>
                </button>
              </div>
            </div>

            {/* Edit Profile Button (Dark Green Pill) */}
            <div className="w-full sm:w-auto self-stretch sm:self-center">
              <Link to="/app/settings" className="block w-full sm:w-auto">
                <button className="w-full sm:w-auto h-10 sm:h-11 px-5 sm:px-6 bg-[#0F4A2E] hover:bg-[#166534] text-white-force text-xs sm:text-sm font-semibold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all">
                  <HiPencilAlt className="w-4 h-4 text-white-force" />
                  <span className="text-white-force">Edit profile</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Bio text if provided */}
          {user.bio && (
            <p className="text-xs sm:text-sm font-normal text-slate-600 max-w-2xl leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Chips Row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            {user.companyName && (
              <Chip icon={HiOfficeBuilding}>{user.companyName}</Chip>
            )}
            {user.industry && <Chip icon={HiBriefcase}>{user.industry}</Chip>}
            {user.fundingStage && (
              <Chip icon={HiShieldCheck}>{user.fundingStage}</Chip>
            )}
            {user.website && <Chip icon={HiGlobe}>{user.website}</Chip>}
            {user.linkedIn && <Chip icon={FaLinkedin}>LinkedIn</Chip>}
          </div>
        </div>
      </div>

      {/* 2. Synchronized Verification & Profile Status Workspace */}
      <div className="mb-6">
        <VerificationStatusCard user={user} />
      </div>

      {/* 3. Pitches & Posts Content Grid — Underline Tabs */}
      {isFounder && (
        <div className="mb-6">
          {/* Underline Tab Navigation Header */}
          <div className="border-b border-slate-200/80 mb-6 flex gap-4 sm:gap-8 overflow-x-auto">
            <UnderlineTabBtn
              active={tab === "pitches"}
              onClick={() => setTab("pitches")}
              icon={HiVideoCamera}
              label="Pitches"
              count={pitches.length}
            />
            <UnderlineTabBtn
              active={tab === "posts"}
              onClick={() => setTab("posts")}
              icon={HiPhotograph}
              label="Posts"
              count={posts.length}
            />
          </div>

          {tab === "pitches" ? (
            pitches.length === 0 ? (
              <EmptyGrid
                title="No pitches yet"
                cta="Upload a pitch"
                to="/app/upload"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pitches.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setPreviewPitch(p)}
                    className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 group text-left"
                  >
                    <img
                      src={p.coverUrl || p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity">
                      <HiPlay className="w-10 h-10 text-white-force" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs font-semibold text-white-force drop-shadow-md">
                      <span className="flex items-center gap-1">
                        <HiHeart className="w-4 h-4 text-red-500" />
                        {p.likeCount ??
                          (Array.isArray(p.likes) ? p.likes.length : 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiEye className="w-4 h-4 text-white-force" />
                        {p.views || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : posts.length === 0 ? (
            <EmptyGrid
              title="No posts yet"
              cta="Create a post"
              to="/app/post/new"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {posts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setPreviewPost(p)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 group border border-slate-200 text-left w-full cursor-pointer"
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full p-2 sm:p-3 flex items-center justify-center text-center bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200">
                      <span className="line-clamp-4 text-[11px] sm:text-xs font-semibold text-[#0F172A]/80 leading-tight">
                        {p.caption}
                      </span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white-force text-xs font-bold">
                    <span className="inline-flex items-center gap-1">
                      <HiHeart className="w-4 h-4 text-red-400" />
                      {typeof p.likeCount === "number"
                        ? p.likeCount
                        : Array.isArray(p.likes)
                          ? p.likes.length
                          : p.likes || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HiChatAlt2 className="w-4 h-4" /> {p.commentCount || 0}
                    </span>
                  </div>
                  {p.images?.length > 1 && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-900/70 text-white-force text-[10px] font-bold rounded">
                      {p.images.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile-Only Navigation Menu */}
      <div className="md:hidden mt-8">
        <h3 className="text-lg font-semibold mb-3 text-[#0F172A]">Menu</h3>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden divide-y divide-[#E5E7EB]">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-[#166534]">
                <item.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 font-semibold text-sm text-[#0F172A]">
                {item.label}
              </span>
              <HiChevronRight className="w-5 h-5 text-[#94A3B8]" />
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-red-50 transition-colors w-full"
          >
            <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
              <HiLogout className="w-5 h-5" />
            </span>
            <span className="flex-1 font-semibold text-sm text-red-600 text-left">
              Log out
            </span>
          </button>
        </div>
      </div>

      {/* Profile Completion Drawer (Naukri Inspired) */}
      <ProfileCompletionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onOpenEditProfile={() => navigate("/app/settings")}
      />

      {/* Followers / Following Modal */}
      <FollowListModal
        open={!!followModal}
        onClose={() => setFollowModal(null)}
        userId={user._id}
        mode={followModal}
      />

      {/* Pitch preview modal */}
      {previewPitch && (
        <PitchPreviewModal
          pitch={previewPitch}
          onClose={() => setPreviewPitch(null)}
          onPitchUpdated={(updatedPitch) => {
            setPitches((prev) =>
              prev.map((p) => (p._id === updatedPitch._id ? updatedPitch : p))
            );
          }}
        />
      )}

      {/* Post preview modal */}
      {previewPost && (
        <PostPreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onPostUpdated={(updatedPost) => {
            setPosts((prev) =>
              prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
            );
          }}
        />
      )}
    </DashboardShell>
  );
}

function UnderlineTabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-semibold flex items-center gap-2 relative transition-colors ${
        active
          ? "text-[#0F4A2E]"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F4A2E] rounded-full" />
      )}
    </button>
  );
}

function EmptyGrid({ title, cta, to }) {
  return (
    <div className="bg-[#FAFAF7] border border-slate-200/60 rounded-2xl p-12 text-center">
      <p className="font-bold text-[#0F172A] mb-4 text-base">{title}</p>
      <Link to={to}>
        <button className="h-11 px-6 bg-[#0F4A2E] hover:bg-[#166534] text-white-force font-semibold text-sm rounded-full shadow-xs transition-all inline-flex items-center justify-center">
          <span className="text-white-force">{cta}</span>
        </button>
      </Link>
    </div>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700">
      <Icon className="w-4 h-4 text-[#0F4A2E]" />
      {children}
    </span>
  );
}
