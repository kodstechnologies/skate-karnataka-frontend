import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, Layers, PencilLine, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventCategoriesApi } from "@/api/event-categories-api";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   Helper
───────────────────────────────────────────── */
const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

/* ─────────────────────────────────────────────
   EventCategoryPage
───────────────────────────────────────────── */
export default function EventCategoryPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await eventCategoriesApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const id = pendingDelete._id ?? pendingDelete.id;
      await eventCategoriesApi.delete(id);
      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((c) => (c._id ?? c.id) !== id));
      setPendingDelete(null);
    } catch (err) {
      toast.error(extractError(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Render ── */
  return (
    <Box className="space-y-5">
      {/* ── Hero Banner (DistrictsPage pattern) ── */}
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Categories</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Event Categories
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Define skating disciplines, age groups, and lap categories used across events.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                label={`${categories.length} Type${categories.length !== 1 ? "s" : ""}`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Management Panel ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        {/* Header row */}
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
              Each category defines a skating type with its age groups and lap / round categories.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={fetchCategories}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/events/category/create")}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Add Category
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {/* Loading */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#f6765e" }} />
            </Box>
          ) : fetchError ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: "22px",
                textAlign: "center",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7"
              }}
            >
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 1 }}>
                Failed to load categories
              </Typography>
              <Typography sx={{ color: "#9b2c2c", mb: 3, fontSize: 14 }}>{fetchError}</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={15} />}
                onClick={fetchCategories}
                sx={{ borderColor: "#c53030", color: "#c53030" }}
              >
                Retry
              </Button>
            </Paper>
          ) : categories.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              No event categories found. Click &quot;Add Category&quot; to create the first one.
            </Paper>
          ) : (
            /* Category cards */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0,1fr))",
                  xl: "repeat(3, minmax(0,1fr))"
                },
                gap: 2
              }}
            >
              {categories.map((cat) => {
                const catId = cat._id ?? cat.id;
                const activeAgeGroups = (cat.ageGroups ?? []).filter(
                  (ag) => ag.categories?.length > 0
                );

                return (
                  <Paper
                    key={catId}
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: "1px solid #f0ddd5",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
                      boxShadow: "0 20px 50px rgba(56,36,29,0.08)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 28px 65px rgba(56,36,29,0.12)"
                      }
                    }}
                  >
                    {/* Card header */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1.5}
                      sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 42,
                          height: 42,
                          borderRadius: "14px",
                          backgroundColor: "#fff1eb",
                          color: "#f6765e",
                          flexShrink: 0
                        }}
                      >
                        <Layers size={20} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: "#2f2829",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {cat.typeName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#8d7f7b", mt: 0.25 }}>
                          {activeAgeGroups.length} age group
                          {activeAgeGroups.length !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ borderColor: "#f5ebe7", mx: 2.5 }} />

                    {/* Age groups preview */}
                    <Stack spacing={1.25} sx={{ px: 2.5, py: 1.75 }}>
                      {activeAgeGroups.length === 0 ? (
                        <Typography sx={{ fontSize: 13, color: "#b8a9a5", fontStyle: "italic" }}>
                          No age groups configured.
                        </Typography>
                      ) : (
                        activeAgeGroups.map((ag) => (
                          <Box key={ag.label}>
                            <Chip
                              label={ag.label}
                              size="small"
                              sx={{
                                mb: 0.75,
                                backgroundColor: "#fff1eb",
                                color: "#f6765e",
                                fontWeight: 700,
                                fontSize: 11
                              }}
                            />
                            <Stack
                              direction="row"
                              spacing={0.75}
                              useFlexGap
                              sx={{ flexWrap: "wrap", pl: 0.25 }}
                            >
                              {ag.categories.map((c, idx) => (
                                <Chip
                                  key={idx}
                                  label={c.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#f5ebe7",
                                    color: "#5f5552",
                                    fontSize: 11
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        ))
                      )}
                    </Stack>

                    <Divider sx={{ borderColor: "#f5ebe7", mx: 2.5 }} />

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} sx={{ p: 2.5, pt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PencilLine size={15} />}
                        onClick={() =>
                          navigate(`/events/category/${catId}/edit`, {
                            state: { category: cat }
                          })
                        }
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Trash2 size={15} />}
                        onClick={() => setPendingDelete(cat)}
                        fullWidth
                        sx={{
                          backgroundColor: "#f6765e",
                          "&:hover": { backgroundColor: "#ea6b54" }
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── Confirm Delete ── */}
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete Category"
        itemLabel={pendingDelete?.typeName}
        description="This event category and all its age groups will be permanently removed. This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
