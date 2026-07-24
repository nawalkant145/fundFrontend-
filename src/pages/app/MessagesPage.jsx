import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
 * Instagram-style split-view inbox.
 * Desktop: chat list on the left, active chat on the right.
 * Mobile: only one of the two visible at a time, route-based.
 */
function getOtherUser(chat, currentUser) {
  if (!chat) return {};
  const currentUid = (currentUser?._id || "").toString();

  // If founderId & investorId are populated objects
  if (chat.founderId && chat.investorId) {
    const founderIdStr = (chat.founderId._id || chat.founderId).toString();
    const investorIdStr = (chat.investorId._id || chat.investorId).toString();
    if (currentUid && founderIdStr === currentUid) return chat.investorId;
    if (currentUid && investorIdStr === currentUid) return chat.founderId;
  }

  if (Array.isArray(chat.participants)) {
    const otherPart = chat.participants.find(
      (p) => (p?._id || p).toString() !== currentUid
    );
    if (otherPart && typeof otherPart === "object") return otherPart;
  }

  const isFounder = currentUser?.role === "founder";
  const partner = isFounder ? chat.investorId : chat.founderId;
  return partner || chat.otherUser || {};
}

export default function MessagesPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch real chats on mount
  useEffect(() => {
    chatService
      .listChats()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.chats || data || [];
        setChats(list);
      })
      .catch(() => setChats([]));
  }, []);

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

  const activeChat = chats.find((c) => c._id === chatId);

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
        setChats((prev) => [newChat, ...prev]);
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
      <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] md:h-screen">
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
                      src={
                        other.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          other.name || "U"
                        )}&background=1B5E3F&color=fff`
                      }
                      alt={other.name || "User"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
                    />
                    {other.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-navy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm truncate flex items-center gap-1">
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
                          ? "text-white font-semibold"
                          : "text-gray-400"
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
                          src={
                            u.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.name || "U"
                            )}&background=1B5E3F&color=fff`
                          }
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/20 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate flex items-center gap-1">
                            {u.name}
                            {u.isVerified && (
                              <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                            )}
                          </p>
                          <p className="text-xs text-gold/80 font-mono truncate">
                            @{u.username || "user"}
                          </p>
                          {u.companyName && (
                            <p className="text-[11px] text-gray-400 truncate">
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
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    No matching users or chats
                  </p>
                  <p className="text-xs text-gray-500">
                    Try searching by full username (e.g. @john) or name.
                  </p>
                </div>
              )}

            {searchLoading && qClean && (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
              </div>
            )}

            {!qClean && chats.length === 0 && (
              <div className="text-center text-gray-400 py-12 px-4 text-sm">
                <p className="font-semibold text-gray-300 mb-1">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-500">
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
          {activeChat ? (
            <ActiveChat
              chat={activeChat}
              onBack={() => navigate("/app/messages")}
              onConfirmDelete={() => setConfirming(activeChat)}
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
function ActiveChat({ chat, onBack, onConfirmDelete }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const { startCall } = useCall();
  const other = getOtherUser(chat, user);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [callPaywall, setCallPaywall] = useState(false);
  const [typing, setTyping] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const endRef = useRef(null);
  const typingTimeout = useRef(null);

  // Fetch real messages on mount / chat change
  useEffect(() => {
    setLoadingMsgs(true);
    chatService
      .getMessages(chat._id, { limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const msgs = data?.messages || data || [];
        // API returns newest first; reverse for display
        setMessages([...msgs].reverse());
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
      setMessages((prev) => [...prev, msg]);
    };
    const handleTyping = ({ userId }) => {
      if (userId !== user?._id) setTyping(true);
    };
    const handleStopTyping = () => setTyping(false);

    socket.on("new_message", handleNewMsg);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.emit("leave_chat", { chatId: chat._id });
      socket.off("new_message", handleNewMsg);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, chat._id, user?._id]);

  // Mark messages as read
  useEffect(() => {
    if (chat._id) chatService.markRead(chat._id).catch(() => {});
  }, [chat._id, messages.length]);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleStartCall = (kind) => {
    const check = canStartCall();
    if (!check.allowed) {
      setCallPaywall(true);
      return;
    }
    if (!other?._id) {
      toast.error("Cannot identify who to call");
      return;
    }
    startCall({
      receiverId: other._id,
      name: other.name,
      avatar: other.avatar,
      type: kind,
    });
  };

  const send = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    // Send via socket (real-time — the server broadcasts back via "new_message")
    if (socket) {
      socket.emit(
        "send_message",
        { chatId: chat._id, text: text.trim(), type: "text" },
        (res) => {
          if (!res?.ok) {
            // Fallback: use REST API
            chatService
              .sendMessage(chat._id, { text: text.trim() })
              .catch(() => {});
          }
        },
      );
    } else {
      // No socket — use REST
      chatService
        .sendMessage(chat._id, { text: text.trim() })
        .then((res) => {
          const data = res?.data?.data;
          const msg = data?.message || data;
          if (msg) setMessages((prev) => [...prev, msg]);
        })
        .catch(() => {});
    }
    setText("");
    // Stop typing indicator
    if (socket) socket.emit("stop_typing", { chatId: chat._id });
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

  const sendFile = (file, kind) => {
    if (!file) return;
    chatService
      .uploadAttachment(chat._id, file)
      .then((res) => {
        const data = res?.data?.data;
        const msg = data?.message || data;
        if (msg) setMessages((prev) => [...prev, msg]);
        toast.success(`${kind === "image" ? "Image" : "File"} sent`);
      })
      .catch(() => toast.error("Failed to send file"));
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
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gold/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-dark-bg/60 rounded-lg md:hidden flex-shrink-0"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <img
                src={other.avatar}
                alt={other.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              {other.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-dark-navy" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="font-bold text-sm flex items-center gap-1 truncate">
                {other.name}
                {(other.isVerified ?? true) && (
                  <MdVerified className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                )}
              </p>
              <p className="text-[11px] text-gray-400">
                {other.isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => handleStartCall("audio")}
            className="p-2 hover:bg-dark-bg/60 rounded-lg"
            title="Audio call"
          >
            <HiPhone className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStartCall("video")}
            className="p-2 hover:bg-dark-bg/60 rounded-lg"
            title="Video call"
          >
            <HiVideoCamera className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="p-2 hover:bg-dark-bg/60 rounded-lg"
            title="Conversation info"
          >
            <HiInformationCircle className="w-5 h-5" />
          </button>
          <DropdownMenu items={menuItems} />
        </div>
      </div>

      {/* Avatar + name centered intro (Instagram style) */}
      <div className="text-center py-6 border-b border-gold/5">
        <img
          src={other.avatar}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {messages.map((m, i) => {
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
              className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 items-end`}
            >
              {!isMe && (
                <img
                  src={other.avatar}
                  alt=""
                  className={`w-7 h-7 rounded-full object-cover ${
                    showAvatar ? "" : "invisible"
                  }`}
                />
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${
                  isMe ? "bg-primary-green text-white" : "bg-card-bg text-white"
                }`}
              >
                {m.type === "file" || m.type === "image" ? (
                  <div className="flex items-center gap-2">
                    {m.type === "image" ? (
                      <HiPhotograph className="w-5 h-5" />
                    ) : (
                      <HiDocument className="w-5 h-5" />
                    )}
                    <span className="font-semibold text-sm">{m.fileUrl}</span>
                  </div>
                ) : (
                  <p className="text-sm leading-snug whitespace-pre-line">
                    {m.text}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
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

      {/* Composer */}
      <form
        onSubmit={send}
        className="border-t border-gold/10 p-3 flex items-center gap-2"
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
        <DropdownMenu
          align="left"
          placement="top"
          trigger={<HiPaperClip className="w-5 h-5" />}
          triggerClass="p-2 text-gray-400 hover:text-gold transition-colors"
          items={[
            {
              label: "Photo",
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
        <div className="flex-1 flex items-center bg-dark-bg/60 border border-gold/15 rounded-full px-1">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gold transition-colors"
          >
            <HiEmojiHappy className="w-5 h-5" />
          </button>
          <input
            value={text}
            onChange={handleTextChange}
            placeholder="Message…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none py-2"
          />
          {text.trim() && (
            <button
              type="submit"
              className="px-3 py-1 text-gold hover:text-bright-gold font-bold text-sm"
            >
              Send
            </button>
          )}
        </div>
      </form>

      {/* Profile modal */}
      <Modal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        title={null}
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <img
            src={other.avatar}
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
    </>
  );
}

export { MessagesPage };
