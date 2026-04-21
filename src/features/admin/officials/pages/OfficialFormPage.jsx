import { useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Divider
} from "@mui/material";
import {
  ChevronRight,
  Save,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import officialHero from "@/assets/State_official_header.jpg";
import { useOfficialsStore } from "../store/officials-store";

const designationOptions = [
  "Technical Official",
  "District Coordinator",
  "Event Manager",
  "Registrar"
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export const OfficialFormPage = () => {
  const navigate = useNavigate();
  const { officialId } = useParams();
  const isEditing = Boolean(officialId);
  const officials = useOfficialsStore((state) => state.officials);
  const addOfficial = useOfficialsStore((state) => state.addOfficial);
  const updateOfficial = useOfficialsStore((state) => state.updateOfficial);

  const existingOfficial = useMemo(
    () => officials.find((o) => o.id === officialId) ?? null,
    [officialId, officials]
  );

  const [formData, setFormData] = useState({
    fullName: existingOfficial?.fullName ?? "",
    email: existingOfficial?.email ?? "",
    phone: existingOfficial?.phone ?? "",
    password: existingOfficial?.password ?? "",
    designation: existingOfficial?.designation ?? "Technical Official",
    status: existingOfficial?.status ?? "active"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone is required";
    if (!formData.password.trim()) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing) {
      updateOfficial(officialId, formData);
    } else {
      addOfficial(formData);
    }

    navigate("/officials");
  };

  if (isEditing && !existingOfficial) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Official not found
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/officials")}>
          Back to list
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: 220,
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.92) 0%, rgba(35,23,23,0.78) 38%, rgba(246,118,94,0.3) 100%), url("${officialHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box>
            <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, color: "white/80" }}>
              <Typography
                component={RouterLink}
                to="/dashboard"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to="/officials"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Officials
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {isEditing ? "Edit" : "Create"}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1 }}>
              {isEditing ? "Update Profile" : "Register Official"}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Configure account credentials and permission levels for state officials.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: "32px", p: 4, border: "1px solid #f2dfd7", maxWidth: 1100, mx: "auto" }}
      >
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, color: "#2f2829" }}>
          Official Information
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleFieldChange("fullName")}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={18} style={{ color: "#b19f99" }} />
                  </InputAdornment>
                )
              }
            }}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Email Address"
              value={formData.email}
              onChange={handleFieldChange("email")}
              error={Boolean(errors.email)}
              helperText={errors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleFieldChange("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>

          <TextField
            fullWidth
            label="Login Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleFieldChange("password")}
            error={Boolean(errors.password)}
            helperText={errors.password || "This will be the password used for login"}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} style={{ color: "#b19f99" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#b19f99" }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Designation"
              value={formData.designation}
              onChange={handleFieldChange("designation")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShieldCheck size={18} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
            >
              {designationOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Account Status"
              value={formData.status}
              onChange={handleFieldChange("status")}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/officials")}
              sx={{ borderRadius: "14px", px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSubmit}
              sx={{
                borderRadius: "14px",
                px: 4,
                backgroundColor: "#f6765e",
                "&:hover": { backgroundColor: "#ea6b54" }
              }}
            >
              {isEditing ? "Save Changes" : "Create Official"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
