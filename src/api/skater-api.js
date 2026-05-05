import api from "@/lib/axios";

export const skaterApi = {
  getAll: async (params = {}) => {
    return api.get("/admin/v1/skater", { params });
  },
  getById: async (id) => {
    return api.get(`/admin/v1/skater/${id}`);
  }
};
