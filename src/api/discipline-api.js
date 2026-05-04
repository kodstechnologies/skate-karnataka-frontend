import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const disciplineApi = {
  getAll: async (params = {}) => {
    return api.get("/guest/v1/discipline", { params });
  },
  create: async (data) => {
    return api.post("/guest/v1/discipline", data, { headers: multipartHeaders });
  },
  update: async (id, data) => {
    return api.patch(`/guest/v1/discipline/${id}`, data, { headers: multipartHeaders });
  },
  delete: async (id) => {
    return api.delete(`/guest/v1/discipline/${id}`);
  }
};
