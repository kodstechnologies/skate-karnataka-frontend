import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Chip,
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import { Mail, LogIn, ArrowLeft, CheckCircle2, ShieldCheck, Timer, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getHomePathForRole } from "@/lib/role-navigation";
import toast from "react-hot-toast";
import logo from "@/assets/karnataka-roller-skating-logo.png";
import clubHero from "@/assets/Club_header.jpg";
import districtHero from "@/assets/District_header.jpg";
import stateHero from "@/assets/State_header.jpg";
import skatingHero from "@/assets/Skating_header.jpg";
import { getFCMToken } from "@/firebase/fcm";

// ── Portal config ────────────────────────────────────────────────────────
const PORTAL_CONFIG = {
  club: {
    label: "Club Portal",
    tagline: "Manage your club, members and events",
    hero: clubHero,
    accent: "#f6765e",
    accentDark: "#e85d44",
    accentLight: "#ff8c75",
    chips: ["Members", "Events", "Media"],
  },
  district: {
    label: "District Portal",
    tagline: "Oversee clubs and district-level events",
    hero: districtHero,
    accent: "#FD866F",
    accentDark: "#e8724f",
    accentLight: "#ff9d8a",
    chips: ["Clubs", "Skaters", "Reports"],
  },
  state: {
    label: "State Portal",
    tagline: "State-wide administration and reporting",
    hero: stateHero,
    accent: "#FD866F",
    accentDark: "#e8724f",
    accentLight: "#ff9d8a",
    chips: ["Events", "Officials", "Gallery"],
  },
};

const DEFAULT_CONFIG = {
  label: "Admin Portal",
  tagline: "Welcome back to Skate Karnataka",
  hero: skatingHero,
  accent: "#f6765e",
  accentDark: "#e85d44",
  accentLight: "#ff8c75",
  chips: [],
};

