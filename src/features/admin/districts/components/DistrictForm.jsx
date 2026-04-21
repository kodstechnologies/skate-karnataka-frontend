import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { districtStatusOptions } from "@/features/admin/districts/components/districtFormConfig";

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

export const DistrictForm = ({ formData, errors, onFieldChange, stateOptions }) => {
  return (
    <Stack spacing={2.5}>
      <SectionCard
        icon={<ApartmentOutlinedIcon />}
        title="District Identity"
        description="Register district code, state mapping, and office details."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="District name"
            value={formData.districtName}
            onChange={onFieldChange("districtName")}
            error={Boolean(errors.districtName)}
            helperText={errors.districtName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="District code"
            value={formData.districtCode}
            onChange={onFieldChange("districtCode")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            select
            label="State"
            value={formData.stateName}
            onChange={onFieldChange("stateName")}
            error={Boolean(errors.stateName)}
            helperText={errors.stateName}
            fullWidth
            disabled
            sx={inputStyles}
          >
            {stateOptions.map((stateName) => (
              <MenuItem key={stateName} value={stateName}>
                {stateName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Office address"
            value={formData.officeAddress}
            onChange={onFieldChange("officeAddress")}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<BadgeOutlinedIcon />}
        title="Coordinator Contacts"
        description="Capture district coordinator and assistant contact details."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Coordinator name"
            value={formData.coordinatorName}
            onChange={onFieldChange("coordinatorName")}
            error={Boolean(errors.coordinatorName)}
            helperText={errors.coordinatorName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Coordinator phone"
            value={formData.coordinatorPhone}
            onChange={onFieldChange("coordinatorPhone")}
            error={Boolean(errors.coordinatorPhone)}
            helperText={errors.coordinatorPhone}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Assistant coordinator name"
            value={formData.assistantCoordinatorName}
            onChange={onFieldChange("assistantCoordinatorName")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Assistant coordinator phone"
            value={formData.assistantCoordinatorPhone}
            onChange={onFieldChange("assistantCoordinatorPhone")}
            error={Boolean(errors.assistantCoordinatorPhone)}
            helperText={errors.assistantCoordinatorPhone}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<InsightsOutlinedIcon />}
        title="Coverage and Status"
        description="Track district metrics and operational status."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Total clubs"
            type="number"
            value={formData.totalClubs}
            onChange={onFieldChange("totalClubs")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Total skaters"
            type="number"
            value={formData.totalSkaters}
            onChange={onFieldChange("totalSkaters")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={onFieldChange("status")}
            fullWidth
            sx={inputStyles}
          >
            {districtStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack />
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={onFieldChange("notes")}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
        </Box>
      </SectionCard>
    </Stack>
  );
};
