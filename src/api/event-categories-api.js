import api from "@/lib/axios";

const BASE = "/event/v1/event-categories";

export const eventCategoriesApi = {
  /** GET /event/v1/event-categories */
  getAll: () => api.get(BASE),

  /** GET /event/v1/event-categories/:id */
  getById: (id) => api.get(`${BASE}/${id}`),

  /** POST /event/v1/event-categories */
  create: (body) => api.post(BASE, body),

  /** PATCH /event/v1/event-categories/:id */
  update: (id, body) => api.patch(`${BASE}/${id}`, body),

  /** DELETE /event/v1/event-categories/:id */
  delete: (id) => api.delete(`${BASE}/${id}`),

  /** GET /event/v1/event-categories/org-context — standard list + your custom doc */
  getOrgContext: () => api.get(`${BASE}/org-context`),

  /** GET /event/v1/event-categories/org-custom — one custom list per club/district */
  getOrgCustom: () => api.get(`${BASE}/org-custom`),

  /** PUT /event/v1/event-categories/org-custom — upsert names array for your org */
  saveOrgCustom: (body) => api.put(`${BASE}/org-custom`, body)
};
