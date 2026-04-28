import { create } from "zustand";
import { galleryApi } from "@/api/gallery-api";
import toast from "react-hot-toast";

export const useGalleryStore = create((set, get) => ({
  items: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  isLoading: false,
  error: null,
  currentType: "all",

  fetchItems: async (type = "all", page = 1, limit = 10) => {
    set({ isLoading: true, error: null, currentType: type });
    try {
      const response = await galleryApi.getAll(type, page, limit);
      if (response.success) {
        set({
          items: response.data.data,
          pagination: response.data.pagination,
          isLoading: false
        });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch gallery items",
        isLoading: false
      });
    }
  },

  addItem: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.create(formData);
      if (response.success) {
        set({ isLoading: false });
        toast.success(response.message || "Gallery item added successfully");
        // Refresh current page
        const { pagination, currentType } = get();
        await get().fetchItems(currentType, pagination.page, pagination.limit);
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to add gallery item";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateItem: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.update(id, formData);
      if (response.success) {
        set({ isLoading: false });
        toast.success(response.message || "Gallery item updated successfully");
        // Refresh items
        const { pagination, currentType } = get();
        await get().fetchItems(currentType, pagination.page, pagination.limit);
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to update gallery item";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.delete(id);
      if (response.success) {
        set({ isLoading: false });
        toast.success(response.message || "Gallery item deleted successfully");
        // Refresh items
        const { pagination, currentType } = get();
        await get().fetchItems(currentType, pagination.page, pagination.limit);
        return response;
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete gallery item";
      set({
        error: errorMessage,
        isLoading: false
      });
      toast.error(errorMessage);
      throw error;
    }
  }
}));
