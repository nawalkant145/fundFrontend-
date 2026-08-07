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
 * Robust helper to compute the other participant in a conversation for both Founder and Investor roles.
 * Always returns a valid user object with fallback defaults.
 */
function getOtherUser(chat, currentUser) {
  const fallback = { name: "User", username: "user", avatar: null, isOnline: false, isVerified: false };
  if (!chat || typeof chat !== "object") return fallback;
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

  return fallback;
}

// WhatsApp-style Call Log Card Component (Screenshot 1)
function CallLogMessageItem({ message, isMe }) {
  const text = message?.text || message?.message || "";
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
    <div className="flex items-center gap-3 py-1 px-1 min-w-[210px]">
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
    <div className="flex items-center gap-2.5 py-1 px-0.5 min-w-[240px] max-w-[320px]">
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
    setChatsLoading(true);
    chatService
      .listChats()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.chats || data || [];
        setChats(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setChats(MOCK_CHATS);
      })
      .finally(() => setChatsLoading(false));
  };

  useEffect(() => {
    refreshChats();
  }, [chatId]);

  // Live search users by username / name
  useEffect(() => {
    const q = query.trim().replace(/^@/, "");
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      userService
        .search(q)
        .then((res) => {
          const list = res?.data?.data?.users || res?.data?.users || res?.data?.data || [];
          const currId = (user?._id || user?.id || "").toString();
          const filtered = (Array.isArray(list) ? list : []).filter(
            (u) => u && (u._id || u.id || "").toString() !== currId
          );
          setSearchResults(filtered);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  const activeChat = chats.find((c) => c?._id && c._id.toString() === chatId);

  const qClean = query.toLowerCase().trim().replace(/^@/, "");

  const filteredChats = chats.filter((c) => {
    if (!qClean) return true;
    const otherUser = getOtherUser(c, user);
    const name = (otherUser?.name || "").toLowerCase();
    const username = (otherUser?.username || "").toLowerCase();
    const company = (otherUser?.companyName || "").toLowerCase();
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
        const otherUser = getOtherUser(c, user);
        return (
          otherUser?._id && otherUser._id.toString() === targetUser._id.toString()
        );
      });

      if (existing) {
        navigate(`/app/messages/${existing._id}`);
        setQuery("");
        setSearchResults([]);
        return;
      }

      const res = await chatService.startChat(targetUser._id);
      const newChat = res?.data?.data;
      if (newChat?._id) {
        setChats((prev) => [newChat, ...prev.filter((c) => c._id !== newChat._id)]);
        navigate(`/app/messages/${newChat._id}`);
        setQuery("");
        setSearchResults([]);
        toast.success(`Chat started with ${targetUser.name || "user"}`);
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
    <DashboardShell title="Messages">
      <div className="flex h-[calc(100vh-6rem)] bg-dark-navy/90 border border-gold/15 rounded-2xl overflow-hidden shadow-2xl">
        {/* Inbox Sidebar (Desktop: always, Mobile: visible only if no active chatId) */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gold/15 bg-dark-bg/60 ${
            chatId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Sidebar Header & Search Input */}
          <div className="p-4 border-b border-gold/15 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-white tracking-wide">
                Inbox
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {chats.length} {chats.length === 1 ? "chat" : "chats"}
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats or find users by @username..."
                className="w-full bg-card-bg/80 border border-gold/15 focus:border-gold rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:outline-none transition-colors"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="text-[11px] font-semibold text-gray-400 block px-1">
              {qClean ? "Search Results" : "Messages"}
            </span>
          </div>

          {/* Chat list & search results */}
          <div className="flex-1 overflow-y-auto divide-y divide-gold/5">
            {/* 1. Filtered existing conversations */}
            {filteredChats.map((c) => {
              const otherUser = getOtherUser(c, user);
              const other = otherUser;
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
                      src={getAvatar(otherUser)}
                      alt={otherUser?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
                    />
                    {otherUser?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-navy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm truncate flex items-center gap-1">
                        {otherUser?.name || "User"}
                        {otherUser?.isVerified && (
                          <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        )}
                      </p>
                      {c.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatMessageTimestamp(c.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {otherUser?.username && (
                      <p className="text-[11px] text-gray-400 truncate">
                        @{otherUser.username}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 truncate mt-0.5">
                      {c.lastMessage || "Click to view chat"}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-gold text-dark-navy font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* 2. Global user search results */}
            {qClean && searchResults.length > 0 && (
              <div className="p-2 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 block my-1">
                  Global Users ({searchResults.length})
                </span>
                {searchResults.map((u) => {
                  const isStarting = startingChatId === u._id;
                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-2 hover:bg-card-bg/60 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getAvatar(u)}
                          alt={u.name || "User"}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate flex items-center gap-1">
                            {u.name}
                            {u.isVerified && (
                              <MdVerified className="w-3 h-3 text-gold flex-shrink-0" />
                            )}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            @{u.username || "user"} • {u.role || "member"}
                          </p>
                        </div>
                      </div>
                      <button
                        disabled={isStarting}
                        onClick={() => handleStartChatWithUser(u)}
                        className="px-3 py-1 bg-gold hover:bg-bright-gold text-dark-navy font-bold text-xs rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        {isStarting ? "Opening..." : "Message"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search Loading Indicator */}
            {qClean && searchLoading && (
              <div className="p-4 text-center text-xs text-gray-400 animate-pulse">
                Searching users...
              </div>
            )}

            {/* Empty Search State */}
            {qClean && !searchLoading && searchResults.length === 0 && filteredChats.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <HiSearchSm className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-white">No matches found</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Try searching by exact @username or full name.
                </p>
              </div>
            )}

            {/* Empty Inbox State */}
            {!qClean && !chatsLoading && chats.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <HiUserCircle className="w-10 h-10 mx-auto text-gold/40 mb-2" />
                <p className="text-sm font-bold text-white">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Search a username above to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Chat Conversation Panel (Desktop: right side, Mobile: visible when chatId exists) */}
        <div
          className={`flex-1 flex-col bg-dark-bg/40 ${
            chatId ? "flex" : "hidden md:flex"
          }`}
        >
          {chatId ? (
            <ChatView chat={activeChat || { _id: chatId }} user={user} refreshChats={refreshChats} chats={chats} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 shadow-inner">
                <HiPaperAirplane className="w-10 h-10 text-gold rotate-45" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Select a conversation from the sidebar or search for a founder/investor to start pitching.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

/**
 * Inner ChatView component handling messages, socket listeners, typing, and actions.
 */
function ChatView({ chat, user, refreshChats, chats = [] }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { socket } = useSocket() || {};
  const { startCall } = useCall();
  const otherUser = getOtherUser(chat, user);
  const other = otherUser; // Alias ensuring both variables work in all scopes

  const handleStartCall = (type = "meeting") => {
    if (!canStartCall(user)) {
      setCallPaywall(true);
      return;
    }
    if (!otherUser?._id) {
      toast.error("User not found");
      return;
    }
    startCall({
      receiverId: otherUser._id,
      name: otherUser.name || "User",
      avatar: getAvatar(otherUser),
      type,
    });
  };

  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [callPaywall, setCallPaywall] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Interactive Message Actions State
  const [replyingTo, setReplyingTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
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
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ x, y, message: m });
  };

  const handleTouchStart = (e, m) => {
    touchTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({
        x: Math.min(touch.clientX, window.innerWidth - 220),
        y: Math.min(touch.clientY, window.innerHeight - 300),
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
      const targetUserObj = getOtherUser(targetChat, user);

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
      toast.success(`Forwarded to ${targetUserObj?.name || "User"}`);
      setForwardingMsg(null);
    } catch (err) {
      toast.error("Failed to forward message");
    }
  };

  // Audio recording helpers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access required to record voice notes");
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      await uploadAttachment(file, "audio");
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
    audioChunksRef.current = [];
  };

  const formatRecordingTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Typing state
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load message history from REST API when chat opens
  useEffect(() => {
    if (!chat?._id) return;
    setLoadingMsgs(true);
    chatService
      .getMessages(chat._id)
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.messages || data || [];
        setMessages(Array.isArray(list) ? list : []);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [chat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listeners for real-time messaging
  useEffect(() => {
    if (!socket || !chat?._id) return;

    socket.emit("join_chat", { chatId: chat._id });

    const handleReceiveMsg = (msg) => {
      if (!msg) return;
      const msgChatId = msg.chatId?._id || msg.chatId;
      if (msgChatId && msgChatId.toString() === chat._id.toString()) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTyping = (data) => {
      if (data?.chatId === chat._id && data?.userId !== user?._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data?.chatId === chat._id && data?.userId !== user?._id) {
        setTyping(false);
      }
    };

    const handleMsgEdited = (data) => {
      if (data?.chatId === chat._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? { ...m, text: data.message, message: data.message, edited: true }
              : m
          )
        );
      }
    };

    const handleMsgDeleted = (data) => {
      if (data?.chatId === chat._id) {
        if (data.deleteForEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === data.messageId
                ? { ...m, deletedEveryone: true, text: "This message was deleted", message: "This message was deleted" }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
        }
      }
    };

    socket.on("receive_message", handleReceiveMsg);
    socket.on("new_message", handleReceiveMsg);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_edited", handleMsgEdited);
    socket.on("message_deleted", handleMsgDeleted);

    return () => {
      socket.off("receive_message", handleReceiveMsg);
      socket.off("new_message", handleReceiveMsg);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_edited", handleMsgEdited);
      socket.off("message_deleted", handleMsgDeleted);
    };
  }, [socket, chat?._id, user?._id]);

  // Handle typing status emission
  const typingTimerRef = useRef(null);
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket || !chat?._id) return;

    socket.emit("typing", { chatId: chat._id, userId: user?._id });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId: chat._id, userId: user?._id });
    }, 1500);
  };

  // Add emoji at cursor position
  const handleEmojiClick = (emojiData) => {
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

  // Send plain text message
  const handleSendText = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !chat?._id) return;

    const messageContent = text.trim();
    setText("");
    setShowEmoji(false);

    const tempMsg = {
      _id: `opt_${Date.now()}`,
      chatId: chat._id,
      senderId: user,
      message: messageContent,
      text: messageContent,
      messageType: "text",
      type: "text",
      replyTo: replyingTo,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setReplyingTo(null);

    try {
      if (socket && socket.connected) {
        socket.emit("send_message", {
          chatId: chat._id,
          message: messageContent,
          text: messageContent,
          replyTo: replyingTo?._id,
        });
      } else {
        const res = await chatService.sendMessage(chat._id, {
          message: messageContent,
          text: messageContent,
          replyTo: replyingTo?._id,
        });
        const saved = res?.data?.data;
        if (saved?._id) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempMsg._id ? saved : m))
          );
        }
      }
      refreshChats();
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // Upload attachment file (Image, Video, Doc, Audio)
  const uploadAttachment = async (file, kind) => {
    if (!file || !chat?._id) return;
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

      if (socket && socket.connected) {
        socket.emit("send_message", {
          chatId: chat._id,
          message: fileText,
          text: fileText,
          messageType,
          type: messageType,
          attachment,
        });
      } else {
        const sendRes = await chatService.sendMessage(chat._id, {
          message: fileText,
          text: fileText,
          messageType,
          type: messageType,
          attachment,
          fileUrl: attachment.url,
        });
        const saved = sendRes?.data?.data;
        if (saved) {
          setMessages((prev) => [...prev, saved]);
        }
      }
      refreshChats();
    } catch (err) {
      toast.error("Failed to upload attachment");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let kind = "document";
    if (file.type.startsWith("image/")) kind = "image";
    else if (file.type.startsWith("video/")) kind = "video";
    else if (file.type.startsWith("audio/")) kind = "audio";
    uploadAttachment(file, kind);
  };

  return (
    <>
      {/* Active Conversation Top Header */}
      <div className="p-3.5 border-b border-gold/15 flex items-center justify-between bg-dark-bg/80">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/app/messages")}
            className="md:hidden p-1.5 hover:bg-gold/10 text-gray-300 rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative flex-shrink-0">
              <img
                src={getAvatar(otherUser)}
                alt={otherUser?.name || "User"}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30 group-hover:ring-gold transition-all"
              />
              {otherUser?.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-dark-navy" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-white truncate flex items-center gap-1">
                {otherUser?.name || "User"}
                {otherUser?.isVerified && (
                  <MdVerified className="w-4 h-4 text-gold flex-shrink-0" />
                )}
              </h2>
              <p className="text-[11px] text-gray-400 truncate">
                {otherUser?.isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleStartCall("audio")}
            className="p-2 text-gray-300 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors"
            title="Start Voice Call"
          >
            <HiPhone className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStartCall("video")}
            className="p-2 text-gray-300 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors"
            title="Start Video Call"
          >
            <HiVideoCamera className="w-5 h-5" />
          </button>

          <DropdownMenu
            trigger={
              <button className="p-2 text-gray-300 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors">
                <HiChevronDown className="w-5 h-5" />
              </button>
            }
            items={[
              {
                label: "View Profile",
                icon: HiUserCircle,
                onClick: () => setShowProfile(true),
              },
              {
                label: "Start Meeting Room",
                icon: HiVideoCamera,
                onClick: () => handleStartCall("meeting"),
              },
              {
                label: "Clear Chat",
                icon: HiTrash,
                onClick: () => setMessages([]),
              },
              {
                label: "Block User",
                icon: HiBan,
                onClick: () => {
                  if (otherUser?._id) {
                    userService.blockUser(otherUser._id).catch(() => {});
                    toast.warn(`${otherUser.name || "User"} blocked`);
                  }
                },
              },
              {
                label: "Report User",
                icon: HiFlag,
                onClick: () => setReporting(true),
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-navy/40">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 animate-pulse">
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
            <img
              src={getAvatar(otherUser)}
              alt={otherUser?.name || "User"}
              className="w-16 h-16 rounded-full border-2 border-gold/30 object-cover mb-3 shadow-lg"
            />
            <h4 className="font-bold text-base text-white">
              Say Hello to {otherUser?.name || "User"}!
            </h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Start the conversation by sending a pitch update, introduction, or audio message below.
            </p>
          </div>
        ) : (
          (() => {
            let lastDate = null;
            return messages.map((m, idx) => {
              const senderIdStr = (m.senderId?._id || m.senderId || "").toString();
              const currentUid = (user?._id || user?.id || "").toString();
              const isMe = senderIdStr === currentUid;

              const msgDate = formatDateSeparator(m.createdAt);
              const showDate = msgDate !== lastDate;
              if (showDate) lastDate = msgDate;

              return (
                <motion.div
                  key={m._id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {/* Date Separator Pill */}
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] font-bold tracking-wide uppercase bg-dark-bg/80 border border-gold/15 text-gold/90 px-3 py-1 rounded-full shadow-xs">
                        {msgDate}
                      </span>
                    </div>
                  )}

                  {/* Single Message Row */}
                  <div
                    onTouchStart={(e) => handleTouchStart(e, m)}
                    onTouchEnd={handleTouchEnd}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 items-end group`}
                  >
                    {!isMe && (
                      <img
                        src={getAvatar(otherUser)}
                        alt={otherUser?.name || "User"}
                        className="w-7 h-7 rounded-full object-cover mb-1 flex-shrink-0 ring-1 ring-gold/20"
                      />
                    )}

                    {/* WhatsApp style message bubble */}
                    <div
                      style={{
                        backgroundColor: isMe ? "#005c4b" : "#202c33",
                        color: isMe ? "#ffffff" : "#e9edef",
                      }}
                      className={`relative max-w-[70%] rounded-xl px-3.5 py-2 shadow-sm break-words ${
                        isMe ? "rounded-tr-none" : "rounded-tl-none border border-gray-100/5"
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

                      {/* Reply Quote Preview inside bubble */}
                      {!m.deletedEveryone && m.replyTo && (
                        <div
                          style={{
                            backgroundColor: isMe ? "rgba(0, 0, 0, 0.25)" : "#111b21",
                            borderLeftColor: isMe ? "#25d366" : "#00a884",
                          }}
                          className="mb-1.5 p-2 rounded-lg border-l-4 text-xs"
                        >
                          <p
                            style={{ color: isMe ? "#25d366" : "#00a884" }}
                            className="font-bold text-[10px]"
                          >
                            {(m.replyTo.senderId?._id || m.replyTo.senderId || "").toString() === currentUid
                              ? "You"
                              : (otherUser?.name || "User")}
                          </p>
                          <p
                            style={{ color: isMe ? "#ffffff" : "#e9edef" }}
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
                          style={{ color: isMe ? "rgba(255, 255, 255, 0.8)" : "#8696a0" }}
                          className="text-sm italic"
                        >
                          🚫 This message was deleted
                        </p>
                      ) : m.type === "system" || m.messageType === "system" || m.type === "call" || m.messageType === "call" || (m.text && (m.text.includes("call") || m.text.includes("Call") || m.text.includes("📞") || m.text.includes("📹"))) || (m.message && (m.message.includes("call") || m.message.includes("Call") || m.message.includes("📞") || m.message.includes("📹"))) ? (
                        <CallLogMessageItem message={m} isMe={isMe} />
                      ) : m.type === "audio" || m.messageType === "audio" || (m.attachment && m.attachment.mimeType?.startsWith("audio")) ? (
                        <VoiceNoteMessageItem
                          audioUrl={m.fileUrl || m.attachment?.url}
                          senderAvatar={isMe ? getAvatar(user) : getAvatar(otherUser)}
                          senderName={isMe ? user?.name : (otherUser?.name || "User")}
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
                            style={{ color: isMe ? "#ffffff" : "#e9edef" }}
                            className="font-semibold text-sm"
                          >
                            {m.fileUrl}
                          </span>
                        </div>
                      ) : (
                        <p
                          style={{ color: isMe ? "#ffffff" : "#e9edef" }}
                          className="text-sm leading-snug whitespace-pre-line break-words pr-3 font-normal"
                        >
                          {m.text || m.message}
                          {m.edited && (
                            <span
                              style={{ color: isMe ? "rgba(255, 255, 255, 0.75)" : "#8696a0" }}
                              className="text-[10px] italic"
                            >
                              {" "}(edited)
                            </span>
                          )}
                        </p>
                      )}

                      <div
                        style={{ color: isMe ? "rgba(255, 255, 255, 0.85)" : "#8696a0" }}
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
                  </div>
                </motion.div>
              );
            });
          })()
        )}
        {typing && (
          <div className="flex items-center gap-2 pl-9 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{otherUser?.name || "User"} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner Indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-dark-bg/90 border-t border-gold/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 min-w-0">
            <HiReply className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              Replying to <strong className="text-white">{replyingTo.senderId === user?._id ? "yourself" : (otherUser?.name || "User")}</strong>: "{replyingTo.text || replyingTo.message}"
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white font-bold px-2 py-0.5 rounded-full hover:bg-black/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input Footer Form */}
      <form
        onSubmit={handleSendText}
        className="p-3 border-t border-gold/15 flex items-center gap-2 bg-dark-bg/90 relative"
      >
        {/* Attachment Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-gray-400 hover:text-gold rounded-full hover:bg-card-bg/60 transition-colors"
          title="Attach file"
        >
          <HiPaperClip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Emoji Picker Trigger Button */}
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2.5 text-gray-400 hover:text-gold rounded-full hover:bg-card-bg/60 transition-colors"
          title="Insert Emoji"
        >
          <HiEmojiHappy className="w-5 h-5" />
        </button>

        {/* Emoji Picker Popover Window */}
        {showEmoji && (
          <div className="absolute bottom-16 left-4 z-50 shadow-2xl rounded-2xl border border-gold/20 overflow-hidden">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
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
          {(contextMenu.message.senderId?._id || contextMenu.message.senderId || "").toString() === (user?._id || user?.id || "").toString() && !contextMenu.message.deletedEveryone && (
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

          {/* 6. Delete for Me */}
          <button
            onClick={() => {
              handleDeleteMsg(contextMenu.message._id, false);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gold/15 flex items-center gap-2.5 transition-colors"
          >
            <HiTrash className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>Delete for Me</span>
          </button>

          {/* 7. Delete for Everyone (only sender) */}
          {(contextMenu.message.senderId?._id || contextMenu.message.senderId || "").toString() === (user?._id || user?.id || "").toString() && !contextMenu.message.deletedEveryone && (
            <button
              onClick={() => {
                handleDeleteMsg(contextMenu.message._id, true);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2.5 transition-colors"
            >
              <HiTrash className="w-4 h-4 text-red-400 flex-shrink-0" />
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
            const targetUserObj = getOtherUser(c, user);
            return (
              <button
                key={c._id}
                onClick={() => handleForwardTo(c)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-gold/10 rounded-xl transition-colors text-left"
              >
                <img src={getAvatar(targetUserObj)} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{targetUserObj?.name || "User"}</p>
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
            src={getAvatar(otherUser)}
            alt={otherUser?.name || "User"}
            className="w-24 h-24 rounded-full mx-auto border-4 border-gold/40 object-cover mb-3"
          />
          <h3 className="text-xl font-bold flex items-center justify-center gap-1">
            {otherUser?.name || "User"}
            <MdVerified className="w-5 h-5 text-gold" />
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {otherUser?.isOnline ? "● Online" : "Offline"}
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
                      reportedUser: otherUser?._id,
                      type: r.toLowerCase().replace(/[\s/]+/g, "_"),
                      description: `Reported ${otherUser?.name || "user"} as: ${r}`,
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
    </>
  );
}

export { MessagesPage };
