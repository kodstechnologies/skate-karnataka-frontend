import { create } from "zustand";
import { schoolApi } from "@/api/school-api";
import { officialApi } from "@/api/official-api";
import { parentApi } from "@/api/parent-api";
import { academyApi } from "@/api/academy-api";

const withRequestMeta = (request) => ({
  ...request,
  // Map backend _id to id for frontend routing and keys
  id: request._id || request.id
});

export const useRequestsStore = create((set) => ({
  schoolRequests: [],
  officialRequests: [],
  parentRequests: [],
  academyRequests: [],
  loading: false,
  fetchSchoolRequests: async (params) => {
    try {
      set({ loading: true });
      const response = await schoolApi.getAll(params);
      const schools = response?.data?.data?.map(withRequestMeta) || [];
      set({ schoolRequests: schools });
    } catch (error) {
      console.error("Failed to fetch school requests:", error);
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
      console.error("Failed to fetch official requests:", error);
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
      console.error("Failed to fetch parent requests:", error);
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
      console.error("Failed to fetch academy requests:", error);
    } finally {
      set({ loading: false });
    }
  }
}));
