import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import {
  HiSearch,
  HiTrash,
  HiCheckCircle,
  HiBan,
  HiVolumeOff,
  HiArchive,
  HiArrowLeft,
  HiPhone,
  HiVideoCamera,
  HiPaperAirplane,
  HiPaperClip,
  HiEmojiHappy,
  HiUserCircle,
  HiFlag,
  HiSearch as HiSearchSm,
  HiPhotograph,
  HiDocument,
  HiPencilAlt,
  HiInformationCircle,
  HiMicrophone,
  HiChevronDown,
  HiReply,
  HiAnnotation,
  HiShare,
  HiDuplicate,
  HiStar,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import ProUpgradeModal from "../../components/monetization/ProUpgradeModal";
import { canStartCall } from "../../lib/auth";
import { useCall } from "../../context/CallContext";
import { chatService } from "../../services/chatService";
import { userService } from "../../services/userService";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { MOCK_CHATS } from "../../constants/mockData";

/**
 * Helper to reliably resolve avatar image URL with fallback to ui-avatars.com
 */
function getAvatar(userObj) {
  if (userObj && typeof userObj === "object" && userObj.avatar) {
    return userObj.avatar;
  }
  const name = userObj?.name || userObj?.username || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B5E3F&color=fff`;
}

function formatMessageTimestamp(createdAtString) {
  if (!createdAtString) return "10:45 AM";
  const date = new Date(createdAtString);
  if (isNaN(date.getTime())) return "10:45 AM";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (date.toDateString() === today.toDateString()) {
    return timeStr;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return `${dateStr} ${timeStr}`;
}

function formatDateSeparator(dateString) {
  if (!dateString) return "Today";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Today";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Instagram-style split-view inbox.
 * Desktop: chat list on the left, active chat on the right.
 * Mobile: only one of the two visible at a time, route-based.
 */
function getOtherUser(chat, currentUser) {
  if (!chat) return { name: "User", avatar: null };
  const currentUid = (currentUser?._id || currentUser?.id || "").toString();

  const founder = chat.founderId && typeof chat.founderId === "object" ? chat.founderId : null;
  const investor = chat.investorId && typeof chat.investorId === "object" ? chat.investorId : null;

  if (founder && founder._id && founder._id.toString() !== currentUid && (founder.name || founder.username)) {
    return founder;
  }
  if (investor && investor._id && investor._id.toString() !== currentUid && (investor.name || investor.username)) {
    return investor;
  }

  if (Array.isArray(chat.participants)) {
    const otherPart = chat.participants.find(
      (p) => p && typeof p === "object" && p._id && p._id.toString() !== currentUid
    );
    if (otherPart && (otherPart.name || otherPart.username)) return otherPart;
  }

  if (chat.otherUser && typeof chat.otherUser === "object" && (chat.otherUser.name || chat.otherUser.username)) {
    return chat.otherUser;
  }

  if (founder && currentUid && founder._id.toString() === currentUid && investor) {
    return investor;
  }
  if (investor && currentUid && investor._id.toString() === currentUid && founder) {
    return founder;
  }

  return { name: "User", username: "user", avatar: null };
}

// WhatsApp-style Call Log Card Component (Screenshot 1)
function CallLogMessageItem({ message, isMe }) {
  const text = message.text || message.message || "";
  const lower = text.toLowerCase();
  const isVideo = lower.includes("video") || text.includes("📹");
  const isMissed = lower.includes("missed");
  const isDeclined = lower.includes("declined") || lower.includes("rejected");

  let title = isVideo ? "Video call" : "Voice call";
  if (isMissed) title = isVideo ? "Missed video call" : "Missed voice call";

  let subtitle = isVideo ? "Video call" : "Voice call";
  if (isMissed) {
    subtitle = "Missed";
  } else if (isDeclined) {
    subtitle = "Declined";
  } else {
    const match = text.match(/\((.*?)\)/);
    if (match && match[1]) {
      subtitle = match[1];
    }
  }

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-0 max-w-full">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
          isMissed ? "bg-red-50 text-red-500" : "bg-white text-gray-900"
        }`}
      >
        {isMissed ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z" />
          </svg>
        ) : isVideo ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z" />
          </svg>
        )}
      </div>
      <div className="flex flex-col">
        <span
          style={{ color: isMe ? "#ffffff" : "#111827" }}
          className="font-semibold text-sm leading-tight"
        >
          {title}
        </span>
        <span
          style={{ color: isMe ? "rgba(255, 255, 255, 0.85)" : "#6b7280" }}
          className="text-xs mt-0.5"
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}

