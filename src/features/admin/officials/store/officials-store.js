import { create } from "zustand";
import { stateApi } from "@/api/state-api";
import toast from "react-hot-toast";

export const useOfficialsStore = create((set, get) => ({
  officials: [],
  isLoading: false,
  error: null,

  fetchOfficials: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.getAll();
      if (response.statusCode === 200) {
        set({
          officials: response.data,
          isLoading: false
        });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch state officials",
        isLoading: false
      });
    }
  },

  addOfficial: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.create(formData);
      if (response.statusCode === 201 || response.statusCode === 200) {
        set({ isLoading: false });
        toast.success(response.message || "Official registered successfully");
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to add state official";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateOfficial: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.update(id, formData);
      if (response.statusCode === 200) {
        set({ isLoading: false });
        toast.success(response.message || "Official updated successfully");
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to update state official";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteOfficial: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.delete(id);
      if (response.statusCode === 200) {
        set({ isLoading: false });
        toast.success(response.message || "Official deleted successfully");
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete state official";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  }
}));
