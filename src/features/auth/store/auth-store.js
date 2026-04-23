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

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });

          if (response.success) {
            const adminData = response.data.admin;
            set({
              user: adminData,
              role: adminData.role,
              isAuthenticated: true
            });

            await get().getProfile();

            toast.success(response.message || "Logged in successfully");
            set({ isLoading: false });
            return adminData.role;
          } else {
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Login failed";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout API failed:", error);
        } finally {
          set({ user: null, role: null, isAuthenticated: false });
          toast.success("Logged out successfully");
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
      },

      sendOtp: async (email) => {
        set({ isLoading: true });
        try {
          const response = await authApi.sendOtp(email);
          if (response.success) {
            toast.success(response.message || "OTP sent successfully");
            set({ isLoading: false });
            return response.data;
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

      verifyOtp: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await authApi.verifyOtp(email, otp);
          if (response.success) {
            toast.success(response.message || "OTP verified successfully");
            set({ isLoading: false });
            return response.data;
          } else {
            throw new Error(response.message || "Failed to verify OTP");
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || "Failed to verify OTP";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.resetPassword(data);
          if (response.success) {
            toast.success(response.message || "Password reset successfully");
            set({ isLoading: false });
            return response.data;
          } else {
            throw new Error(response.message || "Failed to reset password");
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || "Failed to reset password";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: "krsa-auth-store"
    }
  )
);