// ── OTP box ──────────────────────────────────────────────────────────────
const OtpBox = ({ index, value, onChange, onKeyDown, inputRef, filled, accent }) => (
  <Box sx={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={(e) => onChange(e, index)}
      onKeyDown={(e) => onKeyDown(e, index)}
      inputProps={{
        maxLength: 1,
        style: {
          textAlign: "center",
          fontSize: "1.35rem",
          fontWeight: 800,
          padding: 0,
          color: filled ? "#2e7d32" : "#2f2829",
          caretColor: accent,
        },
      }}
      sx={{
        width: "100%",
        height: "100%",
        "& .MuiOutlinedInput-root": {
          height: "100%",
          borderRadius: "14px",
          backgroundColor: filled ? alpha("#2e7d32", 0.06) : "#f9f6f5",
          transition: "all 0.2s ease",
          "& fieldset": {
            border: filled ? "2px solid #2e7d32" : "1.5px solid #e8ddd9",
          },
          "&:hover fieldset": { borderColor: filled ? "#2e7d32" : accent },
          "&.Mui-focused fieldset": {
            borderColor: filled ? "#2e7d32" : accent,
            borderWidth: "2px",
            boxShadow: `0 0 0 4px ${filled ? alpha("#2e7d32", 0.1) : alpha(accent, 0.12)}`,
          },
        },
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: filled ? "60%" : "0%",
        height: "3px",
        backgroundColor: "#2e7d32",
        borderRadius: "2px",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    />
  </Box>
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getEmailError = (val) => {
  if (!val) return "";
  if (!EMAIL_REGEX.test(val)) return "Enter a valid email address";
  return "";
};

// ── Main Component ────────────────────────────────────────────────────────
export const LoginPage = ({ portalRole: portalRoleProp = "" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalRole = portalRoleProp || searchParams.get("role") || "";
  const config = PORTAL_CONFIG[portalRole] || DEFAULT_CONFIG;
  const { accent, accentDark, accentLight } = config;

  const requestLoginOtp = useAuthStore((state) => state.requestLoginOtp);
  const verifyLoginOtp = useAuthStore((state) => state.verifyLoginOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const homePath = getHomePathForRole(role);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (isAuthenticated) navigate(getHomePathForRole(role), { replace: true });
  }, [isAuthenticated, navigate, role]);

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [userId, setUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [fcmToken, setFcmToken] = useState(null);

  const otpRefs = useRef([]);
  const emailError = getEmailError(identifier);
  const isEmailValid = EMAIL_REGEX.test(identifier);
  const otpValue = otpDigits.join("");
  const isOtpExpired = timeLeft === 0;

  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const timerMinutes = Math.floor(timeLeft / 60);
  const timerSeconds = timeLeft % 60;
  const timerColor = timeLeft > 120 ? "#2e7d32" : timeLeft > 60 ? "#ed6c02" : "#d32f2f";

  const handleEmailChange = (e) => setIdentifier(e.target.value.trim());

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const data = await requestLoginOtp(identifier);
      if (data && data.type) {
        const userRole = data.type.toLowerCase();
        if (!["admin", "state", "club", "district"].includes(userRole)) {
          toast.dismiss();
          toast.error("This account type cannot sign in on the web portal.");
          return;
        }
      }
      setUserId(data.id);
      setTimeLeft(300);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 350);
      getFCMToken().then((token) => {
        if (token) {
          setFcmToken(token);
          localStorage.setItem("fcm_token", token);
          localStorage.setItem("fcm_token_version", "v2-sw-pinned");
        }
      }).catch(() => {});
    } catch (error) {
      console.error("Request OTP failed:", error);
    }
  };

  const handleOtpChange = useCallback((e, index) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    if (char && index < 3) otpRefs.current[index + 1]?.focus();
  }, [otpDigits]);

  const handleOtpKeyDown = useCallback((e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }, [otpDigits]);

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const tokenForLogin = fcmToken || localStorage.getItem("fcm_token");
      const result = await verifyLoginOtp(userId, otpValue, tokenForLogin);
      navigate(getHomePathForRole(result?.role || useAuthStore.getState().role));
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleChangeEmail = () => { setStep(1); setOtpDigits(["", "", "", ""]); setUserId(""); setTimeLeft(300); };

  const handleResendOtp = async () => {
    try {
      const data = await requestLoginOtp(identifier);
      setUserId(data.id);
      setOtpDigits(["", "", "", ""]);
      setTimeLeft(300);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      console.error("Resend OTP failed:", error);
    }
  };

  if (isAuthenticated) return <Navigate to={homePath} replace />;

  const primaryBtnSx = {
    py: 1.85,
    borderRadius: "14px",
    background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
    fontWeight: 800,
    fontSize: "1rem",
    textTransform: "none",
    boxShadow: `0 10px 28px ${alpha(accent, 0.32)}`,
    "&:hover:not(:disabled)": {
      background: `linear-gradient(135deg, ${accentDark} 0%, ${accent} 100%)`,
      boxShadow: `0 16px 36px ${alpha(accent, 0.42)}`,
      transform: "translateY(-2px)",
    },
    "&:active": { transform: "translateY(0)" },
    "&:disabled": { opacity: 0.55, boxShadow: "none" },
    transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", backgroundColor: "#FFFFFF" }}>
      {/* ══ LEFT — hero panel ══════════════════════════════════════════════ */}
      {!isMobile && (
        <Box
          sx={{
            flex: "0 0 46%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            p: 5,
          }}
        >
          {/* Hero image */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${config.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: "scale(1.02)",
            }}
          />
          {/* Gradient overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(160deg, ${alpha(accentDark, 0.55)} 0%, rgba(15,10,12,0.72) 100%)`,
            }}
          />
          {/* Accent top bar */}
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${accent}, ${accentLight})` }} />

          {/* Content over hero */}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 52,
                width: 52,
                borderRadius: "14px",
                border: "1.5px solid rgba(255,255,255,0.2)",
                p: "6px",
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                mb: 3,
              }}
            />
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "2.4rem",
                letterSpacing: "-0.05em",
                color: "#fff",
                lineHeight: 1.1,
                mb: 1.5,
              }}
            >
              {config.label}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1rem",
                lineHeight: 1.6,
                maxWidth: 340,
                mb: 3,
              }}
            >
              {config.tagline}
            </Typography>

            {/* Feature chips */}
            {config.chips.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {config.chips.map((chip) => (
                  <Chip
                    key={chip}
                    label={chip}
                    size="small"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}

      {/* ══ RIGHT — form panel ════════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 3, sm: 6, md: 7 },
          py: { xs: 5, md: 6 },
          maxWidth: { md: 520 },
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Back link */}
        <Button
          onClick={() => navigate("/web")}
          startIcon={<ArrowLeft size={15} />}
          sx={{
            alignSelf: "flex-start",
            color: "#9e8f8b",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            px: 0,
            mb: 4,
            "&:hover": { backgroundColor: "transparent", color: accent },
          }}
        >
          Back
        </Button>

        {/* Mobile logo */}
        {isMobile && (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 44, width: 44, borderRadius: "12px", border: "1px solid #efe2dc", p: "5px" }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#2f2829", letterSpacing: "-0.03em" }}>
              {config.label}
            </Typography>
          </Stack>
        )}

        {/* Step heading */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.9rem", md: "2.2rem" },
              letterSpacing: "-0.05em",
              color: "#2f2829",
              lineHeight: 1.1,
              mb: 0.75,
            }}
          >
            {step === 1 ? "Sign In" : "Verify OTP"}
          </Typography>
          <Typography sx={{ color: "#9e8f8b", fontSize: "0.92rem" }}>
            {step === 1
              ? "Enter your registered email address"
              : (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  OTP sent to&nbsp;
                  <Chip
                    icon={<CheckCircle2 size={13} color={accentDark} />}
                    label={identifier}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      backgroundColor: alpha(accent, 0.1),
                      color: accentDark,
                      border: `1px solid ${alpha(accent, 0.25)}`,
                      "& .MuiChip-icon": { ml: "5px" },
                    }}
                  />
                </Box>
              )}
          </Typography>
        </Box>

        {/* ── STEP 1: Email ── */}
        <Fade in={step === 1} unmountOnExit>
          <Box component="form" onSubmit={handleRequestOtp} sx={{ display: step === 1 ? "block" : "none" }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={identifier}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError || (isEmailValid ? "✓ Valid email address" : "Enter your email")}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={17} style={{ color: "#b8a9a4" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    height: 58,
                    backgroundColor: identifier.length > 0 ? alpha("#2e7d32", 0.04) : "#faf7f6",
                    "& fieldset": {
                      border: identifier.length > 0 ? "1.5px solid #2e7d32" : "1.5px solid #e8ddd9",
                    },
                    "&:hover fieldset": { borderColor: accent },
                    "&.Mui-focused fieldset": {
                      borderColor: accent,
                      borderWidth: "2px",
                      boxShadow: `0 0 0 4px ${alpha(accent, 0.1)}`,
                    },
                  },
                  "& .MuiFormHelperText-root": {
                    fontWeight: 600,
                    fontSize: "0.74rem",
                    color: isEmailValid ? "#2e7d32" : emailError ? "#d32f2f" : "#b0a09b",
                    mt: 0.75,
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading || !isEmailValid}
                sx={primaryBtnSx}
              >
                {isLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={19} sx={{ color: "white" }} />
                    Sending OTP…
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LogIn size={19} />
                    Send OTP
                  </Box>
                )}
              </Button>
            </Stack>
          </Box>
        </Fade>

        {/* ── STEP 2: OTP ── */}
        <Fade in={step === 2} unmountOnExit>
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ display: step === 2 ? "block" : "none" }}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#8a7b77", mb: 2, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.7rem" }}>
                  Enter 4-digit OTP
                </Typography>

                <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }} onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <OtpBox
                      key={i}
                      index={i}
                      value={digit}
                      filled={!!digit}
                      accent={accent}
                      inputRef={(el) => (otpRefs.current[i] = el)}
                      onChange={handleOtpChange}
                      onKeyDown={handleOtpKeyDown}
                    />
                  ))}

                  {/* Progress indicator */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 1 }}>
                    {otpValue.length === 4 ? (
                      <Fade in>
                        <Stack alignItems="center" spacing={0.25}>
                          <ShieldCheck size={26} color="#2e7d32" />
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#2e7d32" }}>Ready</Typography>
                        </Stack>
                      </Fade>
                    ) : (
                      <Stack alignItems="center" spacing={0.25}>
                        <Box sx={{ position: "relative", width: 26, height: 26 }}>
                          <CircularProgress variant="determinate" value={100} size={26} sx={{ color: "#ede4e0", position: "absolute" }} />
                          <CircularProgress variant="determinate" value={(otpValue.length / 4) * 100} size={26} sx={{ color: accent, position: "absolute" }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#b0a09b" }}>{otpValue.length}/4</Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* Timer */}
                  <Box
                    sx={{
                      ml: "auto",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.25,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Timer size={11} color="#9e8f8b" />
                      <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#9e8f8b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {isOtpExpired ? "Expired" : "Expires"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        px: 1.25,
                        py: 0.6,
                        borderRadius: "10px",
                        backgroundColor: alpha(timerColor, 0.08),
                        border: `1.5px solid ${alpha(timerColor, 0.3)}`,
                        boxShadow: timeLeft <= 60 ? `0 0 10px ${alpha(timerColor, 0.2)}` : "none",
                        transition: "all 0.4s ease",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1.15rem",
                          fontWeight: 900,
                          fontFamily: "'Courier New', monospace",
                          color: timerColor,
                          lineHeight: 1,
                          minWidth: "2ch",
                          textAlign: "center",
                        }}
                      >
                        {String(timerMinutes).padStart(2, "0")}
                      </Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, fontFamily: "'Courier New', monospace", color: timerColor, lineHeight: 1, animation: !isOtpExpired ? "blinkColon 1s step-start infinite" : "none", "@keyframes blinkColon": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.15 } } }}>
                        :
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1.15rem",
                          fontWeight: 900,
                          fontFamily: "'Courier New', monospace",
                          color: timerColor,
                          lineHeight: 1,
                          minWidth: "2ch",
                          textAlign: "center",
                        }}
                      >
                        {String(timerSeconds).padStart(2, "0")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading || otpValue.length < 4 || isOtpExpired}
                sx={primaryBtnSx}
              >
                {isLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={19} sx={{ color: "white" }} />
                    Verifying…
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShieldCheck size={19} />
                    Verify &amp; Login
                  </Box>
                )}
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Button
                  onClick={handleChangeEmail}
                  startIcon={<ArrowLeft size={15} />}
                  sx={{ color: "#9e8f8b", textTransform: "none", fontWeight: 600, fontSize: "0.88rem", px: 0, "&:hover": { backgroundColor: "transparent", color: accent } }}
                >
                  Change Email
                </Button>
                {isOtpExpired && (
                  <Fade in={isOtpExpired}>
                    <Button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.88rem", color: accent, px: 0, "&:hover": { backgroundColor: "transparent", color: accentDark } }}
                    >
                      {isLoading ? "Sending…" : "Resend OTP"}
                    </Button>
                  </Fade>
                )}
              </Box>
            </Stack>
          </Box>
        </Fade>

        <Typography sx={{ mt: 5, color: "#c9bab5", fontSize: "0.78rem", textAlign: "center" }}>
          © {new Date().getFullYear()} Karnataka Roller Skating Association
        </Typography>
      </Box>
    </Box>
  );
};
