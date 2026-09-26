import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const clubPortalApi = {
  getDashboard: async () => api.get("/club/v1/dashboard"),
  getProfile: async () => api.get("/club/v1/profile"),
  updateProfile: async (data) => api.patch("/club/v1/profile", data, { headers: multipartHeaders }),
  getSkaters: async (params = {}) => api.get("/club/v1/display-all-skater", { params }),
  getSkater: async (id) => api.get(`/club/v1/club-skater-details/${id}`),
  editSkater: async (id, data) => {
    // If data contains a photo File object, send as multipart
    if (data.photo instanceof File) {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          form.append(k, v);
        }
      });
      return api.patch(`/club/v1/club-skater-edit/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    }
    return api.patch(`/club/v1/club-skater-edit/${id}`, data);
  },
  blockSkater: async (id) => api.patch(`/club/v1/block-skater/${id}`),
  listDistricts: async (params = {}) => api.get("/club/v1/display-all-district", { params }),
};
