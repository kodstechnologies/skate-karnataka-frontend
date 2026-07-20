import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { HeaderLayout } from "@/layouts/HeaderLayout";
import { SidebarLayout } from "@/layouts/SidebarLayout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { isPathAllowedForModules } from "@/lib/navigation-modules";

export const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const getProfile = useAuthStore((state) => state.getProfile);
  const location = useLocation();
  const { allowedSlugs } = useAppNavigation();

  useEffect(() => {
    if (isAuthenticated && !user) {
      getProfile().catch(() => {});
    }
  }, [getProfile, isAuthenticated, user]);

  // Register the FCM foreground notification listener for the entire
  // authenticated session. The hook is a no-op if messaging is not supported
  // or if notification permission has been denied.
  useFirebaseMessaging();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (role || "").toLowerCase();
  const webRoles = ["admin", "state", "club", "district"];
  if (!webRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedSlugs &&
    user &&
    !isPathAllowedForModules(location.pathname, allowedSlugs, userRole, user?.allowedModule)
  ) {
    const fallback =
      userRole === "club"
        ? "/club/dashboard"
        : userRole === "district"
          ? "/district/dashboard"
          : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return (
    <HeaderLayout>
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </HeaderLayout>
  );
};
