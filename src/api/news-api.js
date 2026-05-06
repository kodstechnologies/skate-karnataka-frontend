import api from "@/lib/axios";

export const newsApi = {
  /**
   * Fetch paginated news items with optional server-side search.
   * GET /guest/v1/news?page=<n>&limit=10&search=<term>
   */
  getAll: async (search = "", page = 1, limit = 10) => {
    const params = { page, limit };
    if (search.trim()) {
      params.search = search.trim();
    }
    return api.get("/guest/v1/news", { params });
  },

  /**
   * Fetch a single news item by ID.
   * GET /guest/v1/news/:id
   */
  getById: async (id) => {
    return api.get(`/guest/v1/news/${id}`);
  },

  /**
   * Create a new news item.
   * POST /guest/v1/news
   * Payload fields: header, about, img (file)
   */
  create: async (formData) => {
    return api.post("/guest/v1/news", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  /**
   * Update an existing news item.
   * PATCH /guest/v1/news/:id
   * Payload fields: header, about, img (file, optional)
   */
  update: async (id, formData) => {
    return api.patch(`/guest/v1/news/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  /**
   * Delete a news item by ID.
   * DELETE /guest/v1/news/:id
   */
  delete: async (id) => {
    return api.delete(`/guest/v1/news/${id}`);
  }
};
