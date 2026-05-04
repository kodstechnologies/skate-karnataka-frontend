import { create } from "zustand";
import { disciplineApi } from "@/api/discipline-api";
import toast from "react-hot-toast";

const mapToFrontend = (d) => ({
  id: d._id,
  img: d.img || "",
  title: d.title || "",
  text: d.text || "",
  about: d.about || "",
  createdAt: d.createdAt || null,
  updatedAt: d.updatedAt || null
});

const mapToBackend = (payload) => {
  const fd = new FormData();
  if (payload.title?.trim()) fd.append("title", payload.title.trim());
  if (payload.text?.trim()) fd.append("text", payload.text.trim());
  if (payload.about?.trim()) fd.append("about", payload.about.trim());
  if (payload.img instanceof File) {
    fd.append("img", payload.img);
  }
  return fd;
};

export const useDisciplinesStore = create((set, get) => ({
  disciplines: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchDisciplines: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await disciplineApi.getAll(params);
      const payloadData = response.data?.data || [];
      const paginationData = response.data?.pagination || null;

      const mapped = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ disciplines: mapped, pagination: paginationData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch disciplines:", error);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch disciplines");
    }
  },

  addDiscipline: async (payload) => {
    try {
      await disciplineApi.create(mapToBackend(payload));
      await get().fetchDisciplines();
      toast.success("Discipline added successfully");
      return true;
    } catch (error) {
      console.error("Failed to add discipline:", error);
      toast.error(error.response?.data?.message || "Failed to add discipline");
      return false;
    }
  },

  updateDiscipline: async (id, payload) => {
    try {
      await disciplineApi.update(id, mapToBackend(payload));
      await get().fetchDisciplines();
      toast.success("Discipline updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update discipline:", error);
      toast.error(error.response?.data?.message || "Failed to update discipline");
      return false;
    }
  },

  deleteDiscipline: async (id) => {
    try {
      await disciplineApi.delete(id);
      set((state) => ({
        disciplines: state.disciplines.filter((item) => item.id !== id)
      }));
      toast.success("Discipline deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete discipline:", error);
      toast.error(error.response?.data?.message || "Failed to delete discipline");
      return false;
    }
  }
}));
