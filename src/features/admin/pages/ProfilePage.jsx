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
  Business,
  Edit,
  Close,
  VerifiedUser
} from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  buildProfileUpdateFormData,
  getProfileOrgCard,
  getProfileOrgDisplayName,
  getProfileRoleLabel,
  normalizeProfileResponse
} from "@/features/admin/pages/profileMapper";

const labelStyles = {
  mb: 1,
  ml: 0.5,
  fontWeight: 700,
  color: "#6f625e",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em"
};

const sectionTitleStyles = {
  fontWeight: 800,
  color: "#2f2829",
  fontSize: "1.05rem",
  letterSpacing: "-0.02em",
  mb: 0.5
};

const metaPillSx = {
  color: "#5f5552",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: 0.625,
  fontSize: "0.8125rem",
  bgcolor: "#f5f3f2",
  border: "1px solid #ebe4e0",
  px: 1.35,
  py: 0.625,
  borderRadius: "999px",
  lineHeight: 1.2,
  minHeight: 32
};

const rolePillSx = {
  color: "#f6765e",
  fontWeight: 700,
  bgcolor: "#fff",
  border: "1px solid rgba(246, 118, 94, 0.35)",
  px: 1.35,
  py: 0.625,
  borderRadius: "999px",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  lineHeight: 1.2,
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center"
};

const ProfileMetaPill = ({ icon: Icon, children }) => (
  <Typography component="span" sx={metaPillSx}>
    <Icon sx={{ fontSize: 16, color: "#f6765e" }} />
    {children}
  </Typography>
);

const orgPanelSx = {
  height: "100%",
  p: 2.5,
  borderRadius: "24px",
  border: "1px solid rgba(246, 118, 94, 0.18)",
  background: "linear-gradient(180deg, #fff9f7 0%, #fff1eb 100%)"
};

const personalPanelSx = {
  height: "100%",
  p: { xs: 2.5, md: 3, lg: 3.5 },
  borderRadius: "24px",
  border: "1px solid #efe2dc",
  bgcolor: "#fcfbfa"
};

/** Shared profile header — same layout for admin, sub-admin, state, club, and district. */
const ProfilePageHeader = ({
  isEditing,
  onToggleEdit,
  avatarSrc,
  avatarInitials,
  onAvatarClick,
  fileInputRef,
  onFileChange,
  headline,
  orgDisplayName,
  roleLabel,
  krsaId
}) => {
  const showOrgPill = Boolean(orgDisplayName) && orgDisplayName !== headline;

  return (
    <Box sx={{ borderBottom: "1px solid #efe2dc" }}>
      <Box
        sx={{
          height: { xs: 96, md: 116 },
          background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 55%, #ffb09e 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.12)",
            top: -80,
            right: -40
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
            bottom: -50,
            left: "18%"
          }}
        />
        <Box sx={{ position: "absolute", top: 16, right: { xs: 16, md: 24 }, zIndex: 2 }}>
          <Button
            variant={isEditing ? "outlined" : "contained"}
            startIcon={isEditing ? <Close /> : <Edit />}
            onClick={onToggleEdit}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              px: 2.5,
              py: 1,
              fontWeight: 700,
              bgcolor: isEditing ? "rgba(255,255,255,0.16)" : "white",
              borderColor: "white",
              color: isEditing ? "white" : "#f6765e",
              boxShadow: isEditing ? "none" : "0 8px 20px rgba(0,0,0,0.08)",
              "&:hover": {
                bgcolor: isEditing ? "rgba(255,255,255,0.24)" : "#f8f9fa",
                borderColor: "white"
              }
            }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: "#fff",
          px: { xs: 2.5, md: 4, lg: 5 },
          pb: { xs: 2.5, md: 3 },
          pt: { xs: 7, md: 0 }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "center" },
            gap: { xs: 1.5, md: 2.5 },
            mt: { md: -7 },
            position: "relative",
            zIndex: 1
          }}
        >
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              src={avatarSrc}
              onClick={onAvatarClick}
              sx={{
                width: { xs: 108, md: 128 },
                height: { xs: 108, md: 128 },
                fontSize: "1.9rem",
                fontWeight: 800,
                bgcolor: "#f6765e",
                border: "5px solid #fff",
                boxShadow: "0 16px 36px rgba(246, 118, 94, 0.22)",
                cursor: isEditing ? "pointer" : "default",
                transition: "transform 0.2s ease",
                "&:hover": isEditing ? { transform: "scale(1.02)" } : {}
              }}
            >
              {avatarInitials}
            </Avatar>
            {isEditing && (
              <IconButton
                onClick={onAvatarClick}
                sx={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  bgcolor: "white",
                  color: "#f6765e",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#f8f9fa", transform: "scale(1.08)" },
                  transition: "all 0.2s ease",
                  width: 40,
                  height: 40
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            )}
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={onFileChange} />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              textAlign: { xs: "center", md: "left" },
              pt: { md: 1.5 }
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#2f2829",
                fontSize: { xs: "1.5rem", md: "1.9rem" },
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                mb: 1.25
              }}
            >
              {headline}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "center", justifyContent: { xs: "center", md: "flex-start" } }}
            >
              {showOrgPill ? (
                <ProfileMetaPill icon={Business}>{orgDisplayName}</ProfileMetaPill>
              ) : null}
              <Typography component="span" sx={rolePillSx}>
                {roleLabel}
              </Typography>
              {krsaId ? <ProfileMetaPill icon={BadgeIcon}>{krsaId}</ProfileMetaPill> : null}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const ProfileInfoField = ({
  label,
  value,
  icon: Icon,
  isEditing,
  name,
  onChange,
  multiline = false,
  rows = 1,
  disabled = false,
  endAdornment,
  textFieldStyles
}) => {
  if (!isEditing) {
    return (
      <Box>
        <Typography variant="subtitle2" sx={labelStyles}>
          {label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: multiline ? "flex-start" : "center",
            gap: 1.5,
            p: 2,
            borderRadius: "18px",
            border: "1px solid #efe2dc",
            bgcolor: "#faf8f7",
            minHeight: multiline ? 96 : 56
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: "#fff1eb",
              color: "#f6765e"
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              flex: 1,
              color: value ? "#2f2829" : "#b19f99",
              fontWeight: value ? 600 : 500,
              fontSize: "0.95rem",
              lineHeight: 1.5,
              pt: multiline ? 0.5 : 0,
              wordBreak: "break-word"
            }}
          >
            {value || "—"}
          </Typography>
          {endAdornment}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={labelStyles}>
        {label}
      </Typography>
      <TextField
        fullWidth
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={multiline ? { alignSelf: "flex-start", mt: 1.8 } : undefined}>
                <Icon sx={{ color: disabled ? "#b19f99" : "#f6765e" }} />
              </InputAdornment>
            ),
            endAdornment
          }
        }}
        sx={textFieldStyles}
      />
    </Box>
  );
};

