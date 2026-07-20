import { create } from "zustand";
import toast from "react-hot-toast";
import {
  applyAlphabeticalOrder,
  applyTopLevelOrder,
  buildNavigationFromSidebarItems
} from "@/lib/sidebar-tree";
import { filterNavigationGroups, getAllowedNavSlugs } from "@/lib/navigation-modules";
import { clubNavigationGroups, districtNavigationGroups } from "@/lib/role-navigation";
import { sidebarApi } from "@/services/sidebar.service";

const isClubOrDistrict = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "club" || normalized === "district";
};

const canReorderSidebar = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "admin" || normalized === "state";
};

export const useSidebarStore = create((set, get) => ({
  rawItems: [],
  previousItems: [],
  isLoading: false,
  isSavingOrder: false,
  hasOrderChanged: false,
  fetchError: null,
  fetchedOnce: false,

  fetchSidebar: async () => {
    set({ isLoading: true, fetchError: null });
    try {
      const items = await sidebarApi.getAll();
      const list = Array.isArray(items) ? items : [];
      set({
        rawItems: list,
        previousItems: list,
        hasOrderChanged: false,
        fetchedOnce: true
      });
    } catch (error) {
      console.error("Failed to load sidebar:", error);
      set({ fetchError: error, rawItems: [], fetchedOnce: true });
    } finally {
      set({ isLoading: false });
    }
  },

  handleDragEndReorder: (orderedTopLevelIds) => {
    const { rawItems } = get();
    set({
      previousItems: rawItems,
      rawItems: applyTopLevelOrder(rawItems, orderedTopLevelIds),
      hasOrderChanged: true
    });
  },

  saveOrder: async () => {
    const { rawItems, hasOrderChanged, previousItems } = get();
    if (!hasOrderChanged) return;

    const payload = rawItems.map((item) => ({
      _id: item._id,
      order: item.order
    }));

    set({ isSavingOrder: true });
    try {
      await sidebarApi.reorder(payload);
      set({ previousItems: rawItems, hasOrderChanged: false });
      toast.success("Sidebar order saved");
    } catch (error) {
      set({ rawItems: previousItems, hasOrderChanged: false });
      toast.error(error?.response?.data?.message || "Failed to save sidebar order");
    } finally {
      set({ isSavingOrder: false });
    }
  },

  discardOrder: () => {
    const { rawItems, previousItems } = get();
    set({
      previousItems,
      rawItems: applyAlphabeticalOrder(rawItems),
      hasOrderChanged: true
    });
  }
}));

export const selectNavigationForRole = (rawItems, role, allowedModule) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "club") {
    return {
      navigationGroups: clubNavigationGroups,
      navigationItems: clubNavigationGroups.flatMap((group) => group.items),
      allowedSlugs: getAllowedNavSlugs(role, allowedModule)
    };
  }

  if (normalizedRole === "district") {
    return {
      navigationGroups: districtNavigationGroups,
      navigationItems: districtNavigationGroups.flatMap((group) => group.items),
      allowedSlugs: getAllowedNavSlugs(role, allowedModule)
    };
  }

  const built = buildNavigationFromSidebarItems(rawItems);
  const groups = filterNavigationGroups(built.navigationGroups, role, allowedModule);
  return {
    navigationGroups: groups,
    navigationItems: groups.flatMap((group) => group.items),
    allowedSlugs: getAllowedNavSlugs(role, allowedModule)
  };
};

export { isClubOrDistrict, canReorderSidebar };
