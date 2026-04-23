import { useLottie } from "lottie-react";
import { Button, Container, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import animationData from "@/assets/LottieFiles/404-Pagenotfound.json";
import HomeIcon from "@mui/icons-material/Home";

export const NotFoundPage = () => {
  const options = {
    animationData: animationData,
    loop: true
  };

  const { View: LottieView } = useLottie(options);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 4
        }}
      >
        <Box
          sx={{
            width: { xs: "300px", md: "500px" },
            mb: 4
          }}
        >
          {LottieView}
        </Box>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "primary.main",
            fontSize: { xs: "1.75rem", md: "3rem" }
          }}
        >
          Oops! Page Not Found
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: "600px" }}>
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </Typography>

        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "1.1rem",
            boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) => `0 12px 20px ${theme.palette.primary.main}4d`
            }
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};
