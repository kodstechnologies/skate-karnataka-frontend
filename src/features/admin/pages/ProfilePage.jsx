import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Skeleton,
  IconButton,
  Stack,
  Divider,
  InputAdornment,
  Tooltip,
  Alert
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Person,
  Phone,
  LocationOn,
  Email,
  Badge as BadgeIcon,
  Edit,
  Close,
  VerifiedUser
} from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/auth-store";

const labelStyles = {
  mb: 1.2,
  ml: 1,
  fontWeight: 800,
  color: "#2f2829",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const emptyForm = {
  fullName: "",
  phone: "",
  address: "",
  email: "",
  krsaId: "",
  img: ""
};

const mapProfileToForm = (data) => ({
  fullName: data?.fullName || "",
  phone: data?.phone || "",
  address: data?.address || "",
  email: data?.email || "",
  krsaId: data?.krsaId || "",
  img: data?.img || ""
});

export const ProfilePage = () => {
  const { user, getProfile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      setPageLoading(true);
      setLoadError("");
      try {
        const data = await getProfile();
        if (!active) return;
        setFormData(mapProfileToForm(data));
      } catch (error) {
        if (!active) return;
        const message =
          error?.response?.data?.message || error?.message || "Failed to load profile";
        setLoadError(message);
      } finally {
        if (active) setPageLoading(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [getProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("address", formData.address);

      if (selectedFile) {
        data.append("img", selectedFile);
      }

      const updated = await updateProfile(data);
      setIsEditing(false);
      setSelectedFile(null);
      if (updated) {
        setFormData(mapProfileToForm(updated));
      } else {
        const refreshed = await getProfile();
        setFormData(mapProfileToForm(refreshed));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = formData.fullName || user?.fullName || "";

  const getRoleLabel = (role) => {
    const normalized = String(role || "").toLowerCase();
    if (normalized === "admin") return "Admin";
    if (normalized === "state") return "State Official";
    return role || "";
  };

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "18px",
      backgroundColor: "#fbf6f4",
      transition: "all 0.2s ease",
      border: "1px solid #efe2dc",
      "& fieldset": { border: "none" },
      "&.Mui-focused": {
        backgroundColor: "white",
        boxShadow: "0 0 0 2px #f6765e"
      },
      "&.Mui-disabled": {
        backgroundColor: "#f5f5f5",
        color: "#888",
        opacity: 0.8
      }
    },
    "& .MuiInputLabel-root": {
      color: "#8d7f7b",
      fontWeight: 500
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "32px",
            overflow: "hidden",
            border: "1px solid #efe2dc",
            minHeight: "80vh"
          }}
        >
          <Skeleton variant="rectangular" height={200} />
          <Box sx={{ p: 4 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              alignItems="center"
              sx={{ mt: -10, mb: 6 }}
            >
              <Skeleton
                variant="circular"
                width={160}
                height={160}
                sx={{ border: "6px solid #fff" }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={60} />
                <Skeleton variant="text" width="40%" height={30} />
              </Box>
            </Stack>
            <Grid container spacing={4}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: i === 5 ? 12 : 6 }}>
                  <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: "18px" }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, width: "100%", maxWidth: 900, mx: "auto" }}>
        <Alert severity="error" sx={{ borderRadius: "16px" }}>
          {loadError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, width: "100%", maxWidth: "1600px", mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid #efe2dc",
          backgroundColor: "white",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          width: "100%"
        }}
      >
        <Box
          sx={{
            height: { xs: 140, md: 220 },
            background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
            position: "relative"
          }}
        >
          <Box sx={{ position: "absolute", top: 24, right: 24, zIndex: 2 }}>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              startIcon={isEditing ? <Close /> : <Edit />}
              onClick={() => setIsEditing(!isEditing)}
              sx={{
                borderRadius: "16px",
                textTransform: "none",
                px: 3,
                py: 1.2,
                fontWeight: 800,
                backdropFilter: "blur(8px)",
                bgcolor: isEditing ? "rgba(255,255,255,0.15)" : "white",
                borderColor: "white",
                color: isEditing ? "white" : "#f6765e",
                boxShadow: isEditing ? "none" : "0 10px 25px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: isEditing ? "rgba(255,255,255,0.25)" : "#f8f9fa",
                  borderColor: "white",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 3, md: 6 }, pb: 6 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 4 }}
            alignItems={{ xs: "center", md: "flex-end" }}
            sx={{ mt: { xs: -8, md: -10 }, mb: 6 }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={formData.img || user?.img || ""}
                onClick={handleImageClick}
                sx={{
                  width: { xs: 150, md: 190 },
                  height: { xs: 150, md: 190 },
                  fontSize: "4rem",
                  bgcolor: "#f6765e",
                  border: "8px solid #fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                  cursor: isEditing ? "pointer" : "default",
                  transition: "all 0.3s ease",
                  "&:hover": isEditing ? { transform: "scale(1.03) rotate(2deg)" } : {}
                }}
              >
                {getInitials(displayName)}
              </Avatar>
              {isEditing && (
                <IconButton
                  onClick={handleImageClick}
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    bgcolor: "white",
                    color: "#f6765e",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                    "&:hover": { bgcolor: "#f8f9fa", transform: "scale(1.1)" },
                    transition: "all 0.2s ease",
                    width: 48,
                    height: 48
                  }}
                >
                  <CameraAlt />
                </IconButton>
              )}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>

            <Box sx={{ textAlign: { xs: "center", md: "left" }, pb: { md: 1 }, flex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "#2f2829",
                  fontSize: { xs: "1.75rem", md: "2.75rem" },
                  letterSpacing: "-0.02em"
                }}
              >
                {displayName}
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent={{ xs: "center", md: "flex-start" }}
                sx={{ mt: 1 }}
              >
                <Typography
                  sx={{
                    color: "#f6765e",
                    fontWeight: 800,
                    bgcolor: "#fff1eb",
                    px: 2,
                    py: 0.6,
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {getRoleLabel(user?.role)}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ height: 20, my: "auto" }} />
                <Typography
                  sx={{
                    color: "#8d7f7b",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                  }}
                >
                  <BadgeIcon sx={{ fontSize: 18, color: "#f6765e" }} />
                  {formData.krsaId || user?.krsaId}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ mb: 6, opacity: 0.6 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 3, md: 5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: isEditing ? "#f6765e" : "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  value={formData.email}
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "#b19f99" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Verified Email">
                            <span style={{ display: "flex" }}>
                              <VerifiedUser sx={{ color: "#4caf50", fontSize: 20 }} />
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: isEditing ? "#f6765e" : "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  KRSA ID
                </Typography>
                <TextField
                  fullWidth
                  value={formData.krsaId}
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Physical Address
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.8 }}>
                          <LocationOn sx={{ color: isEditing ? "#f6765e" : "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              {isEditing && (
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={isSaving}
                    startIcon={<Save />}
                    sx={{
                      py: 2.5,
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      textTransform: "none",
                      boxShadow: "0 20px 40px rgba(246, 118, 94, 0.35)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 25px 50px rgba(246, 118, 94, 0.45)",
                        background: "linear-gradient(135deg, #ea6b54 0%, #f6765e 100%)"
                      }
                    }}
                  >
                    {isSaving ? "Saving Changes..." : "Save Profile Updates"}
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};
