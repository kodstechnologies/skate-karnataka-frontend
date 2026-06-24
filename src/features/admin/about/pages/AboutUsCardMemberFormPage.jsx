import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { aboutUsCardHero } from "../about-us-card-assets";
import { aboutUsCardApi } from "@/api/about-us-card-api";
import { useAboutUsCardStore } from "../store/about-us-card-store";

const sectionPaperSx = {
  p: { xs: 2.25, md: 2.75 },
  borderRadius: "28px",
  border: "1px solid rgba(244, 228, 221, 0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
  boxShadow: "0 24px 70px rgba(48, 30, 24, 0.06)"
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

const SectionHeader = ({ icon: Icon, title, description }) => (
  <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: "flex-start" }}>
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "16px",
        display: "grid",
        placeItems: "center",
        color: "#f6765e",
        backgroundColor: "rgba(246,118,94,0.12)",
        flexShrink: 0
      }}
    >
      <Icon />
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>{description}</Typography>
    </Box>
  </Stack>
);

const defaultForm = {
  displayName: "",
  designation: "",
  email: "",
  phoneNo: "",
  description: "",
  photo: null
};

const sanitizePhoneNo = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

export const AboutUsCardMemberFormPage = () => {
  const navigate = useNavigate();
  const { cardId, memberId } = useParams();
  const { state } = useLocation();
  const passedMember = state?.member;
  const isEditing = Boolean(memberId);

  const currentCard = useAboutUsCardStore((s) => s.currentCard);
  const fetchCardById = useAboutUsCardStore((s) => s.fetchCardById);
  const createMember = useAboutUsCardStore((s) => s.createMember);
  const updateMember = useAboutUsCardStore((s) => s.updateMember);

  const [formData, setFormData] = useState(defaultForm);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMember, setLoadingMember] = useState(isEditing && !passedMember);

  useEffect(() => {
    if (cardId && !currentCard) fetchCardById(cardId);
  }, [cardId, currentCard, fetchCardById]);

  useEffect(() => {
    if (!isEditing) return;

    if (passedMember) {
      setFormData({
        displayName: passedMember.displayName ?? "",
        designation: passedMember.designation ?? "",
        email: passedMember.email ?? "",
        phoneNo: sanitizePhoneNo(passedMember.phoneNo),
        description: passedMember.description ?? "",
        photo: null
      });
      setPhotoPreviewUrl(passedMember.photo ?? null);
      setLoadingMember(false);
      return;
    }

    let mounted = true;
    const loadMember = async () => {
      try {
        const member = await aboutUsCardApi.getMemberById(cardId, memberId);
        if (!mounted || !member) return;
        setFormData({
          displayName: member.displayName ?? "",
          designation: member.designation ?? "",
          email: member.email ?? "",
          phoneNo: sanitizePhoneNo(member.phoneNo),
          description: member.description ?? "",
          photo: null
        });
        setPhotoPreviewUrl(member.photo ?? null);
      } finally {
        if (mounted) setLoadingMember(false);
      }
    };
    loadMember();
    return () => {
      mounted = false;
    };
  }, [isEditing, passedMember, cardId, memberId]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handleField = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handlePhoneChange = (e) => {
    const phoneNo = sanitizePhoneNo(e.target.value);
    setFormData((p) => ({ ...p, phoneNo }));
    setErrors((p) => ({ ...p, phoneNo: "" }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setFormData((p) => ({ ...p, photo: file }));
    setErrors((p) => ({ ...p, photo: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.displayName.trim()) next.displayName = "Display name is required.";
    if (!formData.designation.trim()) next.designation = "Designation is required.";
    if (!isEditing && !formData.photo && !photoPreviewUrl) {
      next.photo = "Please select a photo.";
    }
    if (formData.phoneNo && formData.phoneNo.length !== 10) {
      next.phoneNo = "Phone number must be exactly 10 digits.";
    }
    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = new FormData();
    payload.append("displayName", formData.displayName.trim());
    payload.append("designation", formData.designation.trim());
    if (formData.email.trim()) payload.append("email", formData.email.trim());
    if (formData.phoneNo.trim()) payload.append("phoneNo", formData.phoneNo.trim());
    if (formData.description.trim()) payload.append("description", formData.description.trim());
    if (formData.photo) payload.append("photo", formData.photo);

    setIsSubmitting(true);
    const ok = isEditing
      ? await updateMember(cardId, memberId, payload)
      : await createMember(cardId, payload);
    setIsSubmitting(false);

    if (ok) navigate(`/about-us-card/${cardId}`);
  };

  const cardTitle = currentCard?.title || "Card";

  if (loadingMember) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 250, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${aboutUsCardHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
            }}
          >
            <Typography component={RouterLink} to="/dashboard" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
              Dashboard
            </Typography>
            <Typography component={RouterLink} to="/about-us-card" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
              About usCard
            </Typography>
            <Typography component={RouterLink} to={`/about-us-card/${cardId}`} sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
              {cardTitle}
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit Member" : "Add Member"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update Member" : "Add Member"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Update member details for this card."
              : "Fill in the details below to add a member to this card."}
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack spacing={2.5}>
          <Paper elevation={0} sx={sectionPaperSx}>
            <SectionHeader
              icon={ArticleOutlinedIcon}
              title="Member Information"
              description="Display name and designation are required."
            />
            <Stack spacing={2}>
              <TextField
                label="Display Name *"
                value={formData.displayName}
                onChange={handleField("displayName")}
                error={Boolean(errors.displayName)}
                helperText={errors.displayName}
                fullWidth
                autoFocus={!isEditing}
                sx={inputSx}
              />
              <TextField
                label="Designation *"
                value={formData.designation}
                onChange={handleField("designation")}
                error={Boolean(errors.designation)}
                helperText={errors.designation}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Description (Optional)"
                value={formData.description}
                onChange={handleField("description")}
                multiline
                minRows={3}
                fullWidth
                sx={inputSx}
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={sectionPaperSx}>
            <SectionHeader
              icon={ContactMailOutlinedIcon}
              title="Contact Details (Optional)"
              description="Email and phone number are optional."
            />
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleField("email")}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Phone No"
                value={formData.phoneNo}
                onChange={handlePhoneChange}
                error={Boolean(errors.phoneNo)}
                helperText={errors.phoneNo || "10 digits only (optional)"}
                fullWidth
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
                sx={inputSx}
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={sectionPaperSx}>
            <SectionHeader
              icon={ImageOutlinedIcon}
              title={`Photo ${isEditing ? "(Optional)" : "*"}`}
              description={
                isEditing ? "Leave empty to keep the existing photo." : "Upload a photo for this member."
              }
            />
            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
                sx={{ alignSelf: "flex-start", borderRadius: "14px", textTransform: "none" }}
              >
                Choose Photo
                <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </Button>
              {photoPreviewUrl ? (
                <Box
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #efe2dc",
                    backgroundColor: "white",
                    p: 1.5,
                    boxShadow: "0 8px 24px rgba(48,30,24,0.06)"
                  }}
                >
                  <Box
                    component="img"
                    src={photoPreviewUrl}
                    alt="Member preview"
                    sx={{
                      width: "100%",
                      height: 176,
                      borderRadius: "12px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                  {formData.photo && (
                    <Typography sx={{ mt: 1, fontSize: 13, color: "#6f6462" }}>
                      {formData.photo.name}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>No photo selected</Typography>
              )}
              <Typography sx={{ color: errors.photo ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}>
                {errors.photo || "PNG, JPG, WEBP supported"}
              </Typography>
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              mt: 3,
              pt: 3,
              borderTop: "1px solid rgba(240, 219, 210, 0.9)",
              justifyContent: "flex-end"
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(`/about-us-card/${cardId}`)}
              disabled={isSubmitting}
              sx={{ borderRadius: "14px", textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={15} color="inherit" /> : <Save size={16} />
              }
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                backgroundColor: "#f6765e",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
              }}
            >
              {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Add Member"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
