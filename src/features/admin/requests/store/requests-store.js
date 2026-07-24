import { create } from "zustand";
import { schoolApi } from "@/api/school-api";
import { officialApi } from "@/api/official-api";
import { parentApi } from "@/api/parent-api";
import { academyApi } from "@/api/academy-api";
import { guestApi } from "@/api/guest-api";
import toast from "react-hot-toast";

const withRequestMeta = (request) => ({
  ...request,
  id: request._id || request.id
});

export const useRequestsStore = create((set) => ({
  schoolRequests: [],
  selectedSchool: null,
  officialRequests: [],
  selectedOfficial: null,
  parentRequests: [],
  selectedParent: null,
  academyRequests: [],
  selectedAcademy: null,
  guestRequests: [],
  selectedGuest: null,
  loading: false,
  fetchSchoolRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await schoolApi.getAll(params);
      const schools = response?.data?.data?.map(withRequestMeta) || [];
      set({ schoolRequests: schools });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch school requests";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  fetchSchoolDetails: async (id) => {
    try {
      set({ loading: true, selectedSchool: null });
      const response = await schoolApi.getDetails(id);
      const details = response?.data ? withRequestMeta(response.data) : null;
      set({ selectedSchool: details });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch school details";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  deleteSchool: async (id) => {
    try {
      const response = await schoolApi.delete(id);
      set((state) => ({
        schoolRequests: state.schoolRequests.filter((school) => school.id !== id),
        selectedSchool: state.selectedSchool?.id === id ? null : state.selectedSchool
      }));
      toast.success(response?.message || "School deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete school";
      console.error(errorMessage, error);
      toast.error(errorMessage);
      return false;
    }
  },
  fetchOfficialRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await officialApi.getAll(params);
      const officials = response?.data?.data?.map(withRequestMeta) || [];
      set({ officialRequests: officials });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch official requests";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  fetchOfficialDetails: async (id) => {
    try {
      set({ loading: true, selectedOfficial: null });
      const response = await officialApi.getDetails(id);
      const details = response?.data ? withRequestMeta(response.data) : null;
      set({ selectedOfficial: details });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch official details";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  deleteOfficial: async (id) => {
    try {
      const response = await officialApi.delete(id);
      set((state) => ({
        officialRequests: state.officialRequests.filter((official) => official.id !== id),
        selectedOfficial: state.selectedOfficial?.id === id ? null : state.selectedOfficial
      }));
      toast.success(response?.message || "Official deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete official";
      console.error(errorMessage, error);
      toast.error(errorMessage);
      return false;
    }
  },
  fetchParentRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await parentApi.getAll(params);
      const parents = response?.data?.data?.map(withRequestMeta) || [];
      set({ parentRequests: parents });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch parent requests";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  fetchParentDetails: async (id) => {
    try {
      set({ loading: true, selectedParent: null });
      const response = await parentApi.getDetails(id);
      const details = response?.data ? withRequestMeta(response.data) : null;
      set({ selectedParent: details });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch parent details";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  deleteParent: async (id) => {
    try {
      const response = await parentApi.delete(id);
      set((state) => ({
        parentRequests: state.parentRequests.filter((parent) => parent.id !== id),
        selectedParent: state.selectedParent?.id === id ? null : state.selectedParent
      }));
      toast.success(response?.message || "Parent deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete parent";
      console.error(errorMessage, error);
      toast.error(errorMessage);
      return false;
    }
  },
  fetchAcademyRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await academyApi.getAll(params);
      const academies = response?.data?.data?.map(withRequestMeta) || [];
      set({ academyRequests: academies });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch academy requests";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  fetchAcademyDetails: async (id) => {
    try {
      set({ loading: true, selectedAcademy: null });
      const response = await academyApi.getDetails(id);
      const details = response?.data ? withRequestMeta(response.data) : null;
      set({ selectedAcademy: details });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch academy details";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  deleteAcademy: async (id) => {
    try {
      const response = await academyApi.delete(id);
      set((state) => ({
        academyRequests: state.academyRequests.filter((academy) => academy.id !== id),
        selectedAcademy: state.selectedAcademy?.id === id ? null : state.selectedAcademy
      }));
      toast.success(response?.message || "Academy deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete academy";
      console.error(errorMessage, error);
      toast.error(errorMessage);
      return false;
    }
  },
  fetchGuestRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await guestApi.getAll(params);
      const guests = response?.data?.data?.map(withRequestMeta) || [];
      set({ guestRequests: guests });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch guest reports";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  fetchGuestDetails: async (id) => {
    try {
      set({ loading: true, selectedGuest: null });
      const response = await guestApi.getDetails(id);
      const details = response?.data ? withRequestMeta(response.data) : null;
      set({ selectedGuest: details });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch guest details";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  deleteGuest: async (id) => {
    try {
      const response = await guestApi.delete(id);
      set((state) => ({
        guestRequests: state.guestRequests.filter((guest) => guest.id !== id),
        selectedGuest: state.selectedGuest?.id === id ? null : state.selectedGuest
      }));
      toast.success(response?.message || "Guest deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete guest";
      console.error(errorMessage, error);
      toast.error(errorMessage);
      return false;
    }
  }
}));
