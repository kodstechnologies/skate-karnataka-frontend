import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useLottie } from "lottie-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import passwordLottie from "@/assets/LottieFiles/password.json";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, resetPassword, isLoading } = useAuthStore();

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const options = {
    animationData: passwordLottie,
    loop: true
  };

  const { View: LottieView } = useLottie(options);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp(email);
      setActiveStep(1);
    } catch (error) {
      console.error("Send OTP failed:", error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(email, otp);
      setActiveStep(2);
    } catch (error) {
      console.error("Verify OTP failed:", error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ email, newPassword, confirmPassword });
      navigate("/login");
    } catch (error) {
      console.error("Reset password failed:", error);
    }
  };

  const steps = ["Email", "Verify", "Reset"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#fff",
        flexDirection: { xs: "column", md: "row" }
      }}
    >
      {/* Left Side - Visual */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(145deg, #f6765e 0%, #e85d44 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 8 },
          textAlign: "center"
        }}
      >
        <Box
          sx={{
            width: { xs: "200px", md: "400px" },
            mb: 4,
            filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))"
          }}
        >
          {LottieView}
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: "white",
            mb: 2,
            fontSize: { xs: "1.75rem", md: "2.5rem" }
          }}
        >
          Reset Your Password
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.8)",
            maxWidth: "400px",
            fontSize: "1.1rem"
          }}
        >
          Follow the simple steps to securely reset your admin portal password.
        </Typography>
      </Box>

      {/* Right Side - Forms */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, md: 8 },
          maxWidth: { md: "600px" },
          mx: "auto",
          width: "100%"
        }}
      >
        <Button
          component={Link}
          to="/login"
          startIcon={<ArrowLeft size={18} />}
          sx={{
            alignSelf: "flex-start",
            mb: 4,
            color: "#8d7f7b",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#f6765e" }
          }}
        >
          Back to Login
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 800, color: "#2f2829", mb: 1 }}>
          Forgot Password?
        </Typography>
        <Typography variant="body1" sx={{ color: "#8d7f7b", mb: 4 }}>
          {activeStep === 0 && "Enter your email to receive a verification code."}
          {activeStep === 1 && `Verification code sent to ${email}`}
          {activeStep === 2 && "Enter your new password below."}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepIcon-root.Mui-active": { color: "#f6765e" },
                  "& .MuiStepIcon-root.Mui-completed": { color: "#f6765e" }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <form onSubmit={handleSendOtp}>
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
                        <Mail size={20} color="#b19f99" />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fbf6f4"
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
                sx={{
                  py: 2,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  boxShadow: "0 10px 20px rgba(246, 118, 94, 0.2)"
                }}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </Stack>
          </form>
        )}

        {activeStep === 1 && (
          <form onSubmit={handleVerifyOtp}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Verification Code"
                variant="outlined"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyRound size={20} color="#b19f99" />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fbf6f4"
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
                sx={{
                  py: 2,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "1.1rem"
                }}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                onClick={() => setActiveStep(0)}
                sx={{ color: "#f6765e", textTransform: "none" }}
              >
                Resend Code
              </Button>
            </Stack>
          </form>
        )}

        {activeStep === 2 && (
          <form onSubmit={handleResetPassword}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="New Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color="#b19f99" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fbf6f4"
                  }
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ShieldCheck size={20} color="#b19f99" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fbf6f4"
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
                sx={{
                  py: 2,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "1.1rem"
                }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </Stack>
          </form>
        )}
      </Box>
    </Box>
  );
};
