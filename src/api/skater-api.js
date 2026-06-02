import api from "@/lib/axios";

export const skaterApi = {
  getAll: async (params = {}) => {
    return api.get("/admin/v1/skater", { params });
  },
  getById: async (id) => {
    return api.get(`/admin/v1/skater/${id}`);
  },
  update: async (id, data) => {
    return api.patch(`/admin/v1/skater/${id}`, data);
  },
  toggleBlock: async (userId, isBlocked) => {
    return api.patch(`/auth/v1/toggle-block/${userId}`, { isBlocked });
  }
};
