import { useEffect, useMemo, useState } from "react";
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
  Divider,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  Skeleton
} from "@mui/material";
import { ChevronRight, Save, User, Mail, Phone, ShieldCheck, Users } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import officialHero from "@/assets/State_official_header.jpg";
import { useOfficialsStore } from "../store/officials-store";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];

const moduleOptions = ["Skaters", "Clubs", "Events", "Gallery", "Districts", "Reports"];

export const OfficialFormPage = () => {
  const navigate = useNavigate();
  const { officialId } = useParams();
  const isEditing = Boolean(officialId);
  const { officials, isLoading, fetchOfficials, addOfficial, updateOfficial } = useOfficialsStore();

  useEffect(() => {
    if (officials.length === 0) {
      fetchOfficials();
    }
  }, [fetchOfficials, officials.length]);

  const existingOfficial = useMemo(
    () => officials.find((o) => o._id === officialId) ?? null,
    [officialId, officials]
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    status: true,
    allowedModule: []
  });

  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Sync form data when existingOfficial is loaded or changed
  const [prevOfficial, setPrevOfficial] = useState(null);
  if (existingOfficial !== prevOfficial) {
    setPrevOfficial(existingOfficial);
    setFormData({
      fullName: existingOfficial?.fullName || "",
      email: existingOfficial?.email || "",
      phone: existingOfficial?.phone || "",
      gender: existingOfficial?.gender || "male",
      status: existingOfficial?.status ?? true,
      allowedModule: Array.isArray(existingOfficial?.allowedModule)
        ? existingOfficial.allowedModule
        : typeof existingOfficial?.allowedModule === "string"
          ? JSON.parse(existingOfficial.allowedModule)
          : []
    });
    setImgPreview(existingOfficial?.img || null);
  }

  const handleFieldChange = (field) => (event) => {
    const value = field === "status" ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("gender", formData.gender);
    data.append("status", formData.status.toString());
    data.append("allowedModule", JSON.stringify(formData.allowedModule));

    if (imgFile) {
      data.append("img", imgFile);
    }

    try {
      if (isEditing) {
        await updateOfficial(officialId, data);
      } else {
        await addOfficial(data);
      }
      navigate("/officials");
    } catch (error) {
      console.error("Failed to save official:", error);
    }
  };

  if (isEditing && !existingOfficial && !isLoading) {
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
        sx={{
          borderRadius: "32px",
          p: { xs: 2, sm: 4 },
          border: "1px solid #f2dfd7",
          maxWidth: 1380, // Match the main max-width
          mx: "auto",
          width: "100%"
        }}
      >
        {isLoading ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={120} height={120} />
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, color: "#2f2829" }}>
              Official Information
            </Typography>

            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Box sx={{ textAlign: "center", position: "relative" }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "24px",
                      overflow: "hidden",
                      border: "2px dashed #efe2dc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fafafa",
                      mb: 1
                    }}
                  >
                    {imgPreview ? (
                      <img
                        src={imgPreview}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <User size={40} color="#b19f99" />
                    )}
                  </Box>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: "8px", textTransform: "none" }}
                  >
                    Upload Photo
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </Box>
                <Box sx={{ flex: 1, width: "100%" }}>
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
                </Box>
              </Stack>

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

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                sx={{ alignItems: { md: "center" } }}
              >
                <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 300px" } }}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={formData.gender}
                    onChange={handleFieldChange("gender")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Users size={18} style={{ color: "#b19f99" }} />
                          </InputAdornment>
                        )
                      }
                    }}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status}
                        onChange={handleFieldChange("status")}
                        color="success"
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: formData.status ? "#2f8f4e" : "#d32f2f",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Account Status: {formData.status ? "Active" : "Inactive"}
                      </Typography>
                    }
                  />
                </Box>
              </Stack>

              <Autocomplete
                multiple
                options={moduleOptions}
                value={formData.allowedModule}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({ ...prev, allowedModule: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Allowed Modules"
                    placeholder="Select modules"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <ShieldCheck size={18} style={{ color: "#b19f99" }} />
                          </InputAdornment>
                          {params.InputProps?.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      sx={{ backgroundColor: "#f3efff", color: "#6e56cf", fontWeight: 600 }}
                    />
                  ))
                }
              />

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
                  disabled={isLoading}
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
          </>
        )}
      </Paper>
    </Box>
  );
};
