import { create } from "zustand";
import { stateApi } from "@/api/state-api";

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
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to add state official",
        isLoading: false
      });
      throw error;
    }
  },

  updateOfficial: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.update(id, formData);
      if (response.statusCode === 200) {
        set({ isLoading: false });
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to update state official",
        isLoading: false
      });
      throw error;
    }
  },

  deleteOfficial: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stateApi.delete(id);
      if (response.statusCode === 200) {
        set({ isLoading: false });
        await get().fetchOfficials();
        return response;
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to delete state official",
        isLoading: false
      });
      throw error;
    }
  }
}));
