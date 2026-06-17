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
import {
  MOCK_CHATS,
  MOCK_MESSAGES,
  CURRENT_USER,
} from "../../constants/mockData";

/**
 * Instagram-style split-view inbox.
 * Desktop: chat list on the left, active chat on the right.
 * Mobile: only one of the two visible at a time, route-based.
 */
export default function MessagesPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [chats, setChats] = useState(MOCK_CHATS);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);

  const activeChat = chats.find((c) => c._id === chatId);

  const filtered = chats.filter((c) => {
    const other = CURRENT_USER.role === "founder" ? c.investorId : c.founderId;
    if (
      query &&
      !`${other.name} ${c.lastMessage}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    return true;
  });

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
              {CURRENT_USER.username || "messages"}
            </h2>
            <button
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-gold/15 rounded-lg text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-sm">Messages</span>
            <button className="text-xs text-gray-400 hover:text-white">
              Requests
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                {query ? "No conversations match." : "No conversations yet."}
              </p>
            ) : (
              filtered.map((c) => {
                const other =
                  CURRENT_USER.role === "founder" ? c.investorId : c.founderId;
                const isActive = chatId === c._id;
                return (
                  <Link
                    key={c._id}
                    to={`/app/messages/${c._id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                      isActive ? "bg-card-bg/80" : "hover:bg-card-bg/40"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={other.avatar}
                        alt={other.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {other.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-navy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate flex items-center gap-1">
                        {other.name}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          c.unread > 0 && !isActive
                            ? "text-white font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {c.lastMessage}{" "}
                        <span className="text-gray-500">
                          · {c.lastMessageAt}
                        </span>
                      </p>
                    </div>
                    {c.unread > 0 && !isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" />
                    )}
                  </Link>
                );
              })
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
          setChats((p) => p.filter((x) => x._id !== confirming._id));
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
  const other =
    CURRENT_USER.role === "founder" ? chat.investorId : chat.founderId;
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [callPaywall, setCallPaywall] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartCall = (kind) => {
    const check = canStartCall();
    if (!check.allowed) {
      setCallPaywall(true);
      return;
    }
    navigate(`/app/call/${kind}/${chat._id}`);
  };

  const send = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      {
        _id: `m_${Date.now()}`,
        senderId: "u_self",
        text: text.trim(),
        createdAt: "now",
      },
    ]);
    setText("");
  };

  const sendFile = (file, kind) => {
    if (!file) return;
    setMessages((m) => [
      ...m,
      {
        _id: `m_${Date.now()}`,
        senderId: "u_self",
        type: kind,
        fileUrl: file.name,
        text: "",
        createdAt: "now",
      },
    ]);
    toast.success(`${kind === "image" ? "Image" : "File"} sent`);
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
      onClick: () => toast.warn(`${other.name} blocked`),
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
          const isMe = m.senderId === "u_self";
          const prev = messages[i - 1];
          const showAvatar = !isMe && (!prev || prev.senderId !== m.senderId);
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
            onChange={(e) => setText(e.target.value)}
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
