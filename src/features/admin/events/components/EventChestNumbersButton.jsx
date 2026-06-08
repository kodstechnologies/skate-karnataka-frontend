import { IconButton, Tooltip } from "@mui/material";
import { Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  buildAttendeesNavigationState,
  resolveAttendeesPath,
} from "@/features/admin/events/utils/eventAttendeesNavigation";

const cornerButtonSx = {
  flexShrink: 0,
  borderRadius: "999px",
  px: 1.25,
  py: 0.35,
  minHeight: 30,
  minWidth: 30,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, #1e4a8a 0%, #2563eb 48%, #60a5fa 100%)",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #1a3f75 0%, #1d4ed8 48%, #3b82f6 100%)",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.28)",
    transform: "translateY(-1px)"
  },
  "&:active": {
    transform: "translateY(0)"
  }
};

export default function EventChestNumbersButton({
  event,
  returnTo = "/events/detail",
  returnLabel = "Events",
  dashboardPath,
  dashboardLabel = "Dashboard",
}) {
  const navigate = useNavigate();
  const eventId = event?._id || event?.id;

  if (!eventId) {
    return null;
  }

  const resolvedDashboardPath =
    dashboardPath ||
    (returnTo.startsWith("/district/") ? "/district/dashboard" :
      returnTo.startsWith("/club/") ? "/club/dashboard" :
        "/dashboard");

  const handleOpen = (e) => {
    e.stopPropagation();
    navigate(resolveAttendeesPath(eventId, returnTo), {
      state: buildAttendeesNavigationState({
        event,
        returnTo,
        returnLabel,
        dashboardPath: resolvedDashboardPath,
        dashboardLabel,
      }),
    });
  };

  return (
    <Tooltip title="View attendees with chest numbers" arrow placement="top">
      <IconButton size="small" onClick={handleOpen} sx={cornerButtonSx} aria-label="Chest numbers">
        <Hash size={14} strokeWidth={2.5} />
      </IconButton>
    </Tooltip>
  );
}
