import api from "@/lib/axios";

const BASE = "/district/v1/formula";

export const districtFormulaApi = {
  getAll: (params) => api.get(BASE, { params }),
  getOptions: () => api.get(`${BASE}/options`),
  getSource: () => api.get(`${BASE}/source`),
  patchSource: (formulaSource) => api.patch(`${BASE}/source`, { formulaSource }),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (body) => api.post(BASE, body),
  update: (id, body) => api.patch(`${BASE}/${id}`, body),
  delete: (id) => api.delete(`${BASE}/${id}`)
};
