import { create } from "zustand";
import { aboutApi } from "@/api/about-api";
import toast from "react-hot-toast";

const mapToFrontend = (d) => ({
  id: d._id,
  logo: d.logo || "",
  img: Array.isArray(d.img) ? d.img : [],
  heading: d.heading || "",
  about: d.about || "",
  ourMission: d.ourMission || "",
  student: d.student ?? "",
  address: d.address || "",
  email: d.email || "",
  phoneNo: d.phoneNo || "",
  createdAt: d.createdAt || null,
  updatedAt: d.updatedAt || null
});

const mapToBackend = (payload) => {
  const fd = new FormData();
  if (payload.heading?.trim()) fd.append("heading", payload.heading.trim());
  if (payload.about?.trim()) fd.append("about", payload.about.trim());
  if (payload.ourMission?.trim()) fd.append("ourMission", payload.ourMission.trim());
  if (payload.student !== "" && payload.student !== undefined)
    fd.append("student", String(payload.student));
  if (payload.address?.trim()) fd.append("address", payload.address.trim());
  if (payload.email?.trim()) fd.append("email", payload.email.trim());
  if (payload.phoneNo?.trim()) fd.append("phoneNo", payload.phoneNo.trim());
  if (payload.logo instanceof File) fd.append("logo", payload.logo);
  if (Array.isArray(payload.img)) {
    payload.img.forEach((file) => {
      if (file instanceof File) fd.append("img", file);
    });
  }
  return fd;
};

export const useAboutStore = create((set, get) => ({
  about: null,
  isLoading: false,
  error: null,

  fetchAbout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await aboutApi.getLatest();
      const data = response?.data ?? null;
      set({ about: data ? mapToFrontend(data) : null, isLoading: false });
    } catch (error) {
      // 404 means no record yet — not an error to toast
      if (error.response?.status === 404) {
        set({ about: null, isLoading: false });
      } else {
        console.error("Failed to fetch about:", error);
        set({ error: error.message, isLoading: false });
        toast.error(error.response?.data?.message || "Failed to fetch About Us");
      }
    }
  },

  createAbout: async (payload) => {
    try {
      await aboutApi.create(mapToBackend(payload));
      await get().fetchAbout();
      toast.success("About Us created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create about:", error);
      toast.error(error.response?.data?.message || "Failed to create About Us");
      return false;
    }
  },

  updateAbout: async (payload) => {
    try {
      await aboutApi.update(mapToBackend(payload));
      await get().fetchAbout();
      toast.success("About Us updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update about:", error);
      toast.error(error.response?.data?.message || "Failed to update About Us");
      return false;
    }
  },

  deleteAbout: async () => {
    try {
      await aboutApi.delete();
      set({ about: null });
      toast.success("About Us deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete about:", error);
      toast.error(error.response?.data?.message || "Failed to delete About Us");
      return false;
    }
  }
}));
