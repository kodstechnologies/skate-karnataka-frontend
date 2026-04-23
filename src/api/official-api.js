import api from "@/lib/axios";

export const officialApi = {
  getAll: async (params = {}) => {
    return api.get("/official/v1/all", { params });
  }
};
