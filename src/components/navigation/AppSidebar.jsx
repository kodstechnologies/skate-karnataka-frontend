import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, LogOut, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/karnataka-roller-skating-logo.png";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { isNavChildActive } from "@/lib/role-navigation";
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
import {
  getUserAvatarSrc,
  getUserDisplayName,
  getUserInitials
} from "@/features/admin/pages/profileMapper";

const SortableNavItem = ({ id, disabled, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${
        isDragging
          ? "scale-[1.02] shadow-[0_12px_28px_rgba(47,40,41,0.18)] rounded-2xl bg-[#fbf6f4]"
          : ""
      }`}
    >
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  );
};

const DragHandle = ({ label, dragHandleProps, isDragging, visible }) => {
  if (!visible) return null;
  return (
    <button
      type="button"
      className={`shrink-0 rounded-lg p-1 text-[#b5a7a2] transition hover:bg-white hover:text-[#2f2829] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      aria-label={`Reorder ${label}`}
      {...dragHandleProps}
    >
      <GripVertical size={16} />
    </button>
  );
};

const NavItemContent = ({
  item,
  sidebarOpen,
  locationPathname,
  expandedParentItems,
  toggleParentItem,
  reorderable,
  dragHandleProps,
  isDragging
}) => {
  const Icon = item.icon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isChildActive = hasChildren
    ? item.children.some((child) => isNavChildActive(child.to, locationPathname))
    : false;
  const isExpanded = Boolean(expandedParentItems[item.slug]);
  const showHandle = reorderable && sidebarOpen;

  if (hasChildren) {
    return (
      <div className="group relative">
        <div
          className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-sm transition ${
            sidebarOpen ? "justify-between gap-1" : "lg:justify-center"
          } ${
            isChildActive
              ? "bg-[#fef0ea] text-[#f6765e] shadow-[0_8px_24px_rgba(246,118,94,0.12)]"
              : "text-[#7f7270] hover:bg-white hover:text-[#2f2829]"
          }`}
        >
          <div className={`flex min-w-0 flex-1 items-center ${sidebarOpen ? "gap-2" : ""}`}>
            <DragHandle
              label={item.label}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
              visible={showHandle}
            />
            <button
              type="button"
              onClick={() => toggleParentItem(item.slug)}
              className={`flex min-w-0 flex-1 items-center ${
                sidebarOpen ? "justify-between gap-3" : "lg:justify-center"
              }`}
            >
              <div className={`flex items-center ${sidebarOpen ? "gap-3" : "lg:justify-center"}`}>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isChildActive ? "bg-[#f6765e] text-white" : "bg-white text-[#8f817e]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className={`${sidebarOpen ? "block" : "lg:hidden"} font-medium`}>
                  {item.label}
                </span>
              </div>

              {sidebarOpen && (
                <ChevronRight
                  size={16}
                  className={`shrink-0 text-[#d59583] transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {isExpanded && sidebarOpen && (
          <div className="mt-1 ml-12 space-y-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end={child.to === "/club/members" || child.to === "/district/members"}
                  className={() =>
                    `flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition ${
                      isNavChildActive(child.to, locationPathname)
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
    <div className="group relative">
      <div
        className={`flex items-center rounded-2xl px-3 py-2.5 text-sm transition ${
          sidebarOpen ? "gap-1" : "lg:justify-center"
        } ${
          isNavChildActive(item.to, locationPathname)
            ? "bg-[#fef0ea] text-[#f6765e] shadow-[0_8px_24px_rgba(246,118,94,0.12)]"
            : "text-[#7f7270] hover:bg-white hover:text-[#2f2829]"
        }`}
      >
        <DragHandle
          label={item.label}
          dragHandleProps={dragHandleProps}
          isDragging={isDragging}
          visible={showHandle}
        />
        <NavLink to={item.to} className="flex min-w-0 flex-1 items-center justify-between">
          {({ isActive }) => {
            const activeState = isActive || isChildActive;
            return (
              <>
                <div className={`flex items-center ${sidebarOpen ? "gap-3" : "lg:justify-center"}`}>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      activeState ? "bg-[#f6765e] text-white" : "bg-white text-[#8f817e]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className={`${sidebarOpen ? "block" : "lg:hidden"} font-medium`}>
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
      </div>

      {!sidebarOpen && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 rounded-xl bg-[#2f2829] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
          {item.label}
        </div>
      )}
    </div>
  );
};

export const AppSidebar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const {
    navigationGroups,
    reorderable,
    hasOrderChanged,
    isSavingOrder,
    handleDragEndReorder,
    saveOrder,
    discardOrder,
    isLoading: isSidebarLoading
  } = useAppNavigation();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);
  const location = useLocation();
  const [manualExpanded, setManualExpanded] = useState({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const flatTopLevelItems = useMemo(
    () => navigationGroups.flatMap((group) => group.items),
    [navigationGroups]
  );

  const sortableIds = useMemo(
    () => flatTopLevelItems.map((item) => String(item._id || item.slug || item.to)),
    [flatTopLevelItems]
  );

  const pathAutoExpanded = useMemo(() => {
    const path = location.pathname.split("?")[0];
    const nextExpanded = {};
    navigationGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (
          Array.isArray(item.children) &&
          item.children.some((child) => isNavChildActive(child.to, path))
        ) {
          nextExpanded[item.slug] = true;
        }
      });
    });
    return nextExpanded;
  }, [location.pathname, navigationGroups]);

  const expandedParentItems = useMemo(
    () => ({ ...manualExpanded, ...pathAutoExpanded }),
    [manualExpanded, pathAutoExpanded]
  );

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, location.pathname]);

  const toggleParentItem = (itemSlug) => {
    setManualExpanded((previous) => {
      const currentlyOpen = Boolean(pathAutoExpanded[itemSlug] || previous[itemSlug]);
      return {
        ...previous,
        [itemSlug]: !currentlyOpen
      };
    });
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login");
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!reorderable || !over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(flatTopLevelItems, oldIndex, newIndex);
    handleDragEndReorder(reordered.map((item) => String(item._id)));
  };

  const displayName = getUserDisplayName(user);
  const avatarSrc = getUserAvatarSrc(user);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#2f2829]/25 backdrop-blur-sm transition lg:hidden ${
          mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh flex-col overflow-hidden border-r border-[#efe2dc] bg-[#fbf6f4] shadow-[0_14px_40px_rgba(114,88,79,0.12)] transition-transform duration-300 lg:sticky lg:top-[74px] lg:z-0 lg:h-full lg:translate-x-0 lg:self-start ${
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

        {reorderable && hasOrderChanged && sidebarOpen && (
          <div className="flex items-center gap-2 border-b border-[#efe2dc] px-4 py-2">
            <button
              type="button"
              onClick={saveOrder}
              disabled={isSavingOrder}
              className="flex-1 rounded-xl bg-[#f6765e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#e8654d] disabled:opacity-60"
            >
              {isSavingOrder ? "Saving…" : "Save Order"}
            </button>
            <button
              type="button"
              onClick={discardOrder}
              disabled={isSavingOrder}
              className="rounded-xl px-3 py-2 text-xs font-medium text-[#8d7f7b] transition hover:bg-white disabled:opacity-60"
            >
              Reset A–Z
            </button>
          </div>
        )}

        <nav className="custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-3">
          {isSidebarLoading && flatTopLevelItems.length === 0 ? (
            <div className="space-y-2 px-1 py-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={44} sx={{ borderRadius: "16px" }} />
              ))}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <div className="mb-2 space-y-0.5 last:mb-0">
                  {flatTopLevelItems.map((item) => {
                    const sortableId = String(item._id || item.slug || item.to);
                    return (
                      <SortableNavItem key={sortableId} id={sortableId} disabled={!reorderable}>
                        {({ dragHandleProps, isDragging }) => (
                          <NavItemContent
                            item={item}
                            sidebarOpen={sidebarOpen}
                            locationPathname={location.pathname}
                            expandedParentItems={expandedParentItems}
                            toggleParentItem={toggleParentItem}
                            reorderable={reorderable}
                            dragHandleProps={dragHandleProps}
                            isDragging={isDragging}
                          />
                        )}
                      </SortableNavItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
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
                src={avatarSrc || undefined}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "16px",
                  bgcolor: "#f6765e",
                  fontSize: "1rem",
                  fontWeight: 600
                }}
              >
                {getUserInitials(user)}
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
                      {displayName || "Admin"}
                    </p>
                    <p className="text-xs text-[#9b8d88]">
                      {role === "admin"
                        ? "State Admin"
                        : role === "club"
                          ? "Club Member"
                          : role === "district"
                            ? "District Member"
                            : "State Official"}
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
