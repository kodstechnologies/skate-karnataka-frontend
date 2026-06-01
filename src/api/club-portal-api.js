import api from "@/lib/axios";

export const clubPortalApi = {
  getDashboard: async () => api.get("/club/v1/dashboard"),
  getProfile: async () => api.get("/club/v1/profile")
};
