import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import {
  districtOptions,
  eventStatusOptions,
  eventTypeOptions,
  stateOptions
} from "@/features/admin/events/components/eventFormConfig";

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

const getTargetLabel = (eventType) => {
  if (eventType === "state") {
    return "Select state";
  }
  if (eventType === "district") {
    return "Select district";
  }
  if (eventType === "club") {
    return "Select club";
  }
  return "Select target";
};

const getTargetOptions = (eventType, clubOptions) => {
  if (eventType === "state") {
    return stateOptions;
  }
  if (eventType === "district") {
    return districtOptions;
  }
  if (eventType === "club") {
    return clubOptions;
  }
  return [];
};

export const EventForm = ({ formData, errors, onFieldChange, onCoverImageChange, clubOptions }) => {
  const targetOptions = getTargetOptions(formData.eventType, clubOptions);
  const targetLabel = getTargetLabel(formData.eventType);

  return (
    <Stack spacing={2.5}>
      <SectionCard
        icon={<EventAvailableOutlinedIcon />}
        title="Event Information"
        description="Enter event details, timeline, visibility status, and registration pricing."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Event title"
            value={formData.title}
            onChange={onFieldChange("title")}
            error={Boolean(errors.title)}
            helperText={errors.title}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={onFieldChange("description")}
            error={Boolean(errors.description)}
            helperText={errors.description}
            multiline
            minRows={3}
            fullWidth
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <TextField
            label="Registration start date & time"
            type="datetime-local"
            value={formData.registrationStartDateTime}
            onChange={onFieldChange("registrationStartDateTime")}
            error={Boolean(errors.registrationStartDateTime)}
            helperText={errors.registrationStartDateTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Registration end date & time"
            type="datetime-local"
            value={formData.registrationEndDateTime}
            onChange={onFieldChange("registrationEndDateTime")}
            error={Boolean(errors.registrationEndDateTime)}
            helperText={errors.registrationEndDateTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Event start date & time"
            type="datetime-local"
            value={formData.eventStartDateTime}
            onChange={onFieldChange("eventStartDateTime")}
            error={Boolean(errors.eventStartDateTime)}
            helperText={errors.eventStartDateTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            label="Event end date & time"
            type="datetime-local"
            value={formData.eventEndDateTime}
            onChange={onFieldChange("eventEndDateTime")}
            error={Boolean(errors.eventEndDateTime)}
            helperText={errors.eventEndDateTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            sx={inputStyles}
          />
          <TextField
            select
            label="Event type"
            value={formData.eventType}
            onChange={onFieldChange("eventType")}
            error={Boolean(errors.eventType)}
            helperText={errors.eventType}
            fullWidth
            sx={inputStyles}
          >
            {eventTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={targetLabel}
            value={formData.eventFor}
            onChange={onFieldChange("eventFor")}
            error={Boolean(errors.eventFor)}
            helperText={errors.eventFor}
            fullWidth
            disabled={!formData.eventType}
            sx={inputStyles}
          >
            {targetOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={onFieldChange("status")}
            error={Boolean(errors.status)}
            helperText={errors.status}
            fullWidth
            sx={inputStyles}
          >
            {eventStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Price"
            type="number"
            value={formData.price}
            onChange={onFieldChange("price")}
            error={Boolean(errors.price)}
            helperText={errors.price}
            fullWidth
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<PlaceOutlinedIcon />}
        title="Venue"
        description="Set where the event will be conducted."
      >
        <TextField
          label="Address"
          value={formData.address}
          onChange={onFieldChange("address")}
          error={Boolean(errors.address)}
          helperText={errors.address}
          multiline
          minRows={3}
          fullWidth
          sx={inputStyles}
        />
      </SectionCard>

      <SectionCard
        icon={<ImageOutlinedIcon />}
        title="Cover Image (Optional)"
        description="Upload an event cover image to make event cards more attractive."
      >
        <Stack spacing={1.5}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            sx={{ alignSelf: "flex-start", borderRadius: "14px" }}
          >
            Choose Cover Image
            <input type="file" accept="image/*" hidden onChange={onCoverImageChange} />
          </Button>
          {formData.coverImage?.name ? (
            <div className="rounded-2xl border border-[#efe2dc] bg-white p-3 shadow-sm">
              {formData.coverImage.dataUrl ? (
                <img
                  src={formData.coverImage.dataUrl}
                  alt="Event cover preview"
                  className="h-44 w-full rounded-xl object-cover"
                />
              ) : null}
              <Typography sx={{ mt: 1, fontSize: 13, color: "#6f6462" }}>
                {formData.coverImage.name}
              </Typography>
            </div>
          ) : (
            <Typography sx={{ color: "#9b8d88", fontSize: 13 }}>No cover image selected</Typography>
          )}
          <Typography sx={{ color: errors.coverImage ? "#d32f2f" : "#8d7f7b", fontSize: 12 }}>
            {errors.coverImage || "Optional image file"}
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  );
};
