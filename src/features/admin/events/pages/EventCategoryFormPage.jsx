import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Layers, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { eventCategoriesApi } from "@/api/event-categories-api";
import CategoryInlineEditor from "@/features/admin/events/components/CategoryInlineEditor";
import { useFormulasList } from "@/features/admin/events/hooks/useFormulasList";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

import {
  buildFormState,
  buildPayload,
  hasCategoryFormErrors,
  useCategoryFormActions,
  validateCategoryForm
} from "@/features/admin/events/utils/categoryFormUtils";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

/* ─────────────────────────────────────────────
   EventCategoryFormPage
───────────────────────────────────────────── */
const PORTAL_CONFIG = {
  club: {
    dashboard: "/club/dashboard",
    list: "/club/event-categories",
    label: "Club"
  },
  district: {
    dashboard: "/district/dashboard",
    list: "/district/event-categories",
    label: "District"
  }
};

export default function EventCategoryFormPage({
  portalMode = false,
  orgType = null,
  orgOverrideMode = false
}) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { state: routeState } = useLocation();
  const portal = portalMode && orgType ? PORTAL_CONFIG[orgType] : null;
  const isOrgOverride = Boolean(portal && orgOverrideMode);

  const isEditing = Boolean(categoryId);

  /* ── State ── */
  const [form, setForm] = useState(() => buildFormState(routeState?.category ?? null));
  const [loadingDoc, setLoadingDoc] = useState(isEditing && !routeState?.category);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { formulas, formulasLoading } = useFormulasList();
  const {
    setTypeName,
    setCategoryName,
    setCategoryFormula,
    addCategoryRow,
    removeCategoryRow
  } = useCategoryFormActions(setForm, setErrors);

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

  /* ── Submit ── */
  const handleSubmit = async () => {
    const requireFormula = !isOrgOverride;
    const nextErrors = validateCategoryForm(form, {
      requireFormula,
      requireTypeName: !isOrgOverride
    });
    if (hasCategoryFormErrors(nextErrors)) {
      setErrors(nextErrors);
      if (nextErrors.categoryRows) {
        toast.error("Select a formula for each category name.");
      }
      return;
    }

    const payload = buildPayload(form, { namesOnly: isOrgOverride, requireFormula });
    setSaving(true);
    try {
      if (isEditing) {
        const { message } = await eventCategoriesApi.update(categoryId, payload);
        toast.success(
          message ||
            (isOrgOverride
              ? "Your category names were saved for your organization"
              : "Category updated successfully")
        );
      } else {
        const { message } = await eventCategoriesApi.create(payload);
        toast.success(message || "Category created successfully");
      }
      navigate(portal?.list ?? -1);
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
                to={portal?.dashboard ?? "/dashboard"}
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Dashboard
              </Typography>
              {!portal && (
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
              )}
              <Typography
                component={RouterLink}
                to={portal?.list ?? "/events/category"}
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
              {isOrgOverride
                ? "Edit category names"
                : isEditing
                  ? "Edit Event Category"
                  : "Create Event Category"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {isOrgOverride
                ? `Type name is fixed by KRSA. Only lap / round names are saved for your ${portal.label.toLowerCase()}.`
                : portal
                  ? isEditing
                    ? `Update your ${portal.label.toLowerCase()} custom category. Your club/district id is saved automatically.`
                    : `Create a custom category for your ${portal.label.toLowerCase()}. It will be available alongside standard KRSA categories when you create events.`
                  : isEditing
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
            Type Name {!isOrgOverride ? <span style={{ color: "#f6765e" }}>*</span> : null}
          </Typography>
          {isOrgOverride ? (
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: "14px",
                border: "1px solid #f0e8e5",
                bgcolor: "#faf8f7"
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#2f2829", fontSize: 18 }}>
                {form.typeName || "—"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#8d7f7b", mt: 0.5 }}>
                Set by super admin — cannot be changed here.
              </Typography>
            </Paper>
          ) : (
            <TextField
              placeholder='e.g. "Speed Skating", "Artistic Skating"'
              value={form.typeName}
              onChange={(e) => setTypeName(e.target.value)}
              error={Boolean(errors.typeName)}
              helperText={errors.typeName}
              fullWidth
            />
          )}
        </Box>

        <Divider sx={{ borderColor: "#f5ebe7", mb: 2 }} />

        <CategoryInlineEditor
          form={form}
          errors={errors}
          formulas={formulas}
          formulasLoading={formulasLoading}
          showFormula={!isOrgOverride}
          isOrgOverride={isOrgOverride}
          isCreate={false}
          readOnly={false}
          onTypeNameChange={setTypeName}
          onCategoryNameChange={setCategoryName}
          onCategoryFormulaChange={setCategoryFormula}
          onAddCategoryRow={addCategoryRow}
          onRemoveCategoryRow={removeCategoryRow}
        />

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
          <Button
            variant="outlined"
            onClick={() => navigate(portal?.list ?? "/events/category")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
          >
            {saving
              ? "Saving…"
              : isOrgOverride
                ? "Save my names"
                : isEditing
                  ? "Save Changes"
                  : "Create Category"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
