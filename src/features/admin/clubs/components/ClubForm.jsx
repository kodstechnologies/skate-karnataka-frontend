import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import StadiumOutlinedIcon from "@mui/icons-material/StadiumOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { coachAvailabilityOptions } from "@/features/admin/clubs/components/clubFormConfig";

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
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
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
      Upload a PDF document for this section.
    </Typography>
    <Stack spacing={1.5}>
      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFileOutlinedIcon />}
        sx={{ alignSelf: "flex-start", borderRadius: "14px" }}
      >
        Choose PDF
        <input type="file" accept="application/pdf,.pdf" hidden onChange={onChange} />
      </Button>
      {fileValue ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#efe2dc] bg-white px-3 py-3 text-sm text-[#6f6462] shadow-sm">
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: "#f6765e" }} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-[#2f2829]">{fileValue.name}</div>
            <div className="text-xs text-[#978883]">PDF ready to save</div>
          </div>
        </div>
      ) : (
        <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>No PDF selected</Typography>
      )}
    </Stack>
    <Typography
      sx={{ mt: 1.25, minHeight: 20, color: error ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}
    >
      {error || helperText}
    </Typography>
  </Box>
);

export const ClubForm = ({ formData, errors, onFieldChange, onFileChange }) => {
  return (
    <Stack spacing={2.5}>
      <SectionCard
        icon={<ApartmentOutlinedIcon />}
        title="Club Identity"
        description="Add the main club registration details and upload official supporting papers."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Club login"
            value={formData.clubLogin}
            onChange={onFieldChange("clubLogin")}
            error={Boolean(errors.clubLogin)}
            helperText={errors.clubLogin || "Optional login or short identifier"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Name of club"
            value={formData.clubName}
            onChange={onFieldChange("clubName")}
            error={Boolean(errors.clubName)}
            helperText={errors.clubName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="District"
            value={formData.district}
            onChange={onFieldChange("district")}
            error={Boolean(errors.district)}
            helperText={errors.district}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="ROS number"
            value={formData.rosNumber}
            onChange={onFieldChange("rosNumber")}
            error={Boolean(errors.rosNumber)}
            helperText={errors.rosNumber || "Optional registration number"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Registration address"
            value={formData.registrationAddress}
            onChange={onFieldChange("registrationAddress")}
            error={Boolean(errors.registrationAddress)}
            helperText={errors.registrationAddress}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <FileUploadField
            label="ROS certificate"
            fileValue={formData.rosCertificate}
            error={errors.rosCertificate}
            helperText="Optional PDF upload"
            onChange={onFileChange("rosCertificate")}
          />
          <FileUploadField
            label="Documents"
            fileValue={formData.documents}
            error={errors.documents}
            helperText="Optional PDF upload"
            onChange={onFileChange("documents")}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<GroupsOutlinedIcon />}
        title="Office Bearers"
        description="Store the main contact people who represent the club."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Club president name"
            value={formData.clubPresidentName}
            onChange={onFieldChange("clubPresidentName")}
            error={Boolean(errors.clubPresidentName)}
            helperText={errors.clubPresidentName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Club president number"
            value={formData.clubPresidentPhone}
            onChange={onFieldChange("clubPresidentPhone")}
            error={Boolean(errors.clubPresidentPhone)}
            helperText={errors.clubPresidentPhone}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Club secretary name"
            value={formData.clubSecretaryName}
            onChange={onFieldChange("clubSecretaryName")}
            error={Boolean(errors.clubSecretaryName)}
            helperText={errors.clubSecretaryName || "Optional"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Club secretary number"
            value={formData.clubSecretaryPhone}
            onChange={onFieldChange("clubSecretaryPhone")}
            error={Boolean(errors.clubSecretaryPhone)}
            helperText={errors.clubSecretaryPhone || "Optional"}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<SportsScoreOutlinedIcon />}
        title="Skater Capacity"
        description="Track the current skater distribution across categories."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))"
            },
            gap: 2
          }}
        >
          <TextField
            label="Tenacity skaters"
            type="number"
            value={formData.tenacitySkatersCount}
            onChange={onFieldChange("tenacitySkatersCount")}
            error={Boolean(errors.tenacitySkatersCount)}
            helperText={errors.tenacitySkatersCount}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Recreational skaters"
            type="number"
            value={formData.recreationalSkatersCount}
            onChange={onFieldChange("recreationalSkatersCount")}
            error={Boolean(errors.recreationalSkatersCount)}
            helperText={errors.recreationalSkatersCount}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Quad skaters"
            type="number"
            value={formData.quadSkatersCount}
            onChange={onFieldChange("quadSkatersCount")}
            error={Boolean(errors.quadSkatersCount)}
            helperText={errors.quadSkatersCount}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Pro inline skaters"
            type="number"
            value={formData.proInlineSkatersCount}
            onChange={onFieldChange("proInlineSkatersCount")}
            error={Boolean(errors.proInlineSkatersCount)}
            helperText={errors.proInlineSkatersCount}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<StadiumOutlinedIcon />}
        title="Facility and Coaching"
        description="Capture rink details and coaching support available at the club."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Track address"
            value={formData.trackAddress}
            onChange={onFieldChange("trackAddress")}
            error={Boolean(errors.trackAddress)}
            helperText={errors.trackAddress || "Optional"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Track measurements"
            value={formData.trackMeasurements}
            onChange={onFieldChange("trackMeasurements")}
            error={Boolean(errors.trackMeasurements)}
            helperText={errors.trackMeasurements || "Optional"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="No of trainers"
            type="number"
            value={formData.trainersCount}
            onChange={onFieldChange("trainersCount")}
            error={Boolean(errors.trainersCount)}
            helperText={errors.trainersCount || "Optional"}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            select
            label="Trainers / coaches available"
            value={formData.coachesAvailable}
            onChange={onFieldChange("coachesAvailable")}
            error={Boolean(errors.coachesAvailable)}
            helperText={errors.coachesAvailable || "Optional"}
            fullWidth
            sx={inputStyles}
          >
            {coachAvailabilityOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </SectionCard>
    </Stack>
  );
};
