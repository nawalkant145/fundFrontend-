import api from "./api";

export const eventService = {
  getUpcoming: (params) => api.get("/event/upcoming", { params }),
  getById: (id) => api.get(`/event/${id}`),
  register: (id) => api.post(`/event/${id}/register`),
  adminCreate: (data) => api.post("/event/admin/create", data),
  adminList: (params) => api.get("/event/admin/list", { params }),
  getEventRegistrations: (id, params) => api.get(`/event/admin/${id}/registrations`, { params }),
  adminUpdate: (id, data) => api.put(`/event/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/event/admin/${id}`),
};
