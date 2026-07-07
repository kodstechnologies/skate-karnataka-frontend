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
  isSaving: false,

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
      return skater;
    } catch (error) {
      console.error("Failed to fetch skater details:", error);
      set({ isLoadingDetail: false });
      toast.error(error.response?.data?.message || "Failed to fetch skater details");
      return null;
    }
  },

  updateSkater: async (id, formData) => {
    set({ isSaving: true });
    try {
      const response = await skaterApi.update(id, formData);
      const updated = response?.data ?? response;

      set((state) => ({
        isSaving: false,
        selectedSkater: state.selectedSkater?._id === id ? updated : state.selectedSkater,
        skaters: state.skaters.map((skater) =>
          skater._id === id
            ? {
                ...skater,
                fullName: updated?.fullName ?? skater.fullName,
                phone: updated?.phone ?? skater.phone,
                email: updated?.email ?? skater.email,
                rsfiId: updated?.rsfiId ?? skater.rsfiId
              }
            : skater
        )
      }));

      toast.success(response?.message || "Skater updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update skater:", error);
      set({ isSaving: false });
      toast.error(error.response?.data?.message || "Failed to update skater");
      return false;
    }
  },

  toggleSkaterBlock: async (userId, isBlocked) => {
    try {
      const response = await skaterApi.toggleBlock(userId, isBlocked);
      const result = response?.data ?? response;
      const blocked = Boolean(result?.isBlocked ?? isBlocked);

      set((state) => ({
        skaters: state.skaters.map((skater) =>
          skater._id === userId ? { ...skater, isBlocked: blocked } : skater
        ),
        selectedSkater:
          state.selectedSkater?._id === userId
            ? { ...state.selectedSkater, isBlocked: blocked }
            : state.selectedSkater
      }));

      toast.success(
        response?.message ||
          (blocked ? "Skater blocked successfully" : "Skater unblocked successfully")
      );
      return true;
    } catch (error) {
      console.error("Failed to update skater block status:", error);
      toast.error(error.response?.data?.message || "Failed to update skater block status");
      return false;
    }
  },

  createSkater: async (payload) => {
    set({ isSaving: true });
    try {
      const response = await skaterApi.create(payload);
      const created = response?.data ?? response;

      set((state) => ({
        isSaving: false,
        skaters: created?._id ? [created, ...state.skaters] : state.skaters
      }));

      toast.success(response?.message || "Skater created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create skater:", error);
      set({ isSaving: false });
      toast.error(error.response?.data?.message || "Failed to create skater");
      return false;
    }
  }
}));
