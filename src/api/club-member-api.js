import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const clubMemberApi = {
  getAll: (clubId, params = {}) => api.get(`/admin/v1/club-member/${clubId}`, { params }),
  create: (clubId, data) =>
    api.post(`/admin/v1/club-member/${clubId}`, data, { headers: multipartHeaders }),
  update: (memberId, data) =>
    api.patch(`/admin/v1/club-member/${memberId}`, data, { headers: multipartHeaders }),
  delete: (memberId) => api.delete(`/admin/v1/club-member/${memberId}`),
  toggleBlock: (userId, isBlocked) => api.patch(`/auth/v1/toggle-block/${userId}`, { isBlocked }),
  setMain: (clubId, memberId) => api.patch(`/admin/v1/club-member/${clubId}/main/${memberId}`),
  approve: (memberId) => api.patch(`/admin/v1/club-member/${memberId}/approve`)
};
