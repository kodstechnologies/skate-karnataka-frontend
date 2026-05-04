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
import {
  CalendarDays,
  ChevronRight,
  Eye,
  FileText,
  PencilLine,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import circularsHero from "@/assets/Circulars_header.png";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useCircularsStore } from "@/features/admin/circulars/store/circulars-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "medium" });
};

const ImageAvatar = ({ src, alt, sx }) => {
  const [loaded, setLoaded] = useState(!src);
  return (
    <Box sx={{ position: "relative", width: sx?.width, height: sx?.height, flexShrink: 0 }}>
      {!loaded && (
        <Skeleton
          variant="rounded"
          width="100%"
          height="100%"
          sx={{ position: "absolute", inset: 0, borderRadius: sx?.borderRadius }}
        />
      )}
      <Avatar
        src={src}
        alt={alt}
        variant="rounded"
        sx={{
          ...sx,
          width: "100%",
          height: "100%",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s"
        }}
        imgProps={{ onLoad: () => setLoaded(true), onError: () => setLoaded(true) }}
      />
    </Box>
  );
};

export const CircularsPage = () => {
  const navigate = useNavigate();
  const circulars = useCircularsStore((s) => s.circulars);
  const pagination = useCircularsStore((s) => s.pagination);
  const fetchCirculars = useCircularsStore((s) => s.fetchCirculars);
  const deleteCircular = useCircularsStore((s) => s.deleteCircular);
  const isLoading = useCircularsStore((s) => s.isLoading);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchCirculars({ page: page + 1, limit: rowsPerPage, search: searchTerm });
  }, [fetchCirculars, page, rowsPerPage, searchTerm]);

  const isBackendPagination = !!pagination;

  const displayCirculars = useMemo(() => {
    if (isBackendPagination) return circulars;
    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? circulars.filter((c) => [c.heading, c.text].join(" ").toLowerCase().includes(q))
      : circulars;
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [circulars, isBackendPagination, page, rowsPerPage, searchTerm]);

  const totalCount = useMemo(() => {
    if (isBackendPagination) return pagination.total || 0;
    const q = searchTerm.trim().toLowerCase();
    return q
      ? circulars.filter((c) => [c.heading, c.text].join(" ").toLowerCase().includes(q)).length
      : circulars.length;
  }, [circulars, isBackendPagination, pagination, searchTerm]);

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteCircular(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 28, 0.82) 0%, rgba(20, 17, 28, 0.56) 44%, rgba(20, 17, 28, 0.18) 100%), url("${circularsHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                Circulars & Guidelines
              </Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Circulars & Guidelines
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage official circulars, notices and guidelines published for members and athletes.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<FileText size={16} />}
                label="Official circulars"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<CalendarDays size={16} />}
                label="Date-wise records"
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
        {/* Header row with title + search + add button */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Circulars Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Create, edit, search and review all circulars from one organised registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by heading or text…"
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
              onClick={() => navigate("/circulars/create")}
            >
              Add circular
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* ── Mobile cards ─────────────────────────────────────── */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: "18px" }} />
            ))
          ) : displayCirculars.length > 0 ? (
            displayCirculars.map((item) => (
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
                    <ImageAvatar
                      src={item.img}
                      sx={{ width: 48, height: 48, borderRadius: "12px" }}
                      alt={item.heading}
                    />
                    <div className="flex-1">
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                        {item.heading}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {formatDate(item.date)}
                      </Typography>
                    </div>
                    <Chip
                      label={formatDate(item.date)}
                      size="small"
                      sx={{ backgroundColor: "#f0f4ff", color: "#4b72c2", fontWeight: 700 }}
                    />
                  </div>

                  <Typography sx={{ fontSize: 13, color: "#6d5c57" }} noWrap>
                    {item.text}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/circulars/${item.id}`)}
                      fullWidth
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={16} />}
                      onClick={() => navigate(`/circulars/${item.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => setPendingDelete(item)}
                      fullWidth
                      sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
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
              No circulars found for the current search.
            </Paper>
          )}
        </Stack>

        {/* ── Desktop table ─────────────────────────────────────── */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Image", "Heading", "Text", "Date", "Actions"].map((col) => (
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
                [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <TableCell key={j}>
                        <Skeleton variant="rounded" height={32} sx={{ borderRadius: "10px" }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayCirculars.length > 0 ? (
                displayCirculars.map((item) => (
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
                    <TableCell>
                      <ImageAvatar
                        src={item.img}
                        alt={item.heading}
                        sx={{ width: 44, height: 44, borderRadius: "10px" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#2f2829" }}>{item.heading}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Typography
                        title={item.text}
                        sx={{
                          fontSize: 13,
                          color: "#6d5c57",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 240
                        }}
                      >
                        {item.text || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatDate(item.date)}
                        size="small"
                        sx={{
                          backgroundColor: "#f0f4ff",
                          color: "#4b72c2",
                          fontWeight: 600,
                          fontSize: 11
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75}>
                        <IconButton
                          onClick={() => navigate(`/circulars/${item.id}`)}
                          sx={{
                            border: "1px solid #dce8fb",
                            color: "#3b82f6",
                            backgroundColor: "#eff6ff",
                            "&:hover": { backgroundColor: "#dbeafe" }
                          }}
                          aria-label={`View ${item.heading}`}
                          title="View"
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/circulars/${item.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${item.heading}`}
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
                          aria-label={`Delete ${item.heading}`}
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
                  <TableCell colSpan={5} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No circulars found for the current search.
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

      {/* ── Delete Confirm ────────────────────────────────────────── */}
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete Circular"
        itemLabel={pendingDelete?.heading}
        description="This will permanently remove the circular. This action cannot be undone."
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
