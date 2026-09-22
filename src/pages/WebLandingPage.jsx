import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Chip, alpha } from "@mui/material";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/karnataka-roller-skating-logo.png";
import clubHero from "@/assets/Club_header.jpg";
import districtHero from "@/assets/District_header.jpg";
import stateHero from "@/assets/State_header.jpg";

const PORTALS = [
  {
    key: "club",
    label: "Club Portal",
    tagline: "Manage members & events",
    chips: ["Members", "Events", "Media"],
    hero: clubHero,
    accent: "#f6765e",
    path: "/club/login",
  },
  {
    key: "district",
    label: "District Portal",
    tagline: "Oversee clubs & skaters",
    chips: ["Clubs", "Skaters", "Reports"],
    hero: districtHero,
    accent: "#FD866F",
    path: "/district/login",
  },
  {
    key: "state",
    label: "State Portal",
    tagline: "State-wide administration",
    chips: ["Events", "Officials", "Gallery"],
    hero: stateHero,
    accent: "#FD866F",
    path: "/state/login",
  },
];

export const WebLandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 3, sm: 4, md: 6 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background blobs */}
      <Box sx={{ position: "absolute", top: "-10%", left: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(246,118,94,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: "-8%", right: "-4%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,126,234,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: "40%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(17,153,142,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
  <Stack
  alignItems="center"
  spacing={1.5}
  sx={{
    mb: { xs: 4, md: 5 },
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 1000,
  }}
>
  <Box
    component="img"
    src={logo}
    alt="Skate Karnataka"
    sx={{
      height: { xs: 72, md: 88 },
      width: { xs: 72, md: 88 },
      alignSelf: "center",
      display: "block",
      borderRadius: "24px",
      border: "1.5px solid #efe2dc",
      p: 1,
      backgroundColor: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    }}
  />

  <Box sx={{ textAlign: "center" }}>
    <Typography
      sx={{
        fontWeight: 900,
        fontSize: { xs: "2rem", md: "3rem" },
        letterSpacing: "-0.05em",
        color: "#2f2829",
        lineHeight: 1.1,
      }}
    >
      Skate Karnataka
    </Typography>

    <Typography
      sx={{
        mt: 1,
        color: "#9e8f8b",
        fontSize: { xs: "0.95rem", md: "1.05rem" },
        fontWeight: 400,
      }}
    >
      Choose your portal to continue
    </Typography>
  </Box>
</Stack>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }}
      >
        {PORTALS.map((portal) => (
          <Box
            key={portal.key}
            onClick={() => navigate(portal.path)}
            sx={{
              flex: 1,
              cursor: "pointer",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1.5px solid #f0e5e1",
              background: "#FFFFFF",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
              position: "relative",
              "&:hover": {
                transform: "translateY(-8px)",
                border: `1.5px solid ${alpha(portal.accent, 0.4)}`,
                boxShadow: `0 24px 56px ${alpha(portal.accent, 0.15)}, 0 2px 16px rgba(0,0,0,0.06)`,
                "& .card-hero": { transform: "scale(1.06)" },
                "& .arrow-icon": { transform: "translateX(4px)" },
              },
              "&:active": { transform: "translateY(-3px)" },
            }}
          >
            {/* Hero image */}
            <Box sx={{ height: 140, overflow: "hidden", position: "relative" }}>
              <Box
                className="card-hero"
                sx={{
                  height: "100%",
                  backgroundImage: `url(${portal.hero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "transform 0.5s ease",
                }}
              />
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 100%)" }} />
              {/* accent top bar */}
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: portal.accent }} />
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#2f2829",
                  letterSpacing: "-0.03em",
                  mb: 0.5,
                }}
              >
                {portal.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: "#9e8f8b",
                  mb: 2,
                  lineHeight: 1.5,
                }}
              >
                {portal.tagline}
              </Typography>

              {/* Feature chips */}
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                {portal.chips.map((chip) => (
                  <Chip
                    key={chip}
                    label={chip}
                    size="small"
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      backgroundColor: alpha(portal.accent, 0.1),
                      color: portal.accent,
                      border: `1px solid ${alpha(portal.accent, 0.2)}`,
                      height: 22,
                    }}
                  />
                ))}
              </Stack>

              {/* CTA row */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pt: 2, borderTop: "1px solid #f5ece8" }}
              >
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: portal.accent,
                  }}
                >
                  Sign in
                </Typography>
                <ArrowRight
                  className="arrow-icon"
                  size={17}
                  color={portal.accent}
                  style={{ transition: "transform 0.2s ease" }}
                />
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>

      <Typography sx={{ mt: 4, color: "#c9bab5", fontSize: "0.75rem", position: "relative", zIndex: 1, width: "100%", maxWidth: 1000, textAlign: "center" }}>
        © {new Date().getFullYear()} Karnataka Roller Skating Association
      </Typography>
    </Box>
  );
};
