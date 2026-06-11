import { create } from "zustand";
import { districtApi } from "@/api/district-api";
import toast from "react-hot-toast";

const mapToFrontend = (apiData) => ({
  id: apiData._id,
  districtName: apiData.name || "",
  img: apiData.img || "",
  about: apiData.about || "",
  officeAddress: apiData.officeAddress || "",
  members: apiData.memberCount ?? (Array.isArray(apiData.members) ? apiData.members.length : 0),
  pendingEventApprovals: apiData.pendingEventApprovals ?? 0,
  pendingEventDeleteApprovals: apiData.pendingEventDeleteApprovals ?? 0,
  pendingMediaApprovals: apiData.pendingMediaApprovals ?? 0,
  pendingMediaDeleteApprovals: apiData.pendingMediaDeleteApprovals ?? 0,
  event: Boolean(
    apiData.event ??
      apiData.hasPendingEventApproval ??
      (apiData.pendingEventApprovals > 0 || apiData.pendingEventDeleteApprovals > 0)
  ),
  media: Boolean(
    apiData.media ??
      apiData.hasPendingMediaApproval ??
      (apiData.pendingMediaApprovals > 0 || apiData.pendingMediaDeleteApprovals > 0)
  ),
  hasPendingEventApproval: Boolean(
    apiData.event ??
      apiData.hasPendingEventApproval ??
      (apiData.pendingEventApprovals > 0 || apiData.pendingEventDeleteApprovals > 0)
  ),
  hasPendingMediaApproval: Boolean(
    apiData.media ??
      apiData.hasPendingMediaApproval ??
      (apiData.pendingMediaApprovals > 0 || apiData.pendingMediaDeleteApprovals > 0)
  )
});

const mapToBackend = (payload) => {
  const fd = new FormData();
  fd.append("name", payload.districtName.trim());
  if (payload.about?.trim()) fd.append("about", payload.about.trim());
  if (payload.officeAddress?.trim()) fd.append("officeAddress", payload.officeAddress.trim());
  if (payload.imgFile instanceof File) fd.append("img", payload.imgFile);
  return fd;
};

export const useDistrictsStore = create((set, get) => ({
  districts: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchDistricts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await districtApi.getAll(params);
      const payloadData = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || null;

      const mappedDistricts = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ districts: mappedDistricts, pagination: paginationData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch districts");
    }
  },

  addDistrict: async (payload) => {
    try {
      await districtApi.create(mapToBackend(payload));
      await get().fetchDistricts();
      toast.success("District created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create district:", error);
      toast.error(error.response?.data?.message || "Failed to create district");
      return false;
    }
  },

  updateDistrict: async (id, payload) => {
    try {
      await districtApi.update(id, mapToBackend(payload));
      await get().fetchDistricts();
      toast.success("District updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update district:", error);
      toast.error(error.response?.data?.message || "Failed to update district");
      return false;
    }
  },

  deleteDistrict: async (id) => {
    try {
      await districtApi.delete(id);
      set((state) => ({
        districts: state.districts.filter((item) => item.id !== id)
      }));
      toast.success("District deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete district:", error);
      toast.error(error.response?.data?.message || "Failed to delete district");
      return false;
    }
  }
}));
