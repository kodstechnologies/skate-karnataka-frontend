import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  eventStatusOptions,
  mapSkatingCategoryOptions,
  normalizeSkatingEventCategoryIds
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

/* ── Color picker ── */
const ColorPickerField = ({ label, value, onChange, disabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "#8d7f7b", mb: 1, display: "block", fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
        <Box
          onClick={!disabled ? (e) => setAnchorEl(e.currentTarget) : undefined}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "12px",
            backgroundColor: value,
            border: "2px solid #efe2dc",
            cursor: disabled ? "default" : "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            opacity: disabled ? 0.5 : 1,
            transition: "transform 0.2s",
            "&:hover": { transform: disabled ? "none" : "scale(1.05)" }
          }}
        />
        <TextField
          value={value}
          onChange={onChange}
          size="small"
          disabled={disabled}
          sx={{
            ...inputStyles,
            "& .MuiOutlinedInput-input": {
              py: 1,
              px: 1.5,
              fontSize: "0.875rem",
              fontFamily: "monospace"
            }
          }}
        />
      </Stack>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            p: 2,
            borderRadius: "20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            border: "1px solid #efe2dc"
          }
        }}
      >
        <HexColorPicker
          color={value}
          onChange={(color) => onChange({ target: { value: color } })}
        />
      </Popover>
    </Box>
  );
};

/* ── Section card wrapper ── */
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

