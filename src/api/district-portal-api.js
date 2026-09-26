import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const districtPortalApi = {
  getDashboard: async () => api.get("/district/v1/dashboard"),
  getClubs: async (params = {}) => api.get("/district/v1/total-club", { params }),
  getSkaters: async (params = {}) => api.get("/district/v1/total-skater", { params }),
  getSkater: async (skaterId) => api.get(`/district/v1/skater/${skaterId}`),
  editSkater: async (skaterId, data) => {
    if (data.photo instanceof File) {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") form.append(k, v);
      });
      return api.patch(`/district/v1/skater/${skaterId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    }
    return api.patch(`/district/v1/skater/${skaterId}`, data);
  },
  blockSkater: async (skaterId, isBlocked) => api.patch(`/district/v1/skater/${skaterId}/block`, { isBlocked }),
  deleteSkater: async (skaterId) => api.delete(`/district/v1/skater/${skaterId}`),
  getClub: async (clubId) => api.get(`/district/v1/club-details/${clubId}`),
  getProfile: async () => api.get("/district/v1/profile"),
  updateProfile: async (data) =>
    api.patch("/district/v1/profile", data, { headers: multipartHeaders }),
  acceptJoin: async (clubId) => api.get(`/district/v1/accept-join-club/${clubId}`),
  rejectJoin: async (clubId) => api.get(`/district/v1/reject-join-club/${clubId}`),
  acceptLeave: async (clubId) => api.get(`/district/v1/accept-leave-club/${clubId}`),
  rejectLeave: async (clubId) => api.get(`/district/v1/reject-leave-club/${clubId}`),
  deleteClub: async (clubId) => api.delete(`/admin/v1/club/${clubId}`),
  getEventCategories: async () => api.get("/auth/v1/all-skating-event-category"),
};
