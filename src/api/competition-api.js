import api from "@/lib/axios";

export const competitionApi = {
  getChestNumberSummary: async (eventId, params = {}) => {
    return api.get(`/competition/v1/chest-numbers/${eventId}/summary`, { params });
  },
  getChestNumbersByEvent: async (eventId, params = {}) => {
    return api.get(`/competition/v1/chest-numbers/${eventId}`, { params });
  },
};
