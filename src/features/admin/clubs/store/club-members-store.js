import { create } from "zustand";
import { clubMemberApi } from "@/api/club-member-api";
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
  role: d.role || "Club",
  clubId: d.clubId || null
});

export const useClubMembersStore = create((set, get) => ({
  members: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentClubId: null,

  fetchMembers: async (clubId, params = {}) => {
    set({ isLoading: true, error: null, currentClubId: clubId });
    try {
      const response = await clubMemberApi.getAll(clubId, params);
      const payloadData = response.data?.data?.data || response.data?.data || [];
      const paginationData = response.data?.data?.pagination || response.data?.pagination || null;

      const mappedMembers = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ members: mappedMembers, pagination: paginationData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch members");
    }
  },

  addMember: async (clubId, formData) => {
    try {
      const response = await clubMemberApi.create(clubId, formData);
      const newMember = mapToFrontend(response.data?.data || response.data);
      set((state) => ({ members: [newMember, ...state.members] }));
      toast.success(response.data?.message || "Member created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create member");
      return false;
    }
  },

  updateMember: async (memberId, formData) => {
    try {
      const response = await clubMemberApi.update(memberId, formData);
      const updated = mapToFrontend(response.data?.data || response.data);
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? updated : m))
      }));
      toast.success(response.data?.message || "Member updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member");
      return false;
    }
  },

  deleteMember: async (memberId) => {
    try {
      const response = await clubMemberApi.delete(memberId);
      set((state) => ({ members: state.members.filter((m) => m.id !== memberId) }));
      toast.success(response.data?.message || "Member deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete member");
      return false;
    }
  }
}));
