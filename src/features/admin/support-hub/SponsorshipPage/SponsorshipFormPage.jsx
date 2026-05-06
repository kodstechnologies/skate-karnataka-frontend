import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { sponsorshipApi } from "@/api/sponsorship-api";
import sponsorshipHero from "@/assets/Skating_header.jpg";
import toast from "react-hot-toast";

const defaultForm = {
  brandName: "",
  title: "",
  about: "",
  contribution: "",
  duration: "",
  support: "funding",
  donorName: "",
  amount: "",
  img: null // File object or null
};

const validateForm = (formData, isEditMode) => {
  const errors = {};
  if (!formData.brandName?.trim()) errors.brandName = "Brand Name is required.";
  if (!formData.title?.trim()) errors.title = "Title is required.";
  if (!formData.about?.trim()) errors.about = "About is required.";
  if (!formData.contribution?.trim()) errors.contribution = "Contribution is required.";
  if (!formData.duration?.trim()) errors.duration = "Duration is required.";
  if (!formData.support?.trim()) errors.support = "Support type is required.";
  if (!isEditMode && !formData.img) errors.img = "Please select an image.";
  return errors;
};

const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
};

export const SponsorshipFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const passedSponsorship = state?.sponsorship;
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(
    passedSponsorship
      ? {
          brandName: passedSponsorship.brandName ?? "",
          title: passedSponsorship.title ?? "",
          about: passedSponsorship.about ?? "",
          contribution: passedSponsorship.contribution ?? "",
          duration: passedSponsorship.duration ?? "",
          support: passedSponsorship.support ?? "funding",
          donorName: passedSponsorship.donorName ?? "",
          amount: passedSponsorship.amount ?? "",
          img: null
        }
      : defaultForm
  );

  const [formErrors, setFormErrors] = useState({});
  const [loadingInitial] = useState(false);
  const [fetchError] = useState(
    isEditing && !passedSponsorship
      ? "Please access this page by clicking edit on a sponsorship card."
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (imgPreviewUrl) {
        URL.revokeObjectURL(imgPreviewUrl);
      }
    };
  }, [imgPreviewUrl]);

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imgPreviewUrl) {
      URL.revokeObjectURL(imgPreviewUrl);
    }
    setImgPreviewUrl(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, img: file }));
    if (formErrors.img) {
      setFormErrors((prev) => ({ ...prev, img: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData, isEditing);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const payload = new FormData();
      payload.append("brandName", formData.brandName.trim());
      payload.append("title", formData.title.trim());
      payload.append("about", formData.about.trim());
      payload.append("contribution", formData.contribution.trim());
      payload.append("duration", formData.duration.trim());
      payload.append("support", formData.support.trim());

      // Add optional fields if provided
      if (formData.donorName?.trim()) payload.append("donorName", formData.donorName.trim());
      if (formData.amount?.trim()) payload.append("amount", formData.amount.trim());

      if (formData.img) {
        payload.append("img", formData.img);
      }

      if (isEditing) {
        await sponsorshipApi.update(id, payload);
      } else {
        await sponsorshipApi.create(payload);
      }

      navigate("/support-hub/sponsorship");
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setApiError(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  if (isEditing && fetchError) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Sponsorship not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>{fetchError}</Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate("/support-hub/sponsorship")}
        >
          Back to sponsorships
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* ── Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 250, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${sponsorshipHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 14, md: 16 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/support-hub/sponsorship"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              Sponsorship
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update Sponsorship" : "Create Sponsorship"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Update the details or image of this sponsorship record."
              : "Fill in the details below to record a new sponsorship."}
          </Typography>
        </Stack>
      </Paper>

      {/* ── Form Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack spacing={2.5}>
          {apiError && (
            <Alert severity="error" onClose={() => setApiError(null)} sx={{ borderRadius: "14px" }}>
              {apiError}
            </Alert>
          )}

          {/* Section: Info */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 2.75 },
              borderRadius: "28px",
              border: "1px solid rgba(244, 228, 221, 0.95)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
              boxShadow: "0 24px 70px rgba(48, 30, 24, 0.06)"
            }}
          >
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
                <HandshakeOutlinedIcon />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}
                >
                  Sponsorship Details
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>
                  Information about the sponsor and their contribution.
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}
              >
                <TextField
                  label="Brand Name"
                  value={formData.brandName}
                  onChange={handleFieldChange("brandName")}
                  error={Boolean(formErrors.brandName)}
                  helperText={formErrors.brandName}
                  fullWidth
                  autoFocus={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                <TextField
                  label="Title"
                  value={formData.title}
                  onChange={handleFieldChange("title")}
                  error={Boolean(formErrors.title)}
                  helperText={formErrors.title}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                <TextField
                  label="Support Type (e.g. funding, equipment)"
                  value={formData.support}
                  onChange={handleFieldChange("support")}
                  error={Boolean(formErrors.support)}
                  helperText={formErrors.support}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                <TextField
                  label="Contribution Focus"
                  value={formData.contribution}
                  onChange={handleFieldChange("contribution")}
                  error={Boolean(formErrors.contribution)}
                  helperText={formErrors.contribution}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                <TextField
                  label="Duration (e.g. 2026-2028)"
                  value={formData.duration}
                  onChange={handleFieldChange("duration")}
                  error={Boolean(formErrors.duration)}
                  helperText={formErrors.duration}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                {/* Optional fields based on screenshot (amount, donorName) */}
                <TextField
                  label="Amount (Optional)"
                  type="number"
                  value={formData.amount}
                  onChange={handleFieldChange("amount")}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
                <TextField
                  label="Donor Name (Optional)"
                  value={formData.donorName}
                  onChange={handleFieldChange("donorName")}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "rgba(255,255,255,0.92)"
                    }
                  }}
                />
              </Box>

              <TextField
                label="About"
                value={formData.about}
                onChange={handleFieldChange("about")}
                error={Boolean(formErrors.about)}
                helperText={formErrors.about}
                multiline
                minRows={3}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "18px",
                    backgroundColor: "rgba(255,255,255,0.92)"
                  }
                }}
              />
            </Stack>
          </Paper>

          {/* Section: Image */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 2.75 },
              borderRadius: "28px",
              border: "1px solid rgba(244, 228, 221, 0.95)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
              boxShadow: "0 24px 70px rgba(48, 30, 24, 0.06)"
            }}
          >
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
                <ImageOutlinedIcon />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}
                >
                  Sponsor Logo/Image {isEditing ? "(Optional)" : "*"}
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>
                  {isEditing
                    ? "Leave empty to keep the existing image."
                    : "Upload an image or logo for this sponsorship."}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
                sx={{ alignSelf: "flex-start", borderRadius: "14px" }}
              >
                Choose Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {formData.img ? (
                <div className="rounded-2xl border border-[#efe2dc] bg-white p-3 shadow-sm">
                  <img
                    src={imgPreviewUrl}
                    alt="Preview"
                    className="h-44 w-full rounded-xl object-cover"
                  />
                  <Typography sx={{ mt: 1, fontSize: 13, color: "#6f6462" }}>
                    {formData.img.name}
                  </Typography>
                </div>
              ) : (
                <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>No image selected</Typography>
              )}
              <Typography sx={{ color: formErrors.img ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}>
                {formErrors.img || "PNG, JPG, WEBP supported"}
              </Typography>
            </Stack>
          </Paper>

          {/* Action Row */}
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
              onClick={() => navigate("/support-hub/sponsorship")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={15} color="inherit" /> : <Save size={16} />
              }
            >
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Sponsorship"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SponsorshipFormPage;
