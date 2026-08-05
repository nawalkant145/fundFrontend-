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
  suspendUser: (id, days, reason) =>
    api.put(`/admin/users/${id}/suspend`, { days, reason }),
  unsuspendUser: (id) => api.put(`/admin/users/${id}/unsuspend`),
  impersonateUser: (id) => api.post(`/admin/users/${id}/impersonate`),
  resetUserPassword: (id, newPassword) =>
    api.put(`/admin/users/${id}/reset-password`, { newPassword }),
  promoteToAdmin: (id) => api.put(`/admin/users/${id}/promote`),
  demoteAdmin: (id, role) => api.put(`/admin/users/${id}/demote`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Videos
  listVideos: (params) => api.get("/admin/videos", { params }),
  getPendingVideos: () => api.get("/admin/videos/pending"),
  approveVideo: (id) => api.put(`/admin/videos/${id}/approve`),
  rejectVideo: (id, reason) =>
    api.put(`/admin/videos/${id}/reject`, { reason }),
  boostVideo: (id, days) => api.post(`/admin/videos/${id}/boost`, { days }),
  removeBoost: (id) => api.delete(`/admin/videos/${id}/boost`),
  deleteVideo: (id) => api.delete(`/admin/videos/${id}`),

  // Trash (soft-deleted content)
  listTrash: (params) => api.get("/admin/trash", { params }),
  restoreVideo: (id) => api.put(`/admin/videos/${id}/restore`),
  purgeVideo: (id) => api.delete(`/admin/videos/${id}/purge`),

  // KYC Workspace (Level 1 to 5)
  getOperationalKpis: () => api.get("/admin/kyc/kpis"),
  getPendingQueues: (type) => api.get(`/admin/kyc/queue/${type || "personal"}`),
  getPendingDocuments: () => api.get("/admin/documents/pending"),
  approveUserDocuments: (userId, notes = "") => api.put(`/admin/documents/${userId}/approve`, { notes }),
  rejectUserDocuments: (userId, reason, notes = "") =>
    api.put(`/admin/documents/${userId}/reject`, { reason, notes }),
  approveCompanyKyc: (companyId) => api.put(`/admin/kyc/company/${companyId}/approve`),
  rejectCompanyKyc: (companyId, reason) => api.put(`/admin/kyc/company/${companyId}/reject`, { reason }),
  approveInvestorKyc: (investmentKycId) => api.put(`/admin/kyc/investor/${investmentKycId}/approve`),
  rejectInvestorKyc: (investmentKycId, reason) => api.put(`/admin/kyc/investor/${investmentKycId}/reject`, { reason }),

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
  freezeInvestment: (id, reason) =>
    api.put(`/admin/investments/${id}/freeze`, { reason }),
  unfreezeInvestment: (id) => api.put(`/admin/investments/${id}/unfreeze`),
  getSuspiciousActivity: () => api.get("/admin/investments/suspicious"),
  exportInvestmentsUrl: () => "/admin/investments/export",

  // Calls / Chats
  listCalls: (params) => api.get("/admin/calls", { params }),
  listChats: (params) => api.get("/admin/chats", { params }),
  getChatMessages: (chatId, params) =>
    api.get(`/admin/chats/${chatId}/messages`, { params }),

  // Broadcast
  broadcast: (data) => api.post("/admin/broadcast", data),

  // Audit
  getAuditLogs: (params) => api.get("/admin/audit", { params }),
  getAuditActions: () => api.get("/admin/audit/actions"),
  auditExportUrl: () => "/admin/audit/export",

  // Moderation queue (auto-flagged content)
  listFlags: (params) => api.get("/admin/moderation", { params }),
  resolveFlag: (id, action) =>
    api.put(`/admin/moderation/${id}/resolve`, { action }),

  // Platform settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};
