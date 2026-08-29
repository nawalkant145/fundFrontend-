import axios from "axios";

// ─── Base URL — auto-detects environment ──────────────────
// Priority:
//   1. VITE_API_URL (explicit override via .env)
//   2. Production build → Render backend
//   3. Local dev → localhost
const PROD_API = "https://fundbackend-a2ur.onrender.com/api/v1";
const LOCAL_API = "http://localhost:5000/api/v1";

const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API : LOCAL_API);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
    "x-platform": "web",
  },
});

// ─── Request interceptor — attach access token ─────────
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("expglo:accessToken") ||
      sessionStorage.getItem("expglo:accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — auto-refresh on 401 ────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // Routes that should NEVER trigger an auto-refresh — they're expected
    // to return 401 for bad credentials / unverified state. Note: /auth/me
    // is deliberately NOT in this list, so an expired access token on page
    // load triggers a silent refresh (keeps "Remember me" sessions alive).
    const noRefreshRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
      "/auth/send-pre-register-otp",
      "/auth/verify-pre-register-otp",
      "/auth/check-availability",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    const skipRefresh = noRefreshRoutes.some((r) => url.includes(r));

    // If 401 and not already retrying and refresh is allowed for this route
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem("expglo:refreshToken") ||
        sessionStorage.getItem("expglo:refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error("No refresh token available"), null);
        localStorage.removeItem("expglo:accessToken");
        localStorage.removeItem("expglo:refreshToken");
        localStorage.removeItem("expglo:remember");
        sessionStorage.removeItem("expglo:accessToken");
        sessionStorage.removeItem("expglo:refreshToken");
        const path = window.location.pathname;
        if (path.startsWith("/app") || path.startsWith("/admin")) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true },
        );

        const payload = data.data || data;
        const newAccessToken = payload?.accessToken;
        const newRefreshToken = payload?.refreshToken || refreshToken;

        if (!newAccessToken) {
          throw new Error("Invalid refresh response");
        }

        // Store in the same storage the user originally used
        const remembered = localStorage.getItem("expglo:remember") === "1";
        if (remembered) {
          localStorage.setItem("expglo:accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("expglo:refreshToken", newRefreshToken);
          }
          sessionStorage.removeItem("expglo:accessToken");
          sessionStorage.removeItem("expglo:refreshToken");
        } else {
          sessionStorage.setItem("expglo:accessToken", newAccessToken);
          if (newRefreshToken) {
            sessionStorage.setItem("expglo:refreshToken", newRefreshToken);
          }
          localStorage.removeItem("expglo:accessToken");
          localStorage.removeItem("expglo:refreshToken");
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — session is truly gone. Clear tokens from all storages.
        localStorage.removeItem("expglo:accessToken");
        localStorage.removeItem("expglo:refreshToken");
        localStorage.removeItem("expglo:remember");
        sessionStorage.removeItem("expglo:accessToken");
        sessionStorage.removeItem("expglo:refreshToken");

        // Only hard-redirect if the user is on a protected (/app or /admin)
        // page. On public pages, let them keep browsing as a guest.
        const path = window.location.pathname;
        if (path.startsWith("/app") || path.startsWith("/admin")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
