import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const galleryApi = {
  getAll: async (params = {}) => {
    return api.get("/gallery/v1/all", { params });
  },
  getPendingApprovals: async ({ page = 1, limit = 20 } = {}) =>
    api.get("/gallery/v1/admin/pending", { params: { page, limit } }),
  getByOwner: async ({ ownerType, ownerId, page = 1, limit = 12, mediaType } = {}) => {
    const params = { page, limit, ownerType, ownerId };
    if (mediaType && mediaType !== "all") {
      params.mediaType = mediaType;
    }
    return api.get("/gallery/v1/all", { params });
  },
  /** Club/district/state uploads for the signed-in org (role-based owner). */
  getMyMedia: async ({ page = 1, limit = 100, type } = {}) => {
    const params = { page, limit };
    if (type && type !== "all") {
      params.type = type;
    }
    return api.get("/gallery/v1", { params });
  },
  create: async (formData) => {
    return api.post("/gallery/v1", formData, { headers: multipartHeaders });
  },
  update: async (id, formData) => {
    return api.patch(`/gallery/v1/${id}`, formData, { headers: multipartHeaders });
  },
  delete: async (id) => {
    return api.delete(`/gallery/v1/${id}`);
  },
  approve: async (id) => api.patch(`/gallery/v1/admin/media/${id}/approve`),
  reject: async (id) => api.patch(`/gallery/v1/admin/media/${id}/reject`),
  approveDelete: async (id) => api.patch(`/gallery/v1/admin/media/${id}/approve-delete`),
  rejectDelete: async (id) => api.patch(`/gallery/v1/admin/media/${id}/reject-delete`)
};
