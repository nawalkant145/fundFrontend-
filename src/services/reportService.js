import api from "./api";

export const reportService = {
  create: (data) => api.post("/report", data),
  myReports: () => api.get("/report/my-reports"),
};
