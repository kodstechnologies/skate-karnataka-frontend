import { Navigate, Outlet, useLocation } from "react-router-dom";
import { HeaderLayout } from "@/layouts/HeaderLayout";
import { SidebarLayout } from "@/layouts/SidebarLayout";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

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
