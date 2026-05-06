import { create } from "zustand";
import { clubApi } from "@/api/club-api";
import toast from "react-hot-toast";

const mapToFrontend = (apiData) => ({
  id: apiData._id,
  clubId: apiData.clubId || "",
  name: apiData.name || "",
  districtName: apiData.districtName || "",
  districtStatus: apiData.districtStatus || "",
  districtId: apiData.district?._id || "",
  img: apiData.img || "",
  officeAddress: apiData.officeAddress || "",
  about: apiData.about || "",
  members: apiData.members || [],
  memberCount: apiData.memberCount ?? (apiData.members?.length || 0)
});

const mapToBackend = (payload) => {
  const fd = new FormData();
  if (payload.name?.trim()) fd.append("name", payload.name.trim());
  if (payload.district?.trim()) fd.append("district", payload.district.trim());
  if (payload.officeAddress?.trim()) fd.append("officeAddress", payload.officeAddress.trim());
  if (payload.about?.trim()) fd.append("about", payload.about.trim());
  if (payload.img instanceof File) {
    fd.append("img", payload.img);
  }
  return fd;
};

export const useClubsStore = create((set, get) => ({
  clubs: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchClubs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clubApi.getAll(params);
      const payloadData = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || null;

      const mappedClubs = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ clubs: mappedClubs, pagination: paginationData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch clubs");
    }
  },

  addClub: async (payload) => {
    try {
      await clubApi.create(mapToBackend(payload));
      await get().fetchClubs();
      toast.success("Club created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create club:", error);
      toast.error(error.response?.data?.message || "Failed to create club");
      return false;
    }
  },

  updateClub: async (id, payload) => {
    try {
      await clubApi.update(id, mapToBackend(payload));
      await get().fetchClubs();
      toast.success("Club updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update club:", error);
      toast.error(error.response?.data?.message || "Failed to update club");
      return false;
    }
  },

  deleteClub: async (id) => {
    try {
      await clubApi.delete(id);
      set((state) => ({
        clubs: state.clubs.filter((item) => item.id !== id)
      }));
      toast.success("Club deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete club:", error);
      toast.error(error.response?.data?.message || "Failed to delete club");
      return false;
    }
  }
}));
