import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { navigationItems } from "@/lib/app-shell";
import { useUiStore } from "@/store/ui-store";

export const AppHeader = () => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return navigationItems
      .filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
      .slice(0, 6);
  }, [query]);

  const handleSidebarToggle = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      toggleMobileSidebar();
      return;
    }

    toggleSidebar();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setQuery("");
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && filteredItems[0]) {
      handleNavigate(filteredItems[0].to);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#efe2dc] bg-[#fbf6f4]/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          type="button"
          onClick={handleSidebarToggle}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eee1db] bg-white text-[#756968] shadow-sm transition hover:border-[#e6d0c7] hover:bg-[#fffaf7]"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden md:block">
          <div className="flex w-[280px] items-center rounded-2xl border border-[#eee1db] bg-white px-4 py-3 shadow-sm lg:w-[340px]">
            <Search size={16} className="mr-3 text-[#b19f99]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm text-[#2f2829] outline-none placeholder:text-[#b8aaa4]"
            />
          </div>

          {filteredItems.length > 0 && (
            <div className="absolute left-0 top-[calc(100%+10px)] w-full rounded-[24px] border border-[#f0e3dd] bg-white p-2 shadow-[0_20px_50px_rgba(120,91,81,0.12)]">
              {filteredItems.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleNavigate(item.to)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-[#faf5f2]"
                >
                  <span className="text-sm font-medium text-[#2f2829]">{item.label}</span>
                  <span className="text-xs text-[#b19f99]">Open</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eee1db] bg-white text-[#756968] shadow-sm transition hover:bg-[#fffaf7]">
          <Bell size={20} />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f6765e]" />
        </button>

        <button className="flex items-center gap-2 rounded-2xl border border-[#eee1db] bg-white px-2 py-2 shadow-sm transition hover:bg-[#fffaf7]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff1eb] text-xs font-semibold text-[#f6765e]">
            AS
          </div>
          <span className="hidden text-sm font-medium text-[#2f2829] sm:block">AS</span>
          <ChevronDown size={16} className="hidden text-[#ab9b95] sm:block" />
        </button>
      </div>
    </header>
  );
};
