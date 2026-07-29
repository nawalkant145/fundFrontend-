import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { syncSubscriptionFromUser, setAuth } from "../lib/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "expglo:accessToken";
const REMEMBER_KEY = "expglo:remember";

/**
 * Get the token from whichever storage it lives in.
 * - If "remember me" was checked → localStorage
 * - If not → sessionStorage
 * We check both on boot since we don't know yet which was used.
 */
function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Store token in the appropriate storage based on remember preference.
 */
function storeToken(token, remember) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "1");
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/**
 * Clear token from both storages.
 */
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount (if token exists in either storage)
  useEffect(() => {
    const token = getStoredToken();
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
      const u = payload.user || payload;
      setUser(u);
      syncSubscriptionFromUser(u);
      // Ensure localStorage role is always up-to-date for getRole() fallback
      if (u?.role) {
        setAuth({ role: u.role, identifier: u.email || u.username || "" });
      }
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { remember = true, ...loginData } = credentials;
    const res = await authService.login(loginData);
    const payload = res.data.data; // { user, accessToken, refreshToken }
    storeToken(payload.accessToken, remember);
    setUser(payload.user);
    syncSubscriptionFromUser(payload.user);
    // Persist role to localStorage so getRole() fallback always works
    setAuth({ role: payload.user?.role, identifier: payload.user?.email || payload.user?.username || "" });
    return payload;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const payload = res.data.data; // { user, accessToken, refreshToken }
    // Registration always remembers (new user just signed up)
    storeToken(payload.accessToken, true);
    setUser(payload.user);
    // Persist role to localStorage so getRole() fallback always works
    setAuth({ role: payload.user?.role, identifier: payload.user?.email || payload.user?.username || "" });
    return payload;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    clearToken();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      const payload = res.data.data || res.data;
      const u = payload.user || payload;
      setUser(u);
      syncSubscriptionFromUser(u);
    } catch {}
  }, []);

  // ─── Impersonation (admin "view as user") ───────────────
  const [impersonating, setImpersonating] = useState(() => {
    try {
      const raw = sessionStorage.getItem("expglo:impersonating");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const startImpersonation = (token, targetUser) => {
    // Stash the admin's own token so we can restore it on exit
    const adminToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (adminToken) sessionStorage.setItem("expglo:adminToken", adminToken);
    // Activate the impersonation token in sessionStorage
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY); // don't let admin token win
    const info = { name: targetUser?.name, id: targetUser?._id };
    sessionStorage.setItem("expglo:impersonating", JSON.stringify(info));
    setImpersonating(info);
    setUser(targetUser);
  };

  const stopImpersonation = () => {
    const adminToken = sessionStorage.getItem("expglo:adminToken");
    sessionStorage.removeItem("expglo:impersonating");
    sessionStorage.removeItem("expglo:adminToken");
    sessionStorage.removeItem(TOKEN_KEY);
    if (adminToken) {
      // Restore admin session (admins log in with remember = localStorage)
      localStorage.setItem(TOKEN_KEY, adminToken);
      localStorage.setItem(REMEMBER_KEY, "1");
    }
    setImpersonating(null);
    // Reload the admin profile
    fetchUser();
  };

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
    impersonating,
    startImpersonation,
    stopImpersonation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
