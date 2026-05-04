import api from "@/lib/axios";

export const authApi = {
  requestLoginOtp: async (identifier) => {
    return api.post("/auth/v1/login", { identifier });
  },
  verifyLoginOtp: async ({ userId, otp, firebaseTokens }) => {
    return api.post("/auth/verify-otp", { userId, otp, firebaseTokens });
  },
  logout: async (refreshToken) => {
    return api.post("/admin/v1/logout", { refreshToken });
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
  }
};
