import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Popover,
  Autocomplete
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Save,
  Trash2,
  UploadCloud
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import toast from "react-hot-toast";
import eventsHero from "@/assets/Events_header.jpg";
import { manualEventsApi } from "@/api/manual-events-api";
import { eventsApi } from "@/api/events-api";
import { eventCategoriesApi } from "@/api/event-categories-api";
import {
  filterDisciplineIdsForCategories,
  mapSkatingCategoryOptions,
  mapSkatingDisciplineOptions
} from "@/features/admin/events/components/eventFormConfig";
import { unwrapSkatingCategories } from "@/features/admin/events/utils/parseEventApi";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

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

const formatDateForInput = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/* ── Section Card Wrapper ── */
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
        <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>
          {description}
        </Typography>
      </Box>
    </Stack>
    {children}
  </Paper>
);

/* ── Interactive Color Picker Field ── */
const ColorPickerField = ({ label, name, value, onChange, disabled }) => {
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
            width: 32,
            height: 32,
            borderRadius: "12px",
            backgroundColor: value || "#FFFFFF",
            border: "2px solid #efe2dc",
            cursor: disabled ? "default" : "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            opacity: disabled ? 0.5 : 1,
            transition: "transform 0.2s",
            "&:hover": { transform: disabled ? "none" : "scale(1.05)" }
          }}
        />
        <TextField
          name={name}
          value={value || ""}
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
        slotProps={{
          paper: {
            sx: {
              p: 2,
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              border: "1px solid #efe2dc"
            }
          }
        }}
      >
        <HexColorPicker
          color={value || "#FFFFFF"}
          onChange={(color) => onChange({ target: { name, value: color } })}
        />
      </Popover>
    </Box>
  );
};

/* ── Drag & Drop Upload Zone ── */
function DragDropUploadZone({
  label,
  sublabel,
  accept,
  file,
  onFileSelect,
  onFileRemove,
  existingUrl,
  icon: IconComponent,
  accentColor = "#f6765e",
  allowedFormats = "PDF, DOC, DOCX up to 25MB"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const hasItem = Boolean(file || existingUrl);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2f2829" }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: "#a1938f" }}>
          {allowedFormats}
        </Typography>
      </Stack>

      {hasItem ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "18px",
            border: "1.5px solid #e7ded9",
            backgroundColor: "#fffbf9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                backgroundColor: `${accentColor}18`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <IconComponent size={22} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "#2f2829",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {file ? file.name : existingUrl.split("/").pop()}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8d7f7b" }}>
                {file ? formatFileSize(file.size) : "Attached document on cloud storage"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {existingUrl && !file && (
              <Button
                href={existingUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                startIcon={<ExternalLink size={14} />}
                sx={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  textTransform: "none",
                  py: 0.5,
                  px: 1.5,
                  borderColor: "#e0d5ce",
                  color: "#475569"
                }}
              >
                View
              </Button>
            )}
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={onFileRemove}
              startIcon={<Trash2 size={14} />}
              sx={{
                borderRadius: "10px",
                fontSize: "12px",
                textTransform: "none",
                py: 0.5,
                px: 1
              }}
            >
              Remove
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            border: `2px dashed ${isDragging ? accentColor : "#e4d6ce"}`,
            borderRadius: "20px",
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragging ? `${accentColor}08` : "rgba(255,255,255,0.92)",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: accentColor,
              backgroundColor: `${accentColor}05`
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
            }}
          />
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "16px",
              backgroundColor: `${accentColor}14`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5
            }}
          >
            <UploadCloud size={24} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
            Drag & drop file here, or{" "}
            <span style={{ color: accentColor, textDecoration: "underline" }}>browse</span>
          </Typography>
          <Typography variant="caption" sx={{ color: "#8d7f7b" }}>
            {sublabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

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
  eventStartTime: "08:00 AM",
  eventEndTime: "06:00 PM",
  address: "",
  backgroundColor1: "#FFFFFF",
  backgroundColor2: "#FEF2EB",
  textColor: "#2F2829"
};

