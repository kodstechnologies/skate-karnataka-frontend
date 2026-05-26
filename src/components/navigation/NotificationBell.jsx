import { Bell, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  Box,
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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { notifications, isLoading, error, refresh, hasUnread } = useNotifications();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    refresh();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: "0.95rem" }}>
              Notifications
            </Typography>
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
            <Stack alignItems="center" sx={{ py: 4 }}>
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
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
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
                    <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
                      <RoleBadge role={item.senderRole} prefix="From" />
                    </Stack>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};
