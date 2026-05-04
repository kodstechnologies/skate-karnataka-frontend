import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
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
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Eye, Layers, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import disciplinesHero from "@/assets/Disciplines_header.png";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useDisciplinesStore } from "@/features/admin/disciplines/store/disciplines-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "—"}</Typography>
  </div>
);

export const DisciplinesPage = () => {
  const navigate = useNavigate();
  const disciplines = useDisciplinesStore((s) => s.disciplines);
  const fetchDisciplines = useDisciplinesStore((s) => s.fetchDisciplines);
  const deleteDiscipline = useDisciplinesStore((s) => s.deleteDiscipline);
  const pagination = useDisciplinesStore((s) => s.pagination);
  const isLoading = useDisciplinesStore((s) => s.isLoading);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchDisciplines({ page: page + 1, limit: rowsPerPage, search: searchTerm });
  }, [fetchDisciplines, page, rowsPerPage, searchTerm]);

  const isBackendPagination = Boolean(pagination);

  const displayItems = useMemo(() => {
    if (isBackendPagination) return disciplines;
    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? disciplines.filter((d) => [d.title, d.text, d.about].join(" ").toLowerCase().includes(q))
      : disciplines;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [disciplines, isBackendPagination, page, rowsPerPage, searchTerm]);

  const totalCount = useMemo(() => {
    if (isBackendPagination) return pagination.total || 0;
    const q = searchTerm.trim().toLowerCase();
    return q
      ? disciplines.filter((d) => [d.title, d.text, d.about].join(" ").toLowerCase().includes(q))
          .length
      : disciplines.length;
  }, [disciplines, isBackendPagination, pagination, searchTerm]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteDiscipline(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20,17,20,0.86) 0%, rgba(20,17,20,0.58) 44%, rgba(20,17,20,0.18) 100%), url("${disciplinesHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Disciplines</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Discipline Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage all skating disciplines — title, description, and imagery — from a single clean
              workspace.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Layers size={16} />}
                label="Skating disciplines registry"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Table Card ───────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.7)",
          overflow: "hidden"
        }}
      >
        {/* Toolbar */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Disciplines Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Create, edit, and delete skating disciplines from one organised registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search by title, text, about…"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 300 } }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/disciplines/create")}
              sx={{
                backgroundColor: "#f6765e",
                boxShadow: "none",
                whiteSpace: "nowrap",
                "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
              }}
            >
              Add Discipline
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* ── Mobile Cards ─────────────────────────────────────────────── */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={130} sx={{ borderRadius: "18px" }} />
            ))
          ) : displayItems.length > 0 ? (
            displayItems.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={item.img}
                      variant="rounded"
                      sx={{ width: 52, height: 52, borderRadius: "14px" }}
                      alt={item.title}
                    />
                    <div className="flex-1 min-w-0">
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 12,
                          color: "#8d7f7b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {item.text}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Box sx={{ gridColumn: "span 2" }}>
                      <DetailItem label="About" value={item.about} />
                    </Box>
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/disciplines/${item.id}`)}
                      fullWidth
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={16} />}
                      onClick={() => navigate(`/disciplines/${item.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => setPendingDelete(item)}
                      fullWidth
                      sx={{
                        backgroundColor: "#f6765e",
                        "&:hover": { backgroundColor: "#ea6b54" }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              No disciplines found for the current search.
            </Paper>
          )}
        </Stack>

        {/* ── Desktop Table ─────────────────────────────────────────────── */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Image", "Title", "Text", "About", "Updated At", "Actions"].map((col) => (
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayItems.length > 0 ? (
                displayItems.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "middle"
                      }
                    }}
                  >
                    {/* Image */}
                    <TableCell>
                      <Avatar
                        src={item.img}
                        variant="rounded"
                        alt={item.title}
                        sx={{ width: 48, height: 48, borderRadius: "14px" }}
                      />
                    </TableCell>

                    {/* Title */}
                    <TableCell sx={{ fontWeight: 700, color: "#2f2829", whiteSpace: "nowrap" }}>
                      {item.title}
                    </TableCell>

                    {/* Text */}
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        title={item.text}
                        sx={{
                          fontSize: 13,
                          color: "#6d5c57",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 180
                        }}
                      >
                        {item.text || "—"}
                      </Typography>
                    </TableCell>

                    {/* About */}
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography
                        title={item.about}
                        sx={{
                          fontSize: 13,
                          color: "#6d5c57",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6,
                          maxWidth: 240
                        }}
                      >
                        {item.about || "—"}
                      </Typography>
                    </TableCell>

                    {/* Updated At */}
                    <TableCell sx={{ fontSize: 13, color: "#8d7f7b", whiteSpace: "nowrap" }}>
                      {formatDate(item.updatedAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.75}>
                        <IconButton
                          onClick={() => navigate(`/disciplines/${item.id}`)}
                          sx={{
                            border: "1px solid #dce8fb",
                            backgroundColor: "#eff6ff",
                            color: "#3b82f6"
                          }}
                          aria-label={`View ${item.title}`}
                          title="View"
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/disciplines/${item.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${item.title}`}
                          title="Edit"
                        >
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => setPendingDelete(item)}
                          sx={{
                            border: "1px solid #f2d9d1",
                            color: "#e06f58",
                            backgroundColor: "#fff6f2"
                          }}
                          aria-label={`Delete ${item.title}`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8, textAlign: "center", color: "#978a86" }}>
                    No disciplines found for the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete discipline"
        itemLabel={pendingDelete?.title}
        description="This will permanently remove the discipline record. This action cannot be undone."
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
