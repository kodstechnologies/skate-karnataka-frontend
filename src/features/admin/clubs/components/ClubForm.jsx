import { useEffect, useMemo, useRef, useState } from "react";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

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

const FileUploadField = ({ label, fileValue, existingImageUrl, error, helperText, onChange }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (!fileValue) return null;

    return URL.createObjectURL(fileValue);
  }, [fileValue]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageFile = (file) => {
    if (!file?.type?.startsWith("image/")) return;
    onChange({ target: { files: [file] } });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const displayPreview = previewUrl || existingImageUrl;

  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: "22px",
        border: "1px solid #f4e5de",
        backgroundColor: "#fffaf8",
        gridColumn: { md: "span 2" }
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
        {label}
      </Typography>
      <Typography sx={{ mb: 1.75, color: "#9b8d88", fontSize: 13 }}>
        Upload an image for this section.
      </Typography>
      <Stack spacing={1.5}>
        {displayPreview ? (
          <div className="rounded-2xl border border-[#efe2dc] bg-white p-3 shadow-sm">
            <img
              src={displayPreview}
              alt={fileValue ? "New preview" : "Existing preview"}
              className="h-44 w-full rounded-xl object-cover"
            />
            <div className="mt-2 truncate text-center text-sm font-semibold text-[#2f2829]">
              {fileValue ? fileValue.name : "Current image"}
            </div>
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mt: 1.5, borderRadius: "12px", fontSize: 12 }}
            >
              Change image
            </Button>
          </div>
        ) : (
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: isDragging ? "2px dashed #f6765e" : "2px dashed rgba(246,118,94,0.35)",
              borderRadius: "20px",
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: isDragging ? "rgba(246,118,94,0.12)" : "rgba(246,118,94,0.03)",
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
              <UploadFileOutlinedIcon sx={{ fontSize: 22, color: "#f6765e" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
              {isDragging ? "Drop image here" : "Drag and drop or click to upload"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
              PNG, JPG, JPEG supported
            </Typography>
          </Box>
        )}
      </Stack>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
      <Typography
        sx={{ mt: 1.25, minHeight: 20, color: error ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}
      >
        {error || helperText}
      </Typography>
    </Box>
  );
};

export const ClubForm = ({
  formData,
  existingImageUrl,
  errors,
  districts,
  onFieldChange,
  onFileChange
}) => {
  return (
    <Stack spacing={2.5}>
      <SectionCard
        icon={<ApartmentOutlinedIcon />}
        title="Club Identity"
        description="Add the main club registration details."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Name of club"
            value={formData.name}
            onChange={onFieldChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            select
            label="District"
            value={formData.district}
            onChange={onFieldChange("district")}
            error={Boolean(errors.district)}
            helperText={errors.district}
            fullWidth
            sx={inputStyles}
          >
            {districts?.map((district) => (
              <MenuItem key={district.id} value={district.id}>
                {district.districtName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Office address"
            value={formData.officeAddress}
            onChange={onFieldChange("officeAddress")}
            error={Boolean(errors.officeAddress)}
            helperText={errors.officeAddress}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <TextField
            label="About"
            value={formData.about}
            onChange={onFieldChange("about")}
            error={Boolean(errors.about)}
            helperText={errors.about}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <FileUploadField
            label="Club Image"
            fileValue={formData.img}
            existingImageUrl={existingImageUrl}
            error={errors.img}
            helperText="Optional image upload"
            onChange={onFileChange("img")}
          />
        </Box>
      </SectionCard>
    </Stack>
  );
};
