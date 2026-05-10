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
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { newsApi } from "@/api/news-api";
import { UploadProgressBanner } from "@/components/ui/UploadProgressBanner";
import newsHero from "@/assets/Skating_header.jpg";

const defaultForm = {
  heading: "",
  about: "",
  img: null // File object or null
};

const validateForm = (formData, isEditMode) => {
  const errors = {};
  if (!formData.heading.trim()) {
    errors.heading = "Heading / title is required.";
  }
  if (!formData.about.trim()) {
    errors.about = "About / content is required.";
  }
  if (!isEditMode && !formData.img) {
    errors.img = "Please select an image for the news.";
  }
  return errors;
};

const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
};

export const NewsFormPage = () => {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const isEditing = Boolean(newsId);

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchNewsItem = async () => {
        try {
          const { data } = await newsApi.getById(newsId);
          const item = data?.data ?? data;
          setFormData({
            heading: item.heading ?? "",
            about: item.about ?? "",
            img: null // require re-upload if changing, or leave null to keep
          });
          if (item.img) {
            setImgPreviewUrl(item.img);
          }
        } catch (error) {
          setFetchError("The news article you are trying to edit is not available.");
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchNewsItem();
    }
  }, [newsId, isEditing]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (imgPreviewUrl && imgPreviewUrl.startsWith("blob:")) {
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
    if (imgPreviewUrl && imgPreviewUrl.startsWith("blob:")) {
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
      payload.append("heading", formData.heading.trim());
      payload.append("about", formData.about.trim());
      if (formData.img) {
        payload.append("img", formData.img);
      }

      if (isEditing) {
        await newsApi.update(newsId, payload);
      } else {
        await newsApi.create(payload);
      }

      navigate("/news");
    } catch (error) {
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
          News not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>{fetchError}</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/news")}>
          Back to news
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
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${newsHero}")`,
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
              to="/news"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              News
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update News Article" : "Create News Article"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Update the heading, content, or image of this article."
              : "Fill in the details below to publish a new news article."}
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
        <UploadProgressBanner isSubmitting={submitting} isEditing={isEditing} />
        <Stack spacing={2.5}>
          {apiError && (
            <Alert severity="error" onClose={() => setApiError(null)} sx={{ borderRadius: "14px" }}>
              {apiError}
            </Alert>
          )}

          {/* Section: Article Info */}
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
                <ArticleOutlinedIcon />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}
                >
                  Article Information
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>
                  Heading and content for this news article.
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2}>
              <TextField
                label="Heading / Title"
                value={formData.heading}
                onChange={handleFieldChange("heading")}
                error={Boolean(formErrors.heading)}
                helperText={formErrors.heading}
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
                label="About / Content"
                value={formData.about}
                onChange={handleFieldChange("about")}
                error={Boolean(formErrors.about)}
                helperText={formErrors.about}
                multiline
                minRows={4}
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

          {/* Section: Cover Image */}
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
                  Cover Image {isEditing ? "(Optional)" : "*"}
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>
                  {isEditing
                    ? "Leave empty to keep the existing image."
                    : "Upload a cover image for this news article."}
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
                Choose Cover Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {imgPreviewUrl ? (
                <div className="rounded-2xl border border-[#efe2dc] bg-white p-3 shadow-sm">
                  <img
                    src={imgPreviewUrl}
                    alt="Cover preview"
                    className="h-44 w-full rounded-xl object-cover"
                  />
                  {formData.img && (
                    <Typography sx={{ mt: 1, fontSize: 13, color: "#6f6462" }}>
                      {formData.img.name}
                    </Typography>
                  )}
                </div>
              ) : (
                <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>
                  No cover image selected
                </Typography>
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
            <Button variant="outlined" onClick={() => navigate("/news")} disabled={submitting}>
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
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create News"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
