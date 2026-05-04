import { create } from "zustand";
import { feedbackApi } from "@/api/feedback-api";
import toast from "react-hot-toast";

const mapToFrontend = (d) => ({
  id: d._id,
  fullName: d.fullName || "",
  email: d.email || "",
  phone: d.phone || "",
  message: d.message || "",
  createdAt: d.createdAt || null,
  updatedAt: d.updatedAt || null
});

export const useFeedbackStore = create((set) => ({
  feedbacks: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchFeedbacks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await feedbackApi.getAll(params);
      // Interceptor returns response.data directly, so response = { statusCode, data, message, success }
      // response.data = { data: [...], pagination: {...} }
      const payloadData = response.data?.data || [];
      const paginationData = response.data?.pagination || null;

      const mapped = Array.isArray(payloadData) ? payloadData.map(mapToFrontend) : [];
      set({ feedbacks: mapped, pagination: paginationData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch feedback");
    }
  }
}));
