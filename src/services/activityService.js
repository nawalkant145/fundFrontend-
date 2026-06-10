import api from "./api";

export const activityService = {
  getDashboard: () => api.get("/activity/dashboard"),
};
