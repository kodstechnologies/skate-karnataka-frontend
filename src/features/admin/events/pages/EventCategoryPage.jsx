import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  Skeleton
} from "@mui/material";
import { ChevronRight, Layers, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventCategoriesApi } from "@/api/event-categories-api";
import CategoryInlineEditor from "@/features/admin/events/components/CategoryInlineEditor";
import { buildFormState, buildPayload } from "@/features/admin/events/utils/categoryFormUtils";
import { unwrapOrgCategoryContext } from "@/features/admin/events/utils/categoryDisplay";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

const getCategoryId = (cat) => String(cat?._id ?? cat?.id ?? "");

const CATEGORY_CARD_SX = {
  borderRadius: "24px",
  border: "1px solid #f0ddd5",
  overflow: "hidden",
  background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
  boxShadow: "0 20px 50px rgba(56,36,29,0.08)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 28px 65px rgba(56,36,29,0.12)"
  }
};

const CategoryTypeTabs = ({ categories, activeId, onSelect, showNewTab }) => (
  <Box
    sx={{
      display: "flex",
      gap: 0,
      overflowX: "auto",
      px: 2,
      pt: 1.5,
      borderBottom: "1px solid #e8dcd6",
      "&::-webkit-scrollbar": { height: 4 },
      "&::-webkit-scrollbar-thumb": { backgroundColor: "#e8dcd6", borderRadius: 4 }
    }}
  >
    {categories.map((cat) => {
      const catId = getCategoryId(cat);
      const isActive = catId === activeId;
      return (
        <Box
          key={catId}
          component="button"
          type="button"
          onClick={() => onSelect(catId)}
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
          {cat.typeName || "Unnamed"}
        </Box>
      );
    })}
    {showNewTab ? (
      <Box
        component="button"
        type="button"
        onClick={() => onSelect("new")}
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.25,
          border: "none",
          cursor: "pointer",
          background: "transparent",
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: activeId === "new" ? 700 : 500,
          color: activeId === "new" ? "#f6765e" : "#8d7f7b",
          borderBottom: activeId === "new" ? "2px solid #f6765e" : "2px solid transparent",
          marginBottom: "-1px"
        }}
      >
        New type
      </Box>
    ) : null}
  </Box>
);

const CategoryPickerCard = ({ cat, onOpen }) => (
  <Paper
    elevation={0}
    onClick={() => onOpen(cat)}
    sx={{
      ...CATEGORY_CARD_SX,
      width: { xs: "100%", sm: 220 },
      maxWidth: 280,
      py: 3.5,
      px: 2,
      textAlign: "center"
    }}
  >
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "14px",
        backgroundColor: "#fff1eb",
        color: "#f6765e",
        mb: 1.5
      }}
    >
      <Layers size={22} />
    </Box>
    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#2f2829" }}>
      {cat.typeName || "Unnamed"}
    </Typography>
    <Chip
      size="small"
      label={cat.categoryStatus === "custom" ? "Custom" : "Standard"}
      sx={{
        mt: 1.25,
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        bgcolor: cat.categoryStatus === "custom" ? "#e0f7f5" : "#fff1eb",
        color: cat.categoryStatus === "custom" ? "#00897b" : "#f6765e"
      }}
    />
  </Paper>
);

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

