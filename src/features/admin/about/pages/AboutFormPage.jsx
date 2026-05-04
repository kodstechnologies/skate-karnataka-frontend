import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ChevronRight, Info, Mail, MapPin, Phone, Save, Users, X } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import aboutHero from "@/assets/AboutUs_header.png";
import { useAboutStore } from "@/features/admin/about/store/about-store";

// ── Styles ───────────────────────────────────────────────────────────────────

const sectionCard = {
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

// ── Section Card Wrapper ──────────────────────────────────────────────────────

const SectionCard = ({ icon, title, description, children }) => (
  <Paper elevation={0} sx={sectionCard}>
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
        {icon}
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>{description}</Typography>
      </Box>
    </Stack>
    {children}
  </Paper>
);

// ── Single File Upload Field ──────────────────────────────────────────────────

const SingleFileField = ({ label, fileValue, existingUrl, error, onChange, onRemove }) => (
  <Box
    sx={{ p: 2.25, borderRadius: "22px", border: "1px solid #f4e5de", backgroundColor: "#fffaf8" }}
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
      {label}
    </Typography>
    {existingUrl && !fileValue && (
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={existingUrl}
          variant="rounded"
          sx={{ width: 56, height: 56, borderRadius: "14px" }}
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
      {existingUrl ? "Replace" : "Choose"} Image
      <input type="file" accept="image/*" hidden onChange={onChange} />
    </Button>
    {fileValue && (
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2f2829",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {fileValue.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#978883" }}>Ready to save</Typography>
        </Box>
        <Tooltip title="Remove selected file">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              color: "#e06f58",
              border: "1px solid #f2d9d1",
              backgroundColor: "#fff6f2",
              "&:hover": { backgroundColor: "#ffe8e2" }
            }}
          >
            <X size={14} />
          </IconButton>
        </Tooltip>
      </Box>
    )}
    {error && <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>{error}</Typography>}
  </Box>
);

// ── Multi File Upload Field ───────────────────────────────────────────────────

const MultiFileField = ({
  label,
  files,
  existingUrls,
  error,
  onChange,
  onRemoveAt,
  onClearAll
}) => (
  <Box
    sx={{ p: 2.25, borderRadius: "22px", border: "1px solid #f4e5de", backgroundColor: "#fffaf8" }}
  >
    <Stack direction="row" sx={{ mb: 1, alignItems: "center", justifyContent: "space-between" }}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: "#7f706c",
          textTransform: "uppercase",
          letterSpacing: "0.08em"
        }}
      >
        {label}
      </Typography>
      {files?.length > 0 && (
        <Typography sx={{ fontSize: 11, color: "#a28f89" }}>
          {files.length} image{files.length > 1 ? "s" : ""} selected
        </Typography>
      )}
    </Stack>

    {/* ── Always show existing server images ── */}
    {existingUrls?.length > 0 && (
      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" sx={{ mb: 0.75, alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 11, color: "#a28f89" }}>
            Current saved images ({existingUrls.length}):
          </Typography>
          {files?.length > 0 && (
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                px: 1,
                py: 0.25,
                borderRadius: "6px",
                backgroundColor: "#fdf0eb",
                color: "#c56b53"
              }}
            >
              Will be replaced on save
            </Typography>
          )}
        </Stack>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {existingUrls.map((url, i) => (
            <Avatar
              key={i}
              src={url}
              variant="rounded"
              sx={{
                width: 72,
                height: 72,
                borderRadius: "14px",
                border: files?.length > 0 ? "2px dashed #f0b8a8" : "2px solid #f0e1da",
                opacity: files?.length > 0 ? 0.65 : 1,
                transition: "opacity 0.2s"
              }}
            />
          ))}
        </Stack>
      </Box>
    )}

    {/* ── New files to upload ── */}
    {files?.length > 0 && (
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, color: "#6aab6a", fontWeight: 600, mb: 0.75 }}>
          New images to upload ({files.length}):
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 1.25
          }}
        >
          {files.map((f, i) => (
            <Box key={i} sx={{ position: "relative" }}>
              <Avatar
                src={URL.createObjectURL(f)}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: 80,
                  borderRadius: "14px",
                  border: "2px solid #a8d5a2"
                }}
              />
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  onClick={() => onRemoveAt(i)}
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    width: 20,
                    height: 20,
                    color: "white",
                    backgroundColor: "rgba(224,111,88,0.92)",
                    "&:hover": { backgroundColor: "#c0392b" }
                  }}
                >
                  <X size={11} />
                </IconButton>
              </Tooltip>
              <Typography
                title={f.name}
                sx={{
                  mt: 0.5,
                  fontSize: 10,
                  color: "#8d7f7b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center"
                }}
              >
                {f.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    )}

    {/* Action buttons */}
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFileOutlinedIcon />}
        sx={{ borderRadius: "14px", textTransform: "none" }}
      >
        {files?.length > 0 ? "Add More Images" : "Choose Images"}
        <input type="file" accept="image/*" multiple hidden onChange={onChange} />
      </Button>
      {files?.length > 0 && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<X size={14} />}
          onClick={onClearAll}
          sx={{ borderRadius: "12px", textTransform: "none", fontSize: 12 }}
        >
          Clear all
        </Button>
      )}
    </Stack>

    {error && <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>{error}</Typography>}
  </Box>
);