export const ManualEventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [feeType, setFeeType] = useState("free");
  const [existingData, setExistingData] = useState(null);
  const [circularFile, setCircularFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  // 100% Dynamic categories and disciplines loaded from backend
  const [eventCategories, setEventCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedDisciplineIds, setSelectedDisciplineIds] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch dynamic categories and disciplines from the API
  useEffect(() => {
    let isMounted = true;
    eventsApi
      .getSkatingCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = unwrapSkatingCategories(res);
        setEventCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!isMounted) return;
        eventCategoriesApi
          .getAll({ limit: 100 })
          .then((res) => {
            if (!isMounted) return;
            const raw = res?.data?.data ?? res?.data ?? [];
            const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
            setEventCategories(list);
          })
          .catch((err) => {
            console.error("Failed to load dynamic categories:", err);
            setEventCategories([]);
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute options dynamically using standard app utility functions
  const categoryOptions = useMemo(
    () => mapSkatingCategoryOptions(eventCategories),
    [eventCategories]
  );

  const selectedCategoryOptions = useMemo(
    () => categoryOptions.filter((opt) => selectedCategoryIds.includes(opt.id)),
    [categoryOptions, selectedCategoryIds]
  );

  const disciplineOptions = useMemo(
    () => mapSkatingDisciplineOptions(eventCategories, selectedCategoryIds),
    [eventCategories, selectedCategoryIds]
  );

  const selectedDisciplineOptions = useMemo(
    () => disciplineOptions.filter((opt) => selectedDisciplineIds.includes(opt.id)),
    [disciplineOptions, selectedDisciplineIds]
  );

  // Load existing event data when editing
  useEffect(() => {
    if (!isEditing || !id) return;

    let isMounted = true;
    setLoading(true);

    manualEventsApi
      .getById(id)
      .then((res) => {
        if (!isMounted) return;
        const ev = res?.data?.data || res?.data || null;
        if (!ev) {
          toast.error("Could not find manual event details");
          navigate("/events/manual");
          return;
        }

        setExistingData(ev);
        const hasFee = Number(ev.entryFee) > 0;
        setFeeType(hasFee ? "paid" : "free");

        setFormData({
          title: ev.title || "",
          description: ev.description || "",
          status: ev.status || "draft",
          entryFee: ev.entryFee ?? 0,
          eventCategory: ev.eventCategory || "",
          discipline: ev.discipline || "",
          registrationStartDate: formatDateForInput(ev.registrationStartDate),
          registrationEndDate: formatDateForInput(ev.registrationEndDate),
          startDate: formatDateForInput(ev.startDate),
          endDate: formatDateForInput(ev.endDate),
          eventStartTime: ev.eventStartTime || "",
          eventEndTime: ev.eventEndTime || "",
          address: ev.address || "",
          backgroundColor1: ev.backgroundColor1 || "#FFFFFF",
          backgroundColor2: ev.backgroundColor2 || "#FEF2EB",
          textColor: ev.textColor || "#2F2829"
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error(err?.response?.data?.message || "Failed to load event details");
        navigate("/events/manual");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, navigate]);

  // Sync existing event category and discipline names to Autocomplete IDs
  useEffect(() => {
    if (!existingData || eventCategories.length === 0) return;
    if (selectedCategoryIds.length > 0) return;

    const savedCatNames = (existingData.eventCategory || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (savedCatNames.length === 0) return;

    const matchedCatIds = eventCategories
      .filter((cat) => {
        const catName = (cat.name || cat.typeName || "").trim().toLowerCase();
        return savedCatNames.includes(catName);
      })
      .map((cat) => String(cat._id || cat.id));

    if (matchedCatIds.length > 0) {
      setSelectedCategoryIds(matchedCatIds);

      const savedDiscNames = (existingData.discipline || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const matchedDiscIds = [];
      for (const cat of eventCategories) {
        if (matchedCatIds.includes(String(cat._id || cat.id))) {
          for (const d of cat.disciplines || []) {
            const dName = (d.name || d.typeName || "").trim().toLowerCase();
            if (savedDiscNames.includes(dName)) {
              matchedDiscIds.push(String(d._id || d.id));
            }
          }
        }
      }
      setSelectedDisciplineIds(matchedDiscIds);
    }
  }, [existingData, eventCategories, selectedCategoryIds.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!name || typeof name !== "string" || !name.trim()) return;
    setFormData((prev) => ({ ...prev, [name.trim()]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFeeTypeChange = (e) => {
    const nextType = e.target.value;
    setFeeType(nextType);
    if (nextType === "free") {
      setFormData((prev) => ({ ...prev, entryFee: 0 }));
    } else {
      const current = Number(formData.entryFee);
      setFormData((prev) => ({ ...prev, entryFee: current > 0 ? current : "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    if (feeType === "paid" && (formData.entryFee === "" || Number(formData.entryFee) <= 0)) {
      newErrors.entryFee = "Please enter a valid entry fee amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Resolve dynamic category names and clean discipline names for storage in ManualEvent model
      const catNames = selectedCategoryOptions.map((o) => o.label).filter(Boolean);
      const discNames = selectedDisciplineOptions.map((o) => {
        for (const cat of eventCategories) {
          for (const d of cat.disciplines || []) {
            if (String(d._id || d.id) === String(o.id)) {
              return d.name || d.typeName || o.label;
            }
          }
        }
        return o.label.replace(/\s*\([^)]*\)$/, "");
      });

      const preparedPayload = {
        title: formData.title?.trim() || "",
        description: formData.description?.trim() || null,
        status: formData.status || "draft",
        entryFee: feeType === "free" ? 0 : Number(formData.entryFee || 0),
        eventCategory: catNames.join(", ") || null,
        discipline: discNames.join(", ") || null,
        registrationStartDate: formData.registrationStartDate || null,
        registrationEndDate: formData.registrationEndDate || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        eventStartTime: formData.eventStartTime || null,
        eventEndTime: formData.eventEndTime || null,
        address: formData.address?.trim() || null,
        backgroundColor1: formData.backgroundColor1 || "#FFFFFF",
        backgroundColor2: formData.backgroundColor2 || "#FEF2EB",
        textColor: formData.textColor || "#2F2829"
      };

      let payload;
      if (circularFile || excelFile) {
        const fd = new FormData();
        Object.entries(preparedPayload).forEach(([k, v]) => {
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
        payload = { ...preparedPayload };
        if (existingData?.circularDocument && !payload.circularDocument) {
          payload.circularDocument = existingData.circularDocument;
        }
        if (existingData?.excelTemplate && !payload.excelTemplate) {
          payload.excelTemplate = existingData.excelTemplate;
        }
      }

      if (isEditing && id) {
        await manualEventsApi.update(id, payload);
        toast.success("Manual event updated successfully");
      } else {
        await manualEventsApi.create(payload);
        toast.success("Manual event created successfully");
      }
      navigate("/events/manual");
    } catch (err) {
      console.error("Failed to save manual event:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save manual event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 6, borderRadius: "28px", textAlign: "center" }}>
        <CircularProgress sx={{ color: "#f6765e", mb: 2 }} />
        <Typography variant="body1" sx={{ color: "#7f7270", fontWeight: 600 }}>
          Loading manual event details...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* ── Top Hero Banner (Exact match to /events/create) ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 250, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${eventsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 14, md: 16 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/events/manual"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Events
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit Manual Event" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              size="small"
              label="Manual Event"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
            />
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update Manual Event" : "Create Event"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Modify event title, dates, registration parameters, venue address, styling, or attached circulars."
              : "Create and publish event schedules for state, district, and club level participation."}
          </Typography>
        </Stack>
      </Paper>

      {/* ── Main Form Paper Container ── */}
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack spacing={2.5}>
          {/* ── Section 1: Event Information ── */}
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
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={Boolean(errors.title)}
                helperText={errors.title}
                placeholder="e.g. 28th Karnataka State Roller Speed Skating Championship"
                fullWidth
                disabled={saving}
                sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
              />

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
                placeholder="Provide instructions, registration notes, eligibility details..."
                multiline
                minRows={3}
                fullWidth
                disabled={saving}
                sx={{ ...inputStyles, gridColumn: { md: "span 2" } }}
              />

              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Entry Fee Radio Group */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: "18px",
                  border: "1px solid",
                  borderColor:
                    errors.entryFee && feeType === "paid"
                      ? "#d32f2f"
                      : "rgba(244, 228, 221, 0.95)",
                  backgroundColor: "rgba(255,255,255,0.92)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minHeight: 56
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#8d7f7b",
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 0.25
                  }}
                >
                  Entry Fee
                </Typography>
                <RadioGroup row value={feeType} onChange={handleFeeTypeChange}>
                  <FormControlLabel
                    value="free"
                    disabled={saving}
                    control={
                      <Radio
                        size="small"
                        sx={{ color: "#f6765e", "&.Mui-checked": { color: "#f6765e" } }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: feeType === "free" ? 700 : 500,
                          color: "#2f2829"
                        }}
                      >
                        Free (₹0)
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="paid"
                    disabled={saving}
                    control={
                      <Radio
                        size="small"
                        sx={{ color: "#f6765e", "&.Mui-checked": { color: "#f6765e" } }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: feeType === "paid" ? 700 : 500,
                          color: "#2f2829"
                        }}
                      >
                        Paid
                      </Typography>
                    }
                  />
                </RadioGroup>
              </Box>

              {feeType === "paid" && (
                <TextField
                  label="Entry Fee Amount (₹)"
                  type="number"
                  name="entryFee"
                  placeholder="e.g. 500"
                  value={formData.entryFee === "0" || formData.entryFee === 0 ? "" : formData.entryFee}
                  onChange={handleChange}
                  error={Boolean(errors.entryFee)}
                  helperText={errors.entryFee || "Enter entry fee amount per participant in rupees"}
                  fullWidth
                  required
                  disabled={saving}
                  sx={{
                    ...inputStyles,
                    gridColumn: { md: "span 2" }
                  }}
                  slotProps={{
                    htmlInput: { min: 1, step: "any" },
                    input: {
                      startAdornment: (
                        <Typography
                          sx={{ color: "#8d7f7b", mr: 1, fontWeight: 700, fontSize: 16 }}
                        >
                          ₹
                        </Typography>
                      )
                    }
                  }}
                />
              )}
            </Box>
          </SectionCard>

          {/* ── Section 2: Skating Event Categories & Disciplines (100% Dynamic matching /events/create) ── */}
          <SectionCard
            icon={<CategoryOutlinedIcon />}
            title="Skating Event Categories"
            description="Select one or more category types, then choose disciplines under those categories."
          >
            <Stack spacing={2}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={categoryOptions}
                value={selectedCategoryOptions}
                onChange={(_, newValue) => {
                  const nextCategoryIds = newValue.map((item) => item.id);
                  setSelectedCategoryIds(nextCategoryIds);
                  setSelectedDisciplineIds((prev) =>
                    filterDisciplineIdsForCategories(prev, eventCategories, nextCategoryIds)
                  );
                }}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                disabled={saving}
                fullWidth
                sx={inputStyles}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.label}
                      size="small"
                      sx={{ bgcolor: "#fff4e6", color: "#e65100", fontWeight: 600 }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Event Categories"
                    placeholder="Select one or more categories"
                    error={Boolean(errors.eventCategory)}
                    helperText={
                      errors.eventCategory || "Choose one or more skating categories for this event"
                    }
                  />
                )}
              />

              <Autocomplete
                multiple
                disableCloseOnSelect
                options={disciplineOptions}
                value={selectedDisciplineOptions}
                onChange={(_, newValue) => {
                  setSelectedDisciplineIds(newValue.map((item) => item.id));
                }}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                disabled={saving || selectedCategoryIds.length === 0}
                fullWidth
                sx={inputStyles}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.label}
                      size="small"
                      sx={{ bgcolor: "#eef6ff", color: "#2f5f9e", fontWeight: 600 }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Disciplines"
                    placeholder={
                      selectedCategoryIds.length === 0
                        ? "Select a category first"
                        : selectedDisciplineOptions.length
                          ? ""
                          : "Select one or more disciplines"
                    }
                    error={Boolean(errors.discipline)}
                    helperText={
                      errors.discipline ||
                      (selectedCategoryIds.length === 0
                        ? "Pick a category to load disciplines"
                        : disciplineOptions.length === 0
                          ? "No disciplines found for the selected category"
                          : "Choose one or more disciplines for this event")
                    }
                  />
                )}
              />
            </Stack>
          </SectionCard>

          {/* ── Section 3: Schedule ── */}
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
              <TextField
                label="Registration Start Date"
                name="registrationStartDate"
                type="date"
                value={formData.registrationStartDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />
              <TextField
                label="Registration End Date"
                name="registrationEndDate"
                type="date"
                value={formData.registrationEndDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />

              <TextField
                label="Event Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />
              <TextField
                label="Event End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />

              <TextField
                label="Daily Start Time"
                name="eventStartTime"
                placeholder="e.g. 08:00 AM"
                value={formData.eventStartTime}
                onChange={handleChange}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />
              <TextField
                label="Daily End Time"
                name="eventEndTime"
                placeholder="e.g. 06:00 PM"
                value={formData.eventEndTime}
                onChange={handleChange}
                fullWidth
                disabled={saving}
                sx={inputStyles}
              />
            </Box>
          </SectionCard>

          {/* ── Section 4: Venue ── */}
          <SectionCard
            icon={<PlaceOutlinedIcon />}
            title="Venue"
            description="Set where the event will be conducted."
          >
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Kanteerava Outdoor Stadium, Kasturba Road, Bengaluru, Karnataka"
              multiline
              minRows={3}
              fullWidth
              disabled={saving}
              sx={inputStyles}
            />
          </SectionCard>

          {/* ── Section 5: Official Documents & Excel Templates ── */}
          <SectionCard
            icon={<DescriptionOutlinedIcon />}
            title="Official Circular & Skater Excel Template"
            description="Attach official circular document for public notification and excel template for registration."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2.5
              }}
            >
              <DragDropUploadZone
                label="Official Circular Document"
                sublabel="PDF, DOC, DOCX up to 25MB"
                accept=".pdf,.doc,.docx"
                file={circularFile}
                onFileSelect={(f) => setCircularFile(f)}
                onFileRemove={() => {
                  setCircularFile(null);
                  setExistingData((prev) => (prev ? { ...prev, circularDocument: null } : null));
                }}
                existingUrl={existingData?.circularDocument}
                icon={FileText}
                accentColor="#f6765e"
              />

              <DragDropUploadZone
                label="Skater Excel Registration Template"
                sublabel="XLS, XLSX, CSV up to 15MB"
                accept=".xlsx,.xls,.csv"
                file={excelFile}
                onFileSelect={(f) => setExcelFile(f)}
                onFileRemove={() => {
                  setExcelFile(null);
                  setExistingData((prev) => (prev ? { ...prev, excelTemplate: null } : null));
                }}
                existingUrl={existingData?.excelTemplate}
                icon={FileSpreadsheet}
                accentColor="#16a34a"
                allowedFormats="XLS, XLSX up to 15MB"
              />
            </Box>
          </SectionCard>

          {/* ── Section 6: Event Theme Colors ── */}
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
                name="backgroundColor1"
                value={formData.backgroundColor1}
                onChange={handleChange}
                disabled={saving}
              />
              <ColorPickerField
                label="Background Color 2"
                name="backgroundColor2"
                value={formData.backgroundColor2}
                onChange={handleChange}
                disabled={saving}
              />
              <ColorPickerField
                label="Text Color"
                name="textColor"
                value={formData.textColor}
                onChange={handleChange}
                disabled={saving}
              />
            </Box>
          </SectionCard>
        </Stack>

        {/* ── Bottom Action Buttons Bar (Matching /events/create) ── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(240, 219, 210, 0.9)",
            justifyContent: "flex-end",
            flexWrap: "wrap"
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/events/manual")}
            disabled={saving}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              px: 3,
              py: 1,
              borderColor: "#ebdcd5",
              color: "#475569",
              "&:hover": { borderColor: "#f6765e", backgroundColor: "#fff5f2" }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            type="submit"
            disabled={saving}
            sx={{
              backgroundColor: "#f6765e",
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              px: 3.5,
              py: 1,
              boxShadow: "0 10px 24px rgba(246, 118, 94, 0.35)",
              "&:hover": {
                backgroundColor: "#ea6b54",
                boxShadow: "0 14px 28px rgba(246, 118, 94, 0.45)"
              }
            }}
          >
            {saving ? "Saving..." : isEditing ? "Save changes" : "Create event"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ManualEventFormPage;
