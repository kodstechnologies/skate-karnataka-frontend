import api from "@/lib/axios";

export const manualEventsApi = {
  /**
   * Fetch all manual events with optional search, status filter, and pagination
   * GET /manual-events?search=&status=&page=1&limit=10
   */
  getAll: async (params = {}) => {
    return api.get("/manual-events", { params });
  },

  /**
   * Fetch single manual event by ID
   * GET /manual-events/:id
   */
  getById: async (id) => {
    return api.get(`/manual-events/${id}`);
  },

  /**
   * Create a new manual event
   * POST /manual-events
   * Accepts JSON or FormData
   */
  create: async (payload) => {
    return api.post("/manual-events", payload);
  },

  /**
   * Edit an existing manual event
   * PATCH /manual-events/:id
   * Accepts JSON or FormData
   */
  update: async (id, payload) => {
    return api.patch(`/manual-events/${id}`, payload);
  },

  /**
   * Delete a manual event by ID
   * DELETE /manual-events/:id
   */
  delete: async (id) => {
    return api.delete(`/manual-events/${id}`);
  },

  /**
   * Upload or re-upload skater Excel attendance document
   * POST /manual-events/:id/attendance
   * Accepts FormData containing skaterExcelDocument, districtId, districtName, stateName
   */
  uploadAttendance: async (id, formData) => {
    return api.post(`/manual-events/${id}/attendance`, formData);
  }
};
