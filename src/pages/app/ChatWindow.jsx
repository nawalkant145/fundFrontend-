import { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiPhone,
  HiVideoCamera,
  HiPaperAirplane,
  HiPaperClip,
  HiEmojiHappy,
  HiUserCircle,
  HiVolumeOff,
  HiBan,
  HiFlag,
  HiTrash,
  HiSearch,
  HiPhotograph,
  HiDocument,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import {
  MOCK_CHATS,
  MOCK_MESSAGES,
  CURRENT_USER,
} from "../../constants/mockData";

export default function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const chat = MOCK_CHATS.find((c) => c._id === chatId) || MOCK_CHATS[0];
  const other =
    CURRENT_USER.role === "founder" ? chat.investorId : chat.founderId;

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      icon: HiSearch,
      onClick: () => toast.info("Search coming soon"),
    },
    { divider: true },
    {
      label: "Mute notifications",
      icon: HiVolumeOff,
      onClick: () => toast.info("Notifications muted"),
    },
    { divider: true },
    {
      label: "Report user",
      icon: HiFlag,
      onClick: () => setReporting(true),
      danger: true,
    },
    {
      label: "Block user",
      icon: HiBan,
      onClick: () => toast.warn(`${other.name} blocked`),
      danger: true,
    },
    {
      label: "Delete chat",
      icon: HiTrash,
      onClick: () => setConfirmDelete(true),
      danger: true,
    },
  ];

  return (
    <DashboardShell title={null}>
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold/10">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/app/messages"
              className="p-2 hover:bg-dark-bg/60 rounded-lg lg:hidden flex-shrink-0"
            >
              <HiArrowLeft className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={other.avatar}
                  alt={other.name}
                  className="w-10 h-10 rounded-full object-cover border border-gold/20"
                />
                {other.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card-bg" />
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold flex items-center gap-1 truncate">
                  {other.name}
                  <MdVerified className="w-4 h-4 text-gold flex-shrink-0" />
                </p>
                <p className="text-xs text-gray-400">
                  {other.isOnline ? "● Online" : "Offline"}
                </p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/app/call/audio/${chat._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2.5 bg-dark-bg/60 hover:bg-gold/20 hover:text-gold rounded-xl transition-all"
                title="Audio call"
              >
                <HiPhone className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to={`/app/call/video/${chat._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2.5 bg-dark-bg/60 hover:bg-gold/20 hover:text-gold rounded-xl transition-all"
                title="Video call"
              >
                <HiVideoCamera className="w-5 h-5" />
              </motion.button>
            </Link>
            <DropdownMenu items={menuItems} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isMe = m.senderId === "u_self";
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-gradient-to-br from-gold to-bright-gold text-dark-navy rounded-br-sm"
                      : "bg-dark-bg/80 text-white rounded-bl-sm border border-gold/10"
                  }`}
                >
                  {m.type === "file" || m.type === "image" ? (
                    <div className="flex items-center gap-2">
                      {m.type === "image" ? (
                        <HiPhotograph className="w-5 h-5" />
                      ) : (
                        <HiDocument className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{m.fileUrl}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {m.text}
                    </p>
                  )}
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-dark-navy/60" : "text-gray-500"
                    }`}
                  >
                    {m.createdAt}
                  </p>
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
            trigger={<HiPaperClip className="w-5 h-5" />}
            triggerClass="p-2.5 text-gray-400 hover:text-gold transition-colors"
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
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-4 py-3 bg-dark-bg/60 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-gold transition-colors"
          >
            <HiEmojiHappy className="w-5 h-5" />
          </button>
          <motion.button
            type="submit"
            disabled={!text.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl shadow-lg ${
              text.trim()
                ? "bg-gradient-to-br from-gold to-bright-gold text-dark-navy shadow-gold/30"
                : "bg-dark-bg/60 text-gray-500 cursor-not-allowed"
            }`}
          >
            <HiPaperAirplane className="w-5 h-5 rotate-90" />
          </motion.button>
        </form>
      </div>

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
            <Link
              to={`/app/call/audio/${chat._id}`}
              className="px-4 py-2 bg-dark-bg/60 hover:bg-gold/20 rounded-xl text-sm font-bold flex items-center gap-1.5"
            >
              <HiPhone className="w-4 h-4" /> Audio
            </Link>
            <Link
              to={`/app/call/video/${chat._id}`}
              className="px-4 py-2 bg-dark-bg/60 hover:bg-gold/20 rounded-xl text-sm font-bold flex items-center gap-1.5"
            >
              <HiVideoCamera className="w-4 h-4" /> Video
            </Link>
          </div>
          <Link
            to="/app/profile"
            className="text-sm text-gold hover:text-bright-gold font-semibold"
          >
            View full profile →
          </Link>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal
        open={reporting}
        onClose={() => setReporting(false)}
        title="Report user"
      >
        <div className="space-y-3">
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

      {/* Delete confirm */}
      <Confirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.success("Chat deleted");
          navigate("/app/messages");
        }}
        title="Delete this conversation?"
        message="All messages will be removed permanently."
        confirmLabel="Delete"
        destructive
      />
    </DashboardShell>
  );
}
