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
} from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FollowListModal from "../../components/dashboard/FollowListModal";
import { useAuth } from "../../context/AuthContext";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";

const FOUNDER_MENU = [
  { to: "/app/upload", label: "Upload Pitch", icon: HiUpload },
  { to: "/app/analytics", label: "Analytics", icon: HiChartBar },
  { to: "/app/deals", label: "Deals", icon: HiCurrencyDollar },
  { to: "/app/deck-requests", label: "Deck Requests", icon: HiDocumentText },
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
  const navigate = useNavigate();
  const role = user?.role || "founder";
  const menu = role === "investor" ? INVESTOR_MENU : FOUNDER_MENU;
  const isFounder = role === "founder";

  const [pitches, setPitches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("pitches");
  const [followModal, setFollowModal] = useState(null); // "followers" | "following"

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

  if (!user) return null;

  return (
    <DashboardShell title="My profile">
      {/* Cover + avatar */}
      <div className="relative bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden mb-6">
        <div className="h-28 sm:h-40 bg-gradient-to-br from-[#1B5E3F]/20 via-[#F5B942]/20 to-[#1B5E3F]/10" />
        <div className="px-4 sm:px-5 pb-5 -mt-10 sm:-mt-12">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B5E3F&color=fff&size=200`
            }
            alt={user.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="flex items-end justify-between flex-wrap gap-3 mt-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[#0A1F14]">
                {user.name}
                {user.isVerified && (
                  <MdVerified className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5B942]" />
                )}
              </h2>
              <p className="text-sm text-[#0A1F14]/55">
                @{user.username || "user"} ·{" "}
                <span className="capitalize">{role}</span>
              </p>
              {user.bio && (
                <p className="text-sm text-[#0A1F14]/75 mt-2 max-w-2xl">
                  {user.bio}
                </p>
              )}
            </div>
            <Link to="/app/settings">
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white-force text-sm font-bold rounded-full flex items-center gap-2 shadow-md shadow-[#1B5E3F]/25"
                whileHover={{ scale: 1.03 }}
              >
                <HiPencilAlt className="w-4 h-4" />
                Edit profile
              </motion.button>
            </Link>
          </div>

          {/* Follower / following counts */}
          <div className="flex gap-6 mt-4">
            {isFounder && (
              <button className="text-left">
                <span className="font-black text-[#0A1F14]">
                  {pitches.length || user.pitchesCount || 0}
                </span>{" "}
                <span className="text-[#0A1F14]/55 text-sm">pitches</span>
              </button>
            )}
            <button className="text-left">
              <span className="font-black text-[#0A1F14]">
                {posts.length || user.postsCount || 0}
              </span>{" "}
              <span className="text-[#0A1F14]/55 text-sm">posts</span>
            </button>
            <button
              onClick={() => setFollowModal("followers")}
              className="text-left hover:opacity-70 transition-opacity"
            >
              <span className="font-black text-[#0A1F14]">
                {user.followersCount || 0}
              </span>{" "}
              <span className="text-[#0A1F14]/55 text-sm">followers</span>
            </button>
            <button
              onClick={() => setFollowModal("following")}
              className="text-left hover:opacity-70 transition-opacity"
            >
              <span className="font-black text-[#0A1F14]">
                {user.followingCount || 0}
              </span>{" "}
              <span className="text-[#0A1F14]/55 text-sm">following</span>
            </button>
          </div>

          {/* Quick info chips */}
          <div className="flex flex-wrap gap-2 mt-4">
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

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <MiniStat label="Total views" value={user.totalPitchViews || 0} />
          <MiniStat label="Followers" value={user.followersCount || 0} />
          <MiniStat
            label="Level"
            value={`${user.verificationLevel || 0} / 3`}
          />
        </div>

        {/* Profile completeness */}
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider font-bold text-[#0A1F14]/55 mb-1">
            Profile completeness
          </p>
          <p className="text-3xl font-black text-[#0A1F14] mb-2">
            {user.profileCompleteness || 0}%
          </p>
          <div className="h-2 bg-[#FAFAF7] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1B5E3F] to-[#F5B942]"
              initial={{ width: 0 }}
              animate={{ width: `${user.profileCompleteness || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-[#0A1F14]/55 mt-2">
            {user.profileCompleteness >= 100
              ? "All set!"
              : "Complete your profile for better reach"}
          </p>
        </div>
      </div>

      {/* Content grid — founders only */}
      {isFounder && (
        <div className="mb-6">
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
              <EmptyGrid
                title="No pitches yet"
                cta="Upload a pitch"
                to="/app/upload"
              />
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
                      <HiPlay className="w-8 h-8 text-white-force" />
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-2 text-[10px] font-bold text-white-force drop-shadow-md">
                      <span className="flex items-center gap-0.5">
                        <HiHeart className="w-3.5 h-3.5 text-red-500" />
                        {p.likeCount ??
                          (Array.isArray(p.likes) ? p.likes.length : 0)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <HiEye className="w-3.5 h-3.5 text-white-force" />
                        {p.views || 0}
                      </span>
                    </div>
                  </Link>
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full p-3 flex items-start bg-gradient-to-br from-[#f0faf5] to-[#e8f5ee] border border-[#1B5E3F]/10">
                      <span className="line-clamp-6 text-xs text-[#0A1F14]/80 leading-relaxed">{p.caption}</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white-force text-sm font-bold">
                    <span className="inline-flex items-center gap-1">
                      <HiHeart className="w-4 h-4 text-red-400" />
                      {Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HiChatAlt2 className="w-4 h-4" /> {p.commentCount || 0}
                    </span>
                  </div>
                  {p.images?.length > 1 && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/55 text-white-force text-[10px] font-bold rounded">
                      {p.images.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile-only menu */}
      <div className="md:hidden mt-8">
        <h3 className="text-base font-bold mb-3 text-[#0A1F14]">Menu</h3>
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl overflow-hidden divide-y divide-[#1B5E3F]/8">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-[#FAFAF7] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#1B5E3F]/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#1B5E3F]" />
              </span>
              <span className="flex-1 font-semibold text-sm text-[#0A1F14]">
                {item.label}
              </span>
              <HiChevronRight className="w-5 h-5 text-[#0A1F14]/35" />
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-red-50 transition-colors w-full"
          >
            <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <HiLogout className="w-5 h-5 text-red-500" />
            </span>
            <span className="flex-1 font-semibold text-sm text-red-500 text-left">
              Log out
            </span>
          </button>
        </div>
      </div>

      {/* Followers / Following modal */}
      <FollowListModal
        open={!!followModal}
        onClose={() => setFollowModal(null)}
        userId={user._id}
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

function EmptyGrid({ title, cta, to }) {
  return (
    <div className="text-center py-12 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-2xl">
      <p className="font-bold text-[#0A1F14] mb-3">{title}</p>
      <Link to={to}>
        <button className="px-5 py-2.5 rounded-full font-bold text-sm bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white-force">
          {cta}
        </button>
      </Link>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-3 sm:p-5 text-center">
      <p className="text-xl sm:text-3xl font-black text-[#0A1F14]">{value}</p>
      <p className="text-[10px] sm:text-xs text-[#0A1F14]/55 mt-1 font-semibold">
        {label}
      </p>
    </div>
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
