import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import { EventForm } from "@/features/admin/events/components/EventForm";
import {
  createEventFormValues,
  initialEventFormValues,
  normalizeSkatingEventCategoryIds,
  validateEventForm
} from "@/features/admin/events/components/eventFormConfig";
import { unwrapOrgCategoryContext } from "@/features/admin/events/utils/categoryDisplay";
import { unwrapSkatingCategories } from "@/features/admin/events/utils/parseEventApi";
import { eventCategoriesApi } from "@/api/event-categories-api";
import { eventsApi } from "@/api/events-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import toast from "react-hot-toast";

export const DistrictEventFormPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const user = useAuthStore((s) => s.user);
  const isEditing = Boolean(eventId);
  const [existingEvent, setExistingEvent] = useState(null);
  const [fetchDoneForId, setFetchDoneForId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);
  const [categoryFormat, setCategoryFormat] = useState("standard");
  const [categorySourceUsesStandardFallback, setCategorySourceUsesStandardFallback] =
    useState(false);
  const [formData, setFormData] = useState(initialEventFormValues);
  const [errors, setErrors] = useState({});

  const districtName = user?.districtName || user?.name || "District";
  const loading = Boolean(isEditing && eventId && fetchDoneForId !== eventId);

  useEffect(() => {
    if (!isEditing || !eventId) return undefined;

    let cancelled = false;

    eventsApi
      .getDistrictEventById(eventId)
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
        if (!cancelled) setFetchDoneForId(eventId);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditing, eventId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [catRes, ctxRes] = await Promise.all([
          eventsApi.getSkatingCategories({ source: categoryFormat }),
          categoryFormat === "custom" ? eventCategoriesApi.getOrgContext() : Promise.resolve(null)
        ]);

        if (cancelled) return;

        setEventCategories(unwrapSkatingCategories(catRes));

        if (categoryFormat === "custom" && ctxRes) {
          const ctx = unwrapOrgCategoryContext(ctxRes);
          setCategorySourceUsesStandardFallback(ctx.usesStandardFallbackForCustom);
        } else {
          setCategorySourceUsesStandardFallback(false);
        }
      } catch {
        if (cancelled) return;
        setEventCategories([]);
        setCategorySourceUsesStandardFallback(false);
        toast.error("Failed to load event categories");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryFormat]);

  const handleCategoryFormatChange = (format) => {
    setCategoryFormat(format);
    setFormData((current) => ({ ...current, skatingEventCategories: [] }));
  };

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "skatingEventCategories"
        ? normalizeSkatingEventCategoryIds(event.target.value)
        : event.target.value;

    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateEventForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEditing && existingEvent) {
        const response = await eventsApi.updateDistrictEvent(
          existingEvent._id || existingEvent.id,
          { ...formData }
        );
        toast.success(response?.message || response?.data?.message || "Event updated successfully");
      } else {
        const response = await eventsApi.createDistrictEvent({ ...formData });
        toast.success(
          response?.message || "District event submitted — pending super admin approval"
        );
      }
      navigate("/district/events");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(83,199,197,0.28) 100%), url("${districtHero}")`,
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
              to="/district/dashboard"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/district/events"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              District Events
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
            {isEditing ? "Edit District Event" : "Create District Event"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 640, lineHeight: 1.7 }}>
            {isEditing
              ? `Update event details for ${districtName}.`
              : `Publish a new event for ${districtName}. It will appear to skaters after super admin approval.`}
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(200, 230, 228, 0.95)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        {loading ? (
          <Typography sx={{ py: 4, textAlign: "center", color: "#8d7f7b" }}>
            Loading event...
          </Typography>
        ) : (
          <EventForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            disabled={saving}
            eventCategories={eventCategories}
            showCategorySourcePicker
            onCategoryFormatChange={handleCategoryFormatChange}
            categorySourceUsesStandardFallback={categorySourceUsesStandardFallback}
          />
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(200, 230, 228, 0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/district/events")} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving || loading}
            sx={{ bgcolor: "#53c7c5", "&:hover": { bgcolor: "#45b3b1" } }}
          >
            {saving ? "Processing..." : isEditing ? "Save changes" : "Create district event"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
