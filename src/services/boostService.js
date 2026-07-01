import api from "./api";

export const boostService = {
  getTiers: () => api.get("/boost/tiers"),
  getMyBoosts: () => api.get("/boost/my"),
  getActiveBoosts: () => api.get("/boost/active"),
  createOrder: (data) => api.post("/boost/order", data),
  verifyPayment: (id, data) => api.post(`/boost/${id}/verify`, data),
};
