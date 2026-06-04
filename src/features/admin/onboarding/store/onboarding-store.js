import { create } from "zustand";
import { onboardingApi } from "@/api/onboarding-api";
import toast from "react-hot-toast";

export const useOnboardingStore = create((set, get) => ({
  onboarding: null,
  isLoading: false,

  fetchOnboarding: async () => {
    set({ isLoading: true });
    try {
      const data = await onboardingApi.getLatest();
      set({ onboarding: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      if (err.response?.status !== 404) {
        toast.error("Failed to fetch onboarding");
      }
    }
  },

  createOnboarding: async (payload) => {
    try {
      await onboardingApi.create(payload);
      await get().fetchOnboarding();
      toast.success("Onboarding created");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create onboarding");
      return false;
    }
  },

  updateOnboarding: async (id, payload) => {
    try {
      await onboardingApi.update(id, payload);
      await get().fetchOnboarding();
      toast.success("Onboarding updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update onboarding");
      return false;
    }
  },

  deleteOnboarding: async (id) => {
    try {
      await onboardingApi.delete(id);
      set({ onboarding: null });
      toast.success("Onboarding deleted");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete onboarding");
      return false;
    }
  }
}));
