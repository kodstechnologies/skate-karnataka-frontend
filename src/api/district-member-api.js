import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const districtMemberApi = {
  getAll: (districtId, params = {}) =>
    api.get(`/admin/v1/district-member/${districtId}`, { params }),
  create: (districtId, data) =>
    api.post(`/admin/v1/district-member/${districtId}`, data, { headers: multipartHeaders }),
  update: (memberId, data) =>
    api.patch(`/admin/v1/district-member/${memberId}`, data, { headers: multipartHeaders }),
  delete: (memberId) => api.delete(`/admin/v1/district-member/${memberId}`)
};
