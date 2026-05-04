import { create } from "zustand";
import { districtMemberApi } from "@/api/district-member-api";
import toast from "react-hot-toast";

const mapToFrontend = (d) => ({
  id: d._id,
  fullName: d.fullName || "",
  profile: d.profile || "",
  phone: d.phone || "",
  email: d.email || "",
  address: d.address || "",
  gender: d.gender || "",
  countryCode: d.countryCode || "+91",
  isActive: d.isActive ?? true,
  role: d.role || "District",
  district: d.district || null
});

export const useDistrictMembersStore = create((set, get) => ({
  members: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentDistrictId: null,

  fetchMembers: async (districtId, params = {}) => {
    set({ isLoading: true, error: null, currentDistrictId: districtId });
    try {
      const response = await districtMemberApi.getAll(districtId, params);
      const payloadData = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || null;

      const mappedMembers = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ members: mappedMembers, pagination: paginationData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch members");
    }
  },

  addMember: async (districtId, formData) => {
    try {
      const response = await districtMemberApi.create(districtId, formData);
      const newMember = mapToFrontend(response.data);
      set((state) => ({ members: [newMember, ...state.members] }));
      toast.success("Member created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create member");
      return false;
    }
  },

  updateMember: async (memberId, formData) => {
    try {
      const response = await districtMemberApi.update(memberId, formData);
      const updated = mapToFrontend(response.data);
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? updated : m))
      }));
      toast.success("Member updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member");
      return false;
    }
  },

  deleteMember: async (memberId) => {
    try {
      await districtMemberApi.delete(memberId);
      set((state) => ({ members: state.members.filter((m) => m.id !== memberId) }));
      toast.success("Member deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete member");
      return false;
    }
  }
}));
