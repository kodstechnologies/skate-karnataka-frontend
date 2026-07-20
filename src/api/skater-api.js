import api from "@/lib/axios";

export const skaterApi = {
  getAll: async (params = {}) => {
    return api.get("/admin/v1/skater", { params });
  },
  getById: async (id) => {
    return api.get(`/admin/v1/skater/${id}`);
  },
  create: async (data) => {
    return api.post("/admin/v1/skater", data);
  },
  update: async (id, data) => {
    return api.patch(`/admin/v1/skater/${id}`, data);
  },
  toggleBlock: async (userId, isBlocked) => {
    return api.patch(`/auth/v1/toggle-block/${userId}`, { isBlocked });
  },
  delete: async (id) => {
    return api.delete(`/admin/v1/skater/${id}`);
  }
};
