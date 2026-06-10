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
  getSaved: () => api.get("/video/saved"),
  getAnalytics: (id) => api.get(`/video/${id}/analytics`),
  renew: (id) => api.post(`/video/${id}/renew`),
  togglePause: (id) => api.post(`/video/${id}/pause-toggle`),
};
