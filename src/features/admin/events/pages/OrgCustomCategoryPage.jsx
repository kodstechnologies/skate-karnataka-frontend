import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { eventCategoriesApi } from "@/api/event-categories-api";
import CategoryInlineEditor from "@/features/admin/events/components/CategoryInlineEditor";
import { useFormulasList } from "@/features/admin/events/hooks/useFormulasList";
import {
  getOrgFormulaCreatePath,
  getOrgFormulaPortalMode
} from "@/features/admin/events/utils/portalFormulaConfig";
import {
  buildFormState,
  buildPayload,
  hasCategoryFormErrors,
  useCategoryFormActions,
  validateCategoryForm
} from "@/features/admin/events/utils/categoryFormUtils";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

const getCatId = (c) => String(c?._id ?? c?.id ?? "");
const getDisciplineId = (d) => String(d?._id ?? d?.id ?? "");

const PORTAL_CONFIG = {
  club: { dashboard: "/club/dashboard", list: "/club/event-categories", label: "Club" },
  district: { dashboard: "/district/dashboard", list: "/district/event-categories", label: "District" }
};

const EDITOR_CARD_SX = {
  borderRadius: "24px",
  border: "1px solid #f0ddd5",
  overflow: "hidden",
  background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
  boxShadow: "0 20px 50px rgba(56,36,29,0.08)"
};

const TabRow = ({ items, activeId, onSelect, getId, getLabel, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      gap: 0,
      overflowX: "auto",
      px: 2,
      borderBottom: "1px solid #e8dcd6",
      "&::-webkit-scrollbar": { height: 4 },
      "&::-webkit-scrollbar-thumb": { backgroundColor: "#e8dcd6", borderRadius: 4 },
      ...sx
    }}
  >
    {items.map((item) => {
      const id = getId(item);
      const isActive = id === activeId;
      return (
        <Box
          key={id}
          component="button"
          type="button"
          onClick={() => onSelect(id)}
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.25,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#f6765e" : "#8d7f7b",
            borderBottom: isActive ? "2px solid #f6765e" : "2px solid transparent",
            marginBottom: "-1px",
            "&:hover": { color: isActive ? "#f6765e" : "#5f5552" }
          }}
        >
          {getLabel(item)}
        </Box>
      );
    })}
  </Box>
);

