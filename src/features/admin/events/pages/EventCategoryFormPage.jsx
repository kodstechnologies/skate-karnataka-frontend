import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { ChevronRight, Layers, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { eventCategoriesApi } from "@/api/event-categories-api";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   Constants — mirrors backend AGE_GROUPS exactly
───────────────────────────────────────────── */
const AGE_GROUP_LABELS = ["6-8", "8-10", "10-12", "12-15", "15-18", "18+", "35+"];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

/** Initialise form state from an optional existing doc */
const buildFormState = (doc) => ({
  typeName: doc?.typeName ?? "",
  ageGroups: AGE_GROUP_LABELS.map((label) => {
    const existing = doc?.ageGroups?.find((ag) => ag.label === label);
    return {
      label,
      // Keep one empty row if there are no existing categories
      categories: existing?.categories?.length ? existing.categories.map((c) => c.name) : [""]
    };
  })
});

/** Build the API payload from form state */
const buildPayload = (form) => ({
  typeName: form.typeName.trim(),
  ageGroups: form.ageGroups
    .map((ag) => ({
      label: ag.label,
      categories: ag.categories
        .map((c) => c.trim())
        .filter(Boolean)
        .map((name) => ({ name }))
    }))
    .filter((ag) => ag.categories.length > 0)
});

/* ─────────────────────────────────────────────
   EventCategoryFormPage
───────────────────────────────────────────── */
export default function EventCategoryFormPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { state: routeState } = useLocation();

  const isEditing = Boolean(categoryId);

  /* ── State ── */
  const [form, setForm] = useState(() => buildFormState(routeState?.category ?? null));
  const [loadingDoc, setLoadingDoc] = useState(isEditing && !routeState?.category);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /* ── Load existing doc if navigated directly by URL ── */
  useEffect(() => {
    if (!isEditing || routeState?.category) return;

    eventCategoriesApi
      .getById(categoryId)
      .then((res) => {
        const doc = res?.data?.data ?? res?.data;
        setForm(buildFormState(doc));
      })
      .catch((err) => {
        toast.error(extractError(err));
      })
      .finally(() => setLoadingDoc(false));
  }, [isEditing, categoryId, routeState?.category]);

  /* ── Field setters ── */
  const setTypeName = (value) => {
    setForm((f) => ({ ...f, typeName: value }));
    setErrors((e) => ({ ...e, typeName: "" }));
  };

  const setCategoryName = (ageIdx, catIdx, value) => {
    setForm((f) => {
      const ageGroups = f.ageGroups.map((ag, ai) => {
        if (ai !== ageIdx) return ag;
        return {
          ...ag,
          categories: ag.categories.map((c, ci) => (ci === catIdx ? value : c))
        };
      });
      return { ...f, ageGroups };
    });
  };

  const addCategory = (ageIdx) => {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.map((ag, ai) =>
        ai === ageIdx ? { ...ag, categories: [...ag.categories, ""] } : ag
      )
    }));
  };

  const removeCategory = (ageIdx, catIdx) => {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.map((ag, ai) => {
        if (ai !== ageIdx) return ag;
        const filtered = ag.categories.filter((_, ci) => ci !== catIdx);
        return { ...ag, categories: filtered.length ? filtered : [""] };
      })
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    // Validate
    const nextErrors = {};
    if (!form.typeName.trim()) nextErrors.typeName = "Type name is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = buildPayload(form);
    setSaving(true);
    try {
      if (isEditing) {
        await eventCategoriesApi.update(categoryId, payload);
        toast.success("Category updated successfully");
      } else {
        await eventCategoriesApi.create(payload);
        toast.success("Category created successfully");
      }
      navigate("/events/category");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loadingDoc) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  /* ── Page ── */
  return (
    <Box className="space-y-5">
      {/* ── Hero Banner (DistrictsPage pattern) ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.60) 44%, rgba(246,118,94,0.18) 100%), url("${eventsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        {/* Subtle top-tint overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)",
            pointerEvents: "none"
          }}
        />

        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 720 }}>
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
              <Typography
                component={RouterLink}
                to="/events/category"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Categories
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {isEditing ? "Edit" : "Create"}
              </Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              {isEditing ? "Edit Event Category" : "Create Event Category"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {isEditing
                ? "Update the skating discipline, age groups, and lap categories below."
                : "Define a new skating discipline with its age groups and lap / round categories."}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                icon={<Layers size={14} />}
                label={isEditing ? "Editing record" : "New record"}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Form Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        {/* Type Name */}
        <Box sx={{ mb: 3.5 }}>
          <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 1 }}>
            Type Name <span style={{ color: "#f6765e" }}>*</span>
          </Typography>
          <TextField
            placeholder='e.g. "Speed Skating", "Artistic Skating"'
            value={form.typeName}
            onChange={(e) => setTypeName(e.target.value)}
            error={Boolean(errors.typeName)}
            helperText={errors.typeName}
            fullWidth
          />
        </Box>

        <Divider sx={{ borderColor: "#f5ebe7", mb: 3.5 }} />

        {/* Age Groups */}
        <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
          Age Groups & Categories
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#8d7f7b", mb: 2.5 }}>
          Add lap or round categories under each age group. Leave all rows empty to skip an age
          group.
        </Typography>

        <Stack spacing={2.5}>
          {form.ageGroups.map((ag, ageIdx) => {
            const filledCount = ag.categories.filter((c) => c.trim()).length;
            return (
              <Paper
                key={ag.label}
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #f0e8e5",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #fff9f7 0%, #fff4f0 100%)"
                }}
              >
                {/* Age group header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f5ebe7" }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Chip
                      label={ag.label}
                      size="small"
                      sx={{
                        backgroundColor: "#fff1eb",
                        color: "#f6765e",
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    />
                    <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
                      {filledCount} categor{filledCount === 1 ? "y" : "ies"}
                    </Typography>
                  </Stack>

                  <Tooltip title="Add row">
                    <IconButton
                      size="small"
                      onClick={() => addCategory(ageIdx)}
                      sx={{
                        color: "#f6765e",
                        border: "1px solid #f5d5c8",
                        backgroundColor: "#fff1eb",
                        "&:hover": { backgroundColor: "#ffe3d9" }
                      }}
                    >
                      <Plus size={15} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Category inputs */}
                <Stack spacing={1} sx={{ p: 2 }}>
                  {ag.categories.map((catName, catIdx) => (
                    <Stack key={catIdx} direction="row" alignItems="center" gap={1}>
                      <TextField
                        size="small"
                        placeholder={`Category ${catIdx + 1} e.g. "1 Lap"`}
                        value={catName}
                        onChange={(e) => setCategoryName(ageIdx, catIdx, e.target.value)}
                        fullWidth
                      />
                      <Tooltip title="Remove row">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => removeCategory(ageIdx, catIdx)}
                            disabled={ag.categories.length === 1}
                            sx={{ color: "#f6765e", flexShrink: 0 }}
                          >
                            <X size={15} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {/* Action bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid rgba(240,219,210,0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/events/category")} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
          >
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
