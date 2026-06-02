import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Layers, Plus, Save, Shield, X } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { eventCategoriesApi } from "@/api/event-categories-api";
import {
  collectCategoryNameLabels,
  unwrapOrgCategoryContext
} from "@/features/admin/events/utils/categoryDisplay";
import toast from "react-hot-toast";

const PORTAL = {
  club: {
    dashboard: "/club/dashboard",
    path: "/club/event-categories",
    label: "Club"
  },
  district: {
    dashboard: "/district/dashboard",
    path: "/district/event-categories",
    label: "District"
  }
};

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

const normalizeNameRows = (doc) => {
  const list = Array.isArray(doc?.customCategoryNames) ? doc.customCategoryNames : [];
  const rows = list
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .map((name) => String(name || "").trim())
    .filter(Boolean);
  return rows.length ? rows : [""];
};

export default function OrgCustomCategoryEditorPage({ orgType }) {
  const portal = PORTAL[orgType];
  const [standardCategories, setStandardCategories] = useState([]);
  const [typeName, setTypeName] = useState("");
  const [names, setNames] = useState([""]);
  const [recordId, setRecordId] = useState(null);
  const [customHasSavedNames, setCustomHasSavedNames] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventCategoriesApi.getOrgContext();
      const ctx = unwrapOrgCategoryContext(response);

      setStandardCategories(ctx.standardCategories);
      setCustomHasSavedNames(ctx.customHasSavedNames);

      const doc = ctx.customCategory;
      if (doc) {
        setRecordId(doc._id || doc.id || null);
        setTypeName(doc.typeName || `${portal.label} custom categories`);
        setNames(normalizeNameRows(doc));
      } else {
        setRecordId(null);
        setTypeName(`${portal.label} custom categories`);
        setNames([""]);
      }
    } catch (error) {
      toast.error(extractError(error));
      setStandardCategories([]);
      setTypeName(`${portal.label} custom categories`);
      setNames([""]);
    } finally {
      setLoading(false);
    }
  }, [portal.label]);

  useEffect(() => {
    load();
  }, [load]);

  const setNameAt = (index, value) => {
    setNames((rows) => rows.map((row, i) => (i === index ? value : row)));
  };

  const addRow = () => setNames((rows) => [...rows, ""]);

  const removeRow = (index) => {
    setNames((rows) => {
      const next = rows.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });
  };

  const handleSave = async () => {
    const customCategoryNames = names.map((n) => n.trim()).filter(Boolean);

    if (!typeName.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const response = await eventCategoriesApi.saveOrgCustom({
        typeName: typeName.trim(),
        customCategoryNames
      });
      const doc = response?.data ?? response;
      setRecordId(doc?._id || doc?.id || recordId);
      toast.success(
        response?.message ||
          `Custom categories saved for your ${portal.label.toLowerCase()}`
      );
      await load();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
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
              to={portal.dashboard}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Event categories</Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
            {portal.label} event categories
          </Typography>
          <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.86)", maxWidth: 720, lineHeight: 1.6 }}>
            KRSA standard categories are created by super admin and used when you choose{" "}
            <strong>Standard</strong> on an event. Your custom list below is only used when you choose{" "}
            <strong>Custom</strong> on an event — if you never save custom names, custom mode still
            shows the standard list.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "28px",
          border: "1px solid #e8f4f3",
          bgcolor: "#fafefe"
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Shield size={20} color="#00897b" />
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
            KRSA standard categories (read-only)
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, color: "#8d7f7b", mb: 2 }}>
          Created by super admin. Shown when you create an event with category source{" "}
          <em>Standard</em>, or with <em>Custom</em> if you have not saved your own list yet.
        </Typography>

        {standardCategories.length === 0 ? (
          <Typography sx={{ color: "#8d7f7b", fontStyle: "italic" }}>
            No standard categories configured yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {standardCategories.map((cat) => {
              const labels = collectCategoryNameLabels(cat);
              return (
                <Paper
                  key={cat._id || cat.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    borderColor: "rgba(0,137,123,0.2)",
                    bgcolor: "white"
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                    {cat.typeName || "Category"}
                  </Typography>
                  {labels.length ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
                      {labels.map((label) => (
                        <Chip key={label} label={label} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "#8d7f7b" }}>
                      No lap names defined
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "28px",
          border: "1px solid #f0e3dd",
          bgcolor: "#fff"
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Layers size={20} color="#f6765e" />
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
            Your custom list (editable)
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, color: "#8d7f7b", mb: 2 }}>
          Only affects events you create with category source <em>Custom</em>.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={<Layers size={14} />}
            label={recordId ? "Saved" : "Not saved yet"}
            size="small"
            sx={{ bgcolor: "rgba(246,118,94,0.1)", color: "#c45a48" }}
          />
          {customHasSavedNames ? (
            <Chip label="Used for Custom events" size="small" color="success" variant="outlined" />
          ) : (
            <Chip
              label="Custom events fall back to standard until you save"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        <TextField
          label="List title"
          fullWidth
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          helperText={`Shown when selecting categories on ${portal.label.toLowerCase()} events (Custom)`}
          sx={{ mb: 3 }}
        />

        <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 1 }}>
          Category names
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#8d7f7b", mb: 2 }}>
          Examples: 1 Lap, 2 Laps, 2 Laps + D. Each row is one option skaters can register under.
        </Typography>

        <Stack spacing={1.25}>
          {names.map((name, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder={`Category name ${index + 1}`}
                value={name}
                onChange={(e) => setNameAt(index, e.target.value)}
              />
              <IconButton
                size="small"
                onClick={() => removeRow(index)}
                disabled={names.length === 1}
                sx={{ color: "#f6765e" }}
              >
                <X size={18} />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Button
          startIcon={<Plus size={16} />}
          onClick={addRow}
          sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add name
        </Button>

        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ mt: 4, pt: 2, borderTop: "1px solid #f0e3dd" }}
        >
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: "#f6765e", "&:hover": { bgcolor: "#ea6b54" } }}
          >
            {saving ? "Saving…" : `Save for my ${portal.label.toLowerCase()}`}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