export default function OrgCustomCategoryPage({ orgType }) {
  const portal = PORTAL_CONFIG[orgType];

  // categories[] each with disciplines[]
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // two-level selection
  const [activeCatId, setActiveCatId] = useState(null);
  const [activeDisciplineId, setActiveDisciplineId] = useState(null);

  const [form, setForm] = useState(() => buildFormState(null));
  const [saving, setSaving] = useState(false);

  const { formulas, formulasLoading } = useFormulasList({
    portalMode: getOrgFormulaPortalMode(orgType)
  });
  const formulaCreatePath = getOrgFormulaCreatePath(orgType);
  const [formErrors, setFormErrors] = useState({});
  const {
    setCategoryName,
    setCategoryFormula,
    addCategoryRow,
    removeCategoryRow
  } = useCategoryFormActions(setForm, setFormErrors);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await eventCategoriesApi.getOrgContext();
      const body = res?.data ?? res;
      const inner = body?.data && typeof body.data === "object" ? body.data : body;
      const allCats = Array.isArray(inner?.categories)
        ? inner.categories
        : Array.isArray(inner?.standardCategories)
          ? inner.standardCategories
          : [];

      setCategories(allCats);

      // auto-select first category + its first discipline
      if (allCats.length > 0) {
        const firstCat = allCats[0];
        const firstCatId = getCatId(firstCat);
        setActiveCatId(firstCatId);
        const firstDiscs = firstCat.disciplines ?? [];
        if (firstDiscs.length > 0) {
          const firstDiscId = getDisciplineId(firstDiscs[0]);
          setActiveDisciplineId(firstDiscId);
          setForm(buildFormState(firstDiscs[0]));
        } else {
          setActiveDisciplineId(null);
          setForm(buildFormState(null));
        }
      }
      return allCats;
    } catch (err) {
      toast.error(extractError(err));
      setFetchError(extractError(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // selecting a category tab resets discipline selection to first of that category
  const handleCatSelect = (catId) => {
    setActiveCatId(catId);
    setFormErrors({});
    const cat = categories.find((c) => getCatId(c) === catId);
    const discs = cat?.disciplines ?? [];
    if (discs.length > 0) {
      const firstDiscId = getDisciplineId(discs[0]);
      setActiveDisciplineId(firstDiscId);
      setForm(buildFormState(discs[0]));
    } else {
      setActiveDisciplineId(null);
      setForm(buildFormState(null));
    }
  };

  const handleDisciplineSelect = (discId) => {
    setActiveDisciplineId(discId);
    setFormErrors({});
    const cat = categories.find((c) => getCatId(c) === activeCatId);
    const disc = (cat?.disciplines ?? []).find((d) => getDisciplineId(d) === discId);
    setForm(buildFormState(disc ?? null));
  };

  const handleUpdate = async () => {
    if (!activeDisciplineId || !activeCatId) return;
    const nextErrors = validateCategoryForm(form, { requireFormula: true });
    if (hasCategoryFormErrors(nextErrors)) {
      setFormErrors(nextErrors);
      toast.error("Select a formula for each category name.");
      return;
    }
    setFormErrors({});

    const payload = {
      ...buildPayload(form, { requireFormula: true }),
      disciplineId: activeDisciplineId
    };

    setSaving(true);
    try {
      const res = await eventCategoriesApi.update(activeCatId, payload);
      toast.success(res?.message || "Discipline updated successfully");
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const activeCat = categories.find((c) => getCatId(c) === activeCatId);
  const activeCatDisciplines = activeCat?.disciplines ?? [];
  const activeDisc = activeCatDisciplines.find((d) => getDisciplineId(d) === activeDisciplineId);

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 250 },
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
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)", pointerEvents: "none" }} />
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: { xs: 14, md: 16 } } }}
          >
            <Typography component={RouterLink} to={portal.dashboard} sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}>
              Dashboard
            </Typography>
            <Typography component={RouterLink} to={portal.list} sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}>
              Event Categories
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Custom</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            Custom Categories
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
            Each tab is a discipline. Edit and update any tab — unmodified disciplines show the default values.
          </Typography>
        </Stack>
      </Paper>

      {/* Main panel */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              {portal.label} Custom Categories
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Switch tabs to edit another discipline. Update applies to the active tab only.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: "24px" }} />
          ) : fetchError ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", bgcolor: "#fff5f5" }}>
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 2 }}>{fetchError}</Typography>
              <Button variant="outlined" startIcon={<RefreshCw size={15} />} onClick={load}>Retry</Button>
            </Paper>
          ) : categories.length === 0 ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>
              No categories found.
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ ...EDITOR_CARD_SX, maxWidth: 960, mx: "auto", width: "100%", cursor: "default" }}>

              {/* Level 1 — Category tabs */}
              <TabRow
                items={categories}
                activeId={activeCatId}
                onSelect={handleCatSelect}
                getId={getCatId}
                getLabel={(c) => c.name || c.typeName || "Unnamed"}
                sx={{ pt: 1.5 }}
              />

              {/* Level 2 — Discipline tabs (shown after a category is selected) */}
              {activeCatDisciplines.length > 0 ? (
                <TabRow
                  items={activeCatDisciplines}
                  activeId={activeDisciplineId}
                  onSelect={handleDisciplineSelect}
                  getId={getDisciplineId}
                  getLabel={(d) => d.name || d.typeName || "Unnamed"}
                  sx={{
                    pt: 1,
                    background: "rgba(246,118,94,0.04)",
                    borderTop: "1px solid #f5ebe7",
                    "& button": { fontSize: 13, py: 1 }
                  }}
                />
              ) : (
                <Box sx={{ px: 2.5, py: 1.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#978a86" }}>No disciplines in this category.</Typography>
                </Box>
              )}

              {/* Editor — only when a discipline is selected */}
              {activeDisc ? (
                <>
                  <CategoryInlineEditor
                    form={form}
                    errors={formErrors}
                    formulas={formulas}
                    formulasLoading={formulasLoading}
                    formulaCreatePath={formulaCreatePath}
                    showFormula
                    isOrgOverride
                    isCreate={false}
                    readOnly={false}
                    onTypeNameChange={() => {}}
                    onCategoryNameChange={setCategoryName}
                    onCategoryFormulaChange={setCategoryFormula}
                    onAddCategoryRow={addCategoryRow}
                    onRemoveCategoryRow={removeCategoryRow}
                  />
                  <Divider sx={{ borderColor: "#f5ebe7", mx: 2.5 }} />
                  <Stack direction="row" spacing={1.5} sx={{ p: 2.5, justifyContent: "flex-end", alignItems: "center" }}>
                    <Box sx={{ flex: 1 }}>
                      {activeDisc._effectiveOverride
                        ? <Chip label="Custom" size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#e0f7f5", color: "#00897b" }} />
                        : <Chip label="Standard (default)" size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#fff1eb", color: "#f6765e" }} />
                      }
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleUpdate}
                      disabled={saving}
                      sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" }, minWidth: 140 }}
                    >
                      {saving ? <CircularProgress size={16} color="inherit" /> : "Update"}
                    </Button>
                  </Stack>
                </>
              ) : null}

            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
