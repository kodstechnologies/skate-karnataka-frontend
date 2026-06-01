import api from "@/lib/axios";

export const authApi = {
  requestLoginOtp: async (identifier) => {
    return api.post("/auth/v1/login", { identifier });
  },
  verifyLoginOtp: async ({ userId, otp, firebaseTokens }) => {
    return api.post("/auth/verify-otp", { userId, otp, firebaseTokens });
  },
  logout: async (refreshTokens, firebaseTokens) => {
    return api.post("/auth/logout", { refreshTokens, firebaseTokens });
  },
  getProfile: async (role) => {
    const normalizedRole = String(role || "").toLowerCase();
    if (normalizedRole === "state") {
      return api.get("/state/v1/account-profile");
    }
    if (normalizedRole === "club") {
      return api.get("/club/v1/profile");
    }
    if (normalizedRole === "district") {
      return api.get("/district/v1/profile");
    }
    return api.get("/admin/v1/profile");
  },
  updateProfile: async (data, role) => {
    const normalizedRole = String(role || "").toLowerCase();
    const path = normalizedRole === "state" ? "/state/v1/edit-profile" : "/admin/v1/edit-profile";
    return api.patch(path, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
};
