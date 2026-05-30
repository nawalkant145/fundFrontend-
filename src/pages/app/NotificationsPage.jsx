import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiHeart,
  HiBookmark,
  HiChatAlt2,
  HiCurrencyDollar,
  HiUsers,
  HiBell,
  HiEye,
  HiCheckCircle,
  HiTrash,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { useToast } from "../../components/ui/Toast";
import { MOCK_NOTIFICATIONS } from "../../constants/mockData";

const ICONS = {
  like: { icon: HiHeart, cls: "bg-red-500/15 text-red-400" },
  save: { icon: HiBookmark, cls: "bg-blue-500/15 text-blue-400" },
  message: { icon: HiChatAlt2, cls: "bg-gold/15 text-gold" },
  call: { icon: HiUsers, cls: "bg-primary-green/15 text-primary-green" },
  investment: {
    icon: HiCurrencyDollar,
    cls: "bg-emerald-500/15 text-emerald-400",
  },
  match: { icon: HiUsers, cls: "bg-pink-500/15 text-pink-400" },
  pitch_views: { icon: HiEye, cls: "bg-blue-500/15 text-blue-400" },
  system: { icon: MdVerified, cls: "bg-gold/15 text-gold" },
  verification: {
    icon: HiCheckCircle,
    cls: "bg-emerald-500/15 text-emerald-400",
  },
};

const FILTERS = [
  { v: "all", l: "All" },
  { v: "unread", l: "Unread" },
  { v: "like", l: "Likes" },
  { v: "save", l: "Saves" },
  { v: "message", l: "Messages" },
  { v: "investment", l: "Investments" },
];

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const markRead = (id) => {
    setItems((p) => p.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
  };

  const markAllRead = () => {
    setItems((p) => p.map((x) => ({ ...x, isRead: true })));
    toast.success("All notifications marked read");
  };

  const remove = (id) => {
    setItems((p) => p.filter((x) => x._id !== id));
    toast.success("Notification deleted");
  };

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <DashboardShell title="Notifications" subtitle={`${unread} unread`}>
      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f.v
                  ? "bg-gold text-dark-navy"
                  : "bg-card-bg/60 text-gray-300 border border-gold/15 hover:border-gold/40"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-gold hover:text-bright-gold font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <HiBell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No notifications here.</p>
        </div>
      ) : (
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl divide-y divide-gold/10 overflow-hidden">
          {filtered.map((n) => {
            const meta = ICONS[n.type] || ICONS.system;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n._id}
                className={`flex items-start gap-3 p-4 hover:bg-dark-bg/40 transition-colors ${
                  !n.isRead ? "bg-gold/5" : ""
                }`}
                whileHover={{ x: 4 }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.cls}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => markRead(n._id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="font-bold text-sm">{n.title}</p>
                  <p className="text-sm text-gray-400">{n.body}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.createdAt}</p>
                </button>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                )}
                <DropdownMenu
                  items={[
                    !n.isRead && {
                      label: "Mark as read",
                      icon: HiCheckCircle,
                      onClick: () => markRead(n._id),
                    },
                    {
                      label: "Delete",
                      icon: HiTrash,
                      onClick: () => remove(n._id),
                      danger: true,
                    },
                  ].filter(Boolean)}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
