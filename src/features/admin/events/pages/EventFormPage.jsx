import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { EventForm } from "@/features/admin/events/components/EventForm";
import {
  createEventFormValues,
  initialEventFormValues
} from "@/features/admin/events/components/eventFormConfig";
import { eventsApi } from "@/api/events-api";
import toast from "react-hot-toast";

const validateEventForm = (formData) => {
  const errors = {};
  const requiredFields = [
    "header",
    "about",
    "address",
    "registerStartDate",
    "registerEndDate",
    "eventStartDate",
    "eventEndDate",
    "status",
    "entryFee"
  ];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }
  });

  if (formData.entryFee && Number(formData.entryFee) < 0) {
    errors.entryFee = "Entry fee cannot be negative";
  }

  // Logical Date Validation
  const regStart = formData.registerStartDate ? new Date(formData.registerStartDate) : null;
  const regEnd = formData.registerEndDate ? new Date(formData.registerEndDate) : null;
  const eventStart = formData.eventStartDate ? new Date(formData.eventStartDate) : null;
  const eventEnd = formData.eventEndDate ? new Date(formData.eventEndDate) : null;

  if (regStart && regEnd && regStart > regEnd) {
    errors.registerEndDate = "Registration end date cannot be before start date";
  }

  if (eventStart && eventEnd && eventStart > eventEnd) {
    errors.eventEndDate = "Event end date cannot be before start date";
  }

  if (regEnd && eventStart && regEnd > eventStart) {
    errors.registerEndDate = "Registration must end before or on the event start date";
  }

  // Same-day Time Validation
  if (
    formData.eventStartDate &&
    formData.eventEndDate &&
    new Date(formData.eventStartDate).toDateString() ===
      new Date(formData.eventEndDate).toDateString()
  ) {
    if (formData.eventStartTime && formData.eventEndTime) {
      if (formData.eventStartTime >= formData.eventEndTime) {
        errors.eventEndTime = "End time must be strictly after start time for same-day events";
      }
    }
  }

  return errors;
};

export const EventFormPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { state } = useLocation();
  const passedEvent = state?.event;
  const isEditing = Boolean(eventId);
  const [existingEvent, setExistingEvent] = useState(passedEvent || null);
  const [loading, setLoading] = useState(isEditing && !passedEvent);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(
    passedEvent ? createEventFormValues(passedEvent) : initialEventFormValues
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && !passedEvent) {
      eventsApi
        .getById(eventId)
        .then(({ data }) => {
          // Assuming data is in data.data or data itself
          const ev = data?.data || data;
          setExistingEvent(ev);
          setFormData(createEventFormValues(ev));
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Failed to load event");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isEditing, eventId, passedEvent]);

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;

    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: ""
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateEventForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };

      if (isEditing && existingEvent) {
        const { message } = await eventsApi.update(existingEvent._id || existingEvent.id, payload);
        toast.success(message || "Event updated successfully");
      } else {
        const { message } = await eventsApi.create(payload);
        toast.success(message || "Event created successfully");
      }
      navigate(-1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography>Loading event details...</Typography>
      </Paper>
    );
  }

  if (isEditing && !existingEvent && !loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Event not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The event you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/events")}>
          Back to events
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
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
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/events/detail"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              Events
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update Event" : "Create Event"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            Create and publish event schedules for state, district, and club level participation
            with complete registration windows.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <EventForm
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          disabled={saving}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(240, 219, 210, 0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/events/detail")} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Processing..." : isEditing ? "Save changes" : "Create event"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
