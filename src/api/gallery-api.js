import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const galleryApi = {
  getAll: async (type, page = 1, limit = 10) => {
    const params = { page, limit };
    if (type && type !== "all") {
      params.type = type;
    }
    return api.get(`/gallery/v1/all`, { params });
  },
  create: async (formData) => {
    return api.post("/gallery/v1", formData, { headers: multipartHeaders });
  },
  update: async (id, formData) => {
    return api.patch(`/gallery/v1/${id}`, formData, { headers: multipartHeaders });
  },
  delete: async (id) => {
    return api.delete(`/gallery/v1/${id}`);
  }
};
