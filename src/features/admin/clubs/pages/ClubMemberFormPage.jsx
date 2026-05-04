import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Mail, MapPin, Phone, Save, User, Users } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { useClubMembersStore } from "@/features/admin/clubs/store/club-members-store";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];

const inputStyles = {
  "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.92)" }
};

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  gender: "male",
  isActive: true
};

const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  return errors;
};

export const ClubMemberFormPage = () => {
  const navigate = useNavigate();
  const { clubId, memberId } = useParams();
  const isEditing = Boolean(memberId);

  const clubs = useClubsStore((s) => s.clubs);
  const club = useMemo(() => clubs.find((c) => c.id === clubId) ?? null, [clubs, clubId]);

  const { members, isLoading, fetchMembers, addMember, updateMember } = useClubMembersStore();

  useEffect(() => {
    if (members.length === 0) fetchMembers(clubId);
  }, [clubId, fetchMembers, members.length]);

  const existing = useMemo(
    () => members.find((m) => m.id === memberId) ?? null,
    [members, memberId]
  );

  const [formData, setFormData] = useState(initialForm);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Sync when existing member loads
  const [prevExisting, setPrevExisting] = useState(null);
  if (existing !== prevExisting) {
    setPrevExisting(existing);
    if (existing) {
      setFormData({
        fullName: existing.fullName || "",
        email: existing.email || "",
        phone: existing.phone || "",
        address: existing.address || "",
        gender: existing.gender || "male",
        isActive: existing.isActive ?? true
      });
      setImgPreview(existing.profile || null);
    }
  }

  const handleField = (field) => (e) => {
    const value = field === "isActive" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("fullName", formData.fullName.trim());
    if (formData.email.trim()) fd.append("email", formData.email.trim());
    fd.append("phone", formData.phone.trim());
    if (formData.address.trim()) fd.append("address", formData.address.trim());
    fd.append("gender", formData.gender);
    fd.append("isActive", String(formData.isActive));
    if (!isEditing) fd.append("clubId", clubId);
    if (imgFile) fd.append("profile", imgFile);
    return fd;
  };

  const handleSubmit = async () => {
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const fd = buildFormData();
    const ok = isEditing ? await updateMember(memberId, fd) : await addMember(clubId, fd);

    if (ok) navigate(`/clubs/${clubId}/members`);
  };

  const clubName = club?.name || "Club";

  if (isEditing && !existing && !isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Member not found
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate(`/clubs/${clubId}/members`)}
        >
          Back to members
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: 220,
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${clubHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%)",
            pointerEvents: "none"
          }}
        />
        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/clubs"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Clubs
            </Typography>
            <Typography
              component={RouterLink}
              to={`/clubs/${clubId}/members`}
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              {clubName}
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Add Member"}
            </Typography>
          </Breadcrumbs>
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)",
                mb: 1
              }}
            >
              Member Registration
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
              {isEditing ? "Update Member" : "Add Member"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
              {isEditing
                ? `Update details for this member in ${clubName}.`
                : `Register a new member under ${clubName}.`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Form Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: "32px",
          border: "1px solid #f2dfd7",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        {isLoading && isEditing ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="rounded" width={100} height={100} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={2}>
                <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={56} sx={{ flex: 1, borderRadius: 2 }} />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
              {isEditing ? "Update member information" : "Enter member details"}
            </Typography>

            {/* Profile Photo + Full Name */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "22px",
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
                    <Avatar
                      src={imgPreview}
                      alt="Profile"
                      variant="square"
                      sx={{ width: "100%", height: "100%", borderRadius: 0 }}
                    />
                  ) : (
                    <User size={36} color="#b19f99" />
                  )}
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: "10px", textTransform: "none", fontSize: 12 }}
                >
                  {imgPreview ? "Change Photo" : "Upload Photo"}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
              <Box sx={{ flex: 1, width: "100%" }}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={handleField("fullName")}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                  sx={inputStyles}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={17} style={{ color: "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>
            </Stack>

            {/* Email + Phone */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={handleField("email")}
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={17} style={{ color: "#b19f99" }} />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                fullWidth
                label="Phone *"
                value={formData.phone}
                onChange={handleField("phone")}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={17} style={{ color: "#b19f99" }} />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Stack>

            {/* Address */}
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleField("address")}
              multiline
              minRows={2}
              sx={inputStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={17} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
            />

            {/* Gender + Status */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
            >
              <TextField
                select
                fullWidth
                label="Gender"
                value={formData.gender}
                onChange={handleField("gender")}
                sx={{ ...inputStyles, maxWidth: { md: 280 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Users size={17} style={{ color: "#b19f99" }} />
                      </InputAdornment>
                    )
                  }
                }}
              >
                {genderOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleField("isActive")}
                    color="success"
                  />
                }
                label={
                  <Typography
                    sx={{ fontWeight: 600, color: formData.isActive ? "#2f8f4e" : "#d32f2f" }}
                  >
                    Status: {formData.isActive ? "Active" : "Inactive"}
                  </Typography>
                }
              />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate(`/clubs/${clubId}/members`)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save size={16} />}
                onClick={handleSubmit}
                sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
              >
                {isEditing ? "Save Changes" : "Add Member"}
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};
