import api from "./api";

export const subscriptionService = {
  getMine: () => api.get("/subscription/me"),
  createOrder: () => api.post("/subscription/order"),
  verifyPayment: (id, data) => api.post(`/subscription/${id}/verify`, data),
  cancel: () => api.post("/subscription/cancel"),
};