// ── initial values ────────────────────────────────────────────────────────────

const blankForm = {
  logo: null,
  img: [],
  heading: "",
  about: "",
  ourMission: "",
  student: "",
  address: "",
  email: "",
  phoneNo: ""
};

const fromExisting = (a) => ({
  logo: null,
  img: [],
  heading: a.heading ?? "",
  about: a.about ?? "",
  ourMission: a.ourMission ?? "",
  student: a.student ?? "",
  address: a.address ?? "",
  email: a.email ?? "",
  phoneNo: a.phoneNo ?? ""
});

// ── AboutFormPage ─────────────────────────────────────────────────────────────

export const AboutFormPage = () => {
  const navigate = useNavigate();

  const about = useAboutStore((s) => s.about);
  const fetchAbout = useAboutStore((s) => s.fetchAbout);
  const createAbout = useAboutStore((s) => s.createAbout);
  const updateAbout = useAboutStore((s) => s.updateAbout);
  const isLoading = useAboutStore((s) => s.isLoading);

  const isEditing = Boolean(about);

  const [formData, setFormData] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!about && !isLoading) fetchAbout();
  }, [about, isLoading, fetchAbout]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (about) setFormData(fromExisting(about));
  }, [about]);

  const handleField = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, logo: "Only image files allowed" }));
      return;
    }
    setFormData((p) => ({ ...p, logo: file }));
    setErrors((p) => ({ ...p, logo: "" }));
  };

  const handleRemoveLogo = () => {
    setFormData((p) => ({ ...p, logo: null }));
  };

  const handleImgMulti = (e) => {
    const newFiles = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    // Append new files to existing selection (deduplicate by name+size)
    setFormData((p) => {
      const existing = p.img;
      const toAdd = newFiles.filter(
        (nf) => !existing.some((ef) => ef.name === nf.name && ef.size === nf.size)
      );
      return { ...p, img: [...existing, ...toAdd] };
    });
    setErrors((p) => ({ ...p, img: "" }));
    // Reset file input so same files can be re-selected if removed
    e.target.value = "";
  };

  const handleRemoveImgAt = (index) => {
    setFormData((p) => ({ ...p, img: p.img.filter((_, i) => i !== index) }));
  };

  const handleClearAllImg = () => {
    setFormData((p) => ({ ...p, img: [] }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.heading.trim()) errs.heading = "Heading is required";
    if (!formData.about.trim()) errs.about = "About is required";
    if (!formData.ourMission.trim()) errs.ourMission = "Our Mission is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.phoneNo.trim()) errs.phoneNo = "Phone number is required";
    if (!isEditing && !formData.logo) errs.logo = "Logo is required for new record";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const ok = isEditing ? await updateAbout(formData) : await createAbout(formData);
    setIsSubmitting(false);
    if (ok) navigate("/about");
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${aboutHero}")`,
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
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: { xs: -40, md: 24 },
            top: { xs: -30, md: 24 },
            width: { xs: 140, md: 220 },
            height: { xs: 140, md: 220 },
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
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
                to="/about"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                About Us
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
              About Us Workspace
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {isEditing ? "Update About Us" : "Create About Us"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {isEditing
                ? "Update the organisation's public about page information."
                : "Build the organisation's public-facing About Us profile."}
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Info size={16} />}
                label={isEditing ? "Editing record" : "New record"}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Form Card ──────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        {/* ── Upload progress banner ── */}
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
                {isEditing
                  ? "Saving changes & uploading files…"
                  : "Creating record & uploading files…"}
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
              Please wait — images are being uploaded to the server. Do not close this page.
            </Typography>
          </Box>
        )}

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829", mb: 0.75 }}
        >
          {isEditing ? "Update information" : "Enter organisation details"}
        </Typography>
        <Typography sx={{ color: "#8d7f7b", lineHeight: 1.7, mb: 3 }}>
          Fill in all the sections below to {isEditing ? "update" : "publish"} the About Us page.
        </Typography>

        <Stack spacing={2.5}>
          {/* ── Media Section ─────────────────────────────────── */}
          <SectionCard
            icon={<ImageOutlinedIcon />}
            title="Media"
            description="Upload the organisation logo and gallery images."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2
              }}
            >
              <SingleFileField
                label="Logo"
                fileValue={formData.logo}
                existingUrl={about?.logo}
                error={errors.logo}
                onChange={handleLogo}
                onRemove={handleRemoveLogo}
              />
              <MultiFileField
                label="Gallery Images"
                files={formData.img}
                existingUrls={about?.img}
                error={errors.img}
                onChange={handleImgMulti}
                onRemoveAt={handleRemoveImgAt}
                onClearAll={handleClearAllImg}
              />
            </Box>
          </SectionCard>

          {/* ── General Info ──────────────────────────────────── */}
          <SectionCard
            icon={<Info size={22} />}
            title="General Information"
            description="Main heading, about text and mission statement."
          >
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
                label="About"
                value={formData.about}
                onChange={handleField("about")}
                error={Boolean(errors.about)}
                helperText={errors.about}
                multiline
                minRows={3}
                fullWidth
                sx={{ ...inputSx, gridColumn: { md: "span 2" } }}
              />
              <TextField
                label="Our Mission"
                value={formData.ourMission}
                onChange={handleField("ourMission")}
                error={Boolean(errors.ourMission)}
                helperText={errors.ourMission}
                multiline
                minRows={2}
                fullWidth
                sx={{ ...inputSx, gridColumn: { md: "span 2" } }}
              />
            </Box>
          </SectionCard>

          {/* ── Stats & Contact ───────────────────────────────── */}
          <SectionCard
            icon={<Users size={22} />}
            title="Stats & Contact"
            description="Student count and public contact details."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2
              }}
            >
              <TextField
                label="Total Students"
                type="number"
                value={formData.student}
                onChange={handleField("student")}
                error={Boolean(errors.student)}
                helperText={errors.student}
                slotProps={{
                  input: {
                    startAdornment: <Users size={16} style={{ color: "#b3a5a0", marginRight: 8 }} />
                  }
                }}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Address"
                value={formData.address}
                onChange={handleField("address")}
                error={Boolean(errors.address)}
                helperText={errors.address}
                slotProps={{
                  input: {
                    startAdornment: (
                      <MapPin size={16} style={{ color: "#b3a5a0", marginRight: 8 }} />
                    )
                  }
                }}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleField("email")}
                error={Boolean(errors.email)}
                helperText={errors.email}
                slotProps={{
                  input: {
                    startAdornment: <Mail size={16} style={{ color: "#b3a5a0", marginRight: 8 }} />
                  }
                }}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Phone Number"
                value={formData.phoneNo}
                onChange={handleField("phoneNo")}
                error={Boolean(errors.phoneNo)}
                helperText={errors.phoneNo}
                slotProps={{
                  input: {
                    startAdornment: <Phone size={16} style={{ color: "#b3a5a0", marginRight: 8 }} />
                  }
                }}
                fullWidth
                sx={inputSx}
              />
            </Box>
          </SectionCard>
        </Stack>

        {/* Action row */}
        <Divider sx={{ my: 3, borderColor: "rgba(240,219,210,0.9)" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end", alignItems: "center" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/about")}
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
                : "Create About Us"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
