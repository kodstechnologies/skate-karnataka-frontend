import api from "@/lib/axios";

const BASE = "/api/sidebar";

const unwrap = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return response?.data ?? response;
};

export const sidebarApi = {
  getAll: async () => unwrap(await api.get(BASE)),

  reorder: async (items) => unwrap(await api.put(`${BASE}/reorder`, items)),

  create: async (body) => unwrap(await api.post(BASE, body)),

  update: async (id, body) => unwrap(await api.put(`${BASE}/${id}`, body)),

  remove: async (id) => unwrap(await api.delete(`${BASE}/${id}`))
};
