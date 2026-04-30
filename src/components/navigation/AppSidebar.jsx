import { ChevronRight, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/karnataka-roller-skating-logo.png";
import { navigationGroups } from "@/lib/app-shell";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  Avatar,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);
  const location = useLocation();
  const [expandedParentItems, setExpandedParentItems] = useState({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, location.pathname]);

  const toggleParentItem = (itemSlug) => {
    setExpandedParentItems((previous) => ({
      ...previous,
      [itemSlug]: !previous[itemSlug]
    }));
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login");
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
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#2f2829]/25 backdrop-blur-sm transition lg:hidden ${
          mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-[#efe2dc] bg-[#fbf6f4] shadow-[0_14px_40px_rgba(114,88,79,0.12)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-[calc(100vh-74px)] lg:translate-x-0 lg:self-start ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-[280px] ${sidebarOpen ? "lg:w-[280px]" : "lg:w-[104px]"}`}
      >
        <div className="flex items-center justify-between border-b border-[#efe2dc] px-5 py-5 lg:px-6">
          <div
            className={`flex min-w-0 items-center gap-3 transition-all ${
              sidebarOpen ? "justify-start" : "lg:justify-center"
            }`}
          >
            <img
              src={logo}
              alt="Karnataka Roller Skating Association"
              className="h-14 w-14 rounded-2xl border border-white/80 bg-white p-1 shadow-sm"
            />
            <div className={`${sidebarOpen ? "block" : "lg:hidden"} min-w-0`}>
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#2f2829]">
                Skate Karnataka
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-full p-2 text-[#8d7f7b] transition hover:bg-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-3">
          {navigationGroups.map((group) => {
            // Hide entire Admin Controls group for subadmins
            if (role === "subadmin" && group.label === "Admin Controls") return null;

            const filteredItems = group.items.filter((item) => {
              // Always hide States since there is only one state (Karnataka)
              if (item.slug === "states") return false;

              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-2 last:mb-0">
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                    const isChildActive = hasChildren
                      ? item.children.some((child) => location.pathname.startsWith(child.to))
                      : false;
                    const isExpanded = Boolean(expandedParentItems[item.slug]);

                    if (hasChildren) {
                      return (
                        <div key={item.slug} className="group relative">
                          <button
                            type="button"
                            onClick={() => toggleParentItem(item.slug)}
                            className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-sm transition ${
                              sidebarOpen ? "justify-between" : "lg:justify-center"
                            } ${
                              isChildActive
                                ? "bg-[#fef0ea] text-[#f6765e] shadow-[0_8px_24px_rgba(246,118,94,0.12)]"
                                : "text-[#7f7270] hover:bg-white hover:text-[#2f2829]"
                            }`}
                          >
                            <div
                              className={`flex items-center ${
                                sidebarOpen ? "gap-3" : "lg:justify-center"
                              }`}
                            >
                              <span
                                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                  isChildActive
                                    ? "bg-[#f6765e] text-white"
                                    : "bg-white text-[#8f817e]"
                                }`}
                              >
                                <Icon className="h-[18px] w-[18px]" />
                              </span>
                              <span
                                className={`${sidebarOpen ? "block" : "lg:hidden"} font-medium`}
                              >
                                {item.label}
                              </span>
                            </div>

                            {sidebarOpen && (
                              <ChevronRight
                                size={16}
                                className={`text-[#d59583] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            )}
                          </button>

                          {isExpanded && sidebarOpen && (
                            <div className="mt-1 ml-12 space-y-1">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                return (
                                  <NavLink
                                    key={child.to}
                                    to={child.to}
                                    className={({ isActive }) =>
                                      `flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition ${
                                        isActive
                                          ? "bg-[#fff1eb] text-[#f6765e] font-semibold"
                                          : "text-[#8a7d7a] hover:bg-white hover:text-[#2f2829]"
                                      }`
                                    }
                                  >
                                    <ChildIcon className="h-4 w-4" />
                                    <span>{child.label}</span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}

                          {!sidebarOpen && (
                            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 rounded-xl bg-[#2f2829] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
                              {item.label}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={item.to} className="group relative">
                        <NavLink
                          to={item.to}
                          className={({ isActive }) => {
                            const activeState = isActive || isChildActive;
                            return `flex items-center rounded-2xl px-3 py-2.5 text-sm transition ${
                              sidebarOpen ? "justify-between" : "lg:justify-center"
                            } ${
                              activeState
                                ? "bg-[#fef0ea] text-[#f6765e] shadow-[0_8px_24px_rgba(246,118,94,0.12)]"
                                : "text-[#7f7270] hover:bg-white hover:text-[#2f2829]"
                            }`;
                          }}
                        >
                          {({ isActive }) => {
                            const activeState = isActive || isChildActive;
                            return (
                              <>
                                <div
                                  className={`flex items-center ${
                                    sidebarOpen ? "gap-3" : "lg:justify-center"
                                  }`}
                                >
                                  <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                      activeState
                                        ? "bg-[#f6765e] text-white"
                                        : "bg-white text-[#8f817e]"
                                    }`}
                                  >
                                    <Icon className="h-[18px] w-[18px]" />
                                  </span>
                                  <span
                                    className={`${sidebarOpen ? "block" : "lg:hidden"} font-medium`}
                                  >
                                    {item.label}
                                  </span>
                                </div>

                                {sidebarOpen && activeState && (
                                  <ChevronRight size={16} className="text-[#d59583]" />
                                )}
                              </>
                            );
                          }}
                        </NavLink>

                        {!sidebarOpen && (
                          <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 rounded-xl bg-[#2f2829] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[#efe2dc] px-4 py-4">
          <div
            className={`flex items-center rounded-[22px] border border-white/80 bg-white p-3 shadow-sm ${
              sidebarOpen ? "gap-3" : "justify-center lg:px-2"
            }`}
          >
            {isLoading && !user ? (
              <Skeleton variant="circular" width={44} height={44} />
            ) : (
              <Avatar
                src={user?.img}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "16px",
                  bgcolor: "#f6765e",
                  fontSize: "1rem",
                  fontWeight: 600
                }}
              >
                {getInitials(user?.fullName)}
              </Avatar>
            )}

            <div
              className={`${sidebarOpen ? "flex" : "hidden"} min-w-0 flex-1 items-center justify-between`}
            >
              <div className="min-w-0">
                {isLoading && !user ? (
                  <>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={60} />
                  </>
                ) : (
                  <>
                    <p className="truncate text-sm font-semibold text-[#2f2829]">
                      {user?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-[#9b8d88]">
                      {role === "admin" ? "State Admin" : "State Official"}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(true)}
                className="rounded-full p-2 text-[#9b8d88] transition hover:bg-[#faf4f1] hover:text-[#2f2829]"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: "24px", p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of the admin portal?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ borderRadius: "12px", textTransform: "none", color: "#8d7f7b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
