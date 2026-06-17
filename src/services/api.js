import axios from "axios";

// ─── Base URL — auto-detects environment ──────────────────
// Priority:
//   1. VITE_API_URL (explicit override via .env)
//   2. Production build → Render backend
//   3. Local dev → localhost
const PROD_API = "https://expglofundbackend.onrender.com/api/v1";
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
    const token = localStorage.getItem("expglo:accessToken");
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

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
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

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = data.data?.accessToken || data.accessToken;
        localStorage.setItem("expglo:accessToken", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem("expglo:accessToken");
        localStorage.removeItem("expglo:auth");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
