import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const clubPortalApi = {
  getDashboard: async () => api.get("/club/v1/dashboard"),
  getProfile: async () => api.get("/club/v1/profile"),
  updateProfile: async (data) => api.patch("/club/v1/profile", data, { headers: multipartHeaders })
};
