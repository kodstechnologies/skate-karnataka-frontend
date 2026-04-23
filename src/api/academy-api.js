import api from "@/lib/axios";

export const academyApi = {
  getAll: async (params = {}) => {
    return api.get("/academy/v1/all", { params });
  }
};
