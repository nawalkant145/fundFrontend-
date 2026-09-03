import api from "./api";

export const userService = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return api.post("/user/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadPitchDeck: (file) => {
    const fd = new FormData();
    fd.append("pitchDeck", file);
    return api.post("/user/pitch-deck", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  submitDocuments: (files) => {
    const fd = new FormData();
    if (files.panCard) fd.append("panCard", files.panCard);
    if (files.aadhar) fd.append("aadhar", files.aadhar);
    if (files.businessReg) fd.append("businessReg", files.businessReg);
    return api.post("/user/documents", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getVerificationStatus: () => api.get("/user/verification-status"),
  getProfileCompletion: () => api.get("/user/profile-completion"),
  updateFcmToken: (fcmToken) => api.put("/user/fcm-token", { fcmToken }),
  getPublicProfile: (userId) => api.get(`/user/public/${userId}`),
  getProfileViewers: (params) => api.get("/user/profile-viewers", { params }),
  getRecommendedStartups: (params) =>
    api.get("/user/recommended-startups", { params }),
  search: (params) => api.get("/user/search", { params }),
  blockUser: (userId) => api.post(`/user/block/${userId}`),
  unblockUser: (userId) => api.delete(`/user/block/${userId}`),
  deleteAccount: () => api.delete("/user/account"),

                  
  follow: (userId) => api.post(`/user/follow/${userId}`),
  getFollowers: (userId) => api.get(`/user/followers/${userId}`),
  getFollowing: (userId) => api.get(`/user/following/${userId}`),
  checkFollowing: (userId) => api.get(`/user/following-check/${userId}`),
};
