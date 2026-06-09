import { create } from "zustand";
import { reportApi } from "@/api/report-api";
import toast from "react-hot-toast";

const mapReport = (row) => ({
  id: row.id || row._id,
  complainedBy: row.complainedBy || "",
  reportType: row.reportType || "",
  message: row.message || "",
  clubName: row.clubName || "",
  skaterName: row.skaterName || "",
  districtName: row.districtName || "",
  krsaId: row.krsaId || "",
  status: row.status || "",
  clubStatus: row.clubStatus || "pending",
  districtStatus: row.districtStatus || "pending",
  stateStatus: row.stateStatus || "pending",
  clubMessage: row.clubMessage || "",
  districtMessage: row.districtMessage || "",
  stateMessage: row.stateMessage || "",
  createdAt: row.createdAt || null,
});

export const useComplainsStore = create((set, get) => ({
  complains: [],
  pagination: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchComplains: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportApi.getStateReports(params);
      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      const pagination = response?.pagination ?? response?.data?.pagination ?? null;
      set({
        complains: rows.map(mapReport),
        pagination,
        isLoading: false,
      });
      return rows.map(mapReport);
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to load complaints");
      return [];
    }
  },

  fetchComplainById: async (id) => {
    const hasCached = get().complains.some((row) => String(row.id) === String(id));
    if (!hasCached) {
      set({ isLoading: true, error: null });
    }
    try {
      let page = 1;
      const limit = 100;
      let total = Infinity;

      while ((page - 1) * limit < total) {
        const response = await reportApi.getStateReports({ page, limit });
        const rawRows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
        const rows = rawRows.map(mapReport);
        const found = rows.find((row) => String(row.id) === String(id));

        if (found) {
          set((state) => ({
            complains: state.complains.some((row) => String(row.id) === String(found.id))
              ? state.complains.map((row) => (String(row.id) === String(found.id) ? found : row))
              : [...state.complains, found],
            isLoading: false,
          }));
          return found;
        }

        const pagination = response?.pagination ?? response?.data?.pagination ?? null;
        total = pagination?.total ?? rows.length;
        if (rows.length < limit || page * limit >= total) break;
        page += 1;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || "Failed to load complaint");
      return null;
    }
  },

  updateComplain: async (id, payload) => {
    set({ isSaving: true });
    try {
      const response = await reportApi.updateStateReport(id, payload);
      const updated = response?.data;
      if (updated?.id) {
        set({
          complains: get().complains.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  stateStatus: updated.stateStatus ?? payload.stateStatus,
                  stateMessage: updated.stateMessage ?? payload.message ?? "",
                }
              : item
          ),
        });
      }
      set({ isSaving: false });
      toast.success(response?.message || "Complaint updated successfully");
      return true;
    } catch (error) {
      set({ isSaving: false });
      toast.error(error.response?.data?.message || "Failed to update complaint");
      return false;
    }
  },
}));
