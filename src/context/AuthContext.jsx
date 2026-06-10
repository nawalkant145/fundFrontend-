import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount (if token exists)
  useEffect(() => {
    const token = localStorage.getItem("expglo:accessToken");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      const payload = res.data.data || res.data;
      setUser(payload.user || payload);
    } catch {
      localStorage.removeItem("expglo:accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const payload = res.data.data; // { user, accessToken, refreshToken }
    localStorage.setItem("expglo:accessToken", payload.accessToken);
    setUser(payload.user);
    return payload;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const payload = res.data.data; // { user, accessToken, refreshToken }
    localStorage.setItem("expglo:accessToken", payload.accessToken);
    setUser(payload.user);
    return payload;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    localStorage.removeItem("expglo:accessToken");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      const payload = res.data.data || res.data;
      setUser(payload.user || payload);
    } catch {}
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
