import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const clubApi = {
  getAll: async (params = {}) => {
    return api.get("/admin/v1/club", { params });
  },
  create: async (data) => {
    return api.post("/admin/v1/club", data, { headers: multipartHeaders });
  },
  update: async (id, data) => {
    return api.patch(`/admin/v1/club/${id}`, data, { headers: multipartHeaders });
  },
  delete: async (id) => {
    return api.delete(`/admin/v1/club/${id}`);
  }
};
