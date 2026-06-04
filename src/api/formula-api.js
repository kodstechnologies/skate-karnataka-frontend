import api from "@/lib/axios";

const BASE = "/event/v1/formula";

export const formulaApi = {
  /** GET /event/v1/formula?page=&limit= */
  getAll: (params) => api.get(BASE, { params }),

  /** GET /event/v1/formula/all — id + formulaName for dropdowns */
  getAllLight: () => api.get(`${BASE}/all`),

  /** GET /event/v1/formula/:id */
  getById: (id) => api.get(`${BASE}/${id}`),

  /** POST /event/v1/formula */
  create: (body) => api.post(BASE, body),

  /** PATCH /event/v1/formula/:id */
  update: (id, body) => api.patch(`${BASE}/${id}`, body),

  /** DELETE /event/v1/formula/:id */
  delete: (id) => api.delete(`${BASE}/${id}`)
};
