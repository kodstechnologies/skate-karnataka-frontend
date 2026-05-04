import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

const sectionCardStyles = {
  p: { xs: 2.25, md: 2.75 },
  borderRadius: "28px",
  border: "1px solid rgba(244, 228, 221, 0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
  boxShadow: "0 24px 70px rgba(48, 30, 24, 0.06)"
};

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

const SectionCard = ({ icon, title, description, children }) => (
  <Paper elevation={0} sx={sectionCardStyles}>
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

export const DistrictForm = ({ formData, errors, onFieldChange, onFileChange }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileChange(file);
  };

  const handleRemoveImage = () => {
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Stack spacing={2.5}>
      {/* Section 1 — District Info */}
      <SectionCard
        icon={<ApartmentOutlinedIcon />}
        title="District Information"
        description="Enter the district name, a brief description, and office address."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="District name *"
            value={formData.districtName}
            onChange={onFieldChange("districtName")}
            error={Boolean(errors.districtName)}
            helperText={errors.districtName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Office address"
            value={formData.officeAddress}
            onChange={onFieldChange("officeAddress")}
            error={Boolean(errors.officeAddress)}
            helperText={errors.officeAddress}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="About"
            value={formData.about}
            onChange={onFieldChange("about")}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
        </Box>
      </SectionCard>

      {/* Section 2 — District Image */}
      <SectionCard
        icon={<ImageOutlinedIcon />}
        title="District Image"
        description="Upload a representative image for this district (optional)."
      >
        <Stack spacing={2}>
          {formData.imgPreview ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={formData.imgPreview}
                variant="rounded"
                sx={{ width: 80, height: 80, borderRadius: "16px", border: "1px solid #f0e4dd" }}
              />
              <Stack spacing={1}>
                <Typography sx={{ fontSize: 13, color: "#5a4f4c", fontWeight: 600 }}>
                  {formData.imgFile ? formData.imgFile.name : "Current image"}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Upload size={14} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ borderRadius: "12px", fontSize: 12 }}
                  >
                    Change
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<X size={14} />}
                    onClick={handleRemoveImage}
                    sx={{ borderRadius: "12px", fontSize: 12 }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed rgba(246,118,94,0.35)",
                borderRadius: "20px",
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "rgba(246,118,94,0.03)",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#f6765e",
                  backgroundColor: "rgba(246,118,94,0.07)"
                }
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  backgroundColor: "rgba(246,118,94,0.12)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5
                }}
              >
                <Upload size={22} color="#f6765e" />
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
                Click to upload image
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
                PNG, JPG, JPEG supported
              </Typography>
            </Box>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </Stack>
      </SectionCard>
    </Stack>
  );
};
