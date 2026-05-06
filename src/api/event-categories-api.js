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
  delete: (id) => api.delete(`${BASE}/${id}`)
};
