import { useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { Sparkles } from "lucide-react";
import { eventsApi } from "@/api/events-api";
import toast from "react-hot-toast";
import {
  canShowGenerateCertificates,
  isEventEnded
} from "@/features/admin/events/utils/eventCertificateUi";

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
  background: "linear-gradient(135deg, #0f6b52 0%, #1f9d75 48%, #3dd9a8 100%)",
  boxShadow:
    "0 2px 8px rgba(15, 107, 82, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #0d5f48 0%, #1a8f6a 48%, #35c997 100%)",
    boxShadow:
      "0 6px 18px rgba(15, 107, 82, 0.45), inset 0 1px 0 rgba(255,255,255,0.28)",
    transform: "translateY(-1px)"
  },
  "&:active": {
    transform: "translateY(0)"
  },
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.85)",
    background: "linear-gradient(135deg, #5a8f7d 0%, #6aab96 100%)"
  }
};

export default function GenerateEventCertificatesButton({
  event,
  role,
  variant = "corner",
  fullWidth = false,
  sx = {}
}) {
  const [loading, setLoading] = useState(false);
  const eventId = event?._id || event?.id;

  if (!eventId || !canShowGenerateCertificates(role) || !isEventEnded(event)) {
    return null;
  }

  const handleClick = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await eventsApi.generateCertificates(eventId);
      const payload = response?.data ?? response;
      const message = response?.message || "";

      if (
        payload?.allGenerated ||
        message.toLowerCase().includes("already generated")
      ) {
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
      toast.error(
        err?.response?.data?.message || "Failed to generate certificates"
      );
    } finally {
      setLoading(false);
    }
  };

  const isCorner = variant === "corner";
  const label = isCorner ? "Generate" : "Generate certificates";

  const button = (
    <Button
      variant="contained"
      size="small"
      fullWidth={!isCorner && fullWidth}
      disabled={loading}
      onClick={handleClick}
      startIcon={
        loading ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <Sparkles size={14} strokeWidth={2.5} />
        )
      }
      sx={{
        ...(isCorner ? cornerButtonSx : {
          backgroundColor: "#2e7d5a",
          "&:hover": { backgroundColor: "#256b4d" }
        }),
        ...sx
      }}
    >
      {label}
    </Button>
  );

  if (isCorner) {
    return (
      <Tooltip title="Generate event certificates" arrow placement="top">
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
