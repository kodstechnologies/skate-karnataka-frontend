import api from "@/lib/axios";

export const schoolApi = {
  getAll: async (params = {}) => {
    return api.get("/school/v1/all", { params });
  },
  getDetails: async (id) => {
    return api.get(`/school/v1/full-details/${id}`);
  }
};
