import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { navigationItems } from "@/lib/app-shell";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Avatar, Skeleton, Menu as MuiMenu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { Logout, Person } from "@mui/icons-material";

export const AppHeader = () => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);
  const { user, getProfile, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!user) {
      getProfile().catch(() => {});
    }
  }, [getProfile, user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    // The AppSidebar will handle the actual confirmation modal
    // but for the header dropdown we can trigger a logout or redirect to a common confirm
    logout();
    navigate("/login");
  };

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

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

        {isLoading && !user ? (
          <Skeleton variant="rectangular" width={100} height={44} sx={{ borderRadius: "16px" }} />
        ) : (
          <button
            onClick={handleClick}
            className="flex items-center gap-2 rounded-2xl border border-[#eee1db] bg-white px-2 py-2 shadow-sm transition hover:bg-[#fffaf7]"
          >
            <Avatar
              src={user?.img}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "12px",
                bgcolor: "#fff1eb",
                color: "#f6765e",
                fontSize: "0.75rem",
                fontWeight: 600
              }}
            >
              {getInitials(user?.fullName)}
            </Avatar>
            <span className="hidden text-sm font-medium text-[#2f2829] sm:block">
              {user?.fullName?.split(" ")[0]}
            </span>
            <ChevronDown size={16} className="hidden text-[#ab9b95] sm:block" />
          </button>
        )}

        <MuiMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                borderRadius: "16px",
                padding: "4px",
                minWidth: "180px",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0
                }
              }
            }
          }}
        >
          <MenuItem onClick={() => navigate("/profile")} sx={{ borderRadius: "12px", py: 1 }}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleLogoutClick}
            sx={{ borderRadius: "12px", py: 1, color: "error.main" }}
          >
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </MuiMenu>
      </div>
    </header>
  );
};