// WhatsApp-style Voice Note Component (Screenshot 2)
function VoiceNoteMessageItem({ audioUrl, senderAvatar, senderName, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    if (audioRef.current && isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const fmtTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 py-1 px-0.5 min-w-0 max-w-full">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
      <div className="relative w-11 h-11 flex-shrink-0">
        <img
          src={senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName || "U")}`}
          alt={senderName || "User"}
          className="w-11 h-11 rounded-full object-cover shadow-sm"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#00a884] border border-white flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="#fff">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={togglePlay}
          type="button"
          className="p-1.5 focus:outline-none flex items-center justify-center"
          style={{ color: isMe ? "#ffffff" : "#111827" }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="relative flex-1 h-7 flex items-center cursor-pointer" onClick={handleSeek}>
          <div className="flex items-center gap-0.5 w-full h-full">
            {[35, 60, 40, 80, 55, 95, 70, 45, 85, 50, 75, 65, 40, 90, 60, 80, 50, 70, 45, 85, 65, 90, 40, 75, 55, 80, 60, 45, 70, 50, 65, 40].map(
              (heightPct, idx) => {
                const barPct = (idx / 32) * 100;
                const isFilled = barPct <= progressPct;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-xs transition-colors duration-100"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isFilled ? "#34b7f1" : isMe ? "rgba(255, 255, 255, 0.4)" : "#cbd5e1",
                    }}
                  />
                );
              },
            )}
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#34b7f1] shadow-md pointer-events-none"
            style={{ left: `${progressPct}%` }}
          />
        </div>
      </div>
      <div
        className="text-[11px] whitespace-nowrap self-end mb-1"
        style={{ color: isMe ? "rgba(255, 255, 255, 0.85)" : "#6b7280" }}
      >
        {fmtTime(currentTime || duration)}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch chats on mount and whenever the active chat changes (so new chats appear)
  const refreshChats = () => {
    if (chats.length === 0) {
      setChatsLoading(true);
    }
    chatService
      .listChats()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.chats || data || [];
        setChats(list);
      })
      .catch(() => {})
      .finally(() => setChatsLoading(false));
  };

  useEffect(() => {
    refreshChats();
  }, [chatId]); // re-fetch when switching chats (covers new chat being opened)

  // Search registered users in backend when typing
  useEffect(() => {
    const q = query.trim().replace(/^@/, "");
    if (!q || q.length < 1) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      userService
        .search({ q })
        .then((res) => {
          const data = res?.data?.data;
          const users = data?.users || data || [];
          const currentUid = (user?._id || "").toString();
          const filteredUsers = users.filter(
            (u) => u._id && u._id.toString() !== currentUid
          );
          setSearchResults(filteredUsers);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, user]);

  const activeChat = chats.find((c) => c._id && c._id.toString() === chatId);

  const qClean = query.toLowerCase().trim().replace(/^@/, "");

  const filteredChats = chats.filter((c) => {
    if (!qClean) return true;
    const other = getOtherUser(c, user);
    const name = (other.name || "").toLowerCase();
    const username = (other.username || "").toLowerCase();
    const company = (other.companyName || "").toLowerCase();
    const lastMsg = (c.lastMessage || "").toLowerCase();
    return (
      name.includes(qClean) ||
      username.includes(qClean) ||
      company.includes(qClean) ||
      lastMsg.includes(qClean)
    );
  });

  const handleStartChatWithUser = async (targetUser) => {
    if (!targetUser?._id) return;
    setStartingChatId(targetUser._id);
    try {
      const existing = chats.find((c) => {
        const other = getOtherUser(c, user);
        return (
          other?._id && other._id.toString() === targetUser._id.toString()
        );
      });

      if (existing) {
        navigate(`/app/messages/${existing._id}`);
        setQuery("");
        setSearchResults([]);
        return;
      }

      const res = await chatService.startChat(targetUser._id);
      const newChat = res?.data?.data?.chat || res?.data?.data || res?.data;
      if (newChat && newChat._id) {
        setChats((prev) => [
          newChat,
          ...prev.filter(
            (c) => c._id && c._id.toString() !== newChat._id.toString()
          ),
        ]);
        navigate(`/app/messages/${newChat._id}`);
        setQuery("");
        setSearchResults([]);
        toast.success(`Chat started with ${targetUser.name}`);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not start conversation"
      );
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <DashboardShell title={null} noPad hideMobileHeader>
      <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] md:h-screen overflow-hidden max-w-full">
        {/* ─── Chat list (left column) ─────────────── */}
        <div
          className={`md:border-r-2 md:border-gold/15 md:w-80 lg:w-96 md:flex-shrink-0 h-full
                     ${chatId ? "hidden md:flex" : "flex"}
                     flex-col`}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 pt-5 pb-3 border-b border-gold/10 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-1">
              {user?.username ? `@${user.username}` : "messages"}
            </h2>
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="p-2 hover:bg-card-bg rounded-lg"
              title="New message"
            >
              <HiPencilAlt className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search username or name..."
                className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-gold/15 rounded-lg text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-sm">
              {qClean ? "Search Results" : "Messages"}
            </span>
          </div>

          {/* Chat list & search results */}
          <div className="flex-1 overflow-y-auto divide-y divide-gold/5">
            {/* 0. Skeleton loader while fetching chats initially */}
            {chatsLoading && chats.length === 0 && !qClean && (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200/80 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200/80 rounded w-1/2" />
                      <div className="h-2.5 bg-gray-200/60 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 1. Filtered existing conversations */}
            {filteredChats.map((c) => {
              const other = getOtherUser(c, user);
              const isActive = chatId === c._id;
              return (
                <Link
                  key={c._id}
                  to={`/app/messages/${c._id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                    isActive ? "bg-card-bg/80" : "hover:bg-card-bg/40"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatar(other)}
                      alt={other.name || "User"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
                    />
                    {other.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-navy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm truncate flex items-center gap-1 text-[#0A1F14]">
                        {other.name || "User"}
                        {other.isVerified && (
                          <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        )}
                      </p>
                      {c.lastMessageAt && (
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                          {c.lastMessageAt}
                        </span>
                      )}
                    </div>
                    {other.username && (
                      <p className="text-[11px] text-gold/80 truncate font-mono">
                        @{other.username}
                      </p>
                    )}
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        c.unread > 0 && !isActive
                          ? "text-black font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {c.lastMessage || "Tap to chat"}
                    </p>
                  </div>
                  {c.unread > 0 && !isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" />
                  )}
                </Link>
              );
            })}

            {/* 2. Global User Search Results */}
            {qClean && searchResults.length > 0 && (
              <div className="pt-2">
                <div className="px-4 py-1.5 bg-dark-bg/40 text-xs font-extrabold text-gold uppercase tracking-wider">
                  People on Expglo
                </div>
                {searchResults.map((u) => {
                  const isStarting = startingChatId === u._id;
                  return (
                    <button
                      key={u._id}
                      disabled={isStarting}
                      onClick={() => handleStartChatWithUser(u)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gold/10 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAvatar(u)}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/20 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate flex items-center gap-1 text-[#0A1F14]">
                            {u.name}
                            {u.isVerified && (
                              <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                            )}
                          </p>
                          <p className="text-xs text-gold/80 font-mono truncate">
                            @{u.username || "user"}
                          </p>
                          {u.companyName && (
                            <p className="text-[11px] text-gray-500 truncate">
                              {u.companyName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gold text-dark-navy text-xs font-bold rounded-full flex-shrink-0">
                        {isStarting ? "Opening…" : "Message"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state when searching */}
            {qClean &&
              filteredChats.length === 0 &&
              searchResults.length === 0 &&
              !searchLoading && (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-gray-500 font-semibold mb-1">
                    No matching users or chats
                  </p>
                  <p className="text-xs text-gray-400">
                    Try searching by full username (e.g. @john) or name.
                  </p>
                </div>
              )}

            {searchLoading && qClean && (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
              </div>
            )}

            {/* Empty state — ONLY shown when chatsLoading is completely finished */}
            {!chatsLoading && !qClean && chats.length === 0 && (
              <div className="text-center text-gray-500 py-12 px-4 text-sm">
                <p className="font-semibold text-[#0A1F14] mb-1">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-400">
                  Search a username above to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Active chat (right column) ─────────────── */}
        <div
          className={`flex-1 ${
            chatId ? "flex" : "hidden md:flex"
          } flex-col h-full`}
        >
          {chatsLoading && chatId && !activeChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : activeChat ? (
            <ActiveChat
              key={activeChat._id}
              chat={activeChat}
              chats={chats}
              onBack={() => navigate("/app/messages")}
              onConfirmDelete={() => setConfirming(activeChat)}
              onMessageSent={(lastMsg) => {
                // Update sidebar lastMessage instantly without a full re-fetch
                setChats((prev) =>
                  prev.map((c) =>
                    c._id === activeChat._id
                      ? { ...c, lastMessage: lastMsg, lastMessageAt: new Date().toISOString() }
                      : c
                  )
                );
              }}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <Confirm
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          const id = confirming._id;
          chatService.deleteChat(id).catch(() => {});
          setChats((p) => p.filter((x) => x._id !== id));
          setConfirming(null);
          toast.success("Chat deleted");
          navigate("/app/messages");
        }}
        title="Delete this conversation?"
        message="All messages will be removed. This can't be undone."
        confirmLabel="Delete"
        destructive
      />
    </DashboardShell>
  );
}

function EmptyState() {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-white/30 mb-5">
          <HiPaperAirplane className="w-10 h-10 -rotate-12" />
        </div>
        <h3 className="text-2xl font-light mb-2">Your messages</h3>
        <p className="text-sm text-gray-400 mb-5">
          Send private messages to founders and investors.
        </p>
        <button className="px-4 py-2 rounded-lg bg-gold text-dark-navy font-bold text-sm">
          Send message
        </button>
      </div>
    </div>
  );
}

// ─── ACTIVE CHAT (right side) ─────────────────
function ActiveChat({ chat, chats = [], onBack, onConfirmDelete, onMessageSent }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const { startCall } = useCall();
  const other = getOtherUser(chat, user);
  const handleStartCall = (type = "meeting") => {
    if (!canStartCall(user)) {
      setCallPaywall(true);
      return;
    }
    if (!other?._id) {
      toast.error("User not found");
      return;
    }
    startCall({
      receiverId: other._id,
      name: other.name,
      avatar: getAvatar(other),
      type,
    });
  };
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [callPaywall, setCallPaywall] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [contextMenu, setContextMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMsg, setForwardingMsg] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [msgInfoModal, setMsgInfoModal] = useState(null);
  const [starredMsgs, setStarredMsgs] = useState({});

  const touchTimer = useRef(null);

  // Outside click listener to dismiss context menu
  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener("click", handleCloseMenu);
    window.addEventListener("scroll", handleCloseMenu, true);
    return () => {
      window.removeEventListener("click", handleCloseMenu);
      window.removeEventListener("scroll", handleCloseMenu, true);
    };
  }, []);

  const handleContextMenu = (e, m) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 320),
      message: m,
    });
  };

  const handleTouchStart = (e, m) => {
    const touch = e.touches[0];
    touchTimer.current = setTimeout(() => {
      setContextMenu({
        x: Math.min(touch.clientX, window.innerWidth - 220),
        y: Math.min(touch.clientY, window.innerHeight - 320),
        message: m,
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  const handleDeleteMsg = async (messageId, deleteForEveryone = false) => {
    try {
      if (socket && socket.connected) {
        socket.emit("delete_message", { messageId, deleteForEveryone });
      } else {
        await chatService.deleteMessage(chat._id, messageId, deleteForEveryone);
      }

      if (deleteForEveryone) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, deletedEveryone: true, text: "This message was deleted", message: "This message was deleted" }
              : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
      toast.success(deleteForEveryone ? "Message deleted for everyone" : "Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMsg || !editingMsg.text.trim()) return;
    try {
      if (socket && socket.connected) {
        socket.emit("edit_message", { messageId: editingMsg.messageId, message: editingMsg.text });
      } else {
        await chatService.editMessage(chat._id, editingMsg.messageId, editingMsg.text);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === editingMsg.messageId
            ? { ...m, text: editingMsg.text, message: editingMsg.text, edited: true }
            : m
        )
      );
      toast.success("Message edited");
      setEditingMsg(null);
    } catch (err) {
      toast.error("Failed to edit message");
    }
  };

  const handleForwardTo = async (targetChat) => {
    if (!forwardingMsg) return;
    try {
      const fwdText = forwardingMsg.text || forwardingMsg.message || "Attachment";
      const fwdType = forwardingMsg.type || forwardingMsg.messageType || "text";
      const fwdAttachment = forwardingMsg.attachment;

      if (socket && socket.connected) {
        socket.emit("send_message", {
          chatId: targetChat._id,
          message: fwdText,
          text: fwdText,
          messageType: fwdType,
          type: fwdType,
          attachment: fwdAttachment,
        });
      } else {
        await chatService.sendMessage(targetChat._id, {
          message: fwdText,
          text: fwdText,
          messageType: fwdType,
          type: fwdType,
          attachment: fwdAttachment,
        });
      }
      toast.success(`Forwarded to ${getOtherUser(targetChat, user).name}`);
      setForwardingMsg(null);
    } catch (err) {
      toast.error("Failed to forward message");
    }
  };

  const messagesListRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const endRef = useRef(null);
  const typingTimeout = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone permission denied or unavailable");
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;
    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.onstop = async () => {
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const audioFile = new File([audioBlob], `Voice_Note_${Date.now()}.webm`, {
        type: "audio/webm",
      });

      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }

      sendFile(audioFile, "audio");
    };

    mediaRecorder.stop();
  };

  const cancelRecording = () => {
    if (!mediaRecorderRef.current) return;
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    audioChunksRef.current = [];
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Outside click listener to dismiss emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !e.target.closest(".emoji-trigger-btn")
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.focus();
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  // Fetch real messages on mount / chat change
  useEffect(() => {
    setLoadingMsgs(true);
    chatService
      .getMessages(chat._id, { limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const msgs = data?.messages || data || [];
        // Backend getMessages already returns messages in chronological order (oldest to newest)
        setMessages(msgs);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [chat._id]);

  // Join socket room for real-time messages
  useEffect(() => {
    if (!socket || !chat._id) return;
    socket.emit("join_chat", { chatId: chat._id });
    socket.emit("mark_read", { chatId: chat._id });

    const handleNewMsg = (msg) => {
      if (!msg) return;
      const msgIdStr = (msg._id?._id || msg._id || "").toString();
      const msgSenderIdStr = (
        msg.senderId?._id ||
        msg.senderId ||
        ""
      ).toString();
      const msgText = msg.text || "";

      setMessages((prev) => {
        // 1. If message with exact same ID already exists, do nothing
        if (
          msgIdStr &&
          prev.some((m) => (m._id?._id || m._id || "").toString() === msgIdStr)
        ) {
          return prev;
        }

        // 2. If an optimistic message matches text and sender, replace it
        const optIndex = prev.findIndex(
          (m) =>
            typeof m._id === "string" &&
            m._id.startsWith("opt_") &&
            m.text === msgText &&
            (m.senderId?._id || m.senderId || "").toString() === msgSenderIdStr,
        );

        if (optIndex !== -1) {
          const next = [...prev];
          next[optIndex] = msg;
          return next;
        }

        // 3. Otherwise append new message
        return [...prev, msg];
      });

      // Update sidebar lastMessage for incoming messages
      onMessageSent?.(msg.text || `[${msg.type || "message"}]`);
    };
    const handleTyping = ({ userId }) => {
      if (userId !== user?._id) setTyping(true);
    };
    const handleStopTyping = () => setTyping(false);

    const handleSeen = ({ chatId: cId, messageId }) => {
      if (!cId || cId.toString() === chat._id.toString()) {
        setMessages((prev) =>
          prev.map((m) =>
            !messageId || m._id === messageId || m._id?.toString() === messageId?.toString()
              ? { ...m, status: "seen", isRead: true, isSeen: true }
              : m
          )
        );
      }
    };

    const handleDelivered = ({ chatId: cId, messageId }) => {
      if (!cId || cId.toString() === chat._id.toString()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.status !== "seen" && (!messageId || m._id === messageId || m._id?.toString() === messageId?.toString())
              ? { ...m, status: "delivered" }
              : m
          )
        );
      }
    };

    socket.on("new_message", handleNewMsg);
    socket.on("receive_message", handleNewMsg);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("message_seen", handleSeen);
    socket.on("messages_read", handleSeen);
    socket.on("message_delivered", handleDelivered);

    return () => {
      socket.emit("leave_chat", { chatId: chat._id });
      socket.off("new_message", handleNewMsg);
      socket.off("receive_message", handleNewMsg);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("message_seen", handleSeen);
      socket.off("messages_read", handleSeen);
      socket.off("message_delivered", handleDelivered);
    };
  }, [socket, chat._id, user?._id]);

  // Mark messages as read
  useEffect(() => {
    if (chat._id) chatService.markRead(chat._id).catch(() => {});
  }, [chat._id, messages.length]);

  // Auto scroll ONLY the messages container without scrolling window/body
  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const currentReply = replyingTo;
    setText("");
    setReplyingTo(null);
    if (socket && socket.connected) socket.emit("stop_typing", { chatId: chat._id });

    // Optimistic UI — add the message locally right away
    const optimistic = {
      _id: `opt_${Date.now()}`,
      chatId: chat._id,
      senderId: user?._id,
      text: trimmed,
      message: trimmed,
      type: "text",
      messageType: "text",
      replyTo: currentReply,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    onMessageSent?.(trimmed);

    const isConnected = socket && socket.connected;
    if (isConnected) {
      socket.emit(
        "send_message",
        {
          chatId: chat._id,
          text: trimmed,
          message: trimmed,
          type: "text",
          messageType: "text",
          replyTo: currentReply?._id,
        },
        (res) => {
          if (res?.ok && res?.message) {
            handleNewMsg(res.message);
          } else if (!res?.ok) {
            // Fallback: use REST API
            chatService
              .sendMessage(chat._id, {
                text: trimmed,
                message: trimmed,
                replyTo: currentReply?._id,
              })
              .then((res) => {
                const data = res?.data?.data;
                const msg = data?.message || data;
                if (msg) handleNewMsg(msg);
              })
              .catch(() => {});
          }
        },
      );
    } else {
      // Socket not connected — use REST API directly
      chatService
        .sendMessage(chat._id, {
          text: trimmed,
          message: trimmed,
          replyTo: currentReply?._id,
        })
        .then((res) => {
          const data = res?.data?.data;
          const msg = data?.message || data;
          if (msg) handleNewMsg(msg);
        })
        .catch(() => {});
    }
  };

  // Typing indicator
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (socket && e.target.value.trim()) {
      socket.emit("typing", { chatId: chat._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stop_typing", { chatId: chat._id });
      }, 2000);
    }
  };

  const sendFile = async (file, kind) => {
    if (!file) return;
    try {
      const res = await chatService.uploadAttachment(chat._id, file);
      const data = res?.data?.data || res?.data;
      const attachment = data?.attachment || {
        url: data?.url || data?.fileUrl || "",
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
      const messageType = data?.messageType || data?.type || kind || "file";
      const fileText = kind === "audio" ? "Voice Note" : file.name || "Attachment";

      const isConnected = socket && socket.connected;
      if (isConnected) {
        socket.emit(
          "send_message",
          {
            chatId: chat._id,
            message: fileText,
            text: fileText,
            messageType,
            type: messageType,
            attachment,
          },
          (ack) => {
            if (ack?.ok && ack?.message) {
              const ackIdStr = (ack.message._id?._id || ack.message._id)?.toString();
              setMessages((prev) => {
                if (prev.some((m) => (m._id?._id || m._id)?.toString() === ackIdStr)) {
                  return prev;
                }
                return [...prev, ack.message];
              });
            }
          }
        );
      } else {
        const msgRes = await chatService.sendMessage(chat._id, {
          message: fileText,
          text: fileText,
          messageType,
          type: messageType,
          attachment,
          fileUrl: attachment.url,
        });
        const sentMsg = msgRes?.data?.data?.message || msgRes?.data?.data || msgRes?.data;
        if (sentMsg) {
          const sentIdStr = (sentMsg._id?._id || sentMsg._id)?.toString();
          setMessages((prev) => {
            if (prev.some((m) => (m._id?._id || m._id)?.toString() === sentIdStr)) {
              return prev;
            }
            return [...prev, sentMsg];
          });
        }
      }
      toast.success(`${kind === "image" ? "Image" : kind === "audio" ? "Voice note" : "File"} sent`);
    } catch (err) {
      console.error("Upload attachment error:", err);
      toast.error(err?.response?.data?.message || "Failed to send file");
    }
  };

  const menuItems = [
    {
      label: "View profile",
      icon: HiUserCircle,
      onClick: () => setShowProfile(true),
    },
    {
      label: "Search messages",
      icon: HiSearchSm,
      onClick: () => toast.info("Search coming soon"),
    },
    { divider: true },
    {
      label: "Mute",
      icon: HiVolumeOff,
      onClick: () => toast.info("Notifications muted"),
    },
    {
      label: "Archive",
      icon: HiArchive,
      onClick: () => toast.info("Conversation archived"),
    },
    { divider: true },
    {
      label: "Report",
      icon: HiFlag,
      onClick: () => setReporting(true),
      danger: true,
    },
    {
      label: "Block",
      icon: HiBan,
      onClick: () => {
        userService.blockUser(other._id).catch(() => {});
        toast.warn(`${other.name} blocked`);
      },
      danger: true,
    },
    {
      label: "Delete chat",
      icon: HiTrash,
      onClick: onConfirmDelete,
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200/80 flex-shrink-0 bg-white/95 backdrop-blur z-20 text-[#0A1F14]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-[#0A1F14] hover:bg-gray-100 rounded-lg md:hidden flex-shrink-0"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <img
                src={getAvatar(other)}
                alt={other.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              {other.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="font-bold text-sm text-[#0A1F14] flex items-center gap-1 truncate">
                {other.name}
                {(other.isVerified ?? true) && (
                  <MdVerified className="w-3.5 h-3.5 text-[#00a884] flex-shrink-0" />
                )}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                {other.isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => handleStartCall("meeting")}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-[#00a884] via-[#008f6f] to-[#005c4b] hover:from-[#00c096] hover:to-[#00705c] text-white text-xs font-extrabold rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/40 hover:scale-105 active:scale-95 cursor-pointer"
            title="Start Meeting Room (Video & Screen Share)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <HiVideoCamera className="w-4 h-4 text-white flex-shrink-0" />
            <span style={{ color: "#ffffff" }} className="hidden sm:inline tracking-wide text-white drop-shadow-sm">
              Meeting Room
            </span>
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="p-2 text-[#0A1F14]/70 hover:bg-gray-100 rounded-lg"
            title="Conversation info"
          >
            <HiInformationCircle className="w-5 h-5" />
          </button>
          <DropdownMenu items={menuItems} />
        </div>
      </div>

      {/* Avatar + name centered intro card (ONLY when 0 messages exist) */}
      {messages.length === 0 && (
        <div className="text-center py-6 border-b border-gold/5 flex-shrink-0">
          <img
            src={getAvatar(other)}
            alt={other.name}
            className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
          />
          <p className="font-bold text-base flex items-center justify-center gap-1">
            {other.name}
            <MdVerified className="w-4 h-4 text-gold" />
          </p>
          <p className="text-xs text-gray-400 mt-0.5">EXPGLO FUND member</p>
          <button
            onClick={() => setShowProfile(true)}
            className="mt-3 px-4 py-1.5 bg-card-bg border border-gold/20 hover:border-gold/50 rounded-lg text-xs font-bold"
          >
            View profile
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesListRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-y-contain overflow-x-hidden max-w-full px-3 py-3 space-y-1.5 min-h-0"
      >
        {(() => {
          const grouped = [];
          let currentDayStr = null;

          messages.forEach((m, idx) => {
            const rawDate = m.createdAt || Date.now();
            const dayStr = new Date(rawDate).toDateString();

            if (dayStr !== currentDayStr) {
              currentDayStr = dayStr;
              grouped.push({
                type: "separator",
                date: rawDate,
                id: `sep_${dayStr}_${m._id || idx}`,
              });
            }

            grouped.push({
              type: "message",
              data: m,
              id: m._id || idx,
              idx,
            });
          });

          return grouped.map((item) => {
            if (item.type === "separator") {
              return (
                <div key={item.id} className="flex justify-center my-3">
                  <span className="bg-dark-bg/80 text-gray-300 text-[11px] font-bold px-3.5 py-1 rounded-full border border-gold/15 shadow-sm">
                    {formatDateSeparator(item.date)}
                  </span>
                </div>
              );
            }

            const m = item.data;
            const i = item.idx;
            const isMe =
              (m.senderId?._id || m.senderId || "").toString() ===
              user?._id?.toString();
            const prev = messages[i - 1];
            const prevSender = (
              prev?.senderId?._id ||
              prev?.senderId ||
              ""
            ).toString();
            const curSender = (m.senderId?._id || m.senderId || "").toString();
            const showAvatar = !isMe && prevSender !== curSender;

            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 items-end group`}
              >
                {!isMe && (
                  <img
                    src={getAvatar(other)}
                    alt=""
                    className={`w-7 h-7 rounded-full object-cover ${
                      showAvatar ? "" : "invisible"
                    }`}
                  />
                )}
                <div
                  onContextMenu={(e) => handleContextMenu(e, m)}
                  onTouchStart={(e) => handleTouchStart(e, m)}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    backgroundColor: isMe ? "#005c4b" : "#ffffff",
                    color: isMe ? "#ffffff" : "#111827",
                  }}
                  className={`relative max-w-[85%] sm:max-w-[70%] max-w-full overflow-hidden rounded-xl px-3.5 py-2 shadow-sm break-words ${
                    isMe ? "rounded-tr-none" : "rounded-tl-none border border-gray-100"
                  }`}
                >
                  {/* Context Menu Chevron Button */}
                  <button
                    onClick={(e) => handleContextMenu(e, m)}
                    style={{ color: isMe ? "#ffffff" : "#111827" }}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-black/10 transition-opacity"
                    title="Message options"
                  >
                    <HiChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Reply Quote Preview inside bubble (only if message itself is NOT deleted) */}
                  {!m.deletedEveryone && m.replyTo && (
                    <div
                      style={{
                        backgroundColor: isMe ? "rgba(0, 0, 0, 0.25)" : "#f3f4f6",
                        borderLeftColor: isMe ? "#25d366" : "#00a884",
                      }}
                      className="mb-1.5 p-2 rounded-lg border-l-4 text-xs"
                    >
                      <p
                        style={{ color: isMe ? "#25d366" : "#00a884" }}
                        className="font-bold text-[10px]"
                      >
                        {(m.replyTo.senderId?._id || m.replyTo.senderId || "").toString() === user?._id?.toString()
                          ? "You"
                          : other.name}
                      </p>
                      <p
                        style={{ color: isMe ? "#ffffff" : "#374151" }}
                        className="truncate text-xs mt-0.5 font-medium"
                      >
                        {m.replyTo.deletedEveryone || m.replyTo.isDeleted
                          ? "🚫 This message was deleted"
                          : m.replyTo.text || m.replyTo.message || `[${m.replyTo.type || m.replyTo.messageType || "Attachment"}]`}
                      </p>
                    </div>
                  )}

                  {m.deletedEveryone ? (
                    <p
                      style={{ color: isMe ? "rgba(255, 255, 255, 0.8)" : "#6b7280" }}
                      className="text-sm italic"
                    >
                      🚫 This message was deleted
                    </p>
                  ) : m.type === "system" || m.messageType === "system" || m.type === "call" || m.messageType === "call" || (m.text && (m.text.includes("call") || m.text.includes("Call") || m.text.includes("📞") || m.text.includes("📹"))) || (m.message && (m.message.includes("call") || m.message.includes("Call") || m.message.includes("📞") || m.message.includes("📹"))) ? (
                    <CallLogMessageItem message={m} isMe={isMe} />
                  ) : m.type === "audio" || m.messageType === "audio" || (m.attachment && m.attachment.mimeType?.startsWith("audio")) ? (
                    <VoiceNoteMessageItem
                      audioUrl={m.fileUrl || m.attachment?.url}
                      senderAvatar={isMe ? getAvatar(user) : getAvatar(other)}
                      senderName={isMe ? user?.name : other?.name}
                      isMe={isMe}
                    />
                  ) : m.type === "file" || m.type === "image" ? (
                    <div className="flex items-center gap-2">
                      {m.type === "image" ? (
                        <HiPhotograph className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <HiDocument className="w-5 h-5 text-emerald-400" />
                      )}
                      <span
                        style={{ color: isMe ? "#ffffff" : "#111827" }}
                        className="font-semibold text-sm"
                      >
                        {m.fileUrl}
                      </span>
                    </div>
                  ) : (
                    <p
                      style={{ color: isMe ? "#ffffff" : "#111827" }}
                      className="text-sm leading-snug whitespace-pre-line break-words pr-3 font-normal"
                    >
                      {m.text || m.message}
                      {m.edited && (
                        <span
                          style={{ color: isMe ? "rgba(255, 255, 255, 0.75)" : "#6b7280" }}
                          className="text-[10px] italic"
                        >
                          {" "}(edited)
                        </span>
                      )}
                    </p>
                  )}

                  <div
                    style={{ color: isMe ? "rgba(255, 255, 255, 0.85)" : "#6b7280" }}
                    className="flex items-center justify-end gap-1.5 mt-1 text-[10px]"
                  >
                    {starredMsgs[m._id] && <HiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    <span>{formatMessageTimestamp(m.createdAt)}</span>
                    {isMe && (() => {
                      const status = m.status || (m.isSeen || m.isRead ? "seen" : "sent");
                      if (status === "seen") {
                        return (
                          <span className="font-bold text-[11px] text-[#53bdeb]" title="Seen (Blue)">
                            ✓✓
                          </span>
                        );
                      }
                      if (status === "delivered") {
                        return (
                          <span className="font-bold text-[11px] text-white/90" title="Delivered">
                            ✓✓
                          </span>
                        );
                      }
                      return (
                        <span className="font-bold text-[11px] text-white/90" title="Sent">
                          ✓
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          });
        })()}
        {typing && (
          <div className="flex items-center gap-2 pl-9 text-xs text-gray-400">
            <span className="flex gap-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            typing…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Reply Preview Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#1f2c34] border-t border-gold/15 flex items-center justify-between animate-fadeIn">
          <div className="border-l-4 border-[#00a884] pl-3 min-w-0 flex-1">
            <span className="text-xs font-bold text-[#00a884]">
              {(replyingTo.senderId?._id || replyingTo.senderId || "").toString() === user?._id?.toString()
                ? "Replying to yourself"
                : `Replying to ${other?.name || "User"}`}
            </span>
            <p className="text-xs text-gray-200 truncate mt-0.5 font-medium">
              {replyingTo.text || replyingTo.message || `[${replyingTo.type || replyingTo.messageType || "Attachment"}]`}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1.5 hover:text-red-400 text-gray-400 transition-colors text-sm font-bold flex-shrink-0"
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={send}
        className="sticky bottom-0 z-20 flex-shrink-0 border-t border-gold/10 p-3 flex items-center gap-2 bg-dark-bg/40 backdrop-blur"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => sendFile(e.target.files?.[0], "file")}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => sendFile(e.target.files?.[0], "image")}
        />

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-400 hover:text-gold transition-colors rounded-full hover:bg-card-bg/60 emoji-trigger-btn flex-shrink-0"
          title="Emojis"
        >
          <HiEmojiHappy className="w-6 h-6" />
        </button>

        {/* Attachment Dropdown Button */}
        <DropdownMenu
          align="left"
          placement="top"
          trigger={<HiPaperClip className="w-6 h-6 rotate-45" />}
          triggerClass="p-2 text-gray-400 hover:text-gold transition-colors rounded-full hover:bg-card-bg/60 flex-shrink-0"
          items={[
            {
              label: "Photo / Video",
              icon: HiPhotograph,
              onClick: () => imageInputRef.current?.click(),
            },
            {
              label: "Document",
              icon: HiDocument,
              onClick: () => fileInputRef.current?.click(),
            },
          ]}
        />

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div
            className="absolute bottom-16 left-3 z-50 shadow-2xl rounded-xl overflow-hidden border border-gold/20"
            ref={emojiPickerRef}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              searchDisabled={false}
              skinTonesDisabled
              width={Math.min(340, (typeof window !== "undefined" ? window.innerWidth : 360) - 24)}
              height={380}
              theme="dark"
            />
          </div>
        )}

        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-card-bg/90 border border-emerald-500/40 rounded-full px-5 py-1.5 animate-pulse">
            <div className="flex items-center gap-3 text-red-500 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <span>Recording {formatRecordingTime(recordingTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-dark-bg/60 transition-colors"
                title="Cancel recording"
              >
                <HiTrash className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="p-2.5 bg-[#005c4b] hover:bg-[#00a884] text-white rounded-full transition-colors shadow-md flex items-center justify-center"
                title="Send voice note"
              >
                <HiPaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Rounded Input Field */}
            <div className="flex-1 flex items-center bg-card-bg/80 border border-gold/15 rounded-full px-4 py-1.5 focus-within:border-gold">
              <input
                ref={inputRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Type a message"
                className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Send or Voice Button */}
            {text.trim() ? (
              <button
                type="submit"
                className="p-3 bg-[#005c4b] hover:bg-[#00a884] text-white rounded-full flex-shrink-0 transition-colors shadow-md flex items-center justify-center"
                title="Send message"
              >
                <HiPaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            ) : (
              <button
                type="button"
                className="p-3 bg-card-bg/80 text-gray-400 hover:text-gold rounded-full flex-shrink-0 transition-colors flex items-center justify-center"
                title="Voice message"
                onClick={startRecording}
              >
                <HiMicrophone className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </form>

      {/* Floating Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[100] w-52 bg-[#233138] border border-gold/20 rounded-xl shadow-2xl py-1 text-sm text-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Reply */}
          <button
            onClick={() => {
              setReplyingTo(contextMenu.message);
              setContextMenu(null);
              inputRef.current?.focus();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiAnnotation className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Reply</span>
          </button>

          {/* 2. Forward */}
          <button
            onClick={() => {
              setForwardingMsg(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiShare className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Forward</span>
          </button>

          {/* 3. Copy */}
          <button
            onClick={() => {
              const textToCopy = contextMenu.message.text || contextMenu.message.message || "";
              navigator.clipboard.writeText(textToCopy);
              toast.success("Message copied");
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiDuplicate className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Copy</span>
          </button>

          {/* 4. Star */}
          <button
            onClick={() => {
              const mId = contextMenu.message._id;
              const isStarred = !!starredMsgs[mId];
              const nextStarred = !isStarred;
              setStarredMsgs((prev) => ({ ...prev, [mId]: nextStarred }));
              toast.success(nextStarred ? "Message starred" : "Message unstarred");
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiStar className={`w-4 h-4 flex-shrink-0 ${starredMsgs[contextMenu.message._id] ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
            <span>{starredMsgs[contextMenu.message._id] ? "Unstar" : "Star"}</span>
          </button>

          {/* 5. Edit (only sender) */}
          {(contextMenu.message.senderId?._id || contextMenu.message.senderId || "").toString() === user?._id?.toString() && !contextMenu.message.deletedEveryone && (
            <button
              onClick={() => {
                setEditingMsg({
                  messageId: contextMenu.message._id,
                  text: contextMenu.message.text || contextMenu.message.message || "",
                });
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
            >
              <HiPencilAlt className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Edit</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-700/50" />

          {/* 6. Delete for Me */}
          <button
            onClick={() => {
              handleDeleteMsg(contextMenu.message._id, false);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 text-red-400 transition-colors"
          >
            <HiTrash className="w-4 h-4 flex-shrink-0" />
            <span>Delete for Me</span>
          </button>

          {/* 7. Delete for Everyone (only sender) */}
          {(contextMenu.message.senderId?._id || contextMenu.message.senderId || "").toString() === user?._id?.toString() && !contextMenu.message.deletedEveryone && (
            <button
              onClick={() => {
                handleDeleteMsg(contextMenu.message._id, true);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 text-red-400 transition-colors"
            >
              <HiTrash className="w-4 h-4 flex-shrink-0" />
              <span>Delete for Everyone</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-700/50" />

          {/* 8. Message Info */}
          <button
            onClick={() => {
              setMsgInfoModal(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiInformationCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Message Info</span>
          </button>
        </div>
      )}

      {/* Forward Modal */}
      <Modal open={!!forwardingMsg} onClose={() => setForwardingMsg(null)} title="Forward message to...">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {chats.map((c) => {
            const otherUser = getOtherUser(c, user);
            return (
              <button
                key={c._id}
                onClick={() => handleForwardTo(c)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-gold/10 rounded-xl transition-colors text-left"
              >
                <img src={getAvatar(otherUser)} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{otherUser.name}</p>
                  <p className="text-xs text-gray-400">Click to forward message</p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Edit Message Modal */}
      <Modal open={!!editingMsg} onClose={() => setEditingMsg(null)} title="Edit Message">
        {editingMsg && (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={editingMsg.text}
              onChange={(e) => setEditingMsg({ ...editingMsg, text: e.target.value })}
              className="w-full bg-dark-bg border border-gold/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMsg(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gold hover:bg-bright-gold text-dark-navy"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Message Info Modal */}
      <Modal open={!!msgInfoModal} onClose={() => setMsgInfoModal(null)} title="Message Info">
        {msgInfoModal && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-dark-bg/60 rounded-xl border border-gold/15">
              <p className="text-gray-300 italic">
                "{msgInfoModal.text || msgInfoModal.message || `[${msgInfoModal.type || "Attachment"}]`}"
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Sent:</span>
                <span className="font-semibold text-white">{formatMessageTimestamp(msgInfoModal.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-emerald-400 capitalize">{msgInfoModal.status || "Sent"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Message ID:</span>
                <span className="font-mono text-gray-400 text-[10px] select-all">{msgInfoModal._id}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Profile modal */}
      <Modal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        title={null}
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <img
            src={getAvatar(other)}
            alt={other.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-gold/40 object-cover mb-3"
          />
          <h3 className="text-xl font-bold flex items-center justify-center gap-1">
            {other.name}
            <MdVerified className="w-5 h-5 text-gold" />
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {other.isOnline ? "● Online" : "Offline"}
          </p>
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => handleStartCall("audio")}
              className="px-4 py-2 bg-dark-bg/60 hover:bg-gold/20 rounded-xl text-sm font-bold flex items-center gap-1.5"
            >
              <HiPhone className="w-4 h-4" /> Audio
            </button>
            <button
              onClick={() => handleStartCall("video")}
              className="px-4 py-2 bg-dark-bg/60 hover:bg-gold/20 rounded-xl text-sm font-bold flex items-center gap-1.5"
            >
              <HiVideoCamera className="w-4 h-4" /> Video
            </button>
          </div>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal
        open={reporting}
        onClose={() => setReporting(false)}
        title="Report user"
      >
        <div className="space-y-2">
          {["Spam", "Fake / Scam", "Inappropriate", "Harassment", "Other"].map(
            (r) => (
              <button
                key={r}
                onClick={() => {
                  reportService
                    .create({
                      reportedUser: other?._id,
                      type: r.toLowerCase().replace(/[\s/]+/g, "_"),
                      description: `Reported ${other?.name || "user"} as: ${r}`,
                    })
                    .catch(() => {});
                  setReporting(false);
                  toast.success(`Reported as "${r}". We'll review within 24h.`);
                }}
                className="w-full p-3 text-left bg-dark-bg/40 hover:bg-dark-bg/80 border-2 border-gold/15 hover:border-red-500/40 rounded-xl text-sm font-semibold transition-all"
              >
                {r}
              </button>
            ),
          )}
        </div>
      </Modal>

      {/* Pro paywall — calls */}
      <ProUpgradeModal
        open={callPaywall}
        onClose={() => setCallPaywall(false)}
        reason="pro-required"
      />
    </div>
  );
}

export { MessagesPage };
