import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { UploadProgressBanner } from "@/components/ui/UploadProgressBanner";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ChevronRight, FileText, Save, X } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import circularsHero from "@/assets/Circulars_header.png";
import { useCircularsStore } from "@/features/admin/circulars/store/circulars-store";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

const isImageFile = (file) =>
  Boolean(file) &&
  (String(file.type || "").startsWith("image/") || IMAGE_EXTENSIONS.test(file.name || ""));

const useObjectUrl = (file) => {
  const url = useMemo(() => (file instanceof File ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    if (!url) return undefined;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
};

const RelatedImagePreview = ({ file, onRemove }) => {
  const previewUrl = useObjectUrl(file);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "14px",
        border: "1px solid #efe2dc",
        backgroundColor: "white",
        overflow: "hidden"
      }}
    >
      <Box
        component="img"
        src={previewUrl}
        alt={file.name}
        sx={{
          width: "100%",
          height: 120,
          objectFit: "cover",
          display: "block",
          backgroundColor: "#faf6f4"
        }}
      />
      <Box sx={{ p: 1 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#2f2829",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {file.name}
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          minWidth: 0,
          p: 0.5,
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.92)",
          color: "#d32f2f",
          "&:hover": { backgroundColor: "white" }
        }}
        aria-label="Remove image"
      >
        <X size={14} />
      </Button>
    </Box>
  );
};

