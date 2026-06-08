import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";

const FULL_WIDTH_PATHS = ["/profile"];

export const SidebarLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isFullWidth = FULL_WIDTH_PATHS.some((path) => pathname === path);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-transparent text-[#2f2829]">
      <AppSidebar />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <main
          className={`custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pt-3 pb-5 sm:pt-4 lg:pt-4 lg:pb-7 ${
            isFullWidth ? "px-3 sm:px-4 lg:px-5" : "px-4 sm:px-6 lg:px-8"
          }`}
        >
          <div className={isFullWidth ? "w-full" : "mx-auto w-full max-w-[1380px]"}>{children}</div>
        </main>
      </div>
    </div>
  );
};
