import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationService } from "../services/notificationService";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { useToast } from "../components/ui/Toast";

                                                                                                                                                                                                                                 
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoggedIn } = useAuth();
  const { socket } = useSocket() || {};
  const toast = useToast();

  const refreshUnread = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getUnreadCount();
      const data = res?.data?.data ?? res?.data;
      const count = data?.count ?? data?.unread ?? data ?? 0;
      setUnreadCount(Number(count) || 0);
    } catch {
                                     
    }
  }, [isLoggedIn]);

                            
  useEffect(() => {
    refreshUnread();
    if (!isLoggedIn) return;
    const interval = setInterval(refreshUnread, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, refreshUnread]);

                                                                  
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
                                            
      setUnreadCount((prev) => prev + 1);
                                                 
      if (notif?.title) {
        toast?.info(notif.title);
      }
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, toast]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnread, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    return {
      unreadCount: 0,
      refreshUnread: () => {},
      setUnreadCount: () => {},
    };
  return ctx;
}
