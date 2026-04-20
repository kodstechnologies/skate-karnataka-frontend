import { AppSidebar } from "@/components/navigation/AppSidebar";

export const SidebarLayout = ({ children }) => {
  return (
    <div className="flex h-[calc(100vh-74px)] min-h-0 w-full overflow-hidden bg-transparent text-[#2f2829]">
      <AppSidebar />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-5 sm:px-6 sm:pt-4 lg:px-8 lg:pt-4 lg:pb-7">
          <div className="mx-auto w-full max-w-[1380px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
