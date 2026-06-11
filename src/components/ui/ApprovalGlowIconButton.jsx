import { Box, IconButton, Tooltip } from "@mui/material";

const glowKeyframes = {
  "@keyframes approvalIconGlow": {
    "0%, 100%": {
      boxShadow:
        "0 0 0 2px rgba(246, 118, 94, 0.55), 0 0 10px rgba(246, 118, 94, 0.35)",
      transform: "scale(1)"
    },
    "50%": {
      boxShadow:
        "0 0 0 3px rgba(246, 118, 94, 0.85), 0 0 16px rgba(246, 118, 94, 0.55)",
      transform: "scale(1.03)"
    }
  },
  "@keyframes approvalIconGlowTeal": {
    "0%, 100%": {
      boxShadow:
        "0 0 0 2px rgba(0, 137, 123, 0.55), 0 0 10px rgba(0, 137, 123, 0.35)",
      transform: "scale(1)"
    },
    "50%": {
      boxShadow:
        "0 0 0 3px rgba(0, 137, 123, 0.85), 0 0 16px rgba(0, 137, 123, 0.55)",
      transform: "scale(1.03)"
    }
  }
};

export const ApprovalGlowIconButton = ({
  glow = false,
  dot = false,
  dotColor = "#e53935",
  glowVariant = "coral",
  title,
  ariaLabel,
  onClick,
  children,
  sx = {}
}) => {
  const showGlow = Boolean(glow);
  const glowAnimation =
    glowVariant === "teal"
      ? "approvalIconGlowTeal 1.8s ease-in-out infinite"
      : "approvalIconGlow 1.8s ease-in-out infinite";

  const tooltipTitle = dot || showGlow ? `${title} — pending approval` : title;

  const button = (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      sx={{
        ...glowKeyframes,
        ...(showGlow || dot ? { position: "relative" } : {}),
        ...(showGlow ? { animation: glowAnimation } : {}),
        ...sx
      }}
    >
      {children}
      {dot ? (
        <Box
          sx={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 9,
            height: 9,
            borderRadius: "50%",
            backgroundColor: dotColor,
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />
      ) : null}
    </IconButton>
  );

  if (dot || showGlow) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};
