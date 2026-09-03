import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiVideoCamera,
  HiPhotograph,
  HiHeart,
  HiChatAlt2,
  HiBookmark,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import PitchCard from "../../components/dashboard/PitchCard";
import { videoService } from "../../services/videoService";
import { postService } from "../../services/postService";
import { useSocket } from "../../context/SocketContext";

                                                                                                      
export default function SavedPitchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "posts" ? "posts" : "pitches";
  const [tab, setTab] = useState(initialTab);
  const [savedPitches, setSavedPitches] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

                             
  useEffect(() => {
    videoService
      .getSaved()
      .then((res) => {
        const data = res?.data?.data;
        const videos = data?.videos || data || [];
        setSavedPitches(videos);
      })
      .catch(() => setSavedPitches([]))
      .finally(() => setSavedLoading(false));

    postService
      .getSaved()
      .then((res) => {
        const data = res?.data?.data;
        const posts = data?.posts || data || [];
        setSavedPosts(posts);
      })
      .catch(() => setSavedPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  const switchTab = (next) => {
    setTab(next);
    setSearchParams(next === "posts" ? { tab: "posts" } : {});
  };

  return (
    <DashboardShell
      title="Saved Studio"
      subtitle="Pitches and posts you've bookmarked."
    >
      {          }
      <div className="border-b border-[#1B5E3F]/12 mb-6">
        <div className="flex">
          <TabButton
            active={tab === "pitches"}
            onClick={() => switchTab("pitches")}
            icon={HiVideoCamera}
            label="Pitches"
            count={savedPitches.length}
          />
          <TabButton
            active={tab === "posts"}
            onClick={() => switchTab("posts")}
            icon={HiPhotograph}
            label="Posts"
            count={savedPosts.length}
          />
        </div>
      </div>

      {tab === "pitches" ? (
        savedLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/15 border-t-[#1B5E3F] animate-spin" />
          </div>
        ) : savedPitches.length === 0 ? (
          <Empty
            icon={HiBookmark}
            title="No saved pitches yet"
            subtitle="Tap the bookmark icon on any pitch in your feed to save it for later."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedPitches.map((p) => (
              <PitchCard key={p._id} pitch={p} />
            ))}
          </div>
        )
      ) : postsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/15 border-t-[#1B5E3F] animate-spin" />
        </div>
      ) : savedPosts.length === 0 ? (
        <Empty
          icon={HiBookmark}
          title="No saved posts yet"
          subtitle="Save posts you want to revisit. They'll show up here."
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {savedPosts.map((p) => (
            <PostTile key={p._id} post={p} />
          ))}
        </div>
      )}
    </DashboardShell>
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
          layoutId="saved-tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B5E3F]"
        />
      )}
    </button>
  );
}

function PostTile({ post }) {
  const cover = post.images?.[0];
  const [commentCount, setCommentCount] = useState(
    () => post.commentCount || 0,
  );

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !post?._id) return;
    const onEngagement = (data) => {
      if (data.postId === post._id && typeof data.commentCount === "number") {
        setCommentCount(data.commentCount);
      }
    };
    socket.on("post:engagement", onEngagement);
    return () => socket.off("post:engagement", onEngagement);
  }, [socket, post?._id]);

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
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white-force text-sm font-bold">
        <span className="inline-flex items-center gap-1">
          <HiHeart className="w-4 h-4 text-red-400" />{" "}
          {post.likeCount ?? (Array.isArray(post.likes) ? post.likes.length : 0)}
        </span>
        <span className="inline-flex items-center gap-1">
          <HiChatAlt2 className="w-4 h-4" /> {commentCount}
        </span>
      </div>
    </Link>
  );
}

function Empty({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-16 sm:py-20 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-3xl">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#1B5E3F]/15 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#1B5E3F]" />
      </div>
      <h3 className="text-lg font-black mb-2 text-[#0A1F14]">{title}</h3>
      <p className="text-sm text-[#0A1F14]/65 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}
