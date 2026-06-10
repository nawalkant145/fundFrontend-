import api from "./api";

export const chatService = {
  startChat: (founderId) => api.post("/chat/start", { founderId }),
  listChats: () => api.get("/chat/list"),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
  uploadAttachment: (chatId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post(`/chat/${chatId}/attachment`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  markRead: (chatId) => api.put(`/chat/${chatId}/read`),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
  getTotalUnread: () => api.get("/chat/unread-total"),
};
