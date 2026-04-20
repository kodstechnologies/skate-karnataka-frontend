import { Outlet } from "react-router-dom";
import { HeaderLayout } from "@/layouts/HeaderLayout";
import { SidebarLayout } from "@/layouts/SidebarLayout";

export const MainLayout = () => {
  return (
    <HeaderLayout>
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </HeaderLayout>
  );
};
