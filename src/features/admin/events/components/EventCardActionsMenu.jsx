import { useState } from "react";
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from "@mui/material";
import { Hash, MoreVertical, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { competitionApi } from "@/api/competition-api";
import { eventsApi } from "@/api/events-api";
import {
  buildAttendeesNavigationState,
  resolveAttendeesPath
} from "@/features/admin/events/utils/eventAttendeesNavigation";
import {
  canShowGenerateChestNumbers,
  isRegistrationClosedForChestGeneration
} from "@/features/admin/events/utils/eventChestNumberUi";
import {
  canShowGenerateCertificates,
  isEventEnded
} from "@/features/admin/events/utils/eventCertificateUi";

const menuButtonSx = {
  flexShrink: 0,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.35)",
  backgroundColor: "rgba(0,0,0,0.14)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  transition: "background-color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.24)",
    transform: "translateY(-1px)"
  }
};

export default function EventCardActionsMenu({
  event,
  role,
  returnTo = "/events/detail",
  returnLabel = "Events",
  dashboardPath,
  dashboardLabel = "Dashboard"
}) {
  const navigate = useNavigate();
  const eventId = event?._id || event?.id;

  const [anchorEl, setAnchorEl] = useState(null);
  const [generatingChest, setGeneratingChest] = useState(false);
  const [generatingCerts, setGeneratingCerts] = useState(false);

  if (!eventId) {
    return null;
  }

  const open = Boolean(anchorEl);
  const showGenerateChest =
    canShowGenerateChestNumbers(role) && isRegistrationClosedForChestGeneration(event);
  const showGenerateCerts =
    canShowGenerateCertificates(role) && isEventEnded(event);

  const resolvedDashboardPath =
    dashboardPath ||
    (returnTo.startsWith("/district/")
      ? "/district/dashboard"
      : returnTo.startsWith("/club/")
        ? "/club/dashboard"
        : "/dashboard");

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleViewSkaters = () => {
    handleClose();
    navigate(resolveAttendeesPath(eventId, returnTo), {
      state: buildAttendeesNavigationState({
        event,
        returnTo,
        returnLabel,
        dashboardPath: resolvedDashboardPath,
        dashboardLabel
      })
    });
  };

  const handleGenerateChest = async () => {
    handleClose();
    setGeneratingChest(true);
    try {
      const response = await competitionApi.generateChestNumbers(eventId);
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload;
      const message = payload?.message || data?.message || "";

      if (
        data?.alreadyGenerated ||
        message.toLowerCase().includes("already generated")
      ) {
        toast.success(message || "Chest numbers already generated");
        return;
      }

      toast.success(
        message || `Successfully generated ${data?.count ?? 0} skater chest numbers`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate chest numbers");
    } finally {
      setGeneratingChest(false);
    }
  };

  const handleGenerateCerts = async () => {
    handleClose();
    setGeneratingCerts(true);
    try {
      const response = await eventsApi.generateCertificates(eventId);
      const payload = response?.data ?? response;
      const message = response?.message || "";

      if (payload?.allGenerated || message.toLowerCase().includes("already generated")) {
        toast.success(message || "Certificates already generated");
        return;
      }

      const generated = payload?.generated ?? 0;
      const skipped = payload?.skipped ?? 0;
      const failed = payload?.failed ?? 0;

      if (generated === 0 && skipped > 0 && failed === 0) {
        toast.success("Certificates already generated");
        return;
      }

      toast.success(
        message ||
          `Certificates: ${generated} generated, ${skipped} skipped, ${failed} failed`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate certificates");
    } finally {
      setGeneratingCerts(false);
    }
  };

  const busy = generatingChest || generatingCerts;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        disabled={busy}
        aria-label="Event actions"
        sx={menuButtonSx}
      >
        {busy ? <CircularProgress size={16} color="inherit" /> : <MoreVertical size={18} />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              minWidth: 220,
              borderRadius: "14px",
              border: "1px solid #f0e1da",
              boxShadow: "0 12px 40px rgba(48,30,24,0.12)"
            }
          }
        }}
      >
        <MenuItem onClick={handleViewSkaters}>
          <ListItemIcon>
            <Users size={18} />
          </ListItemIcon>
          <ListItemText primary="Registered skaters" secondary="View all with chest no." />
        </MenuItem>

        {showGenerateChest && (
          <MenuItem onClick={handleGenerateChest} disabled={generatingChest}>
            <ListItemIcon>
              {generatingChest ? (
                <CircularProgress size={18} />
              ) : (
                <Hash size={18} />
              )}
            </ListItemIcon>
            <ListItemText primary="Generate chest numbers" />
          </MenuItem>
        )}

        {showGenerateCerts && (
          <MenuItem onClick={handleGenerateCerts} disabled={generatingCerts}>
            <ListItemIcon>
              {generatingCerts ? (
                <CircularProgress size={18} />
              ) : (
                <Sparkles size={18} />
              )}
            </ListItemIcon>
            <ListItemText primary="Generate certificates" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
