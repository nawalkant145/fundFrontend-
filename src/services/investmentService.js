import api from "./api";

export const investmentService = {
  expressInterest: (data) => api.post("/investment/express-interest", data),
  updateStage: (id, stage) => api.put(`/investment/${id}/stage`, { stage }),
  createOrder: (id) => api.post(`/investment/${id}/pay`),
  verifyPayment: (id, data) => api.post(`/investment/${id}/verify-payment`, data),
  getMyDeals: () => api.get("/investment/my-deals"),
  getById: (id) => api.get(`/investment/${id}`),
};
