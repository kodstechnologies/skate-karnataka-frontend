import { Box, Typography } from "@mui/material";
import { aboutUsCardHero } from "../about-us-card-assets";

export const AboutUsCardVisual = ({
  title,
  photoUrl,
  placeholderUrl = aboutUsCardHero,
  height = 260
}) => (
  <Box
    sx={{
      position: "relative",
      height,
      borderRadius: "20px",
      overflow: "hidden",
      background: "#1a1412",
      boxShadow: "0 20px 50px rgba(28,18,16,0.18)"
    }}
  >
    <Box
      component="img"
      src={photoUrl || placeholderUrl}
      alt={title || "Card"}
      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />

    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(12,8,7,0.82) 100%)",
        pointerEvents: "none"
      }}
    />

    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 2, pointerEvents: "none" }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          color: "#fff",
          textShadow: "0 2px 12px rgba(0,0,0,0.35)"
        }}
      >
        {title || "Card title"}
      </Typography>
    </Box>
  </Box>
);
