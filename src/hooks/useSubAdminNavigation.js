import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getNavigationForUser } from "@/lib/navigation-modules";

export const useSubAdminNavigation = () => {
  const role = useAuthStore((state) => state.role);
  const allowedModule = useAuthStore((state) => state.user?.allowedModule);

  return useMemo(() => getNavigationForUser(role, allowedModule), [role, allowedModule]);
};
