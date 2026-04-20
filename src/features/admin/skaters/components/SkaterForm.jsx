import { Box, MenuItem, TextField } from "@mui/material";
import {
  bloodGroupOptions,
  categoryOptions,
  genderOptions
} from "@/features/admin/skaters/components/skaterFormConfig";

export const SkaterForm = ({ formData, errors, onFieldChange }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        gap: 2
      }}
    >
      <TextField
        label="Full name"
        value={formData.fullName}
        onChange={onFieldChange("fullName")}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName}
        fullWidth
      />
      <TextField
        label="Phone"
        value={formData.phone}
        onChange={onFieldChange("phone")}
        error={Boolean(errors.phone)}
        helperText={errors.phone}
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
        label="DOB"
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
        {genderOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Category"
        value={formData.category}
        onChange={onFieldChange("category")}
        error={Boolean(errors.category)}
        helperText={errors.category}
        fullWidth
      >
        {categoryOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Discipline"
        value={formData.discipline}
        onChange={onFieldChange("discipline")}
        error={Boolean(errors.discipline)}
        helperText={errors.discipline}
        fullWidth
      />
      <TextField
        label="District"
        value={formData.district}
        onChange={onFieldChange("district")}
        error={Boolean(errors.district)}
        helperText={errors.district}
        fullWidth
      />
      <TextField
        label="Club"
        value={formData.club}
        onChange={onFieldChange("club")}
        error={Boolean(errors.club)}
        helperText={errors.club}
        fullWidth
      />
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
