import api from "@/lib/axios";

const extractList = (response) => {
  const payload = response?.data ?? response ?? [];
  return Array.isArray(payload) ? payload : [];
};

const extractItem = (response) => response?.data ?? response ?? null;

const defaultPagination = (page = 1, limit = 10) => ({
  total: 0,
  page,
  limit,
  totalPages: 0
});

export const aboutUsCardApi = {
  getAll: (page = 1, limit = 10) =>
    api.get("/about-us-card/v1/", { params: { page, limit } }).then((response) => ({
      data: extractList(response),
      pagination: response?.pagination ?? defaultPagination(page, limit)
    })),

  getById: (id) => api.get(`/about-us-card/v1/${id}`).then(extractItem),

  create: (formData) => api.post("/about-us-card/v1/", formData),

  update: (id, formData) => api.patch(`/about-us-card/v1/${id}`, formData),

  delete: (id) => api.delete(`/about-us-card/v1/${id}`),

  getMembers: (cardId, page = 1, limit = 10) =>
    api
      .get(`/about-us-card/v1/admin/${cardId}/members`, { params: { page, limit } })
      .then((response) => ({
        data: extractList(response),
        pagination: response?.pagination ?? defaultPagination(page, limit)
      })),

  getMemberById: (cardId, memberId) =>
    api.get(`/about-us-card/v1/admin/${cardId}/members/${memberId}`).then(extractItem),

  createMember: (cardId, formData) =>
    api.post(`/about-us-card/v1/${cardId}/members`, formData),

  updateMember: (cardId, memberId, formData) =>
    api.patch(`/about-us-card/v1/${cardId}/members/${memberId}`, formData),

  deleteMember: (cardId, memberId) =>
    api.delete(`/about-us-card/v1/${cardId}/members/${memberId}`)
};
