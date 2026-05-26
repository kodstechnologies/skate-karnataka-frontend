import api from "@/lib/axios";

export const notificationApi = {
  getAll: (params = {}) => api.get("/notification/v1", { params })
};
