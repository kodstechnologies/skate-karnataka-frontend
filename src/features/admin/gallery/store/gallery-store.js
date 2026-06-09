import { create } from "zustand";
import { galleryApi } from "@/api/gallery-api";
import toast from "react-hot-toast";

const mapGalleryItem = (item) => ({
  ...item,
  ownerName: item?.ownerName || item?.uploadedBy || item?.orgName || item?.ownerId?.fullName || item?.ownerId?.name || "",
  uploadedBy: item?.uploadedBy || item?.ownerName || item?.orgName || item?.ownerId?.fullName || item?.ownerId?.name || "",
});

const extractGalleryItems = (response) => {
  const payload = response?.data || response || {};
  const items = Array.isArray(payload) ? payload : payload?.data || [];
  return items.map(mapGalleryItem);
};

export const useGalleryStore = create((set, get) => ({
  items: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  isLoading: false,
  error: null,
  currentType: "all",

  fetchItems: async (type = "all", page = 1, limit = 10) => {
    set({ isLoading: true, error: null, currentType: type });
    try {
      const params = { page, limit };
      if (type && type !== "all") {
        params.type = type;
      }
      const response = await galleryApi.getAll(params);
      const payload = response?.data || response || {};
      const items = extractGalleryItems(response);
      const pagination = payload?.pagination || {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit)
      };
      set({ items, pagination, isLoading: false });
      return items;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch gallery items";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchItemById: async (id) => {
    const hasCached = get().items.some((row) => String(row._id) === String(id));
    if (!hasCached) {
      set({ isLoading: true, error: null });
    }

    try {
      let page = 1;
      const limit = 100;
      let total = Infinity;

      while ((page - 1) * limit < total) {
        const response = await galleryApi.getAll({ page, limit });
        const rows = extractGalleryItems(response);
        const found = rows.find((row) => String(row._id) === String(id));

        if (found) {
          set((state) => ({
            items: state.items.some((row) => String(row._id) === String(found._id))
              ? state.items.map((row) => (String(row._id) === String(found._id) ? found : row))
              : [...state.items, found],
            isLoading: false,
          }));
          return found;
        }

        const payload = response?.data || response || {};
        const pagination = payload?.pagination || get().pagination;
        total = pagination?.total ?? rows.length;
        if (rows.length < limit || page * limit >= total) break;
        page += 1;
      }

      set({ isLoading: false });
      return get().items.find((row) => String(row._id) === String(id)) ?? null;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to load gallery item";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  addItem: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.create(formData);
      set({ isLoading: false });
      toast.success(response?.message || "Gallery item added successfully");
      const { pagination, currentType } = get();
      await get().fetchItems(currentType, pagination.page, pagination.limit);
      return response;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to add gallery item";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateItem: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.update(id, formData);
      set({ isLoading: false });
      toast.success(response?.message || "Gallery item updated successfully");
      const { pagination, currentType } = get();
      await get().fetchItems(currentType, pagination.page, pagination.limit);
      return response;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to update gallery item";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await galleryApi.delete(id);
      set({ isLoading: false });
      toast.success(response?.message || "Gallery item deleted successfully");
      const { pagination, currentType } = get();
      await get().fetchItems(currentType, pagination.page, pagination.limit);
      return response;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete gallery item";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  }
}));
