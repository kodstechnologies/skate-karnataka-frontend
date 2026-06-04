import api from "@/lib/axios";

export const onboardingApi = {
  getLatest: () =>
    api.get("/onboarding/v1/").then((res) => {
      const arr = res?.data;
      return Array.isArray(arr) && arr.length ? arr[0] : null;
    }),

  create: (data) => {
    if (data instanceof FormData) {
      return api.post("/onboarding/v1/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
    return api.post("/onboarding/v1/", data);
  },

  update: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/onboarding/v1/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
    return api.patch(`/onboarding/v1/${id}`, data);
  },

  delete: (id) => api.delete(`/onboarding/v1/${id}`)
};
