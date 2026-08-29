import api from "./api";

export const fundingService = {
  getImpact: () => api.get("/funding/impact"),
  getRecords: () => api.get("/funding/records"),
  createMonthlyFunding: (data) => api.post("/funding", data),
  updateMonthlyFunding: (id, data) => api.put(`/funding/${id}`, data),
  deleteMonthlyFunding: (id) => api.delete(`/funding/${id}`),
};
