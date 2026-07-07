import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const districtPortalApi = {
  getDashboard: async () => api.get("/district/v1/dashboard"),
  getProfile: async () => api.get("/district/v1/profile"),
  updateProfile: async (data) =>
    api.patch("/district/v1/profile", data, { headers: multipartHeaders })
};
