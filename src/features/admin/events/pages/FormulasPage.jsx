import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
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
  Tooltip,
  Typography
} from "@mui/material";
import { ChevronRight, PencilLine, Plus, RefreshCw, Trash2, FunctionSquare } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { OrgFormulaSourceSettings } from "@/features/admin/events/components/OrgFormulaSourceSettings";
import {
  getPortalFormulaConfig,
  isOrgFormulaPortal
} from "@/features/admin/events/utils/portalFormulaConfig";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import {
  getFormulaDisplayName,
  getFormulaId,
  unwrapFormulaListResponse
} from "@/features/admin/events/utils/formulaFormUtils";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

export default function FormulasPage({ portalMode = "admin" }) {
  const isOrgPortal = isOrgFormulaPortal(portalMode);
  const portal = getPortalFormulaConfig(portalMode);
  const api = portal.api;
  const basePath = portal.basePath;
  const dashboardPath = portal.dashboardPath;
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAll({ page: page + 1, limit: rowsPerPage });
      const { formulas: list, pagination: meta } = unwrapFormulaListResponse(res);
      setFormulas(list);
      setPagination(meta);
    } catch (err) {
      toast.error(extractError(err));
      setFormulas([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, api]);

  useEffect(() => {
    fetchFormulas();
  }, [fetchFormulas]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(getFormulaId(pendingDelete));
      toast.success(res?.message || "Formula deleted successfully");
      setPendingDelete(null);
      await fetchFormulas();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const totalCount = pagination?.total ?? formulas.length;

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
              to={dashboardPath}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            {!isOrgPortal && (
              <Typography
                component={RouterLink}
                to="/events/detail"
                sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
              >
                Events
              </Typography>
            )}
            <Typography sx={{ color: "white", fontWeight: 700 }}>Formula</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            Competition Formulas
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
            {isOrgPortal
              ? `Create your ${portalMode} qualification formulas, or use state admin formulas via the source setting below.`
              : "Create and manage qualification formulas. These appear in Events-Category when you assign a formula to each lap name."}
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
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ p: 3, alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                bgcolor: "#fff1eb",
                color: "#f6765e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FunctionSquare size={22} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Formula list
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
                {totalCount}{" "}
                {isOrgPortal ? portal.listLabel : "formula"}
                {totalCount === 1 ? "" : "s"} total
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={fetchFormulas} disabled={loading}>
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate(`${basePath}/create`)}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Add formula
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#faf6f4" }}>
                <TableCell sx={{ fontWeight: 700 }}>Formula name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rounds</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton height={36} />
                    </TableCell>
                  </TableRow>
                ))
              ) : formulas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 6, textAlign: "center", color: "#8d7f7b" }}>
                    {isOrgPortal
                      ? `No ${portalMode} formulas yet. Add one or switch source to use state formulas.`
                      : "No formulas yet. Click Add formula to create one."}
                  </TableCell>
                </TableRow>
              ) : (
                formulas.map((row) => {
                  const id = getFormulaId(row);
                  return (
                    <TableRow key={id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{getFormulaDisplayName(row)}</TableCell>
                      <TableCell>{Array.isArray(row.rounds) ? row.rounds.length : 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`${basePath}/${id}/edit`)}>
                            <PencilLine size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setPendingDelete(row)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {isOrgPortal ? <OrgFormulaSourceSettings portalMode={portalMode} /> : null}

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete formula"
        itemLabel={pendingDelete ? getFormulaDisplayName(pendingDelete) : undefined}
        description="Event categories using this formula will lose the link. This cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
