import api from "@/lib/axios";

export const sponsorshipApi = {
  getAll: async (search = "", page = 1, limit = 10) => {
    const params = { page, limit, supportType: "sponsorship" };
    if (search.trim()) {
      params.search = search.trim();
    }
    return api.get("/guest/v1/sponsorship-donation", { params });
  },

  create: async (formData) => {
    // Ensuring supportType is 'sponsorship' for the backend
    if (formData instanceof FormData) {
      if (!formData.has("supportType")) {
        formData.append("supportType", "sponsorship");
      }
    } else {
      formData.supportType = "sponsorship";
    }
    return api.post("/guest/v1/sponsorship-donation", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  update: async (id, formData) => {
    if (formData instanceof FormData) {
      if (!formData.has("supportType")) {
        formData.append("supportType", "sponsorship");
      }
    } else {
      formData.supportType = "sponsorship";
    }
    return api.patch(`/guest/v1/sponsorship-donation/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  delete: async (id) => {
    return api.delete(`/guest/v1/sponsorship-donation/${id}`);
  }
};
