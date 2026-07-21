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
  designation: d.designation || "",
  gender: d.gender || "",
  countryCode: d.countryCode || "+91",
  isActive: d.isActive ?? true,
  isBlocked: Boolean(d.isBlocked),
  isMain: Boolean(d.isMain),
  verify: d.verify === true,
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
      const innerPayload = response?.data?.data ?? response?.data ?? {};
      const payloadData = Array.isArray(innerPayload)
        ? innerPayload
        : Array.isArray(innerPayload?.data)
          ? innerPayload.data
          : [];
      const paginationData = innerPayload?.pagination ?? response?.data?.pagination ?? null;

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
      const newMember = mapToFrontend(response?.data?.data ?? response?.data ?? response);
      set((state) => ({ members: [newMember, ...state.members] }));
      toast.success(
        response?.message ||
          (newMember.verify
            ? "Member created successfully"
            : "Member created — pending state admin approval")
      );
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
  },

  toggleMemberBlock: async (memberId, isBlocked) => {
    try {
      const response = await districtMemberApi.toggleBlock(memberId, isBlocked);
      const blocked = Boolean(response?.data?.isBlocked ?? isBlocked);

      set((state) => ({
        members: state.members.map((member) =>
          member.id === memberId ? { ...member, isBlocked: blocked } : member
        )
      }));

      toast.success(
        response?.message ||
          (blocked ? "Member blocked successfully" : "Member unblocked successfully")
      );
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member block status");
      return false;
    }
  },

  approveMember: async (memberId) => {
    try {
      const response = await districtMemberApi.approve(memberId);
      set((state) => ({
        members: state.members.map((member) =>
          member.id === memberId ? { ...member, verify: true } : member
        )
      }));
      toast.success(response?.message || "Member approved successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve member");
      return false;
    }
  },

  setMainMember: async (districtId, memberId) => {
    try {
      const response = await districtMemberApi.setMain(districtId, memberId);

      set((state) => ({
        members: state.members.map((member) => ({
          ...member,
          isMain: member.id === memberId
        }))
      }));

      toast.success(response?.message || "Main member updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set main member");
      return false;
    }
  }
}));
