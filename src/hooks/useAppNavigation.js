import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  canReorderSidebar,
  isClubOrDistrict,
  selectNavigationForRole,
  useSidebarStore
} from "@/store/sidebar-store";

/**
 * Unified sidebar navigation:
 * - club / district → existing hardcoded role menus
 * - admin / state → database-driven sidebar (shared zustand store)
 */
export const useAppNavigation = () => {
  const role = useAuthStore((state) => state.role);
  const allowedModule = useAuthStore((state) => state.user?.allowedModule);

  const rawItems = useSidebarStore((state) => state.rawItems);
  const isLoading = useSidebarStore((state) => state.isLoading);
  const fetchError = useSidebarStore((state) => state.fetchError);
  const hasOrderChanged = useSidebarStore((state) => state.hasOrderChanged);
  const isSavingOrder = useSidebarStore((state) => state.isSavingOrder);
  const fetchedOnce = useSidebarStore((state) => state.fetchedOnce);
  const fetchSidebar = useSidebarStore((state) => state.fetchSidebar);
  const handleDragEndReorder = useSidebarStore((state) => state.handleDragEndReorder);
  const saveOrder = useSidebarStore((state) => state.saveOrder);
  const discardOrder = useSidebarStore((state) => state.discardOrder);

  const usesApiMenu = !isClubOrDistrict(role);

  useEffect(() => {
    if (usesApiMenu && !fetchedOnce && !isLoading) {
      fetchSidebar();
    }
  }, [usesApiMenu, fetchedOnce, isLoading, fetchSidebar]);

  const navigation = useMemo(
    () => selectNavigationForRole(rawItems, role, allowedModule),
    [rawItems, role, allowedModule]
  );

  return {
    ...navigation,
    isLoading: usesApiMenu ? isLoading : false,
    fetchError: usesApiMenu ? fetchError : null,
    reorderable: usesApiMenu && canReorderSidebar(role),
    hasOrderChanged: usesApiMenu ? hasOrderChanged : false,
    isSavingOrder: usesApiMenu ? isSavingOrder : false,
    handleDragEndReorder,
    saveOrder,
    discardOrder,
    refetch: fetchSidebar
  };
};
