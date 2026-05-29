import api from "@/lib/axios";

const BASE = "/discipline/v1";

export const disciplineServiceApi = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (body) => api.post(BASE, body),
  update: (id, body) => api.patch(`${BASE}/${id}`, body),
  delete: (id) => api.delete(`${BASE}/${id}`)
};
