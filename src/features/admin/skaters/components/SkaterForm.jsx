import { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import {
  bloodGroupOptions,
  genderOptions
} from "@/features/admin/skaters/components/skaterFormConfig";

export const SkaterForm = ({
  formData,
  errors,
  onFieldChange,
  districts = [],
  clubs = [],
  categories = [],
  onPhotoChange,
  onDocumentsChange,
  onRemoveExistingDocument,
  onRemoveNewDocument
}) => {
  const filteredClubs = useMemo(() => {
    const districtFiltered = !formData.districtId
      ? clubs
      : clubs.filter((club) => {
          const clubDistrictId = String(
            club.districtId || club.district?._id || club.district || ""
          );
          return clubDistrictId === String(formData.districtId);
        });

    if (!formData.clubId) return districtFiltered;

    const selectedClub = clubs.find((club) => club.id === formData.clubId);
    if (selectedClub && !districtFiltered.some((club) => club.id === selectedClub.id)) {
      return [selectedClub, ...districtFiltered];
    }

    return districtFiltered;
  }, [clubs, formData.districtId, formData.clubId]);

  const selectedClubDetails = useMemo(() => {
    if (!formData.clubId) return null;
    const fromList = clubs.find((club) => club.id === formData.clubId);
    if (fromList) return fromList;
    if (formData.clubName) {
      return {
        id: formData.clubId,
        name: formData.clubName,
        clubCode: formData.clubCode,
        districtName: formData.clubDistrictName
      };
    }
    return null;
  }, [clubs, formData.clubId, formData.clubName, formData.clubCode, formData.clubDistrictName]);

  const visibleExistingDocuments = (formData.existingDocuments || []).filter(
    (doc) => !formData.removedDocumentUrls?.includes(doc.url)
  );

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2
        }}
      >
        <TextField label="KRSA ID" value={formData.krsaId} fullWidth disabled />

        <TextField
          select
          label="District"
          value={formData.districtId}
          onChange={onFieldChange("districtId")}
          error={Boolean(errors.districtId)}
          helperText={errors.districtId}
          fullWidth
        >
          <MenuItem value="">Select district</MenuItem>
          {districts.map((district) => (
            <MenuItem key={district.id} value={district.id}>
              {district.districtName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Club"
          value={formData.clubId}
          onChange={onFieldChange("clubId")}
          error={Boolean(errors.clubId)}
          helperText={errors.clubId || (formData.districtId ? "" : "Select a district to filter clubs")}
          fullWidth
        >
          <MenuItem value="">Select club</MenuItem>
          {filteredClubs.map((club) => (
            <MenuItem key={club.id} value={club.id}>
              {club.name}
              {club.districtName ? ` — ${club.districtName}` : ""}
            </MenuItem>
          ))}
        </TextField>

        {selectedClubDetails?.name && (
          <Paper
            elevation={0}
            sx={{
              gridColumn: { lg: "1 / -1" },
              p: 2,
              borderRadius: "20px",
              border: "1px solid #f4e5de",
              backgroundColor: "#fffaf8"
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#a28f89",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 0.75
              }}
            >
              Current club
            </Typography>
            <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 15 }}>
              {selectedClubDetails.name}
            </Typography>
          </Paper>
        )}

        <TextField
          select
          label="Category"
          value={formData.categoryId}
          onChange={onFieldChange("categoryId")}
          error={Boolean(errors.categoryId)}
          helperText={errors.categoryId}
          fullWidth
        >
          <MenuItem value="">Select category</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

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

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "24px",
          border: "1px solid #f4e5de",
          backgroundColor: "#fffaf8"
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 2 }}>Profile photo</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px dashed #efe2dc",
              display: "grid",
              placeItems: "center",
              backgroundColor: "#fafafa"
            }}
          >
            {formData.photoPreview ? (
              <Avatar
                src={formData.photoPreview}
                alt="Profile preview"
                variant="square"
                sx={{ width: "100%", height: "100%", borderRadius: 0 }}
              />
            ) : (
              <PhotoCameraOutlinedIcon sx={{ color: "#b19f99", fontSize: 32 }} />
            )}
          </Box>
          <Stack spacing={1}>
            <Button variant="outlined" component="label" startIcon={<PhotoCameraOutlinedIcon />}>
              {formData.photoPreview ? "Change photo" : "Upload photo"}
              <input hidden type="file" accept="image/*" onChange={onPhotoChange} />
            </Button>
            <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
              JPG or PNG. Replaces the current profile image when saved.
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "24px",
          border: "1px solid #f4e5de",
          backgroundColor: "#fffaf8"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mb: 2, alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>Documents</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "#8d7f7b" }}>
              Add new files or remove existing uploaded documents.
            </Typography>
          </Box>
          <Button variant="outlined" component="label">
            Add documents
            <input hidden type="file" accept="image/*,.pdf" multiple onChange={onDocumentsChange} />
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          {visibleExistingDocuments.map((doc) => (
            <Paper
              key={doc.url}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: "16px",
                border: "1px dashed #f2dfd7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#2f2829" }}>
                {doc.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" component="a" href={doc.url} target="_blank" rel="noopener noreferrer">
                  View
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveExistingDocument(doc.url)}
                  aria-label="Remove document"
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}

          {(formData.newDocumentFiles || []).map((file, index) => (
            <Paper
              key={`${file.name}-${index}`}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: "16px",
                border: "1px dashed #f2dfd7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                bgcolor: "#f0fff4"
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#2f2829" }}>
                {file.name} (new)
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemoveNewDocument(index)}
                aria-label="Remove new document"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}

          {!visibleExistingDocuments.length && !(formData.newDocumentFiles || []).length && (
            <Typography sx={{ color: "#a28f89", fontSize: 14 }}>No documents uploaded yet.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
