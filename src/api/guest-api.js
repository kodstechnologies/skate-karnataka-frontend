import api from "@/lib/axios";

export const guestApi = {
  getAll: async (params = {}) => {
    return api.get("/guest/v1/all", { params });
  },
  getDetails: async (id) => {
    return api.get(`/guest/v1/full-details/${id}`);
  },
  delete: async (id) => {
    return api.delete(`/guest/v1/${id}`);
  }
};
