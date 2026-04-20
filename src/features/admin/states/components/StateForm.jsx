import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { stateStatusOptions } from "@/features/admin/states/components/stateFormConfig";

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

export const StateForm = ({ formData, errors, onFieldChange }) => {
  return (
    <Stack spacing={2.5}>
      <SectionCard
        icon={<AccountBalanceOutlinedIcon />}
        title="State Identity"
        description="Register the state and association identity details."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="State name"
            value={formData.stateName}
            onChange={onFieldChange("stateName")}
            error={Boolean(errors.stateName)}
            helperText={errors.stateName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="State code"
            value={formData.stateCode}
            onChange={onFieldChange("stateCode")}
            error={Boolean(errors.stateCode)}
            helperText={errors.stateCode}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Association name"
            value={formData.associationName}
            onChange={onFieldChange("associationName")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Headquarters address"
            value={formData.headquartersAddress}
            onChange={onFieldChange("headquartersAddress")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={onFieldChange("email")}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Website"
            value={formData.website}
            onChange={onFieldChange("website")}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<BadgeOutlinedIcon />}
        title="Office Bearers"
        description="Capture president and secretary contact details."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="President name"
            value={formData.presidentName}
            onChange={onFieldChange("presidentName")}
            error={Boolean(errors.presidentName)}
            helperText={errors.presidentName}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="President phone"
            value={formData.presidentPhone}
            onChange={onFieldChange("presidentPhone")}
            error={Boolean(errors.presidentPhone)}
            helperText={errors.presidentPhone}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Secretary name"
            value={formData.secretaryName}
            onChange={onFieldChange("secretaryName")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Secretary phone"
            value={formData.secretaryPhone}
            onChange={onFieldChange("secretaryPhone")}
            error={Boolean(errors.secretaryPhone)}
            helperText={errors.secretaryPhone}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<InsightsOutlinedIcon />}
        title="Coverage and Status"
        description="Track district/club counts and maintain state operational status."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Total districts"
            type="number"
            value={formData.totalDistricts}
            onChange={onFieldChange("totalDistricts")}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Total clubs"
            type="number"
            value={formData.totalClubs}
            onChange={onFieldChange("totalClubs")}
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
            {stateStatusOptions.map((option) => (
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
