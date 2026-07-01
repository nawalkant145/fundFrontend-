import api from "./api";

export const commentService = {
  create: (data) => api.post("/comment", data),
  list: (videoId, params) => api.get(`/comment/video/${videoId}`, { params }),
  listByPost: (postId, params) =>
    api.get(`/comment/post/${postId}`, { params }),
  update: (id, text) => api.put(`/comment/${id}`, { text }),
  remove: (id) => api.delete(`/comment/${id}`),
  like: (id) => api.post(`/comment/${id}/like`),
};
