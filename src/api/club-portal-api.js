import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const clubPortalApi = {
  getDashboard: async () => api.get("/club/v1/dashboard"),
  getProfile: async () => api.get("/club/v1/profile"),
  updateProfile: async (data) => api.patch("/club/v1/profile", data, { headers: multipartHeaders }),
  getSkaters: async (params = {}) => api.get("/club/v1/display-all-skater", { params }),
  getSkater: async (id) => api.get(`/club/v1/club-skater-details/${id}`),
  editSkater: async (id, data) => api.patch(`/club/v1/club-skater-edit/${id}`, data),
  blockSkater: async (id) => api.patch(`/club/v1/block-skater/${id}`),
  listDistricts: async (params = {}) => api.get("/club/v1/display-all-district", { params }),
};
