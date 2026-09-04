import api from "@/lib/axios";

const skaterAuth = (token) => ({
  headers: token ? { Authorization: token } : {},
  skipGlobalLogout: true
});

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

  /** Skater app — events visible to the logged-in skater. */
  getSkaterEvents: async (token, { page = 1, limit = 50 } = {}) => {
    return api.get("/event/v1/user-all-events", {
      params: { page, limit },
      ...skaterAuth(token)
    });
  },

  getSkaterEventFormDetails: async (eventId, token) => {
    return api.get(`/event/v1/event-form-details/${eventId}`, skaterAuth(token));
  },

  registerSkaterEvent: async (payload, token) => {
    return api.post("/event/v1/register-form", payload, skaterAuth(token));
  },

  verifySkaterPayment: async (payload, token) => {
    return api.post("/payment/v1/verify/web", payload, skaterAuth(token));
  },

  /** Web dashboard — all state events (Admin / State). */
  getWebStateEvents: async (search = "", page = 1, limit = 10, stateId) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (stateId) params.stateId = stateId;
    return api.get("/event/v1/web/state", { params });
  },

  /** Web dashboard — all club events (Admin / State). */
  getWebClubEvents: async (search = "", page = 1, limit = 10, clubId) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (clubId) params.clubId = clubId;
    return api.get("/event/v1/web/club", { params });
  },

  /** Web dashboard — all district events (Admin / State). */
  getWebDistrictEvents: async (search = "", page = 1, limit = 10, districtId) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (districtId) params.districtId = districtId;
    return api.get("/event/v1/web/district", { params });
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

  /** Toggle chest-number automation: true = scheduler, false = manual */
  updateStateChestNumberMode: async (id, isAutomated) => {
    return api.patch(`/event/v1/state/${id}/chest-number-mode`, { isAutomated });
  },

  /**
   * Delete an event by ID.
   * DELETE /event/v1/state/:id
   */
  delete: async (id) => {
    return api.delete(`/event/v1/state/${id}`);
  },

  /** Events past end date — certificate generation (Admin). */
  listEndedCertificateEvents: async () => {
    return api.get("/event/v1/ended-events-certificates");
  },

  getCertificateStatus: async (eventId) => {
    return api.get(`/event/v1/${eventId}/certificate-status`);
  },

  /** Generate certificates for all eligible skaters (Admin, after event ends). */
  generateCertificates: async (eventId) => {
    return api.post(`/event/v1/${eventId}/generate-certificates`);
  },

  /**
   * Skating categories for event create (club/district).
   * @param {{ source?: 'standard' | 'custom' }} opts
   */
  getSkatingCategories: async ({ source } = {}) => {
    const params = source ? { source } : {};
    return api.get("/event/v1/category", { params });
  },

  getClubEvents: async (params = {}) => {
    return api.get("/event/v1/club", { params });
  },

  /** Club portal — all events for the logged-in club (web dashboard). */
  getClubPortalEvents: async (params = {}) => {
    return api.get("/event/v1/club/web", { params });
  },

  getClubEventById: async (id) => {
    return api.get(`/event/v1/club/${id}`);
  },

  createClubEvent: async (payload) => {
    return api.post("/event/v1/club", payload);
  },

  updateClubEvent: async (id, payload) => {
    return api.patch(`/event/v1/club/${id}`, payload);
  },

  /** Toggle chest-number automation: true = scheduler, false = manual */
  updateClubChestNumberMode: async (id, isAutomated) => {
    return api.patch(`/event/v1/club/${id}/chest-number-mode`, { isAutomated });
  },

  deleteClubEvent: async (id) => {
    return api.delete(`/event/v1/club/${id}`);
  },

  getDistrictEvents: async (params = {}) => {
    return api.get("/event/v1/district", { params });
  },

  /** District portal — all events for the logged-in district (web dashboard). */
  getDistrictPortalEvents: async (params = {}) => {
    return api.get("/event/v1/district/web", { params });
  },

  createDistrictEvent: async (payload) => {
    return api.post("/event/v1/district", payload);
  },

  getDistrictEventById: async (id) => {
    return api.get(`/event/v1/district/${id}`);
  },

  updateDistrictEvent: async (id, payload) => {
    return api.patch(`/event/v1/district/${id}`, payload);
  },

  /** Toggle chest-number automation: true = scheduler, false = manual */
  updateDistrictChestNumberMode: async (id, isAutomated) => {
    return api.patch(`/event/v1/district/${id}/chest-number-mode`, { isAutomated });
  },

  deleteDistrictEvent: async (id) => {
    return api.delete(`/event/v1/district/${id}`);
  },

  approveEvent: (eventId) => api.patch(`/event/v1/admin/event/${eventId}/approve`),
  rejectEvent: (eventId) => api.patch(`/event/v1/admin/event/${eventId}/reject`),
  approveEventDelete: (eventId) => api.patch(`/event/v1/admin/event/${eventId}/approve-delete`),
  rejectEventDelete: (eventId) => api.patch(`/event/v1/admin/event/${eventId}/reject-delete`)
};
