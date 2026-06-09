import { useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { Hash } from "lucide-react";
import { competitionApi } from "@/api/competition-api";
import toast from "react-hot-toast";
import {
  canShowGenerateChestNumbers,
  isRegistrationClosedForChestGeneration,
} from "@/features/admin/events/utils/eventChestNumberUi";

const cornerButtonSx = {
  flexShrink: 0,
  borderRadius: "999px",
  px: 1.75,
  py: 0.35,
  minHeight: 30,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, #1e4a8a 0%, #2563eb 48%, #60a5fa 100%)",
  boxShadow:
    "0 2px 8px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #1a3f75 0%, #1d4ed8 48%, #3b82f6 100%)",
    boxShadow:
      "0 6px 18px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.28)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.85)",
    background: "linear-gradient(135deg, #5a7fb8 0%, #6b9fd4 100%)",
  },
};

export default function GenerateEventChestNumbersButton({
  event,
  role,
  variant = "corner",
  fullWidth = false,
  sx = {},
}) {
  const [loading, setLoading] = useState(false);
  const eventId = event?._id || event?.id;

  if (
    !eventId ||
    !canShowGenerateChestNumbers(role) ||
    !isRegistrationClosedForChestGeneration(event)
  ) {
    return null;
  }

  const handleClick = async (e) => {
    e.stopPropagation();
    setLoading(true);
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
        message ||
          `Successfully generated ${data?.count ?? 0} skater chest numbers`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to generate chest numbers"
      );
    } finally {
      setLoading(false);
    }
  };

  if (variant === "corner") {
    return (
      <Tooltip title="Generate chest numbers" arrow placement="top">
        <span>
          <Button
            size="small"
            onClick={handleClick}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <Hash size={13} strokeWidth={2.5} />
              )
            }
            sx={{ ...cornerButtonSx, ...sx }}
          >
            Chest No
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      fullWidth={fullWidth}
      onClick={handleClick}
      disabled={loading}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : <Hash size={16} />
      }
      sx={sx}
    >
      Generate chest numbers
    </Button>
  );
}
