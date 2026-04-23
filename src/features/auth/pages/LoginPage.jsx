import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useLottie } from "lottie-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import skateLottie from "@/assets/LottieFiles/SkateboardingBoy.json";
import logo from "@/assets/karnataka-roller-skating-logo.png";

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const options = {
    animationData: skateLottie,
    loop: true
  };

  const { View: LottieView } = useLottie(options);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        backgroundColor: "white",
        overflowY: "auto",
        position: "relative"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          minHeight: "100vh"
        }}
      >
        {/* Left Side - Animation/Visual */}
        <Box
          sx={{
            flex: { xs: "0 0 auto", md: 1.15 },
            background: "linear-gradient(145deg, #f6765e 0%, #e85d44 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, sm: 6, md: 8 },
            textAlign: "center",
            position: "relative",
            minHeight: { xs: "40vh", md: "100vh" },
            overflow: "hidden"
          }}
        >
          {/* Decorative Background Elements */}
          <Box
            sx={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "40%",
              height: "40%",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "50%",
              filter: "blur(60px)",
              pointerEvents: "none"
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "-5%",
              right: "-5%",
              width: "30%",
              height: "30%",
              background: "rgba(0, 0, 0, 0.05)",
              borderRadius: "50%",
              filter: "blur(50px)",
              pointerEvents: "none"
            }}
          />

          <Stack
            spacing={0}
            sx={{
              alignItems: "center",
              position: "relative",
              zIndex: 1,
              transform: { md: "translateY(-40px)" } // Move content up slightly
            }}
          >
            <Box
              sx={{
                width: { xs: "140px", sm: "180px", md: "100%" },
                maxWidth: "400px",
                mb: { xs: 2, md: 3 },
                filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))"
              }}
            >
              {LottieView}
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                letterSpacing: "-0.04em",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                color: "#fffcf2",
                textShadow: "0 4px 15px rgba(0,0,0,0.12)"
              }}
            >
              Admin Portal
            </Typography>
            <Box
              sx={{
                width: "60px",
                height: "4px",
                backgroundColor: "#fff9f0",
                borderRadius: "2px",
                mb: 3,
                opacity: 0.8
              }}
            />
            <Typography
              sx={{
                color: "#ffebd6",
                maxWidth: "380px",
                fontSize: { xs: "0.9rem", md: "1.15rem" },
                lineHeight: 1.6,
                fontWeight: 500,
                opacity: 0.95
              }}
            >
              Welcome back to Skate Karnataka. Manage your skating community with precision and
              ease.
            </Typography>
          </Stack>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, sm: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "white",
            maxWidth: { md: "600px" },
            mx: "auto",
            width: "100%",
            minHeight: { xs: "auto", md: "100vh" }
          }}
        >
          <Box sx={{ mb: { xs: 3, md: 5 }, textAlign: { xs: "center", md: "left" } }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: { xs: 50, md: 70 },
                width: { xs: 50, md: 70 },
                mb: { xs: 2, md: 3 },
                borderRadius: "18px",
                border: "1px solid #efe2dc",
                p: 1,
                backgroundColor: "white",
                display: { xs: "inline-block", md: "block" },
                boxShadow: "0 8px 20px rgba(0,0,0,0.04)"
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#2f2829",
                mb: 1,
                letterSpacing: "-0.04em",
                fontSize: { xs: "1.75rem", md: "2.5rem" }
              }}
            >
              Sign In
            </Typography>
            <Typography variant="body1" sx={{ color: "#8d7f7b", fontWeight: 400 }}>
              Enter your credentials to access the dashboard
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} style={{ color: "#b19f99", marginRight: 4 }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "18px",
                    height: { xs: "56px", md: "60px" },
                    backgroundColor: "#fbf6f4",
                    "& fieldset": { border: "1px solid #efe2dc" },
                    "&:hover fieldset": { borderColor: "#f6765e" },
                    "&.Mui-focused fieldset": { borderColor: "#f6765e", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#f6765e" }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} style={{ color: "#b19f99", marginRight: 4 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#b19f99" }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "18px",
                    height: { xs: "56px", md: "60px" },
                    backgroundColor: "#fbf6f4",
                    "& fieldset": { border: "1px solid #efe2dc" },
                    "&:hover fieldset": { borderColor: "#f6765e" },
                    "&.Mui-focused fieldset": { borderColor: "#f6765e", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#f6765e" }
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    color: "#f6765e",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "transparent", opacity: 0.8 }
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={!loading && <LogIn size={24} />}
                sx={{
                  py: 2.25,
                  mt: 1,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  boxShadow: "0 15px 35px rgba(246, 118, 94, 0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ea6b54 0%, #f6765e 100%)",
                    boxShadow: "0 20px 45px rgba(246, 118, 94, 0.45)",
                    transform: "translateY(-2px)"
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {loading ? "Signing in..." : "Access Dashboard"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: { xs: 4, md: 6 }, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#b19f99", fontSize: "0.85rem" }}>
              © {new Date().getFullYear()} Karnataka Roller Skating Association
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
