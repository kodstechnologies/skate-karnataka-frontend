import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
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

const FileUploadField = ({ label, fileValue, error, helperText, onChange }) => (
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
      {label}
    </Typography>
    <Typography sx={{ mb: 1.75, color: "#9b8d88", fontSize: 13 }}>
      Upload an image for this section.
    </Typography>
    <Stack spacing={1.5}>
      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFileOutlinedIcon />}
        sx={{ alignSelf: "flex-start", borderRadius: "14px" }}
      >
        Choose Image
        <input type="file" accept="image/*" hidden onChange={onChange} />
      </Button>
      {fileValue ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#efe2dc] bg-white px-3 py-3 text-sm text-[#6f6462] shadow-sm">
          <ImageOutlinedIcon sx={{ fontSize: 20, color: "#f6765e" }} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-[#2f2829]">{fileValue.name}</div>
            <div className="text-xs text-[#978883]">Image ready to save</div>
          </div>
        </div>
      ) : (
        <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>No Image selected</Typography>
      )}
    </Stack>
    <Typography
      sx={{ mt: 1.25, minHeight: 20, color: error ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}
    >
      {error || helperText}
    </Typography>
  </Box>
);

export const ClubForm = ({ formData, errors, districts, onFieldChange, onFileChange }) => {
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
            error={errors.img}
            helperText="Optional image upload"
            onChange={onFileChange("img")}
          />
        </Box>
      </SectionCard>
    </Stack>
  );
};
