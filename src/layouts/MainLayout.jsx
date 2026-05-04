import { Navigate, Outlet, useLocation } from "react-router-dom";
import { HeaderLayout } from "@/layouts/HeaderLayout";
import { SidebarLayout } from "@/layouts/SidebarLayout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";

export const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Register the FCM foreground notification listener for the entire
  // authenticated session. The hook is a no-op if messaging is not supported
  // or if notification permission has been denied.
  useFirebaseMessaging();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <HeaderLayout>
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </HeaderLayout>
  );
};
