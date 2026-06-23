import api from "@/lib/axios";

export const feedbackApi = {
  getAll: (params = {}) => api.get("/guest/v1/feed-back", { params }),
  getById: (id) => api.get(`/guest/v1/feed-back/${id}`)
};
