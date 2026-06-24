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
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { aboutUsCardHero } from "../about-us-card-assets";
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

export const AboutUsCardFormPage = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const { state } = useLocation();
  const passedCard = state?.card;
  const isEditing = Boolean(cardId);

  const createCard = useAboutUsCardStore((s) => s.createCard);
  const updateCard = useAboutUsCardStore((s) => s.updateCard);

  const [title, setTitle] = useState(passedCard?.title ?? "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(passedCard?.photo ?? null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (passedCard) {
      setTitle(passedCard.title ?? "");
      setPhotoPreviewUrl(passedCard.photo ?? null);
    }
  }, [passedCard]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFile(file);
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!isEditing && !photoFile && !passedCard?.photo) {
      nextErrors.photo = "Please select a photo for the card.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    if (photoFile) formData.append("photo", photoFile);

    setIsSubmitting(true);
    const ok = isEditing ? await updateCard(cardId, formData) : await createCard(formData);
    setIsSubmitting(false);

    if (ok) navigate("/about-us-card");
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 250, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${aboutUsCardHero}")`,
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
              to="/about-us-card"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              About usCard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update About usCard" : "Create About usCard"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Update the title or photo of this card."
              : "Fill in the details below to add a new about us card."}
          </Typography>
        </Stack>
      </Paper>

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
          <Paper elevation={0} sx={sectionPaperSx}>
            <SectionHeader
              icon={ArticleOutlinedIcon}
              title="Card Information"
              description="Title displayed on the about us card."
            />
            <TextField
              label="Card Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              error={Boolean(errors.title)}
              helperText={errors.title}
              fullWidth
              autoFocus={!isEditing}
              sx={inputSx}
            />
          </Paper>

          <Paper elevation={0} sx={sectionPaperSx}>
            <SectionHeader
              icon={ImageOutlinedIcon}
              title={`Card Photo ${isEditing ? "(Optional)" : "*"}`}
              description={
                isEditing
                  ? "Leave empty to keep the existing photo."
                  : "Upload a photo for this about us card."
              }
            />

            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
                sx={{ alignSelf: "flex-start", borderRadius: "14px", textTransform: "none" }}
              >
                Choose Card Photo
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
                    alt="Card photo preview"
                    sx={{
                      width: "100%",
                      height: 176,
                      borderRadius: "12px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                  {photoFile && (
                    <Typography sx={{ mt: 1, fontSize: 13, color: "#6f6462" }}>
                      {photoFile.name}
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
              onClick={() => navigate("/about-us-card")}
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
              {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Card"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
