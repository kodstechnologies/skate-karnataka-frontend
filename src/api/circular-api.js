import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const circularApi = {
  getAll: async (params = {}) => api.get("/guest/v1/circular", { params }),
  create: async (data) => api.post("/guest/v1/circular", data, { headers: multipartHeaders }),
  update: async (id, data) =>
    api.patch(`/guest/v1/circular/${id}`, data, { headers: multipartHeaders }),
  delete: async (id) => api.delete(`/guest/v1/circular/${id}`)
};
