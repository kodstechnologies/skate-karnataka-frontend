import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { EventForm } from "@/features/admin/events/components/EventForm";
import {
  createEventFormValues,
  initialEventFormValues,
  normalizeSkatingEventCategoryIds,
  validateEventForm
} from "@/features/admin/events/components/eventFormConfig";
import { eventsApi } from "@/api/events-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import toast from "react-hot-toast";

export const ClubEventFormPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const user = useAuthStore((s) => s.user);
  const isEditing = Boolean(eventId);
  const [existingEvent, setExistingEvent] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);

  const [formData, setFormData] = useState(initialEventFormValues);
  const [errors, setErrors] = useState({});

  const clubName = user?.name || "Club";

  useEffect(() => {
    if (!isEditing || !eventId) return;

    let cancelled = false;
    setLoading(true);

    eventsApi
      .getClubEventById(eventId)
      .then((response) => {
        if (cancelled) return;
        const ev = response?.data ?? response;
        setExistingEvent(ev);
        setFormData(createEventFormValues(ev));
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err?.response?.data?.message || "Failed to load event");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditing, eventId]);

  useEffect(() => {
    eventsApi
      .getSkatingCategories()
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? [];
        setEventCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setEventCategories([]);
        toast.error("Failed to load event categories");
      });
  }, []);

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "skatingEventCategories"
        ? normalizeSkatingEventCategoryIds(event.target.value)
        : event.target.value;

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
        const response = await eventsApi.updateClubEvent(
          existingEvent._id || existingEvent.id,
          payload
        );
        toast.success(response?.message || "Event updated successfully");
      } else {
        const response = await eventsApi.createClubEvent(payload);
        toast.success(response?.message || "Club event created successfully");
      }
      navigate("/club/events");
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
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/club/events")}>
          Back to club events
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
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${clubHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
            }}
          >
            <Typography
              component={RouterLink}
              to="/club/dashboard"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/club/events"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Club Events
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
            {isEditing ? "Update Club Event" : "Create Club Event"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 640, lineHeight: 1.7 }}>
            {isEditing
              ? `Update event details for ${clubName}.`
              : `Publish a new event for ${clubName} with registration dates and categories.`}
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <EventForm
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          disabled={saving}
          eventCategories={eventCategories}
          categorySeedFromEvent={existingEvent?.skatingEventCategories}
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
          <Button variant="outlined" onClick={() => navigate("/club/events")} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Processing..." : isEditing ? "Save changes" : "Create club event"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
