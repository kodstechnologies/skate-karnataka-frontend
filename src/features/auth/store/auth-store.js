import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api/auth-api";
import toast from "react-hot-toast";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      refreshToken: null,

      requestLoginOtp: async (identifier) => {
        set({ isLoading: true });
        try {
          const response = await authApi.requestLoginOtp(identifier);
          if (response.success) {
            toast.success(response.message || "OTP sent successfully");
            set({ isLoading: false });
            return response.data; // { id, type, identifier }
          } else {
            throw new Error(response.message || "Failed to send OTP");
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || "Failed to send OTP";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      },

      verifyLoginOtp: async (userId, otp, firebaseTokens = null) => {
        set({ isLoading: true });
        try {
          const response = await authApi.verifyLoginOtp({
            userId,
            otp,
            firebaseTokens
          });

          if (response.success) {
            const { accessToken, refreshToken, role } = response.data.result;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            set({
              role,
              isAuthenticated: true,
              refreshToken
            });

            await get().getProfile();

            toast.success(response.message || "Logged in successfully");
            set({ isLoading: false });
            return response.data.result;
          } else {
            throw new Error(response.message || "OTP verification failed");
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || "OTP verification failed";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken, isAuthenticated } = get();

          // Only attempt network logout if we are currently authenticated
          if (isAuthenticated && refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          // Ignore 401 errors from logout (expected if session is already dead)
          if (error.response?.status !== 401) {
            console.error("Logout API failed:", error);
          }
        } finally {
          // Clear everything locally regardless of network success/failure
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, role: null, isAuthenticated: false, refreshToken: null });

          // Prevent toast spam by assigning a fixed ID (will overwrite existing toast instead of stacking)
          toast.success("Logged out successfully", { id: "auth-logout" });
        }
      },

      getProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            set({
              user: response.data,
              role: response.data.role,
              isLoading: false
            });
            return response.data;
          }
          throw new Error(response.message || "Failed to fetch profile");
        } catch (error) {
          set({ isLoading: false });
          console.error("Fetch profile failed:", error);
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.updateProfile(data);
          if (response.success) {
            set({
              user: response.data,
              isLoading: false
            });
            toast.success(response.message || "Profile updated successfully");
            return response.data;
          }
          throw new Error(response.message || "Failed to update profile");
        } catch (error) {
          set({ isLoading: false });
          const errorMessage =
            error.response?.data?.message || error.message || "Failed to update profile";
          toast.error(errorMessage);
          throw error;
        }
      }
    }),
    {
      name: "krsa-auth-store",
      partialize: (state) => ({
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken
      })
    }
  )
);