/* ── Main form ── */
export const EventForm = ({
  formData,
  errors,
  onFieldChange,
  disabled,
  eventCategories = [],
  categorySeedFromEvent = [],
  showCategorySourcePicker = false,
  categorySourceUsesStandardFallback = false,
  onCategoryFormatChange
}) => {
  const categoryFormat = formData.categoryFormat ?? "standard";
  const selectedCategoryIds = normalizeSkatingEventCategoryIds(formData.skatingEventCategories);
  const categoryOptions = mapSkatingCategoryOptions(eventCategories);
  const seedOptions = mapSkatingCategoryOptions(
    Array.isArray(categorySeedFromEvent)
      ? categorySeedFromEvent.filter((item) => item && typeof item === "object")
      : []
  );
  const allCategoryOptions = [
    ...categoryOptions,
    ...seedOptions.filter((seed) => !categoryOptions.some((opt) => opt.id === seed.id))
  ];
  const selectedCategoryOptions = allCategoryOptions.filter((opt) =>
    selectedCategoryIds.includes(opt.id)
  );

  return (
    <Stack spacing={2.5}>
      {/* ── Event Information ── */}
      <SectionCard
        icon={<EventAvailableOutlinedIcon />}
        title="Event Information"
        description="Enter event details, visibility status, and registration pricing."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          <TextField
            label="Event Title"
            value={formData.header}
            onChange={onFieldChange("header")}
            error={Boolean(errors.header)}
            helperText={errors.header}
            fullWidth
            disabled={disabled}
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <TextField
            label="Description"
            value={formData.about}
            onChange={onFieldChange("about")}
            error={Boolean(errors.about)}
            helperText={errors.about}
            multiline
            minRows={3}
            fullWidth
            disabled={disabled}
            sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
          />
          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={onFieldChange("status")}
            error={Boolean(errors.status)}
            helperText={errors.status}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          >
            {eventStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Entry Fee (₹)"
            type="number"
            value={formData.entryFee}
            onChange={onFieldChange("entryFee")}
            error={Boolean(errors.entryFee)}
            helperText={errors.entryFee}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      <SectionCard
        icon={<CategoryOutlinedIcon />}
        title="Skating Event Categories"
        description={
          showCategorySourcePicker
            ? "Choose standard (KRSA) or your custom list. Custom uses your saved names when you have them; otherwise KRSA standard categories apply."
            : "Select one or more category types allowed for this event."
        }
      >
        {showCategorySourcePicker ? (
          <FormControl component="fieldset" sx={{ mb: 2.5, width: "100%" }} disabled={disabled}>
            <Typography variant="caption" sx={{ color: "#8d7f7b", fontWeight: 600, mb: 0.5 }}>
              Format
            </Typography>
            <RadioGroup
              row
              value={categoryFormat}
              onChange={(e) => {
                const value = e.target.value;
                onFieldChange("categoryFormat")({ target: { value } });
                onCategoryFormatChange?.(value);
              }}
            >
              <FormControlLabel value="standard" control={<Radio size="small" />} label="Standard" />
              <FormControlLabel value="custom" control={<Radio size="small" />} label="Custom" />
            </RadioGroup>
            {categoryFormat === "custom" && categorySourceUsesStandardFallback ? (
              <FormHelperText sx={{ mx: 0 }}>
                You have not saved a custom list yet — showing KRSA standard categories. Edit your list under
                Event categories.
              </FormHelperText>
            ) : null}
          </FormControl>
        ) : null}
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={allCategoryOptions}
          value={selectedCategoryOptions}
          onChange={(_, newValue) => {
            onFieldChange("skatingEventCategories")({
              target: { value: newValue.map((item) => item.id) }
            });
          }}
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          disabled={disabled}
          fullWidth
          sx={inputStyles}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={option.label}
                size="small"
                sx={{ bgcolor: "#fff1eb", color: "#c45a42", fontWeight: 600 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category types"
              placeholder={
                selectedCategoryOptions.length ? "" : "Select one or more categories"
              }
              error={Boolean(errors.skatingEventCategories)}
              helperText={
                errors.skatingEventCategories ||
                "Choose all skating categories that apply to this event"
              }
            />
          )}
        />
      </SectionCard>

      {/* ── Schedule ── */}
      <SectionCard
        icon={<CalendarMonthOutlinedIcon />}
        title="Schedule"
        description="Set the registration window, event dates, and daily start/end times."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2
          }}
        >
          {/* Registration window */}
          <TextField
            label="Registration Start Date"
            type="date"
            value={formData.registerStartDate}
            onChange={onFieldChange("registerStartDate")}
            error={Boolean(errors.registerStartDate)}
            helperText={errors.registerStartDate}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />
          <TextField
            label="Registration End Date"
            type="date"
            value={formData.registerEndDate}
            onChange={onFieldChange("registerEndDate")}
            error={Boolean(errors.registerEndDate)}
            helperText={errors.registerEndDate}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />

          {/* Event dates */}
          <TextField
            label="Event Start Date"
            type="date"
            value={formData.eventStartDate}
            onChange={onFieldChange("eventStartDate")}
            error={Boolean(errors.eventStartDate)}
            helperText={errors.eventStartDate}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />
          <TextField
            label="Event End Date"
            type="date"
            value={formData.eventEndDate}
            onChange={onFieldChange("eventEndDate")}
            error={Boolean(errors.eventEndDate)}
            helperText={errors.eventEndDate}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />

          {/* Daily times */}
          <TextField
            label="Event Start Time"
            type="time"
            value={formData.eventStartTime}
            onChange={onFieldChange("eventStartTime")}
            error={Boolean(errors.eventStartTime)}
            helperText={errors.eventStartTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />
          <TextField
            label="Event End Time"
            type="time"
            value={formData.eventEndTime}
            onChange={onFieldChange("eventEndTime")}
            error={Boolean(errors.eventEndTime)}
            helperText={errors.eventEndTime}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={disabled}
            sx={inputStyles}
          />
        </Box>
      </SectionCard>

      {/* ── Venue ── */}
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
          disabled={disabled}
          sx={inputStyles}
        />
      </SectionCard>

      {/* ── Theme Colors ── */}
      <SectionCard
        icon={<PaletteOutlinedIcon />}
        title="Event Theme Colors"
        description="Choose background and text colors for the event card."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3
          }}
        >
          <ColorPickerField
            label="Background Color 1"
            value={formData.colorOne}
            onChange={onFieldChange("colorOne")}
            disabled={disabled}
          />
          <ColorPickerField
            label="Background Color 2"
            value={formData.colorTwo}
            onChange={onFieldChange("colorTwo")}
            disabled={disabled}
          />
          <ColorPickerField
            label="Text Color"
            value={formData.textColor}
            onChange={onFieldChange("textColor")}
            disabled={disabled}
          />
        </Box>
      </SectionCard>
    </Stack>
  );
};
