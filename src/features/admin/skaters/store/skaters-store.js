import { create } from "zustand";
import { skaterApi } from "@/api/skater-api";
import toast from "react-hot-toast";

export const useSkatersStore = create((set) => ({
  skaters: [],
  pagination: null,
  isLoading: false,
  error: null,

  selectedSkater: null,
  isLoadingDetail: false,

  fetchSkaters: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await skaterApi.getAll(params);
      const payloadData = response?.data?.data ?? response?.data ?? [];
      const paginationData = response?.data?.pagination ?? null;

      set({
        skaters: Array.isArray(payloadData) ? payloadData : [],
        pagination: paginationData,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch skaters:", error);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch skaters");
    }
  },

  fetchSkaterById: async (id) => {
    set({ isLoadingDetail: true, selectedSkater: null });
    try {
      const response = await skaterApi.getById(id);
      const skater = response?.data ?? response ?? null;
      set({ selectedSkater: skater, isLoadingDetail: false });
    } catch (error) {
      console.error("Failed to fetch skater details:", error);
      set({ isLoadingDetail: false });
      toast.error(error.response?.data?.message || "Failed to fetch skater details");
    }
  }
}));