export const CircularFormPage = () => {
  const navigate = useNavigate();
  const { circularId } = useParams();
  const isEditing = Boolean(circularId);

  const circulars = useCircularsStore((s) => s.circulars);
  const fetchCirculars = useCircularsStore((s) => s.fetchCirculars);
  const addCircular = useCircularsStore((s) => s.addCircular);
  const updateCircular = useCircularsStore((s) => s.updateCircular);

  const existing = circulars.find((c) => c.id === circularId) ?? null;

  const [formData, setFormData] = useState({
    img: null,
    heading: "",
    text: "",
    date: "",
    relatedInformationImages: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainImagePreview = useObjectUrl(formData.img);

  useEffect(() => {
    if (circulars.length === 0) fetchCirculars({ limit: 100 });
  }, [circulars.length, fetchCirculars]);

  useEffect(() => {
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        img: null,
        heading: existing.heading ?? "",
        text: existing.text ?? "",
        date: existing.date ? existing.date.split("T")[0] : "",
        relatedInformationImages: []
      });
    }
  }, [existing]);

  const handleField = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) {
      setErrors((p) => ({
        ...p,
        img: "Use a standard image file (JPG, PNG, WebP, or GIF)"
      }));
      return;
    }
    setFormData((p) => ({ ...p, img: file }));
    setErrors((p) => ({ ...p, img: "" }));
  };

  const handleRemoveImg = () => setFormData((p) => ({ ...p, img: null }));

  const handleRelatedImages = (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(isImageFile);
    if (imageFiles.length !== files.length) {
      setErrors((p) => ({
        ...p,
        relatedInformationImages: "Use standard image files (JPG, PNG, WebP, or GIF)"
      }));
    } else {
      setErrors((p) => ({ ...p, relatedInformationImages: "" }));
    }
    setFormData((p) => ({
      ...p,
      relatedInformationImages: [...p.relatedInformationImages, ...imageFiles]
    }));
    e.target.value = "";
  };

  const handleRemoveRelatedImage = (index) => {
    setFormData((p) => ({
      ...p,
      relatedInformationImages: p.relatedInformationImages.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.heading.trim()) errs.heading = "Heading is required";
    if (!formData.text.trim()) errs.text = "Text is required";
    if (!formData.date) errs.date = "Date is required";
    if (!isEditing && !formData.img) errs.img = "Image is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    const ok = isEditing ? await updateCircular(circularId, formData) : await addCircular(formData);
    setIsSubmitting(false);
    if (ok) navigate("/circulars");
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,28,0.92) 0%, rgba(30,20,50,0.76) 34%, rgba(80,60,160,0.28) 100%), url("${circularsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(18,14,28,0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 34%)",
            pointerEvents: "none"
          }}
        />

        <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ maxWidth: 760 }}>
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
                to="/circulars"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Circulars & Guidelines
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {isEditing ? "Edit" : "Create"}
              </Typography>
            </Breadcrumbs>

            <Typography
              sx={{
                mb: 1.25,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              Circular Workspace
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {isEditing ? "Edit Circular" : "Add New Circular"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {isEditing
                ? "Update the circular's details below."
                : "Fill in the details to publish a new circular or guideline."}
            </Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<FileText size={16} />}
                label={isEditing ? "Editing" : "New circular"}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Form Card ──────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: "32px",
          border: "1px solid rgba(240,219,210,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        {/* Upload progress banner */}
        <UploadProgressBanner isSubmitting={isSubmitting} isEditing={isEditing} />

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829", mb: 0.75 }}
        >
          {isEditing ? "Update circular" : "Circular details"}
        </Typography>
        <Typography sx={{ color: "#8d7f7b", lineHeight: 1.7, mb: 3 }}>
          All fields marked are required.
        </Typography>

        <Stack spacing={2.5}>
          {/* ── Image ─────────────────────────────────────────── */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: "22px",
              border: "1px solid #f4e5de",
              backgroundColor: "#fffaf8"
            }}
          >
            <Typography
              sx={{
                mb: 1,
                fontSize: 13,
                fontWeight: 700,
                color: "#7f706c",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Circular Image
            </Typography>
            <Typography sx={{ mb: 1.5, fontSize: 12, color: "#8d7f7b", lineHeight: 1.6 }}>
              Required cover image shown on the circulars list and detail page. Use JPG, PNG, or
              WebP (recommended size: 800×600 px or larger).
            </Typography>
            {existing?.img && !formData.img && (
              <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={existing.img}
                  variant="rounded"
                  sx={{ width: 64, height: 64, borderRadius: "14px" }}
                />
                <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                  Current image — will keep unless replaced
                </Typography>
              </Box>
            )}
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              sx={{ borderRadius: "14px" }}
            >
              {existing?.img ? "Replace Image" : "Choose Image"}
              <input type="file" accept="image/*" hidden onChange={handleImg} />
            </Button>
            {formData.img && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: "14px",
                  border: "1px solid #efe2dc",
                  backgroundColor: "white"
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box
                    component="img"
                    src={mainImagePreview}
                    alt={formData.img.name}
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: "12px",
                      objectFit: "cover",
                      border: "1px solid #f0e1da",
                      flexShrink: 0,
                      backgroundColor: "#faf6f4"
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2f2829" }}>
                      {formData.img.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#978883" }}>
                      Preview — this is how the cover will appear after save
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<X size={13} />}
                    color="error"
                    onClick={handleRemoveImg}
                    sx={{ borderRadius: "10px", textTransform: "none", fontSize: 12, flexShrink: 0 }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            )}
            {errors.img && (
              <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>{errors.img}</Typography>
            )}
          </Box>

          {/* ── Related Information Images ────────────────────── */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: "22px",
              border: "1px solid #f4e5de",
              backgroundColor: "#fffaf8"
            }}
          >
            <Typography
              sx={{
                mb: 1,
                fontSize: 13,
                fontWeight: 700,
                color: "#7f706c",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Related Information Images
              <Typography
                component="span"
                sx={{
                  ml: 1,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#b09f99",
                  textTransform: "none"
                }}
              >
                (Optional — multiple allowed)
              </Typography>
            </Typography>

            {/* Show existing images in edit mode when no new files are selected */}
            {isEditing &&
              existing?.relatedInformationImages?.length > 0 &&
              formData.relatedInformationImages.length === 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ mb: 1, fontSize: 12, color: "#8d7f7b" }}>
                    Currently attached — will keep unless you add new ones
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {existing.relatedInformationImages.map((url, idx) => (
                      <Avatar
                        key={idx}
                        src={url}
                        variant="rounded"
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "12px",
                          border: "1px solid #efe2dc"
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              sx={{ borderRadius: "14px" }}
            >
              Add Images
              <input type="file" accept="image/*" multiple hidden onChange={handleRelatedImages} />
            </Button>

            <Typography sx={{ mt: 1, mb: 1.5, fontSize: 12, color: "#8d7f7b", lineHeight: 1.6 }}>
              Optional extra images (posters, guidelines, notices) shown in the circular detail
              page. JPG, PNG, or WebP only.
            </Typography>

            {/* New file previews */}
            {formData.relatedInformationImages.length > 0 && (
              <Box
                sx={{
                  mt: 1.5,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))"
                  },
                  gap: 1.5
                }}
              >
                {formData.relatedInformationImages.map((file, idx) => (
                  <RelatedImagePreview
                    key={`${file.name}-${file.size}-${idx}`}
                    file={file}
                    onRemove={() => handleRemoveRelatedImage(idx)}
                  />
                ))}
              </Box>
            )}

            {errors.relatedInformationImages && (
              <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>
                {errors.relatedInformationImages}
              </Typography>
            )}
          </Box>

          {/* ── Text fields ───────────────────────────────────── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2
            }}
          >
            <TextField
              label="Heading"
              value={formData.heading}
              onChange={handleField("heading")}
              error={Boolean(errors.heading)}
              helperText={errors.heading}
              fullWidth
              sx={{ ...inputSx, gridColumn: { md: "span 2" } }}
            />
            <TextField
              label="Text"
              value={formData.text}
              onChange={handleField("text")}
              error={Boolean(errors.text)}
              helperText={errors.text}
              multiline
              minRows={3}
              fullWidth
              sx={{ ...inputSx, gridColumn: { md: "span 2" } }}
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleField("date")}
              error={Boolean(errors.date)}
              helperText={errors.date}
              fullWidth
              sx={inputSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 3, borderColor: "rgba(240,219,210,0.9)" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end", alignItems: "stretch" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/circulars")}
            disabled={isSubmitting}
            sx={{ borderRadius: "14px", textTransform: "none", width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} thickness={5} sx={{ color: "white" }} />
              ) : (
                <Save size={16} />
              )
            }
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              minWidth: { xs: 0, sm: 160 },
              width: { xs: "100%", sm: "auto" },
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: "#f6765e", color: "white", opacity: 0.75 }
            }}
          >
            {isSubmitting
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save changes"
                : "Add Circular"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
