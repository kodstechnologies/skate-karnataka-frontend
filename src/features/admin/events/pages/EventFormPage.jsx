import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { CheckCircle2, ChevronRight, Save, XCircle } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { EventForm } from "@/features/admin/events/components/EventForm";
import {
  createEventFormValues,
  initialEventFormValues,
  normalizeSkatingEventCategoryIds,
  validateEventForm
} from "@/features/admin/events/components/eventFormConfig";
import {
  unwrapApiMessage,
  unwrapEventPayload,
  unwrapSkatingCategories
} from "@/features/admin/events/utils/parseEventApi";
import { eventsApi } from "@/api/events-api";
import { canApproveEvents, getEventApprovalChipProps } from "@/utils/eventApprovalStatus";
import { useAuthStore } from "@/features/auth/store/auth-store";
import toast from "react-hot-toast";

/** Admin edit page: all event types save via PATCH /event/v1/state/:id (Admin/State auth). */
const updateEventAsAdmin = async (event, payload) => {
  const id = event._id || event.id;
  return eventsApi.update(id, payload);
};

export const EventFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();
  const role = useAuthStore((s) => s.role);
  const canApprove = canApproveEvents(role);
  const isEditing = Boolean(eventId);

  const stateEventPreview = location.state?.event ?? null;

  const [existingEvent, setExistingEvent] = useState(() => stateEventPreview);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);

  const [formData, setFormData] = useState(() =>
    stateEventPreview ? createEventFormValues(stateEventPreview) : initialEventFormValues
  );
  const [errors, setErrors] = useState({});

  const backPath = useMemo(() => {
    const type = String(existingEvent?.eventType || stateEventPreview?.eventType || "").toLowerCase();
    if (type === "club" && location.state?.fromClubId) {
      return `/clubs/${location.state.fromClubId}/events`;
    }
    if (type === "district" && location.state?.fromDistrictId) {
      return `/districts/${location.state.fromDistrictId}/events`;
    }
    return "/events/detail";
  }, [existingEvent, stateEventPreview, location.state]);

  useEffect(() => {
    if (!isEditing || !eventId) return;

    let cancelled = false;
    setLoading(true);

    eventsApi
      .getById(eventId)
      .then((response) => {
        if (cancelled) return;
        const ev = unwrapEventPayload(response);
        if (!ev) {
          if (!location.state?.event) {
            toast.error("Could not load event details");
          }
          return;
        }
        setExistingEvent(ev);
        setFormData((current) => {
          const next = createEventFormValues(ev);
          const preserveIfEmpty = [
            "registerStartDate",
            "registerEndDate",
            "eventStartDate",
            "eventEndDate",
            "eventStartTime",
            "eventEndTime"
          ];
          for (const field of preserveIfEmpty) {
            if (!next[field] && current[field]) {
              next[field] = current[field];
            }
          }
          return next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (!location.state?.event) {
          toast.error(err?.response?.data?.message || err?.message || "Failed to load event");
        }
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
        setEventCategories(unwrapSkatingCategories(res));
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
        const response = await updateEventAsAdmin(existingEvent, payload);
        const message =
          unwrapApiMessage(response) ||
          response?.message ||
          "Event updated successfully";
        toast.success(message);
      } else {
        const response = await eventsApi.create(payload);
        toast.success(unwrapApiMessage(response) || response?.message || "Event created successfully");
      }
      navigate(backPath);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!existingEvent) return;
    try {
      await eventsApi.approveEvent(existingEvent._id || existingEvent.id);
      toast.success("Event approved");
      const response = await eventsApi.getById(eventId);
      const ev = unwrapEventPayload(response);
      if (ev) {
        setExistingEvent(ev);
        setFormData(createEventFormValues(ev));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve event");
    }
  };

  const handleReject = async () => {
    if (!existingEvent) return;
    try {
      await eventsApi.rejectEvent(existingEvent._id || existingEvent.id);
      toast.success("Event rejected");
      const response = await eventsApi.getById(eventId);
      const ev = unwrapEventPayload(response);
      if (ev) {
        setExistingEvent(ev);
        setFormData(createEventFormValues(ev));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject event");
    }
  };

  const eventTypeLabel = existingEvent?.eventType || stateEventPreview?.eventType || "Event";
  const showApprovalActions =
    canApprove &&
    existingEvent &&
    (existingEvent.eventType === "Club" || existingEvent.eventType === "District");

  if (loading && !existingEvent && !stateEventPreview) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography>Loading event details...</Typography>
      </Paper>
    );
  }

  if (isEditing && !existingEvent && !stateEventPreview && !loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Event not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The event you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/events/detail")}>
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
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to={backPath}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Events
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={eventTypeLabel}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
            />
            {existingEvent && <Chip size="small" {...getEventApprovalChipProps(existingEvent)} />}
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            {isEditing ? "Update Event" : "Create Event"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? `Edit ${eventTypeLabel} event details. Club and district events require admin approval before skaters can see them.`
              : "Create and publish event schedules for state, district, and club level participation."}
          </Typography>
        </Stack>
      </Paper>

      {existingEvent?.adminApprovalStatus === "rejected" && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "16px",
            border: "1px solid #ffcdd2",
            bgcolor: "#fff8e1"
          }}
        >
          <Typography sx={{ fontWeight: 600, color: "#5d4037" }}>
            This event was rejected. Saving changes as club/district will resubmit it for approval.
          </Typography>
        </Paper>
      )}

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
            justifyContent: "flex-end",
            flexWrap: "wrap"
          }}
        >
          {showApprovalActions && existingEvent.adminApprovalStatus === "pending" && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckCircle2 size={16} />}
                onClick={handleApprove}
                disabled={saving}
                sx={{ backgroundColor: "#2e7d32" }}
              >
                Approve event
              </Button>
              <Button
                variant="outlined"
                startIcon={<XCircle size={16} />}
                onClick={handleReject}
                disabled={saving}
                color="error"
              >
                Reject
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={() => navigate(backPath)} disabled={saving}>
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
