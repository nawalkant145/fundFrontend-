import { useEffect, useState } from "react";
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
import { notificationService } from "../../services/notificationService";
import { useNotifications } from "../../context/NotificationContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  like: { icon: HiHeart, cls: "bg-red-500/15 text-red-400" },
  save: { icon: HiBookmark, cls: "bg-secondary-green/15 text-secondary-green" },
  comment: { icon: HiChatAlt2, cls: "bg-primary-green/15 text-primary-green" },
  message: { icon: HiChatAlt2, cls: "bg-gold/15 text-gold" },
  call: { icon: HiUsers, cls: "bg-primary-green/15 text-primary-green" },
  investment: {
    icon: HiCurrencyDollar,
    cls: "bg-emerald-500/15 text-emerald-400",
  },
  match: { icon: HiUsers, cls: "bg-pink-500/15 text-pink-400" },
  pitch_views: {
    icon: HiEye,
    cls: "bg-secondary-green/15 text-secondary-green",
  },
  system: { icon: MdVerified, cls: "bg-gold/15 text-gold" },
  verification: {
    icon: HiCheckCircle,
    cls: "bg-emerald-500/15 text-emerald-400",
  },
};

const FILTERS = [
  { v: "all", l: "All" },
  { v: "unread", l: "Unread" },
  { v: "investment", l: "Investments" },
  { v: "mentions", l: "Mentions" },
  { v: "system", l: "System" },
];

export default function NotificationsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { refreshUnread } = useNotifications();
  const { socket } = useSocket();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    console.log("[FOUNDER_FRONTEND_USER]", {
      userId: user?._id,
      role: user?.role,
      name: user?.name,
    });
  }, [user]);

  const fetchList = () => {
    setLoading(true);
    notificationService
      .list({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.notifications || data || [];
        setItems(list);
        console.log("[FOUNDER_NOTIFICATION_FRONTEND]", {
          currentUserId: user?._id,
          responseCount: list.length,
          investmentNotifications: list
            .filter((n) => n.type === "investment")
            .map((n) => ({
              id: n._id,
              userId: n.userId,
              type: n.type,
              title: n.title,
              dataStatus: n.data?.status,
              dataInvestmentId: n.data?.investmentId,
            })),
        });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

                              
  useEffect(() => {
    if (!socket) return;
    const onNotif = (notif) => {
      if (notif) {
        setItems((prev) => [notif, ...prev.filter((x) => x._id !== notif._id)]);
        refreshUnread();
      }
    };
    socket.on("notification", onNotif);
    return () => socket.off("notification", onNotif);
  }, [socket]);

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "investment") return n.type === "investment" || n.type === "investment_received";
    if (filter === "mentions") return n.type === "comment" || n.type === "like";
    if (filter === "system") return n.type === "system" || n.type === "verification";
    return n.type === filter;
  });

  const markRead = (id) => {
    setItems((p) => p.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
    notificationService.markRead(id).catch(() => {});
    refreshUnread();
  };

  const markAllRead = () => {
    setItems((p) => p.map((x) => ({ ...x, isRead: true })));
    notificationService.markAllRead().catch(() => {});
    refreshUnread();
    toast.success("All notifications marked read");
  };

  const remove = (id) => {
    setItems((p) => p.filter((x) => x._id !== id));
    notificationService.remove(id).catch(() => {});
    refreshUnread();
    toast.success("Notification deleted");
  };

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <DashboardShell title="Notifications" subtitle={loading ? "Loading…" : `${unread} unread`}>
      {             }
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === f.v
                  ? "bg-gold text-dark-navy shadow-sm"
                  : "bg-card-bg/60 text-gray-300 border border-gold/15 hover:border-gold/40"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
        {unread > 0 && !loading && (
          <button
            onClick={markAllRead}
            className="text-sm text-gold hover:text-bright-gold font-semibold cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {          }
      {loading ? (
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl divide-y divide-gold/10 overflow-hidden animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-[#1B5E3F]/15 shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="h-4 bg-[#1B5E3F]/15 rounded w-1/3" />
                <div className="h-3 bg-[#1B5E3F]/10 rounded w-3/4" />
                <div className="h-2.5 bg-[#1B5E3F]/10 rounded w-1/5 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#1B5E3F]/12 rounded-2xl">
          <HiBell className="w-12 h-12 text-[#1B5E3F]/30 mx-auto mb-3" />
          <p className="text-gray-500 font-bold text-sm">No notifications here.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl divide-y divide-[#1B5E3F]/10 overflow-hidden shadow-sm">
          {filtered.map((n) => {
            const meta = ICONS[n.type] || ICONS.system;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n._id}
                className={`flex items-start gap-3.5 p-4 hover:bg-[#FAFAF7] transition-colors ${
                  !n.isRead ? "bg-emerald-50/40" : ""
                }`}
                whileHover={{ x: 2 }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.cls}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <a
                  href={`/app/notifications/${n._id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    markRead(n._id);
                    window.location.href = `/app/notifications/${n._id}`;
                  }}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <p className="font-bold text-sm text-[#0A1F14]">{n.title}</p>
                  <p className="text-xs text-[#0A1F14]/70 mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-[#0A1F14]/40 mt-1">
                    {new Date(n.createdAt).toLocaleString("en-IN")}
                  </p>
                </a>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-2" />
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
