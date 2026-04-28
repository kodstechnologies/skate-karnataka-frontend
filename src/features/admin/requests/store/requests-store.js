import { create } from "zustand";
import { schoolApi } from "@/api/school-api";
import { officialApi } from "@/api/official-api";
import { parentApi } from "@/api/parent-api";
import { academyApi } from "@/api/academy-api";
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
  }
}));
