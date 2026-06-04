import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ChevronRight, Save, X } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useOnboardingStore } from "../store/onboarding-store";

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.92)" }
};

const ImageField = ({ label, fileValue, existingUrl, error, onChange, onRemove }) => (
  <Box sx={{ p: 2, borderRadius: "22px", border: "1px solid #f4e5de", backgroundColor: "#fffaf8" }}>
    <Typography
      sx={{
        mb: 1,
        fontSize: 12,
        fontWeight: 700,
        color: "#7f706c",
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      }}
    >
      {label}
    </Typography>

    {existingUrl && !fileValue && (
      <Box
        component="img"
        src={existingUrl}
        alt={label}
        sx={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: "16px",
          mb: 1.5,
          border: "2px solid #f0e1da"
        }}
      />
    )}

    <Button
      component="label"
      variant="outlined"
      startIcon={<UploadFileOutlinedIcon />}
      sx={{ borderRadius: "14px", textTransform: "none" }}
    >
      {existingUrl ? "Replace" : "Choose"} Image
      <input type="file" accept="image/*" hidden onChange={onChange} />
    </Button>

    {fileValue && (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mt: 1.5,
          p: 1.5,
          borderRadius: "14px",
          border: "1px solid #efe2dc",
          backgroundColor: "white",
          alignItems: "center"
        }}
      >
        <Avatar
          src={fileValue ? URL.createObjectURL(fileValue) : ""}
          variant="rounded"
          sx={{ width: 56, height: 56, borderRadius: "12px" }}
        />
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
          <Typography sx={{ fontSize: 11, color: "#978883" }}>Ready to upload</Typography>
        </Box>
        <Tooltip title="Remove">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ color: "#e06f58", border: "1px solid #f2d9d1", backgroundColor: "#fff6f2" }}
          >
            <X size={14} />
          </IconButton>
        </Tooltip>
      </Stack>
    )}

    {error && <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f" }}>{error}</Typography>}
  </Box>
);

export const OnboardingFormPage = () => {
  const navigate = useNavigate();
  const onboarding = useOnboardingStore((s) => s.onboarding);
  const fetchOnboarding = useOnboardingStore((s) => s.fetchOnboarding);
  const createOnboarding = useOnboardingStore((s) => s.createOnboarding);
  const updateOnboarding = useOnboardingStore((s) => s.updateOnboarding);

  const isEditing = Boolean(onboarding);
  const [files, setFiles] = useState({ imgOne: null, imgTwo: null, imgThree: null });
  const [urlInputs, setUrlInputs] = useState({ imgOne: "", imgTwo: "", imgThree: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  const handleFile = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((p) => ({ ...p, [key]: file }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleRemoveFile = (key) => () => {
    setFiles((p) => ({ ...p, [key]: null }));
  };

  const handleUrlChange = (key) => (e) => {
    const value = e.target.value;

    setUrlInputs((prev) => ({
      ...prev,
      [key]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: ""
    }));
  };

  const validate = () => {
    const errs = {};
    ["imgOne", "imgTwo", "imgThree"].forEach((key) => {
      const hasFile = Boolean(files[key]);
      const hasUrl = urlInputs[key]?.trim();
      const hasExisting = isEditing && onboarding?.[key];
      if (!hasFile && !hasUrl && !hasExisting) {
        errs[key] = "Image is required";
      }
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Build payload: files take priority, then typed URL, then keep existing
    const buildValue = (key) => files[key] || urlInputs[key]?.trim() || onboarding?.[key] || "";
    // If any file uploads, use FormData; otherwise plain JSON
    const hasFiles = Object.values(files).some(Boolean);
    let payload;
    if (hasFiles) {
      payload = new FormData();
      ["imgOne", "imgTwo", "imgThree"].forEach((key) => {
        if (files[key]) {
          payload.append(key, files[key]);
        } else {
          payload.append(key, buildValue(key));
        }
      });
    } else {
      payload = {
        imgOne: buildValue("imgOne"),
        imgTwo: buildValue("imgTwo"),
        imgThree: buildValue("imgThree")
      };
    }

    setIsSubmitting(true);
    const ok = isEditing
      ? await updateOnboarding(onboarding._id, payload)
      : await createOnboarding(payload);
    setIsSubmitting(false);
    if (ok) navigate("/onboarding");
  };

  const imageFields = [
    { key: "imgOne", label: "Image 1" },
    { key: "imgTwo", label: "Image 2" },
    { key: "imgThree", label: "Image 3" }
  ];

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 200, md: 230 },
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.8)",
          background: "linear-gradient(135deg, #2f2829 0%, #f6765e 100%)",
          color: "white"
        }}
      >
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          sx={{
            mb: 2,
            "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
            "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
          }}
        >
          <Typography
            component={RouterLink}
            to="/dashboard"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
          >
            Dashboard
          </Typography>
          <Typography
            component={RouterLink}
            to="/onboarding"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
          >
            Onboarding
          </Typography>
          <Typography sx={{ color: "white", fontWeight: 700 }}>
            {isEditing ? "Edit" : "Create"}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em", mb: 1 }}>
          {isEditing ? "Update Onboarding" : "Create Onboarding"}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 520 }}>
          Upload or paste URLs for the three onboarding screen images.
        </Typography>
      </Paper>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          background: "linear-gradient(180deg, #fff 0%, #fff9f6 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
          Onboarding Images
        </Typography>
        <Typography sx={{ color: "#8d7f7b", mb: 3 }}>
          Upload image files or provide URLs for each screen.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.5
          }}
        >
          {imageFields.map(({ key, label }) => (
            <Box key={key}>
              <ImageField
                label={label}
                fileValue={files[key]}
                existingUrl={isEditing && !files[key] ? onboarding?.[key] : null}
                error={errors[key]}
                onChange={handleFile(key)}
                onRemove={handleRemoveFile(key)}
              />
              <TextField
                label={`${label} URL`}
                placeholder="https://..."
                value={urlInputs[key] !== "" ? urlInputs[key] : onboarding?.[key] || ""}
                onChange={handleUrlChange(key)}
                fullWidth
                size="small"
                sx={{ ...inputSx, mt: 1.5 }}
                helperText={files[key] ? "File selected — URL ignored" : ""}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3, borderColor: "rgba(240,219,210,0.9)" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/onboarding")}
            disabled={isSubmitting}
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
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
            {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Onboarding"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
