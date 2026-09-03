import api from "./api";

export const videoService = {
  upload: (file, body) => {
    const fd = new FormData();
    fd.append("video", file);
    Object.entries(body).forEach(([key, val]) => {
      if (val !== undefined && val !== "") fd.append(key, val);
    });
    return api.post("/video/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

                                                                     
  uploadWithProgress: (formData, { onProgress, signal } = {}) => {
    return api.post("/video/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      timeout: 5 * 60 * 1000,                                  
      onUploadProgress: (e) => {
        if (e.total) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress?.(pct);
        }
      },
    });
  },
  getFeed: (params) => api.get("/video/feed", { params }),
  getTrending: (params) => api.get("/video/trending", { params }),
  search: (params) => api.get("/video/search", { params }),
  getById: (id) => api.get(`/video/${id}`),
  update: (id, data) => api.put(`/video/${id}`, data),
  remove: (id) => api.delete(`/video/${id}`),
  like: (id) => api.post(`/video/${id}/like`),
  save: (id) => api.post(`/video/${id}/save`),
  notInterested: (id) => api.post(`/video/${id}/not-interested`),
  logView: (id, data) => api.post(`/video/${id}/view`, data),
  getMyPitches: () => api.get("/video/my-pitches"),
  getUserPitches: (userId) => api.get(`/video/user/${userId}`),
  getSaved: () => api.get("/video/saved"),
  getAnalytics: (id) => api.get(`/video/${id}/analytics`),
  renew: (id) => api.post(`/video/${id}/renew`),
  togglePause: (id) => api.post(`/video/${id}/pause-toggle`),
};
