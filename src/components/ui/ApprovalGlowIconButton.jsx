import { Box, IconButton, Tooltip } from "@mui/material";

const glowKeyframes = {
  "@keyframes approvalIconGlow": {
    "0%, 100%": {
      boxShadow: "0 0 0 0 rgba(246, 118, 94, 0.35)",
      transform: "scale(1)"
    },
    "50%": {
      boxShadow: "0 0 0 6px rgba(246, 118, 94, 0.12)",
      transform: "scale(1.04)"
    }
  },
  "@keyframes approvalIconGlowTeal": {
    "0%, 100%": {
      boxShadow: "0 0 0 0 rgba(0, 137, 123, 0.35)",
      transform: "scale(1)"
    },
    "50%": {
      boxShadow: "0 0 0 6px rgba(0, 137, 123, 0.12)",
      transform: "scale(1.04)"
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
  const showGlow = glow && !dot;
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
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: dotColor,
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.08)",
            pointerEvents: "none"
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
