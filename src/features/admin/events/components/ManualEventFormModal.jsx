import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  FileText,
  FileSpreadsheet,
  Palette,
  Sparkles,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { manualEventsApi } from "@/api/manual-events-api";
import { eventCategoriesApi } from "@/api/event-categories-api";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const formatDateForInput = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const initialForm = {
  title: "",
  description: "",
  status: "draft",
  entryFee: 0,
  eventCategory: "",
  discipline: "",
  registrationStartDate: "",
  registrationEndDate: "",
  startDate: "",
  endDate: "",
  eventStartTime: "",
  eventEndTime: "",
  address: "",
  backgroundColor1: "#FFFFFF",
  backgroundColor2: "#F3F4F6",
  textColor: "#000000"
};

export const ManualEventFormModal = ({
  open,
  onClose,
  onSuccess,
  editEvent = null
}) => {
  const isEdit = Boolean(editEvent?._id || editEvent?.id);
  const [formData, setFormData] = useState(initialForm);
  const [circularFile, setCircularFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [categoriesList, setCategoriesList] = useState([]);
  const [isCustomDiscipline, setIsCustomDiscipline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    eventCategoriesApi
      .getAll({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const raw = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        if (list.length > 0) {
          setCategoriesList(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load categories in modal, using defaults:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory = categoriesList.find(
    (c) => (c.name || c.typeName)?.trim().toLowerCase() === formData.eventCategory?.trim().toLowerCase()
  );
  const availableDisciplines = activeCategory?.disciplines || [];

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setIsCustomDiscipline(false);
    setFormData((prev) => ({
      ...prev,
      eventCategory: selectedCat,
      discipline: ""
    }));
    if (errors.eventCategory) {
      setErrors((prev) => ({ ...prev, eventCategory: "" }));
    }
  };

  useEffect(() => {
    if (open) {
      if (editEvent) {
        setFormData({
          title: editEvent.title || "",
          description: editEvent.description || "",
          status: editEvent.status || "draft",
          entryFee: editEvent.entryFee ?? 0,
          eventCategory: editEvent.eventCategory || "",
          discipline: editEvent.discipline || "",
          registrationStartDate: formatDateForInput(editEvent.registrationStartDate),
          registrationEndDate: formatDateForInput(editEvent.registrationEndDate),
          startDate: formatDateForInput(editEvent.startDate),
          endDate: formatDateForInput(editEvent.endDate),
          eventStartTime: editEvent.eventStartTime || "",
          eventEndTime: editEvent.eventEndTime || "",
          address: editEvent.address || "",
          backgroundColor1: editEvent.backgroundColor1 || "#FFFFFF",
          backgroundColor2: editEvent.backgroundColor2 || "#F3F4F6",
          textColor: editEvent.textColor || "#000000"
        });
      } else {
        setFormData(initialForm);
      }
      setCircularFile(null);
      setExcelFile(null);
      setErrors({});
    }
  }, [open, editEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    if (formData.entryFee < 0) {
      newErrors.entryFee = "Entry fee cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // If files are selected, use FormData for S3 upload
      let payload;
      if (circularFile || excelFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (
            k &&
            typeof k === "string" &&
            k.trim() &&
            k !== "undefined" &&
            k !== "null" &&
            v !== undefined &&
            v !== null &&
            v !== ""
          ) {
            fd.append(k.trim(), v);
          }
        });
        if (circularFile) fd.append("circularDocument", circularFile);
        if (excelFile) fd.append("excelTemplate", excelFile);
        payload = fd;
      } else {
        payload = { ...formData };
      }

      const eventId = editEvent?._id || editEvent?.id;
      if (isEdit) {
        await manualEventsApi.update(eventId, payload);
        toast.success("Manual event updated successfully");
      } else {
        await manualEventsApi.create(payload);
        toast.success("Manual event created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to ${isEdit ? "update" : "create"} manual event`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)"
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderBottom: "1px solid #f0e6e0"
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: "#fef0ea",
              color: "#f6765e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Sparkles size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
              {isEdit ? "Edit Manual Event" : "Create Manual Event"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#8d7f7b" }}>
              {isEdit
                ? "Update manual event details and documents"
                : "Enter event details, scheduling, and configuration"}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Section 1: Basic Information */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#f6765e",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Layers size={16} /> 1. Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Event Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={Boolean(errors.title)}
                helperText={errors.title}
                placeholder="e.g. Karnataka State Speed Skating Championship"
                fullWidth
                size="small"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Category"
                  name="eventCategory"
                  value={formData.eventCategory}
                  onChange={handleCategoryChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">
                    <em>Select category</em>
                  </MenuItem>
                  {categoriesList.map((cat) => {
                    const catName = cat.name || cat.typeName;
                    return (
                      <MenuItem key={cat._id || catName} value={catName}>
                        {catName}
                      </MenuItem>
                    );
                  })}
                </TextField>

                {availableDisciplines.length > 0 && !isCustomDiscipline ? (
                  <TextField
                    select
                    label="Discipline"
                    name="discipline"
                    value={formData.discipline}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomDiscipline(true);
                        setFormData((prev) => ({ ...prev, discipline: "" }));
                      } else {
                        handleChange(e);
                      }
                    }}
                    fullWidth
                    size="small"
                    helperText={
                      formData.eventCategory
                        ? `Disciplines for ${formData.eventCategory}`
                        : undefined
                    }
                  >
                    <MenuItem value="">
                      <em>Select discipline</em>
                    </MenuItem>
                    {availableDisciplines.map((d) => {
                      const dName = typeof d === "string" ? d : d.name;
                      return (
                        <MenuItem key={d._id || dName} value={dName}>
                          {dName}
                        </MenuItem>
                      );
                    })}
                    {formData.discipline &&
                      !availableDisciplines.some(
                        (d) => (typeof d === "string" ? d : d.name) === formData.discipline
                      ) && (
                        <MenuItem value={formData.discipline}>
                          {formData.discipline}
                        </MenuItem>
                    )}
                    <MenuItem value="__custom__" sx={{ color: "#f6765e", fontWeight: 600 }}>
                      + Custom Discipline...
                    </MenuItem>
                  </TextField>
                ) : (
                  <TextField
                    label="Discipline"
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleChange}
                    placeholder={
                      availableDisciplines.length > 0
                        ? "Enter custom discipline name..."
                        : "e.g. Track, Road, Figures"
                    }
                    fullWidth
                    size="small"
                    helperText={
                      availableDisciplines.length > 0 && isCustomDiscipline
                        ? "Entering custom discipline"
                        : undefined
                    }
                    InputProps={
                      availableDisciplines.length > 0
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button
                                  size="small"
                                  onClick={() => {
                                    setIsCustomDiscipline(false);
                                    setFormData((prev) => ({ ...prev, discipline: "" }));
                                  }}
                                  sx={{
                                    fontSize: "11px",
                                    textTransform: "none",
                                    minWidth: "auto",
                                    px: 1,
                                    color: "#f6765e",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  Choose from list
                                </Button>
                              </InputAdornment>
                            )
                          }
                        : undefined
                    }
                  />
                )}

                <TextField
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Entry Fee (₹)"
                  name="entryFee"
                  type="number"
                  value={formData.entryFee}
                  onChange={handleChange}
                  error={Boolean(errors.entryFee)}
                  helperText={errors.entryFee}
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IndianRupee size={16} color="#8d7f7b" />
                        </InputAdornment>
                      )
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IndianRupee size={16} color="#8d7f7b" />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  label="Event Address / Venue"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Kanteerava Outdoor Stadium, Bangalore"
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={16} color="#8d7f7b" />
                        </InputAdornment>
                      )
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin size={16} color="#8d7f7b" />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide event details, guidelines, rules, or eligibility..."
                multiline
                rows={3}
                fullWidth
                size="small"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Section 2: Schedules & Timings */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#f6765e",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Calendar size={16} /> 2. Registration & Event Dates
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Registration Start Date"
                  name="registrationStartDate"
                  type="date"
                  value={formData.registrationStartDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Registration End Date"
                  name="registrationEndDate"
                  type="date"
                  value={formData.registrationEndDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Event Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Event End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Daily Start Time"
                  name="eventStartTime"
                  value={formData.eventStartTime}
                  onChange={handleChange}
                  placeholder="e.g. 08:30 AM"
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Clock size={16} color="#8d7f7b" />
                        </InputAdornment>
                      )
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Clock size={16} color="#8d7f7b" />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label="Daily End Time"
                  name="eventEndTime"
                  value={formData.eventEndTime}
                  onChange={handleChange}
                  placeholder="e.g. 06:00 PM"
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Clock size={16} color="#8d7f7b" />
                        </InputAdornment>
                      )
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Clock size={16} color="#8d7f7b" />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Section 3: Visual Styling & Documents */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#f6765e",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Palette size={16} /> 3. Card Styling & Documents
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Box sx={{ flex: 1, width: "100%" }}>
                  <Typography variant="caption" sx={{ color: "#7f7270", mb: 0.5, display: "block" }}>
                    Gradient Start Color
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <input
                      type="color"
                      name="backgroundColor1"
                      value={formData.backgroundColor1}
                      onChange={handleChange}
                      style={{
                        width: 44,
                        height: 40,
                        border: "1px solid #e0d5ce",
                        borderRadius: 8,
                        cursor: "pointer"
                      }}
                    />
                    <TextField
                      name="backgroundColor1"
                      value={formData.backgroundColor1}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                </Box>

                <Box sx={{ flex: 1, width: "100%" }}>
                  <Typography variant="caption" sx={{ color: "#7f7270", mb: 0.5, display: "block" }}>
                    Gradient End Color
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <input
                      type="color"
                      name="backgroundColor2"
                      value={formData.backgroundColor2}
                      onChange={handleChange}
                      style={{
                        width: 44,
                        height: 40,
                        border: "1px solid #e0d5ce",
                        borderRadius: 8,
                        cursor: "pointer"
                      }}
                    />
                    <TextField
                      name="backgroundColor2"
                      value={formData.backgroundColor2}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                </Box>

                <Box sx={{ flex: 1, width: "100%" }}>
                  <Typography variant="caption" sx={{ color: "#7f7270", mb: 0.5, display: "block" }}>
                    Text Color
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
                      style={{
                        width: 44,
                        height: 40,
                        border: "1px solid #e0d5ce",
                        borderRadius: 8,
                        cursor: "pointer"
                      }}
                    />
                    <TextField
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                </Box>
              </Stack>

              {/* Document uploads */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "16px",
                    border: "1px dashed #e0d5ce",
                    backgroundColor: "#faf7f5"
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileText size={18} color="#f6765e" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Circular Document (PDF)
                      </Typography>
                    </Stack>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCircularFile(e.target.files?.[0] || null)}
                      style={{ fontSize: "12px" }}
                    />
                    {editEvent?.circularDocument && !circularFile && (
                      <Typography variant="caption" sx={{ color: "#16a34a" }}>
                        Existing document attached
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "16px",
                    border: "1px dashed #e0d5ce",
                    backgroundColor: "#faf7f5"
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileSpreadsheet size={18} color="#16a34a" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Excel Skater Template
                      </Typography>
                    </Stack>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      style={{ fontSize: "12px" }}
                    />
                    {editEvent?.excelTemplate && !excelFile && (
                      <Typography variant="caption" sx={{ color: "#16a34a" }}>
                        Existing template attached
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: "1px solid #f0e6e0" }}>
        <Button variant="outlined" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            backgroundColor: "#f6765e",
            px: 3,
            "&:hover": { backgroundColor: "#ea6b54" }
          }}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting
            ? "Saving..."
            : isEdit
              ? "Update Manual Event"
              : "Create Manual Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualEventFormModal;
