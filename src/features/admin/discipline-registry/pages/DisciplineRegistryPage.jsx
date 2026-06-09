import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import {
  CalendarDays,
  ChevronRight,
  Layers,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import disciplinesHero from "@/assets/Disciplines_header.png";
import { disciplineServiceApi } from "@/api/discipline-service-api";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export const DisciplineRegistryPage = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDisciplines = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await disciplineServiceApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setDisciplines(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = extractError(err);
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  const filteredDisciplines = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return disciplines;
    return disciplines.filter((item) => String(item.name || "").toLowerCase().includes(q));
  }, [disciplines, searchTerm]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setName("");
    setNameError("");
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    setNameError("");
    setDialogOpen(true);
  };

  const closeDialog = (force = false) => {
    if (!force && saving) return;
    setDialogOpen(false);
    setEditingItem(null);
    setName("");
    setNameError("");
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Discipline name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const id = editingItem._id ?? editingItem.id;
        const res = await disciplineServiceApi.update(id, { name: trimmed });
        const updated = res?.data?.data ?? res?.data;
        setDisciplines((prev) =>
          prev.map((item) => {
            const itemId = item._id ?? item.id;
            return itemId === id ? { ...item, ...updated, name: trimmed } : item;
          })
        );
        toast.success(res?.data?.message || "Discipline updated successfully");
      } else {
        const res = await disciplineServiceApi.create({ name: trimmed });
        const created = res?.data?.data ?? res?.data;
        setDisciplines((prev) => [created, ...prev]);
        toast.success(res?.data?.message || "Discipline created successfully");
      }
      closeDialog(true);
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
      const res = await disciplineServiceApi.delete(id);
      setDisciplines((prev) => prev.filter((item) => (item._id ?? item.id) !== id));
      toast.success(res?.data?.message || "Discipline deleted successfully");
      setPendingDelete(null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

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
          background: `linear-gradient(90deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.60) 44%, rgba(246,118,94,0.18) 100%), url("${disciplinesHero}")`,
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
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 14, md: 16 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Discipline</Typography>
          </Breadcrumbs>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.72)",
              mb: 1
            }}
          >
            Skater Disciplines
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1 }}>
            Discipline Registry
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 620 }}>
            Manage skating discipline names used when skaters register. Disciplines linked to skaters
            cannot be deleted.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: { xs: 2.5, md: 3 },
            pb: { xs: 2, md: 2.5 },
            alignItems: { lg: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              All Disciplines
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              {disciplines.length} discipline{disciplines.length === 1 ? "" : "s"} in the registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { lg: "auto" } }}>
            <TextField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#b19f99" />
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={fetchDisciplines}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={openCreateDialog}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Add Discipline
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: { xs: 2.5, md: 3 }, pt: { xs: 0.5, md: 1 }, pb: { xs: 3.5, md: 4 } }}>
          {loading ? (
            <Stack spacing={1.5}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rounded" height={56} sx={{ borderRadius: "16px" }} />
              ))}
            </Stack>
          ) : fetchError ? (
            <Paper
              elevation={0}
              sx={{
                py: { xs: 5, md: 6 },
                px: { xs: 3, md: 5 },
                borderRadius: "22px",
                textAlign: "center",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7"
              }}
            >
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 1 }}>
                Failed to load disciplines
              </Typography>
              <Typography sx={{ color: "#9b2c2c", mb: 3, fontSize: 14 }}>{fetchError}</Typography>
              <Button variant="contained" onClick={fetchDisciplines}>
                Retry
              </Button>
            </Paper>
          ) : filteredDisciplines.length > 0 ? (
            <TableContainer
              className="custom-scrollbar"
              sx={{ borderRadius: "22px", border: "1px solid #f0e1da" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                    {["Name", "Created", "Actions"].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          borderBottom: "1px solid #f0e1da",
                          color: "#7e716d",
                          fontWeight: 700,
                          fontSize: 13,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDisciplines.map((item) => {
                    const id = item._id ?? item.id;
                    return (
                      <TableRow
                        key={id}
                        hover
                        sx={{
                          "& .MuiTableCell-root": {
                            borderBottom: "1px solid #f5e9e3",
                            verticalAlign: "middle"
                          }
                        }}
                      >
                        <TableCell>
                          <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(246, 118, 94, 0.12)",
                                color: "#f6765e"
                              }}
                            >
                              <Layers size={18} />
                            </Box>
                            <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                              {item.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ color: "#7e716d", fontSize: 14 }}>
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PencilLine size={15} />}
                              onClick={() => openEditDialog(item)}
                              sx={{ textTransform: "none", borderRadius: "12px" }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Trash2 size={15} />}
                              onClick={() => setPendingDelete(item)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "12px",
                                backgroundColor: "#f6765e",
                                "&:hover": { backgroundColor: "#ea6b54" }
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper
              elevation={0}
              sx={{
                py: { xs: 6, md: 8 },
                px: { xs: 3, md: 5 },
                borderRadius: "22px",
                textAlign: "center",
                border: "1px dashed rgba(240, 221, 213, 0.95)",
                backgroundColor: "rgba(255, 251, 249, 0.92)"
              }}
            >
              <Stack spacing={2} sx={{ maxWidth: 420, mx: "auto", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(246, 118, 94, 0.12)",
                    color: "#f6765e"
                  }}
                >
                  <CalendarDays size={28} strokeWidth={1.75} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 17, md: 18 }, color: "#5f5552" }}>
                  {searchTerm.trim() ? "No matching disciplines" : "No disciplines yet"}
                </Typography>
                <Typography sx={{ color: "#978a86", lineHeight: 1.7, fontSize: 14 }}>
                  {searchTerm.trim()
                    ? "Try a different search term or clear the filter."
                    : "Add a discipline name to make it available for skater registration."}
                </Typography>
                {!searchTerm.trim() && (
                  <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={openCreateDialog}
                    sx={{ mt: 1, backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
                  >
                    Add Discipline
                  </Button>
                )}
              </Stack>
            </Paper>
          )}
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 0.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          {editingItem ? "Edit Discipline" : "Add Discipline"}
          <IconButton
            onClick={closeDialog}
            disabled={saving}
            sx={{ position: "absolute", right: 12, top: 12 }}
            aria-label="Close"
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Discipline name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            error={Boolean(nameError)}
            helperText={nameError || "e.g. Artistic, Speed, Inline Hockey"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: "none",
              backgroundColor: "#f6765e",
              "&:hover": { backgroundColor: "#ea6b54" }
            }}
          >
            {saving ? "Saving..." : editingItem ? "Save changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete discipline"
        itemLabel={pendingDelete?.name}
        description="This discipline will be permanently removed. It cannot be deleted if any skater is using it."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
