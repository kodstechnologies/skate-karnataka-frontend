import { useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { EventForm } from "@/features/admin/events/components/EventForm";
import {
  createEventFormValues,
  initialEventFormValues
} from "@/features/admin/events/components/eventFormConfig";
import { useEventsStore } from "@/features/admin/events/store/events-store";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";

const validateEventForm = (formData) => {
  const errors = {};
  const requiredFields = [
    "title",
    "description",
    "address",
    "registrationStartDateTime",
    "registrationEndDateTime",
    "eventStartDateTime",
    "eventEndDateTime",
    "eventType",
    "eventFor",
    "status",
    "price"
  ];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }
  });

  if (formData.price && Number(formData.price) < 0) {
    errors.price = "Price cannot be negative";
  }

  const registrationStart = Date.parse(formData.registrationStartDateTime || "");
  const registrationEnd = Date.parse(formData.registrationEndDateTime || "");
  const eventStart = Date.parse(formData.eventStartDateTime || "");
  const eventEnd = Date.parse(formData.eventEndDateTime || "");

  if (registrationStart && registrationEnd && registrationStart > registrationEnd) {
    errors.registrationEndDateTime = "Registration end must be after registration start";
  }

  if (eventStart && eventEnd && eventStart > eventEnd) {
    errors.eventEndDateTime = "Event end must be after event start";
  }

  if (registrationEnd && eventStart && registrationEnd > eventStart) {
    errors.eventStartDateTime = "Event start must be after registration closes";
  }

  return errors;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export const EventFormPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditing = Boolean(eventId);
  const events = useEventsStore((state) => state.events);
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const clubs = useClubsStore((state) => state.clubs);

  const clubOptions = useMemo(() => clubs.map((club) => club.clubName).filter(Boolean), [clubs]);
  const existingEvent = useMemo(
    () => events.find((event) => event.id === eventId) ?? null,
    [eventId, events]
  );

  const [formData, setFormData] = useState(
    isEditing && existingEvent ? createEventFormValues(existingEvent) : initialEventFormValues
  );
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;

    setFormData((current) => {
      if (field === "eventType") {
        return { ...current, eventType: value, eventFor: "" };
      }
      return { ...current, [field]: value };
    });
    setErrors((current) => ({
      ...current,
      [field]: "",
      ...(field === "eventType" ? { eventFor: "" } : {})
    }));
  };

  const handleCoverImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, coverImage: "Only image files are allowed" }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((current) => ({
        ...current,
        coverImage: {
          name: file.name,
          dataUrl
        }
      }));
      setErrors((current) => ({ ...current, coverImage: "" }));
    } catch {
      setErrors((current) => ({ ...current, coverImage: "Unable to read selected image" }));
    }
  };

  const handleSubmit = () => {
    const nextErrors = validateEventForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (isEditing && existingEvent) {
      updateEvent(existingEvent.id, formData);
    } else {
      addEvent(formData);
    }

    navigate("/events");
  };

  if (isEditing && !existingEvent) {
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
              to="/events"
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
          onCoverImageChange={handleCoverImageChange}
          clubOptions={clubOptions}
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
          <Button variant="outlined" onClick={() => navigate("/events")}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSubmit}>
            {isEditing ? "Save changes" : "Create event"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
