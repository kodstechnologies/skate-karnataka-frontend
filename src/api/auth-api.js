import api from "@/lib/axios";

export const authApi = {
  requestLoginOtp: async (identifier) => {
    return api.post("/auth/v1/login", { identifier });
  },
  verifyLoginOtp: async ({ userId, otp, firebaseTokens }) => {
    return api.post("/auth/verify-otp", { userId, otp, firebaseTokens });
  },
  getParentChildren: async (parentId) => {
    return api.get(`/auth/v1/login/display-children/${parentId}`);
  },
  selectAccount: async ({ userId, firebaseTokens }) => {
    return api.post("/auth/v1/login/select-account", { userId, firebaseTokens });
  },
  logout: async (refreshTokens, firebaseTokens) => {
    return api.post("/auth/logout", { refreshTokens, firebaseTokens });
  },
  updateFCMToken: async (firebaseToken) => {
    return api.post("/auth/v1/fcm-token", { firebaseToken });
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
  updateProfile: async (data, role, memberId) => {
    const normalizedRole = String(role || "").toLowerCase();
    const multipartHeaders = { "Content-Type": "multipart/form-data" };

    if (normalizedRole === "district") {
      return api.patch(`/admin/v1/district-member/${memberId}`, data, {
        headers: multipartHeaders
      });
    }
    if (normalizedRole === "club") {
      return api.patch(`/admin/v1/club-member/${memberId}`, data, {
        headers: multipartHeaders
      });
    }
    if (normalizedRole === "state") {
      return api.patch("/state/v1/edit-profile", data, {
        headers: multipartHeaders
      });
    }
    return api.patch("/admin/v1/edit-profile", data, {
      headers: multipartHeaders
    });
  }
};
