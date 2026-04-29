import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Chip,
  CircularProgress,
  LinearProgress,
  Fade,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import { Phone, LogIn, ArrowLeft, CheckCircle2, ShieldCheck, Timer } from "lucide-react";
import { useLottie } from "lottie-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import skateLottie from "@/assets/LottieFiles/SkateboardingBoy.json";
import logo from "@/assets/karnataka-roller-skating-logo.png";

const BRAND = "#f6765e";
const BRAND_DARK = "#e85d44";
const BRAND_LIGHT = "#ff8c75";

// ─── Country codes list ────────────────────────────────────────────────────
const COUNTRY_CODES = [{ flag: "🇮🇳", code: "+91", label: "India" }];

// ─── Individual OTP digit box ──────────────────────────────────────────────
const OtpBox = ({ index, value, onChange, onKeyDown, inputRef, filled }) => (
  <Box
    sx={{
      position: "relative",
      width: 56,
      height: 56,
      flexShrink: 0
    }}
  >
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
          letterSpacing: 0,
          color: filled ? "#2e7d32" : "#2f2829",
          caretColor: BRAND
        }
      }}
      sx={{
        width: "100%",
        height: "100%",
        "& .MuiOutlinedInput-root": {
          height: "100%",
          borderRadius: "14px",
          backgroundColor: filled ? alpha("#2e7d32", 0.06) : "#fbf6f4",
          transition: "all 0.2s ease",
          "& fieldset": {
            border: filled ? `2px solid #2e7d32` : "1.5px solid #efe2dc",
            transition: "border-color 0.2s ease"
          },
          "&:hover fieldset": { borderColor: filled ? "#2e7d32" : BRAND },
          "&.Mui-focused fieldset": {
            borderColor: filled ? "#2e7d32" : BRAND,
            borderWidth: "2px",
            boxShadow: `0 0 0 4px ${filled ? alpha("#2e7d32", 0.12) : alpha(BRAND, 0.12)}`
          }
        }
      }}
    />
    {/* Bottom animated bar */}
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
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)"
      }}
    />
  </Box>
);

// ─── Phone validation helper ───────────────────────────────────────────────
const getPhoneError = (val) => {
  if (!val) return "";
  if (val.length < 10)
    return `${10 - val.length} more digit${10 - val.length !== 1 ? "s" : ""} needed`;
  if (/^[0-4]/.test(val)) return "Enter a valid Indian mobile number";
  return "";
};