export default function EventCategoryPage({
  portalMode = false,
  orgType = null,
  orgOverrideList = false
}) {
  const portal = portalMode && orgType ? PORTAL_CONFIG[orgType] : null;
  const isOrgOverrideList = Boolean(portal && orgOverrideList);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [form, setForm] = useState(() => buildFormState(null));
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canEditActive = () => {
    if (isOrgOverrideList) return true;
    if (!portal) return true;
    if (activeCategoryId === "new") return true;
    const cat = categories.find((c) => getCategoryId(c) === activeCategoryId);
    return cat?.categoryStatus === "custom";
  };

  const loadFormForId = useCallback(
    (id) => {
      if (id === "new") {
        setForm(buildFormState(null));
        return;
      }
      const cat = categories.find((c) => getCategoryId(c) === id);
      setForm(buildFormState(cat ?? null));
    },
    [categories]
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      let list = [];
      if (isOrgOverrideList) {
        const res = await eventCategoriesApi.getOrgContext();
        const ctx = unwrapOrgCategoryContext(res);
        list = ctx.categories;
      } else {
        const res = await eventCategoriesApi.getAll();
        const data = res?.data?.data ?? res?.data ?? [];
        list = Array.isArray(data) ? data : [];
      }
      setCategories(list);
      return list;
    } catch (err) {
      toast.error(extractError(err));
      setFetchError(extractError(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, [isOrgOverrideList]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openEditor = (catOrNew) => {
    if (catOrNew === "new") {
      setEditorOpen(true);
      setActiveCategoryId("new");
      loadFormForId("new");
      setFormErrors({});
      return;
    }
    // Virtual "Standard" group card — open the first standard category
    if (catOrNew?._id === "__standard__" && catOrNew?._items?.length) {
      const firstStandard = catOrNew._items[0];
      const id = getCategoryId(firstStandard);
      setEditorOpen(true);
      setActiveCategoryId(id);
      loadFormForId(id);
      setFormErrors({});
      return;
    }
    const id = getCategoryId(catOrNew);
    setEditorOpen(true);
    setActiveCategoryId(id);
    loadFormForId(id);
    setFormErrors({});
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setActiveCategoryId(null);
    setFormErrors({});
  };

  const handleTabSelect = (id) => {
    setActiveCategoryId(id);
    loadFormForId(id);
    setFormErrors({});
  };

  const setTypeName = (value) => {
    setForm((f) => ({ ...f, typeName: value }));
    setFormErrors((e) => ({ ...e, typeName: "" }));
  };

  const setCategoryName = (ageIdx, catIdx, value) => {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.map((ag, ai) =>
        ai === ageIdx
          ? {
              ...ag,
              categories: ag.categories.map((c, ci) => (ci === catIdx ? value : c))
            }
          : ag
      )
    }));
  };

  const addCategoryRow = (ageIdx) => {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.map((ag, ai) =>
        ai === ageIdx ? { ...ag, categories: [...ag.categories, ""] } : ag
      )
    }));
  };

  const removeCategoryRow = (ageIdx, catIdx) => {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.map((ag, ai) => {
        if (ai !== ageIdx) return ag;
        const filtered = ag.categories.filter((_, ci) => ci !== catIdx);
        return { ...ag, categories: filtered.length ? filtered : [""] };
      })
    }));
  };

  const handleUpdate = async () => {
    const nextErrors = {};
    if (!isOrgOverrideList && activeCategoryId === "new" && !form.typeName.trim()) {
      nextErrors.typeName = "Type name is required.";
    }
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    const payload = buildPayload(form, { namesOnly: isOrgOverrideList });
    setSaving(true);
    try {
      if (activeCategoryId === "new") {
        const res = await eventCategoriesApi.create(payload);
        toast.success(res?.message || "Category created successfully");
        const list = await fetchCategories();
        const created = res?.data?.data ?? res?.data;
        const newId = created ? getCategoryId(created) : null;
        const fromList = newId ? list.find((c) => getCategoryId(c) === newId) : list.at(-1);
        if (fromList) {
          setActiveCategoryId(getCategoryId(fromList));
          setForm(buildFormState(fromList));
        } else {
          closeEditor();
        }
      } else {
        const res = await eventCategoriesApi.update(activeCategoryId, payload);
        toast.success(res?.message || "Category updated successfully");
        const list = await fetchCategories();
        const updated = list.find((c) => getCategoryId(c) === activeCategoryId);
        if (updated) setForm(buildFormState(updated));
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const id = pendingDelete._id ?? pendingDelete.id;
      const { message } = await eventCategoriesApi.delete(id);
      toast.success(message || "Category deleted successfully");
      if (getCategoryId(pendingDelete) === activeCategoryId) {
        closeEditor();
      }
      setCategories((prev) => prev.filter((c) => getCategoryId(c) !== String(id)));
      setPendingDelete(null);
    } catch (err) {
      toast.error(extractError(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Group all standard categories into one virtual "Standard" card
  const standardCategories = categories.filter((c) => c.categoryStatus !== "custom");
  const customCategories = categories.filter((c) => c.categoryStatus === "custom");
  const displayCards = [
    ...(standardCategories.length > 0
      ? [{ _id: "__standard__", typeName: "Standard", categoryStatus: "standard", _items: standardCategories }]
      : []),
    ...customCategories
  ];

  const showCreateTab = !isOrgOverrideList && !portal && editorOpen;
  const readOnlyEditor = editorOpen && !canEditActive();

  return (
    <Box className="space-y-5">
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)",
            pointerEvents: "none"
          }}
        />
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: { xs: 14, md: 16 } }
            }}
          >
            <Typography
              component={RouterLink}
              to={portal?.dashboard ?? "/dashboard"}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            {!portal && (
              <Typography
                component={RouterLink}
                to="/events/detail"
                sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
              >
                Events
              </Typography>
            )}
            <Typography sx={{ color: "white", fontWeight: 700 }}>Categories</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            {portal ? `${portal.label} event categories` : "Event Categories"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
            {isOrgOverrideList
              ? `Click a type to edit lap names for your ${portal.label.toLowerCase()}. Update saves that type only.`
              : "Click a type card to open details. Use + to add rows, then Update at the bottom for that type."}
          </Typography>
        </Stack>
      </Paper>

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
              Event Category Management
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              {editorOpen
                ? "Switch tabs to edit another type. Update applies to the active tab only."
                : "Select a type below to open the editor."}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {editorOpen ? (
              <Button variant="outlined" onClick={closeEditor} disabled={saving}>
                Back to types
              </Button>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={fetchCategories}
              disabled={loading}
            >
              Refresh
            </Button>
            {!isOrgOverrideList && !portal ? (
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => openEditor("new")}
                sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
              >
                Add type
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              {[1].map((i) => (
                <Skeleton key={i} variant="rounded" width={220} height={140} sx={{ borderRadius: "24px" }} />
              ))}
            </Box>
          ) : fetchError ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", bgcolor: "#fff5f5" }}>
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 2 }}>{fetchError}</Typography>
              <Button variant="outlined" startIcon={<RefreshCw size={15} />} onClick={fetchCategories}>
                Retry
              </Button>
            </Paper>
          ) : categories.length === 0 && !editorOpen ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>
              {isOrgOverrideList
                ? "No KRSA standard categories yet."
                : 'No categories yet. Click "Add type" to create one.'}
            </Paper>
          ) : !editorOpen ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2.5,
                justifyContent: "center",
                py: 2
              }}
            >
              {displayCards.map((cat) => (
                <CategoryPickerCard key={getCategoryId(cat)} cat={cat} onOpen={openEditor} />
              ))}
            </Box>
          ) : (
            <Paper elevation={0} sx={{ ...CATEGORY_CARD_SX, maxWidth: 960, mx: "auto", width: "100%", cursor: "default" }}>
              <CategoryTypeTabs
                categories={categories}
                activeId={activeCategoryId}
                onSelect={handleTabSelect}
                showNewTab={showCreateTab}
              />
              <CategoryInlineEditor
                form={form}
                errors={formErrors}
                isOrgOverride={isOrgOverrideList}
                isCreate={activeCategoryId === "new"}
                readOnly={readOnlyEditor}
                onTypeNameChange={setTypeName}
                onCategoryNameChange={setCategoryName}
                onAddCategoryRow={addCategoryRow}
                onRemoveCategoryRow={removeCategoryRow}
              />
              <Divider sx={{ borderColor: "#f5ebe7", mx: 2.5 }} />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ p: 2.5, justifyContent: "flex-end" }}
              >
                {readOnlyEditor ? (
                  <Typography sx={{ fontSize: 13, color: "#8d7f7b", flex: 1, alignSelf: "center" }}>
                    Standard KRSA type — read only for your {portal?.label?.toLowerCase() ?? "organization"}.
                  </Typography>
                ) : null}
                {!readOnlyEditor &&
                activeCategoryId !== "new" &&
                !isOrgOverrideList &&
                (!portal || categories.find((c) => getCategoryId(c) === activeCategoryId)?.categoryStatus === "custom") ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={15} />}
                    onClick={() => {
                      const cat = categories.find((c) => getCategoryId(c) === activeCategoryId);
                      if (cat) setPendingDelete(cat);
                    }}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                ) : null}
                <Button variant="outlined" onClick={closeEditor} disabled={saving}>
                  Cancel
                </Button>
                {!readOnlyEditor ? (
                  <Button
                    variant="contained"
                    onClick={handleUpdate}
                    disabled={saving}
                    sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" }, minWidth: 140 }}
                  >
                    {saving
                      ? "Saving…"
                      : activeCategoryId === "new"
                        ? "Create"
                        : isOrgOverrideList
                          ? "Update"
                          : "Update"}
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          )}
        </Box>
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete Category"
        itemLabel={pendingDelete?.typeName}
        description="This event category and all its age groups will be permanently removed."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
