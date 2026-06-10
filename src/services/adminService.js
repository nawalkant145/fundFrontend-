import api from "./api";

export const adminService = {
  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),
  getStats: (params) => api.get("/admin/stats", { params }),

  // Users
  listUsers: (params) => api.get("/admin/users", { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  editUser: (id, data) => api.put(`/admin/users/${id}`, data),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  resetUserPassword: (id, newPassword) =>
    api.put(`/admin/users/${id}/reset-password`, { newPassword }),
  promoteToAdmin: (id) => api.put(`/admin/users/${id}/promote`),
  demoteAdmin: (id, role) => api.put(`/admin/users/${id}/demote`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Videos
  listVideos: (params) => api.get("/admin/videos", { params }),
  getPendingVideos: () => api.get("/admin/videos/pending"),
  approveVideo: (id) => api.put(`/admin/videos/${id}/approve`),
  rejectVideo: (id, reason) => api.put(`/admin/videos/${id}/reject`, { reason }),
  boostVideo: (id, days) => api.post(`/admin/videos/${id}/boost`, { days }),
  removeBoost: (id) => api.delete(`/admin/videos/${id}/boost`),
  deleteVideo: (id) => api.delete(`/admin/videos/${id}`),

  // KYC
  getPendingDocuments: () => api.get("/admin/documents/pending"),
  approveDocuments: (userId) => api.put(`/admin/documents/${userId}/approve`),
  rejectDocuments: (userId, reason) =>
    api.put(`/admin/documents/${userId}/reject`, { reason }),

  // Reports
  listReports: (params) => api.get("/admin/reports", { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),

  // Comments
  listComments: (params) => api.get("/admin/comments", { params }),
  hideComment: (id) => api.put(`/admin/comments/${id}/hide`),
  unhideComment: (id) => api.put(`/admin/comments/${id}/unhide`),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),

  // Investments
  listInvestments: (params) => api.get("/admin/investments", { params }),
  refundInvestment: (id, reason) =>
    api.post(`/admin/investments/${id}/refund`, { reason }),

  // Calls / Chats
  listCalls: (params) => api.get("/admin/calls", { params }),
  listChats: (params) => api.get("/admin/chats", { params }),
  getChatMessages: (chatId, params) =>
    api.get(`/admin/chats/${chatId}/messages`, { params }),

  // Broadcast
  broadcast: (data) => api.post("/admin/broadcast", data),

  // Audit
  getAuditLogs: (params) => api.get("/admin/audit", { params }),
};