// ─── Main Component ────────────────────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const { requestLoginOtp, verifyLoginOtp, isLoading } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { View: LottieView } = useLottie({ animationData: skateLottie, loop: true });

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [userId, setUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [countryCode, setCountryCode] = useState("+91");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const otpRefs = useRef([]);
  const phoneError = getPhoneError(identifier);
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
  const otpValue = otpDigits.join("");
  const isOtpExpired = timeLeft === 0;

  // Timer countdown — starts/resets when entering step 2
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Derived timer display values
  const timerMinutes = Math.floor(timeLeft / 60);
  const timerSeconds = timeLeft % 60;
  const timerLabel = `${String(timerMinutes).padStart(2, "0")}:${String(timerSeconds).padStart(2, "0")}`;
  const timerPercent = (timeLeft / 300) * 100;
  const timerColor = timeLeft > 120 ? "#2e7d32" : timeLeft > 60 ? "#ed6c02" : "#d32f2f";

  // ── Handlers ────────────────────────────────────────────────────────────
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setIdentifier(val);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const data = await requestLoginOtp(identifier);
      setUserId(data.id);
      setTimeLeft(300);
      setStep(2);
      // Auto-focus first OTP box after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 350);
    } catch (error) {
      console.error("Request OTP failed:", error);
    }
  };

  const handleOtpChange = useCallback(
    (e, index) => {
      const char = e.target.value.replace(/\D/g, "").slice(-1);
      const next = [...otpDigits];
      next[index] = char;
      setOtpDigits(next);
      if (char && index < 3) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handleOtpKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      // Allow paste across all boxes
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) return;
    },
    [otpDigits]
  );

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 3);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyLoginOtp(userId, otpValue);
      navigate("/dashboard");
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtpDigits(["", "", "", ""]);
    setUserId("");
    setTimeLeft(300);
  };

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

  // ── Shared button sx ────────────────────────────────────────────────────
  const primaryBtnSx = {
    py: 2,
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
    fontWeight: 800,
    fontSize: "1.05rem",
    textTransform: "none",
    letterSpacing: "0.01em",
    boxShadow: `0 12px 30px ${alpha(BRAND, 0.35)}`,
    "&:hover:not(:disabled)": {
      background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%)`,
      boxShadow: `0 18px 40px ${alpha(BRAND, 0.45)}`,
      transform: "translateY(-2px)"
    },
    "&:active": { transform: "translateY(0px)" },
    "&:disabled": { opacity: 0.6, boxShadow: "none" },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  // ── Common TextField sx ─────────────────────────────────────────────────
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      height: "60px",
      backgroundColor: identifier.length > 0 ? alpha("#2e7d32", 0.04) : "#fbf6f4",
      transition: "all 0.2s ease",
      "& fieldset": {
        border: identifier.length > 0 ? "1.5px solid #2e7d32" : "1.5px solid #efe2dc",
        transition: "border-color 0.2s ease"
      },
      "&:hover fieldset": { borderColor: "#2e7d32" },
      "&.Mui-focused fieldset": {
        borderColor: "#2e7d32",
        borderWidth: "2px",
        boxShadow: `0 0 0 4px ${alpha("#2e7d32", 0.12)}`
      }
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2e7d32" }
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <Box className="min-h-screen w-full flex bg-white overflow-y-auto relative custom-scrollbar">
      <Box className="flex flex-col md:flex-row w-full min-h-screen">
        {/* ═══════════════ LEFT — Visual ═══════════════ */}
        <Box
          className="flex-[0_0_auto] md:flex-[1.15] flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 text-center relative overflow-hidden min-h-[40vh] md:min-h-screen"
          sx={{ background: `linear-gradient(145deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "40%",
              height: "40%",
              background: "rgba(255,255,255,0.08)",
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
              background: "rgba(0,0,0,0.05)",
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
              transform: { md: "translateY(-40px)" }
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

        {/* ═══════════════ RIGHT — Form ═══════════════ */}
        <Box className="flex-1 flex flex-col justify-center bg-white w-full mx-auto p-8 sm:p-12 md:p-16 md:max-w-[600px] min-h-auto md:min-h-screen">
          {/* Logo + Header */}
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
              {step === 1 ? "Sign In" : "Verify OTP"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#8d7f7b", fontWeight: 400 }}>
              {step === 1 ? (
                "Enter your registered mobile number"
              ) : (
                <Box
                  component="span"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                >
                  OTP sent to&nbsp;
                  <Chip
                    icon={<CheckCircle2 size={14} color={BRAND_DARK} />}
                    label={`${countryCode} ${identifier}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      backgroundColor: alpha(BRAND, 0.1),
                      color: BRAND_DARK,
                      border: `1px solid ${alpha(BRAND, 0.3)}`,
                      "& .MuiChip-icon": { ml: "6px" }
                    }}
                  />
                </Box>
              )}
            </Typography>
          </Box>

          {/* ── STEP 1: Phone Number ── */}
          <Fade in={step === 1} unmountOnExit>
            <Box
              component="form"
              onSubmit={handleRequestOtp}
              sx={{ display: step === 1 ? "block" : "none" }}
            >
              <Stack spacing={2.5}>
                {/* Country code + phone field */}
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  {/* Country code selector */}
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    variant="outlined"
                    renderValue={(val) => {
                      const c = COUNTRY_CODES.find((x) => x.code === val) || COUNTRY_CODES[0];
                      return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography sx={{ fontSize: "1.2rem", lineHeight: 1 }}>
                            {c.flag}
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 700, color: "#2f2829", fontSize: "0.9rem" }}
                          >
                            {val}
                          </Typography>
                        </Box>
                      );
                    }}
                    sx={{
                      height: "60px",
                      borderRadius: "16px",
                      backgroundColor: "#fbf6f4",
                      flexShrink: 0,
                      minWidth: "90px",
                      "& .MuiOutlinedInput-notchedOutline": { border: "1.5px solid #efe2dc" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BRAND },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: BRAND,
                        borderWidth: "2px"
                      },
                      "& .MuiSelect-select": { py: 0, display: "flex", alignItems: "center" }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "14px",
                          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                          mt: 1
                        }
                      }
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <MenuItem
                        key={`${c.label}-${c.code}`}
                        value={c.code}
                        sx={{ gap: 1.5, borderRadius: "8px", mx: 0.5, my: 0.25 }}
                      >
                        <Typography sx={{ fontSize: "1.1rem" }}>{c.flag}</Typography>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#2f2829", flex: 1 }}
                        >
                          {c.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#8d7f7b" }}>
                          {c.code}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>

                  {/* Phone input */}
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    placeholder="98765 43210"
                    variant="outlined"
                    type="tel"
                    required
                    autoFocus
                    inputProps={{ maxLength: 10 }}
                    value={identifier}
                    onChange={handlePhoneChange}
                    error={!!phoneError}
                    helperText={
                      phoneError ||
                      (identifier.length === 10
                        ? "✓ Valid mobile number"
                        : `${identifier.length}/10 digits`)
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone size={18} style={{ color: "#b19f99" }} />
                          </InputAdornment>
                        )
                      }
                    }}
                    sx={{
                      ...inputSx,
                      "& .MuiFormHelperText-root": {
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color:
                          identifier.length === 10 && !phoneError
                            ? "#2e7d32"
                            : phoneError
                              ? "#d32f2f"
                              : "#b19f99",
                        mt: 0.75,
                        ml: 0.5
                      }
                    }}
                  />
                </Box>

                {/* Progress dots */}
                <Box sx={{ display: "flex", gap: 0.75, px: 0.5 }}>
                  {[...Array(10)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        height: "3px",
                        borderRadius: "2px",
                        backgroundColor: i < identifier.length ? "#2e7d32" : "#efe2dc",
                        transition: "background-color 0.15s ease"
                      }}
                    />
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={isLoading || identifier.length !== 10 || !!phoneError}
                  sx={primaryBtnSx}
                >
                  {isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CircularProgress size={20} sx={{ color: "white" }} />
                      Sending OTP…
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LogIn size={20} />
                      Send OTP
                    </Box>
                  )}
                </Button>
              </Stack>
            </Box>
          </Fade>

          {/* ── STEP 2: OTP ── */}
          <Fade in={step === 2} unmountOnExit>
            <Box
              component="form"
              onSubmit={handleVerifyOtp}
              sx={{ display: step === 2 ? "block" : "none" }}
            >
              <Stack spacing={3}>
                {/* OTP Boxes label */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#6b5c58",
                      mb: 2,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontSize: "0.72rem"
                    }}
                  >
                    Enter 4-digit OTP
                  </Typography>

                  {/* Industrial OTP boxes */}
                  <Box
                    sx={{ display: "flex", gap: 1.25, alignItems: "center", width: "100%" }}
                    onPaste={handleOtpPaste}
                  >
                    {otpDigits.map((digit, i) => (
                      <OtpBox
                        key={i}
                        index={i}
                        value={digit}
                        filled={!!digit}
                        inputRef={(el) => (otpRefs.current[i] = el)}
                        onChange={handleOtpChange}
                        onKeyDown={handleOtpKeyDown}
                      />
                    ))}

                    {/* Status indicator */}
                    <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                      {otpValue.length === 4 ? (
                        <Fade in>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5
                            }}
                          >
                            <ShieldCheck size={28} color="#2e7d32" />
                            <Typography
                              sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#2e7d32" }}
                            >
                              Ready
                            </Typography>
                          </Box>
                        </Fade>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5
                          }}
                        >
                          <Box sx={{ position: "relative", width: 28, height: 28 }}>
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={28}
                              sx={{ color: "#efe2dc", position: "absolute" }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={(otpValue.length / 4) * 100}
                              size={28}
                              sx={{ color: BRAND, position: "absolute" }}
                            />
                          </Box>
                          <Typography
                            sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#b19f99" }}
                          >
                            {otpValue.length}/4
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Industrial Digital Clock */}
                    <Box
                      sx={{
                        ml: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.25
                      }}
                    >
                      {/* Clock label */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                        <Timer size={11} color="#8d7f7b" />
                        <Typography
                          sx={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            color: "#8d7f7b",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase"
                          }}
                        >
                          {isOtpExpired ? "Expired" : "Expires"}
                        </Typography>
                      </Box>

                      {/* Digit display */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: "12px",
                          backgroundColor: alpha(timerColor, 0.08),
                          border: `1.5px solid ${alpha(timerColor, 0.35)}`,
                          boxShadow:
                            timeLeft <= 60 ? `0 0 10px ${alpha(timerColor, 0.25)}` : "none",
                          transition: "all 0.4s ease",
                          animation:
                            timeLeft <= 30 && !isOtpExpired
                              ? "urgentPulse 1s ease-in-out infinite"
                              : "none",
                          "@keyframes urgentPulse": {
                            "0%, 100%": { boxShadow: `0 0 6px ${alpha(timerColor, 0.2)}` },
                            "50%": { boxShadow: `0 0 16px ${alpha(timerColor, 0.5)}` }
                          }
                        }}
                      >
                        {/* Minutes */}
                        <Typography
                          sx={{
                            fontSize: "1.25rem",
                            fontWeight: 900,
                            fontFamily: "'Courier New', monospace",
                            color: timerColor,
                            lineHeight: 1,
                            letterSpacing: "-0.02em",
                            transition: "color 0.4s ease",
                            minWidth: "2ch",
                            textAlign: "center"
                          }}
                        >
                          {String(timerMinutes).padStart(2, "0")}
                        </Typography>

                        {/* Blinking colon */}
                        <Typography
                          sx={{
                            fontSize: "1.25rem",
                            fontWeight: 900,
                            fontFamily: "'Courier New', monospace",
                            color: timerColor,
                            lineHeight: 1,
                            opacity: isOtpExpired ? 1 : undefined,
                            animation: !isOtpExpired ? "blinkColon 1s step-start infinite" : "none",
                            "@keyframes blinkColon": {
                              "0%, 100%": { opacity: 1 },
                              "50%": { opacity: 0.15 }
                            },
                            transition: "color 0.4s ease"
                          }}
                        >
                          :
                        </Typography>

                        {/* Seconds */}
                        <Typography
                          sx={{
                            fontSize: "1.25rem",
                            fontWeight: 900,
                            fontFamily: "'Courier New', monospace",
                            color: timerColor,
                            lineHeight: 1,
                            letterSpacing: "-0.02em",
                            transition: "color 0.4s ease",
                            minWidth: "2ch",
                            textAlign: "center"
                          }}
                        >
                          {String(timerSeconds).padStart(2, "0")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Verify button */}
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
                      <CircularProgress size={20} sx={{ color: "white" }} />
                      Verifying…
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ShieldCheck size={20} />
                      Verify &amp; Login
                    </Box>
                  )}
                </Button>

                {/* Resend / Change Number row */}
                <Box
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <Button
                    onClick={handleChangeNumber}
                    startIcon={<ArrowLeft size={16} />}
                    sx={{
                      color: "#8d7f7b",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      px: 0,
                      "&:hover": { backgroundColor: "transparent", color: BRAND }
                    }}
                  >
                    Change Number
                  </Button>

                  {isOtpExpired && (
                    <Fade in={isOtpExpired}>
                      <Button
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: BRAND,
                          px: 0,
                          "&:hover": { backgroundColor: "transparent", color: BRAND_DARK }
                        }}
                      >
                        {isLoading ? "Sending…" : "Resend OTP"}
                      </Button>
                    </Fade>
                  )}
                </Box>
              </Stack>
            </Box>
          </Fade>

          {/* Footer */}
          <Box sx={{ mt: { xs: 4, md: 6 }, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#b19f99", fontSize: "0.82rem" }}>
              © {new Date().getFullYear()} Karnataka Roller Skating Association
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
