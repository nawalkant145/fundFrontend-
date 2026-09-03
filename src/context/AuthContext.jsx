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
const REFRESH_TOKEN_KEY = "expglo:refreshToken";
const REMEMBER_KEY = "expglo:remember";

                                                                                                                                              
function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getStoredRefreshToken() {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  );
}

                                                                                                      
function storeToken(tokens, remember) {
  const accessToken = typeof tokens === "string" ? tokens : tokens?.accessToken;
  const refreshToken = typeof tokens === "object" ? tokens?.refreshToken : null;

  if (remember) {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REMEMBER_KEY, "1");

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    if (accessToken) sessionStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

                                            
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem("expglo:adminToken");
  sessionStorage.removeItem("expglo:impersonating");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

                                                                            
  useEffect(() => {
    const token = getStoredToken();
    const refreshToken = getStoredRefreshToken();
    if (token || refreshToken) {
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
    const payload = res.data.data;                                       
    storeToken(
      { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
      remember
    );
    setUser(payload.user);
    syncSubscriptionFromUser(payload.user);
                                                                      
    setAuth({
      role: payload.user?.role,
      identifier: payload.user?.email || payload.user?.username || "",
    });
    return payload;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const payload = res.data.data;                                       
                                                              
    storeToken(
      { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
      true
    );
    setUser(payload.user);
                                                                      
    setAuth({
      role: payload.user?.role,
      identifier: payload.user?.email || payload.user?.username || "",
    });
    return payload;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
                                                    
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

                                                             
  const [impersonating, setImpersonating] = useState(() => {
    try {
      const raw = sessionStorage.getItem("expglo:impersonating");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const startImpersonation = (token, targetUser) => {
                                                               
    const adminToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (adminToken) sessionStorage.setItem("expglo:adminToken", adminToken);
                                                         
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);                             
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
                                                                           
      localStorage.setItem(TOKEN_KEY, adminToken);
      localStorage.setItem(REMEMBER_KEY, "1");
    }
    setImpersonating(null);
                               
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
