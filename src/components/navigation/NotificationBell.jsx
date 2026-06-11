import { Bell, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography
} from "@mui/material";
import { useNotifications } from "@/hooks/useNotifications";
import { formatNotificationRole, isDashboardRoleLabel } from "@/lib/notification-labels";

const formatWhen = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const RoleBadge = ({ role, prefix = "From" }) => {
  const label = formatNotificationRole(role);
  if (!label) return null;

  const isAdmin = label === "Admin";
  const isSubAdmin = label === "Sub Admin";
  const highlighted = isDashboardRoleLabel(role);

  return (
    <Chip
      size="small"
      label={`${prefix} ${label}`}
      sx={{
        height: 22,
        fontSize: "0.65rem",
        fontWeight: 600,
        bgcolor: isAdmin ? "#fff1eb" : isSubAdmin ? "#eef6ff" : "#f5f0ee",
        color: isAdmin ? "#e85d3f" : isSubAdmin ? "#3b6fd4" : "#756968",
        border: `1px solid ${
          isAdmin ? "#f5d5c8" : isSubAdmin ? "#c5daf5" : highlighted ? "#e8ddd8" : "#eee1db"
        }`
      }}
    />
  );
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {
    notifications,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    openPanel,
    loadMore,
    hasMore,
    hasUnread
  } = useNotifications();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    openPanel();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (item) => {
    const link = String(item?.link || "").trim();
    if (!link) return;
    handleClose();
    navigate(link);
  };

  const totalCount = pagination?.total ?? notifications.length;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eee1db] bg-white text-[#756968] shadow-sm transition hover:bg-[#fffaf7]"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f6765e]" />
        )}
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 380,
              maxWidth: "calc(100vw - 24px)",
              borderRadius: "20px",
              border: "1px solid #f0e3dd",
              boxShadow: "0 20px 50px rgba(120, 91, 81, 0.12)",
              overflow: "hidden"
            }
          }
        }}
      >
        <Box sx={{ px: 2.5, py: 2, bgcolor: "#fbf6f4", borderBottom: "1px solid #f0e3dd" }}>
          <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
            <Stack spacing={0.25}>
              <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: "0.95rem" }}>
                Notifications
              </Typography>
              {totalCount > 0 && (
                <Typography sx={{ color: "#b19f99", fontSize: "0.72rem" }}>
                  {totalCount} total
                </Typography>
              )}
            </Stack>
            <IconButton
              size="small"
              onClick={refresh}
              disabled={isLoading}
              aria-label="Refresh notifications"
              sx={{ color: "#ab9b95" }}
            >
              {isLoading ? (
                <CircularProgress size={16} sx={{ color: "#f6765e" }} />
              ) : (
                <RefreshCw size={16} />
              )}
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {isLoading && notifications.length === 0 ? (
            <Stack sx={{ py: 4, alignItems: "center" }}>
              <CircularProgress size={28} sx={{ color: "#f6765e" }} />
            </Stack>
          ) : error ? (
            <Typography sx={{ px: 2.5, py: 3, color: "#b19f99", fontSize: "0.875rem" }}>
              {error}
            </Typography>
          ) : notifications.length === 0 ? (
            <Typography sx={{ px: 2.5, py: 3, color: "#b19f99", fontSize: "0.875rem" }}>
              No notifications yet.
            </Typography>
          ) : (
            notifications.map((item, index) => (
              <Box key={item._id || index}>
                {index > 0 && <Divider sx={{ borderColor: "#f5ebe6" }} />}
                <Box
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    px: 2.5,
                    py: 2,
                    bgcolor: item.isRead ? "transparent" : "#fffaf7",
                    cursor: item.link ? "pointer" : "default",
                    transition: "background-color 0.2s",
                    "&:hover": item.link ? { bgcolor: "#fff3ee" } : undefined
                  }}
                >
                  <Stack
                    sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
                    direction="row"
                    gap={1}
                  >
                    <Typography
                      sx={{
                        fontWeight: item.isRead ? 500 : 600,
                        color: "#2f2829",
                        fontSize: "0.875rem",
                        lineHeight: 1.35,
                        flex: 1
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: "#b19f99", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                      {formatWhen(item.createdAt)}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.75,
                      color: "#756968",
                      fontSize: "0.8rem",
                      lineHeight: 1.45
                    }}
                  >
                    {item.body}
                  </Typography>

                  {item.senderRole && (
                    <Stack direction="row" gap={0.75} sx={{ mt: 1, flexWrap: "wrap" }}>
                      <RoleBadge role={item.senderRole} prefix="From" />
                    </Stack>
                  )}
                </Box>
              </Box>
            ))
          )}

          {hasMore && (
            <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid #f5ebe6" }}>
              <Button
                fullWidth
                size="small"
                onClick={loadMore}
                disabled={isLoadingMore}
                sx={{
                  textTransform: "none",
                  borderRadius: "12px",
                  color: "#f6765e",
                  fontWeight: 600
                }}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};
