import api from "@/lib/axios";

export const parentApi = {
  getAll: async (params = {}) => {
    return api.get("/parent/v1/all", { params });
  }
};
