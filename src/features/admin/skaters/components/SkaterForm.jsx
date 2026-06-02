import { Box, MenuItem, TextField } from "@mui/material";
import {
  bloodGroupOptions,
  genderOptions
} from "@/features/admin/skaters/components/skaterFormConfig";

export const SkaterForm = ({ formData, errors, onFieldChange, readOnlyMeta = false }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        gap: 2
      }}
    >
      {readOnlyMeta && (
        <>
          <TextField label="KRSA ID" value={formData.krsaId} fullWidth disabled />
          <TextField label="District" value={formData.districtName} fullWidth disabled />
          <TextField
            label="Club"
            value={formData.clubName}
            fullWidth
            disabled
            sx={{ gridColumn: { lg: "1 / -1" } }}
          />
        </>
      )}

      <TextField
        label="Full name"
        value={formData.fullName}
        onChange={onFieldChange("fullName")}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName}
        fullWidth
        required
      />
      <TextField
        label="Phone"
        value={formData.phone}
        onChange={onFieldChange("phone")}
        error={Boolean(errors.phone)}
        helperText={errors.phone}
        fullWidth
        required
      />
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={onFieldChange("email")}
        error={Boolean(errors.email)}
        helperText={errors.email}
        fullWidth
      />
      <TextField
        label="RSFI ID"
        value={formData.rsfiId}
        onChange={onFieldChange("rsfiId")}
        error={Boolean(errors.rsfiId)}
        helperText={errors.rsfiId}
        fullWidth
      />
      <TextField
        label="Date of birth"
        type="date"
        value={formData.dob}
        onChange={onFieldChange("dob")}
        error={Boolean(errors.dob)}
        helperText={errors.dob}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
      <TextField
        label="Aadhaar number"
        value={formData.aadharNumber}
        onChange={onFieldChange("aadharNumber")}
        error={Boolean(errors.aadharNumber)}
        helperText={errors.aadharNumber}
        fullWidth
      />
      <TextField
        select
        label="Gender"
        value={formData.gender}
        onChange={onFieldChange("gender")}
        error={Boolean(errors.gender)}
        helperText={errors.gender}
        fullWidth
      >
        <MenuItem value="">Select gender</MenuItem>
        {genderOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Parent / guardian"
        value={formData.parent}
        onChange={onFieldChange("parent")}
        error={Boolean(errors.parent)}
        helperText={errors.parent}
        fullWidth
      />
      <TextField
        select
        label="Blood group"
        value={formData.bloodGroup}
        onChange={onFieldChange("bloodGroup")}
        error={Boolean(errors.bloodGroup)}
        helperText={errors.bloodGroup}
        fullWidth
      >
        <MenuItem value="">Select blood group</MenuItem>
        {bloodGroupOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="School"
        value={formData.school}
        onChange={onFieldChange("school")}
        error={Boolean(errors.school)}
        helperText={errors.school}
        fullWidth
      />
      <TextField
        label="Grade"
        value={formData.grade}
        onChange={onFieldChange("grade")}
        error={Boolean(errors.grade)}
        helperText={errors.grade}
        fullWidth
      />
      <TextField
        label="Address"
        value={formData.address}
        onChange={onFieldChange("address")}
        error={Boolean(errors.address)}
        helperText={errors.address}
        multiline
        minRows={3}
        fullWidth
        sx={{ gridColumn: { lg: "1 / -1" } }}
      />
      <TextField
        label="Signature"
        value={formData.signature}
        onChange={onFieldChange("signature")}
        error={Boolean(errors.signature)}
        helperText={errors.signature}
        fullWidth
        sx={{ gridColumn: { lg: "1 / -1" } }}
      />
    </Box>
  );
};
