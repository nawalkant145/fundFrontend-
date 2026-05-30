import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiCheckCircle,
  HiBan,
  HiVolumeOff,
  HiArchive,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { MOCK_CHATS, CURRENT_USER } from "../../constants/mockData";

export default function MessagesPage() {
  const toast = useToast();
  const [chats, setChats] = useState(MOCK_CHATS);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);

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
    <DashboardShell title="Messages" subtitle="Your conversations.">
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-3 mb-4">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          {query
            ? "No conversations match your search."
            : "No conversations yet."}
        </p>
      ) : (
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl divide-y divide-gold/10 overflow-hidden">
          {filtered.map((c) => {
            const other =
              CURRENT_USER.role === "founder" ? c.investorId : c.founderId;
            return (
              <div
                key={c._id}
                className="flex items-center hover:bg-dark-bg/40 transition-colors"
              >
                <Link
                  to={`/app/messages/${c._id}`}
                  className="flex-1 flex items-center gap-4 p-4 min-w-0"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={other.avatar}
                      alt={other.name}
                      className="w-12 h-12 rounded-full object-cover border border-gold/20"
                    />
                    {other.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card-bg" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold truncate">{other.name}</p>
                      <span className="text-[11px] text-gray-500 flex-shrink-0">
                        {c.lastMessageAt}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        c.unread > 0
                          ? "text-white font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-6 h-6 bg-gold text-dark-navy text-xs font-black rounded-full flex items-center justify-center flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </Link>
                <div className="px-2">
                  <DropdownMenu
                    items={[
                      {
                        label: "Mark as read",
                        icon: HiCheckCircle,
                        onClick: () => {
                          setChats((p) =>
                            p.map((x) =>
                              x._id === c._id ? { ...x, unread: 0 } : x,
                            ),
                          );
                          toast.info("Marked as read");
                        },
                      },
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
                        label: "Block user",
                        icon: HiBan,
                        onClick: () => toast.warn(`${other.name} blocked`),
                        danger: true,
                      },
                      {
                        label: "Delete chat",
                        icon: HiTrash,
                        onClick: () => setConfirming(c),
                        danger: true,
                      },
                    ]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Confirm
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          setChats((p) => p.filter((x) => x._id !== confirming._id));
          toast.success("Chat deleted");
        }}
        title="Delete this conversation?"
        message="All messages will be removed. This can't be undone."
        confirmLabel="Delete"
        destructive
      />
    </DashboardShell>
  );
}
