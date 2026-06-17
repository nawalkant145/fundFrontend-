import api from "./api";

export const postService = {
  create: (files, body) => {
    const fd = new FormData();
    if (files?.length) {
      files.forEach((f) => fd.append("images", f));
    }
    if (body.caption) fd.append("caption", body.caption);
    if (body.link) fd.append("link", body.link);
    if (body.hashtags) fd.append("hashtags", body.hashtags);
    if (body.type) fd.append("type", body.type);
    return api.post("/post", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getFeed: (params) => api.get("/post/feed", { params }),
  getMyPosts: () => api.get("/post/my-posts"),
  getById: (id) => api.get(`/post/${id}`),
  update: (id, data) => api.put(`/post/${id}`, data),
  remove: (id) => api.delete(`/post/${id}`),
  like: (id) => api.post(`/post/${id}/like`),
  save: (id) => api.post(`/post/${id}/save`),
  getUserPosts: (userId, params) => api.get(`/post/user/${userId}`, { params }),
};
