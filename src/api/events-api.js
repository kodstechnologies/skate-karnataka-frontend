import api from "@/lib/axios";

export const eventsApi = {
  /**
   * Fetch paginated events with optional server-side search.
   * GET /event/v1/state?page=<n>&limit=6&search=<term>
   */
  getAll: async (search = "", page = 1, limit = 10) => {
    const params = { page, limit };
    if (search.trim()) {
      params.search = search.trim();
    }
    return api.get("/event/v1/state", { params });
  },

  /**
   * Fetch a single event by ID.
   */
  getById: async (id) => {
    return api.get(`/event/v1/state/${id}`);
  },

  /**
   * Create a new event.
   * POST /event/v1/state
   */
  create: async (formData) => {
    return api.post("/event/v1/state", formData);
  },

  /**
   * Update an existing event.
   * PATCH /event/v1/state/:id
   */
  update: async (id, formData) => {
    return api.patch(`/event/v1/state/${id}`, formData);
  },

  /**
   * Delete an event by ID.
   * DELETE /event/v1/state/:id
   */
  delete: async (id) => {
    return api.delete(`/event/v1/state/${id}`);
  }
};
