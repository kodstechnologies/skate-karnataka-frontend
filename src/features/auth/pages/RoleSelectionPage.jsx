import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Building2, MapPin, Shield } from "lucide-react";
import logo from "@/assets/karnataka-roller-skating-logo.png";

const BRAND = "#f6765e";
const BRAND_DARK = "#e85d44";

const RoleCard = ({ title, description, icon: Icon, to, color }) => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(to)}
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: "280px", md: "300px" },
        maxWidth: "360px",
        p: 4,
        borderRadius: "28px",
        border: "2px solid #f3ebe6",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        "&:hover": {
          transform: "translateY(-8px)",
          borderColor: color,
          boxShadow: `0 24px 48px ${color}22`,
          "& .icon-wrapper": {
            transform: "scale(1.1)",
            backgroundColor: color,
            "& svg": { color: "#fff" }
          },
          "& .continue-btn": {
            backgroundColor: color,
            color: "#fff"
          }
        }
      }}
    >
      <Box
        className="icon-wrapper"
        sx={{
          width: 80,
          height: 80,
          borderRadius: "24px",
          backgroundColor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          "& svg": {
            color: color,
            transition: "color 0.35s ease"
          }
        }}
      >
        <Icon size={36} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: "#2f2829",
          mb: 1.5,
          letterSpacing: "-0.03em"
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "#8d7f7b",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          mb: 3,
          flexGrow: 1
        }}
      >
        {description}
      </Typography>

      <Button
        className="continue-btn"
        variant="outlined"
        sx={{
          borderRadius: "16px",
          px: 4,
          py: 1.5,
          fontWeight: 700,
          fontSize: "0.9rem",
          textTransform: "none",
          borderColor: color,
          color: color,
          transition: "all 0.35s ease",
          "&:hover": {
            backgroundColor: color,
            borderColor: color
          }
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export const RoleSelectionPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const roles = [
    {
      title: "Club",
      description: "Manage club activities, members, events, and media for your skating club.",
      icon: Building2,
      to: "/club/login",
      color: "#f6765e"
    },
    {
      title: "District",
      description: "Oversee district operations, manage clubs, skaters, and coordinate events.",
      icon: MapPin,
      to: "/district/login",
      color: "#53c7c5"
    },
    {
      title: "State",
      description: "Administer state-wide skating programs, approvals, and official activities.",
      icon: Shield,
      to: "/state/login",
      color: "#8e82ff"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff9f6 0%, #ffffff 50%, #f8f4f2 100%)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 4,
          px: 3,
          borderBottom: "1px solid #f3ebe6",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)"
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              component="img"
              src={logo}
              alt="KRSA Logo"
              sx={{
                height: 50,
                width: 50,
                borderRadius: "14px",
                border: "1px solid #efe2dc",
                p: 0.5,
                backgroundColor: "white"
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  color: "#2f2829",
                  letterSpacing: "-0.02em"
                }}
              >
                KRSA
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#b19f99", fontWeight: 500 }}>
                Management Portal
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", py: 6, px: 3 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.75rem" },
                color: "#2f2829",
                letterSpacing: "-0.04em",
                mb: 2
              }}
            >
              Select your management dashboard
            </Typography>
            <Typography
              sx={{
                color: "#8d7f7b",
                fontSize: "1.1rem",
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.7
              }}
            >
              Choose your role to access the appropriate management tools for Karnataka Roller Skating Association.
            </Typography>
          </Box>

          {/* Role Cards */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{
              justifyContent: "center",
              alignItems: { xs: "center", md: "stretch" }
            }}
          >
            {roles.map((role) => (
              <RoleCard key={role.title} {...role} />
            ))}
          </Stack>

          {/* Footer Info */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              sx={{
                color: "#b19f99",
                fontSize: "0.85rem",
                fontWeight: 500
              }}
            >
              Need help? Contact your administrator for access credentials.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          px: 3,
          borderTop: "1px solid #f3ebe6",
          textAlign: "center"
        }}
      >
        <Typography sx={{ color: "#b19f99", fontSize: "0.82rem" }}>
          © {new Date().getFullYear()} Karnataka Roller Skating Association. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
