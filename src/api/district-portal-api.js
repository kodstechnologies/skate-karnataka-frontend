import api from "@/lib/axios";

export const districtPortalApi = {
  getDashboard: async () => api.get("/district/v1/dashboard"),
  getProfile: async () => api.get("/district/v1/profile")
};
