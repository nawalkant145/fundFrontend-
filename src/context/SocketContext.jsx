import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

// Auto-detect the socket server origin (same logic as api.js)
const PROD_ORIGIN = "https://fundbackend-a2ur.onrender.com";
const LOCAL_ORIGIN = "http://localhost:5000";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api/v1", "")
    : import.meta.env.PROD
      ? PROD_ORIGIN
      : LOCAL_ORIGIN);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketInstance(null);
        setConnected(false);
      }
      return;
    }

    const token =
      localStorage.getItem("expglo:accessToken") ||
      sessionStorage.getItem("expglo:accessToken");
    if (!token) {
      console.warn("🔌 Socket initialization skipped: No auth token found");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 CALL SOCKET CONNECTED", { id: socket.id, url: SOCKET_URL });
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 CALL SOCKET DISCONNECTED", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("CALL SOCKET ERROR", err.message || err);
      setConnected(false);
    });

    // Heartbeat — keep online status alive
    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit("heartbeat");
    }, 20000);

    socketRef.current = socket;
    setSocketInstance(socket);

    return () => {
      clearInterval(heartbeat);
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
      setConnected(false);
    };
  }, [user]);

  const activeSocket = socketInstance || socketRef.current;

  return (
    <SocketContext.Provider value={{ socket: activeSocket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
