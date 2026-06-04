import api from "@/lib/axios";

const BASE = "/club/v1/formula";

export const clubFormulaApi = {
  getAll: (params) => api.get(BASE, { params }),

  /** Admin + club formulas for category dropdowns (respects formulaSource) */
  getOptions: () => api.get(`${BASE}/options`),

  getSource: () => api.get(`${BASE}/source`),

  patchSource: (formulaSource) => api.patch(`${BASE}/source`, { formulaSource }),

  getById: (id) => api.get(`${BASE}/${id}`),

  create: (body) => api.post(BASE, body),

  update: (id, body) => api.patch(`${BASE}/${id}`, body),

  delete: (id) => api.delete(`${BASE}/${id}`)
};
