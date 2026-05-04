import { useEffect, useState } from "react";
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
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
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

export const CircularFormPage = () => {
  const navigate = useNavigate();
  const { circularId } = useParams();
  const isEditing = Boolean(circularId);

  const circulars = useCircularsStore((s) => s.circulars);
  const fetchCirculars = useCircularsStore((s) => s.fetchCirculars);
  const addCircular = useCircularsStore((s) => s.addCircular);
  const updateCircular = useCircularsStore((s) => s.updateCircular);

  const existing = circulars.find((c) => c.id === circularId) ?? null;

  const [formData, setFormData] = useState({ img: null, heading: "", text: "", date: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        date: existing.date ? existing.date.split("T")[0] : ""
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
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, img: "Only image files allowed" }));
      return;
    }
    setFormData((p) => ({ ...p, img: file }));
    setErrors((p) => ({ ...p, img: "" }));
  };

  const handleRemoveImg = () => setFormData((p) => ({ ...p, img: null }));

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
        {isSubmitting && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: "18px",
              border: "1px solid rgba(246,118,94,0.3)",
              backgroundColor: "rgba(246,118,94,0.06)"
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.25 }}>
              <CircularProgress size={18} thickness={5} sx={{ color: "#f6765e", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#c56b53" }}>
                {isEditing ? "Saving changes & uploading…" : "Creating circular & uploading…"}
              </Typography>
            </Stack>
            <LinearProgress
              sx={{
                borderRadius: "8px",
                backgroundColor: "rgba(246,118,94,0.18)",
                "& .MuiLinearProgress-bar": { backgroundColor: "#f6765e", borderRadius: "8px" }
              }}
            />
            <Typography sx={{ mt: 1, fontSize: 11, color: "#a28f89" }}>
              Please wait — do not close this page.
            </Typography>
          </Box>
        )}

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
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "14px",
                  border: "1px solid #efe2dc",
                  backgroundColor: "white"
                }}
              >
                <ImageOutlinedIcon sx={{ fontSize: 20, color: "#f6765e" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2f2829" }}>
                    {formData.img.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#978883" }}>Ready to save</Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<X size={13} />}
                  color="error"
                  onClick={handleRemoveImg}
                  sx={{ borderRadius: "10px", textTransform: "none", fontSize: 12 }}
                >
                  Remove
                </Button>
              </Box>
            )}
            {errors.img && (
              <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>{errors.img}</Typography>
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
          sx={{ justifyContent: "flex-end", alignItems: "center" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/circulars")}
            disabled={isSubmitting}
            sx={{ borderRadius: "14px", textTransform: "none" }}
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
              minWidth: 160,
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
