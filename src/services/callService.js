import api from "./api";

export const callService = {
  initiate: (data) => api.post("/call/initiate", data),
  accept: (callId) => api.put(`/call/${callId}/accept`),
  decline: (callId) => api.put(`/call/${callId}/decline`),
  end: (callId) => api.put(`/call/${callId}/end`),
  getHistory: (params) => api.get("/call/history", { params }),
  getById: (callId) => api.get(`/call/${callId}`),
  getIceServers: () => api.get("/call/ice-servers"),
};
