import api from "./api";

export const notificationService = {
  list: (params) => api.get("/notification/list", { params }),
  getUnreadCount: () => api.get("/notification/unread-count"),
  markRead: (id) => api.put(`/notification/${id}/read`),
  markAllRead: () => api.put("/notification/read-all"),
  remove: (id) => api.delete(`/notification/${id}`),
  getById: (id) => api.get(`/notification/${id}`),
};