const emptyForm = {
  fullName: "",
  phone: "",
  address: "",
  email: "",
  krsaId: "",
  img: "",
  gender: "",
  memberId: "",
  districtName: "",
  districtKrsaId: "",
  clubName: "",
  clubId: "",
  stateName: "",
  allowedModules: [],
  orgName: "",
  orgSubtitle: "",
  orgAddress: "",
  orgAbout: ""
};

const mapProfileToForm = (data, role) => normalizeProfileResponse(data, role);

export const ProfilePage = () => {
  const { user, role, getProfile, updateProfile } = useAuthStore();
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
        setFormData(mapProfileToForm(data, role));
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
  }, [getProfile, role]);

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
      const data = buildProfileUpdateFormData(formData, selectedFile, role);
      const updated = await updateProfile(data);
      setIsEditing(false);
      setSelectedFile(null);
      if (updated) {
        setFormData(mapProfileToForm(updated, role));
      } else {
        const refreshed = await getProfile();
        setFormData(mapProfileToForm(refreshed, role));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const normalizedRole = String(role || user?.role || "").toLowerCase();
  const orgCard = getProfileOrgCard(normalizedRole, formData, user);
  const orgDisplayName = getProfileOrgDisplayName(normalizedRole, formData, user);

  const displayName =
    formData.fullName ||
    user?.currentMember?.fullName ||
    user?.memberDetails?.fullName ||
    user?.fullName ||
    "";
  const headline = displayName || orgDisplayName || "Profile";
  const krsaId =
    formData.krsaId || user?.currentMember?.krsaId || user?.krsaId || "";
  const avatarSrc =
    formData.img ||
    user?.currentMember?.photo ||
    user?.memberDetails?.photo ||
    user?.img ||
    "";
  const roleLabel = getProfileRoleLabel(role || user?.role, { ...user, ...formData });

  const getInitials = (name) => {
    const source = name || headline;
    if (!source) return "A";
    const parts = source.trim().split(/\s+/).filter(Boolean);
    return parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: isEditing ? "#fff" : "#faf7f5",
      transition: "all 0.2s ease",
      border: "1px solid #efe2dc",
      "& fieldset": { border: "none" },
      "&.Mui-focused": {
        backgroundColor: "white",
        boxShadow: "0 0 0 2px #f6765e"
      },
      "&.Mui-disabled": {
        backgroundColor: "#faf7f5",
        WebkitTextFillColor: "#2f2829",
        color: "#2f2829",
        opacity: 1
      },
      "&.Mui-disabled input, &.Mui-disabled textarea": {
        WebkitTextFillColor: "#2f2829",
        color: "#2f2829",
        opacity: 1
      }
    },
    "& .MuiInputLabel-root": {
      color: "#8d7f7b",
      fontWeight: 500
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "32px",
            overflow: "hidden",
            border: "1px solid #efe2dc",
            minHeight: "80vh"
          }}
        >
          <Skeleton variant="rectangular" height={116} />
          <Box sx={{ px: 4, pb: 3, pt: 0 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{ mt: -7, mb: 3, alignItems: "center" }}
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Skeleton variant="rounded" height={220} sx={{ borderRadius: "24px" }} />
              </Grid>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: "24px" }} />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ width: "100%" }}>
        <Alert severity="error" sx={{ borderRadius: "16px" }}>
          {loadError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "calc(100vh - 120px)" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid #efe2dc",
          backgroundColor: "white",
          boxShadow: "0 28px 80px rgba(48, 30, 24, 0.08)",
          width: "100%"
        }}
      >
        <ProfilePageHeader
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          avatarSrc={avatarSrc}
          avatarInitials={getInitials(displayName)}
          onAvatarClick={handleImageClick}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          headline={headline}
          orgDisplayName={orgDisplayName}
          roleLabel={roleLabel}
          krsaId={krsaId}
        />

        <Box sx={{ px: { xs: 2.5, md: 4, lg: 5 }, pb: 5, pt: 3, bgcolor: "#fff" }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
              <Paper elevation={0} sx={orgPanelSx}>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#f6765e",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em"
                  }}
                >
                  {orgCard.title}
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  {orgCard.items.map((item) => (
                    <Box key={`${item.label}-${item.value}`}>
                      <Typography sx={{ fontSize: "0.72rem", color: "#8d7f7b", fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: item.label === "Name" ? 800 : 600,
                          color: "#2f2829",
                          mt: 0.5,
                          fontSize: item.label === "Name" ? "1.05rem" : "0.95rem",
                          lineHeight: 1.5,
                          wordBreak: "break-word"
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
              <Paper elevation={0} sx={personalPanelSx}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={sectionTitleStyles}>Personal information</Typography>
                  <Typography sx={{ color: "#8d7f7b", fontSize: "0.9rem" }}>
                    {isEditing
                      ? "Update your contact details below."
                      : "Your account details and contact information."}
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={{ xs: 2.5, md: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ProfileInfoField
                        label="Full Name"
                        value={formData.fullName}
                        icon={Person}
                        isEditing={isEditing}
                        name="fullName"
                        onChange={handleChange}
                        textFieldStyles={textFieldStyles}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ProfileInfoField
                        label="Email Address"
                        value={formData.email}
                        icon={Email}
                        isEditing={isEditing}
                        disabled
                        endAdornment={
                          isEditing ? (
                            <InputAdornment position="end">
                              <Tooltip title="Verified email">
                                <span style={{ display: "flex" }}>
                                  <VerifiedUser sx={{ color: "#4caf50", fontSize: 20 }} />
                                </span>
                              </Tooltip>
                            </InputAdornment>
                          ) : (
                            <Tooltip title="Verified email">
                              <VerifiedUser sx={{ color: "#4caf50", fontSize: 22, flexShrink: 0 }} />
                            </Tooltip>
                          )
                        }
                        textFieldStyles={textFieldStyles}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ProfileInfoField
                        label="Phone Number"
                        value={formData.phone}
                        icon={Phone}
                        isEditing={isEditing}
                        name="phone"
                        onChange={handleChange}
                        textFieldStyles={textFieldStyles}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ProfileInfoField
                        label="KRSA ID"
                        value={formData.krsaId}
                        icon={BadgeIcon}
                        isEditing={isEditing}
                        disabled
                        textFieldStyles={textFieldStyles}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <ProfileInfoField
                        label="Physical Address"
                        value={formData.address}
                        icon={LocationOn}
                        isEditing={isEditing}
                        name="address"
                        onChange={handleChange}
                        multiline
                        rows={3}
                        textFieldStyles={textFieldStyles}
                      />
                    </Grid>

                    {isEditing && (
                      <Grid size={{ xs: 12, lg: 6, xl: 4 }} sx={{ mt: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          type="submit"
                          disabled={isSaving}
                          startIcon={<Save />}
                          sx={{
                            py: 1.75,
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #f6765e 0%, #ff8c75 100%)",
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            textTransform: "none",
                            boxShadow: "0 12px 28px rgba(246, 118, 94, 0.32)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #ea6b54 0%, #f6765e 100%)"
                            }
                          }}
                        >
                          {isSaving ? "Saving changes..." : "Save profile updates"}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};
