import api from "@/lib/axios";

export const academyApi = {
  getAll: async (params = {}) => {
    return api.get("/academy/v1/all", { params });
  },
  getDetails: async (id) => {
    return api.get(`/academy/v1/full-details/${id}`);
  },
  delete: async (id) => {
    return api.delete(`/academy/v1/${id}`);
  }
};
