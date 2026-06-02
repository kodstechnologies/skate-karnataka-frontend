import api from "@/lib/axios";

export const notificationApi = {
  getAll: (params = {}) => api.get("/notification/v1", { params }),
  markAllRead: () => api.patch("/notification/v1/read-all")
};
