import api from "@/lib/axios";

const BASE = "/event/v1/event-categories";

export const eventCategoriesApi = {
  /** GET /event/v1/event-categories */
  getAll: (params = {}) => api.get(BASE, { params: { limit: 100, ...params } }),

  /** GET /event/v1/event-categories/:id */
  getById: (id) => api.get(`${BASE}/${id}`),

  /** POST /event/v1/event-categories */
  create: (body) => api.post(BASE, body),

  /** PATCH /event/v1/event-categories/:id */
  update: (id, body) => api.patch(`${BASE}/${id}`, body),

  /** DELETE /event/v1/event-categories/:id */
  delete: (id) => api.delete(`${BASE}/${id}`),

  /** POST /event/v1/event-categories/:categoryId/disciplines */
  addDisciplines: (categoryId, body) => api.post(`${BASE}/${categoryId}/disciplines`, body),

  /** GET /event/v1/event-categories/:categoryId/disciplines/:disciplineId */
  getDiscipline: (categoryId, disciplineId) =>
    api.get(`${BASE}/${categoryId}/disciplines/${disciplineId}`),

  /** PUT /event/v1/event-categories/:categoryId/disciplines/:disciplineId */
  updateDiscipline: (categoryId, disciplineId, body) =>
    api.put(`${BASE}/${categoryId}/disciplines/${disciplineId}`, body),

  /** DELETE /event/v1/event-categories/:categoryId/disciplines/:disciplineId */
  deleteDiscipline: (categoryId, disciplineId) =>
    api.delete(`${BASE}/${categoryId}/disciplines/${disciplineId}`),

  /** GET /event/v1/event-categories/org-context — standard list + your custom doc */
  getOrgContext: () => api.get(`${BASE}/org-context`),

  /** GET /event/v1/event-categories/org-custom — one custom list per club/district */
  getOrgCustom: () => api.get(`${BASE}/org-custom`),

  /** PUT /event/v1/event-categories/org-custom — upsert names array for your org */
  saveOrgCustom: (body) => api.put(`${BASE}/org-custom`, body)
};
