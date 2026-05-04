import { create } from "zustand";
import { contactUsApi } from "@/api/contact-us-api";
import toast from "react-hot-toast";

export const useContactUsStore = create((set) => ({
  contactInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchContactUs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactUsApi.get();
      // Since axios interceptor returns response.data directly, 'response' here is the actual payload
      // If payload is { statusCode: 200, data: { ... } }, then response.data is the contact object
      let data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      set({ contactInfo: data || null, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch contact info");
    }
  },

  saveContactUs: async (payload) => {
    set({ isSaving: true });
    try {
      const response = await contactUsApi.upsert(payload);
      toast.success(response.message || "Contact info saved successfully");
      // Refresh the contact info after save
      const fetchResponse = await contactUsApi.get();
      let data = fetchResponse.data;
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      set({ contactInfo: data || null, isSaving: false });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save contact info");
      set({ isSaving: false });
      return false;
    }
  }
}));
