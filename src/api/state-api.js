import api from "@/lib/axios";

export const stateApi = {
  getAll: async () => {
    return api.get("/state/v1/all");
  },
  create: async (formData) => {
    return api.post("/state/v1", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  update: async (id, formData) => {
    return api.patch(`/state/v1/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  delete: async (id) => {
    return api.delete(`/state/v1/${id}`);
  }
};
