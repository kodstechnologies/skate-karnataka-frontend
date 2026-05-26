import api from "@/lib/axios";

export const reportApi = {
  getStateReports: (params) => api.get("/report/v1/state", { params }),
  updateStateReport: (id, data) => api.patch(`/report/v1/state/${id}`, data),
};
