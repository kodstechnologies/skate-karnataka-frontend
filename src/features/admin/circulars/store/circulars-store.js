import { create } from "zustand";
import { circularApi } from "@/api/circular-api";
import toast from "react-hot-toast";

const mapToFrontend = (d) => ({
  id: d._id,
  img: d.img || "",
  heading: d.heading || "",
  text: d.text || "",
  date: d.date || null,
  createdAt: d.createdAt || null,
  updatedAt: d.updatedAt || null
});

const mapToBackend = (payload) => {
  const fd = new FormData();
  if (payload.heading?.trim()) fd.append("heading", payload.heading.trim());
  if (payload.text?.trim()) fd.append("text", payload.text.trim());
  if (payload.date) fd.append("date", payload.date);
  if (payload.img instanceof File) fd.append("img", payload.img);
  return fd;
};

export const useCircularsStore = create((set, get) => ({
  circulars: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchCirculars: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await circularApi.getAll(params);
      const items = response.data?.data || [];
      const pagination = response.data?.pagination || null;
      set({
        circulars: Array.isArray(items) ? items.map(mapToFrontend) : [],
        pagination,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch circulars:", error);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch circulars");
    }
  },

  addCircular: async (payload) => {
    try {
      await circularApi.create(mapToBackend(payload));
      await get().fetchCirculars();
      toast.success("Circular added successfully");
      return true;
    } catch (error) {
      console.error("Failed to add circular:", error);
      toast.error(error.response?.data?.message || "Failed to add circular");
      return false;
    }
  },

  updateCircular: async (id, payload) => {
    try {
      await circularApi.update(id, mapToBackend(payload));
      await get().fetchCirculars();
      toast.success("Circular updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update circular:", error);
      toast.error(error.response?.data?.message || "Failed to update circular");
      return false;
    }
  },

  deleteCircular: async (id) => {
    try {
      await circularApi.delete(id);
      set((state) => ({ circulars: state.circulars.filter((c) => c.id !== id) }));
      toast.success("Circular deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete circular:", error);
      toast.error(error.response?.data?.message || "Failed to delete circular");
      return false;
    }
  }
}));
