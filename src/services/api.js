import axios from "axios";

                                                             
            
                                                 
                                         
                             
const PROD_API = "https://fundbackend-a2ur.onrender.com/api/v1";
const LOCAL_API = "http://localhost:5000/api/v1";

const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API : LOCAL_API);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,                                         
  headers: {
    "Content-Type": "application/json",
    "x-platform": "web",
  },
});

                                                          
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

                                                                            
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      if (isRefreshing) {
                                                     
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
                                                                                  
        localStorage.removeItem("expglo:accessToken");
        localStorage.removeItem("expglo:refreshToken");
        localStorage.removeItem("expglo:remember");
        sessionStorage.removeItem("expglo:accessToken");
        sessionStorage.removeItem("expglo:refreshToken");

                                                                            
                                                                    
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
