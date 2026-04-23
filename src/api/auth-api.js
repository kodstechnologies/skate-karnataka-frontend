import api from "@/lib/axios";

export const authApi = {
  login: async (credentials) => {
    return api.post("/admin/v1/login", credentials);
  },
  logout: async () => {
    return api.post("/admin/v1/logout");
  },
  getProfile: async () => {
    return api.get("/admin/v1/profile");
  },
  updateProfile: async (data) => {
    return api.patch("/admin/v1/edit-profile", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  sendOtp: async (email) => {
    return api.post("/admin/v1/send-otp-for-password", { email });
  },
  verifyOtp: async (email, otp) => {
    return api.post("/admin/v1/verify-otp-for-password", { email, otp });
  },
  resetPassword: async (data) => {
    return api.post("/admin/v1/reset-password", data);
  }
};
