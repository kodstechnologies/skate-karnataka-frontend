import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { ChevronRight, Search, ShieldCheck, Trophy } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { MemberAddMenuButton } from "@/components/members/MemberAddMenuButton";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";
import { getSkaterDistrictName } from "@/features/admin/skaters/utils/skater-display";
import { formatGenderLabel } from "@/utils/validationHelper";

// Custom useDebounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const formatGender = formatGenderLabel;

const GENDER_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "male", label: "Boys" },
  { value: "female", label: "Girls" }
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" }
];

const getStatusChipSx = (isBlocked) =>
  isBlocked
    ? { bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 }
    : { bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 };

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography
      sx={{
        mt: 0.5,
        fontSize: 14,
        color: "#2f2829",
        wordBreak: "break-word",
        overflowWrap: "anywhere"
      }}
    >
      {value || "-"}
    </Typography>
  </div>
);

export const SkatersPage = () => {
  const navigate = useNavigate();
  const { skaters, fetchSkaters, pagination, isLoading, toggleSkaterBlock, deleteSkater } =
    useSkatersStore();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingBlockSkater, setPendingBlockSkater] = useState(null);
  const [pendingDeleteSkater, setPendingDeleteSkater] = useState(null);

  const loadSkaters = useCallback(() => {
    fetchSkaters({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearchTerm,
      ...(genderFilter ? { gender: genderFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    });
  }, [fetchSkaters, page, rowsPerPage, debouncedSearchTerm, genderFilter, statusFilter]);

  const paginatedSkaters = useMemo(() => {
    // If backend returns pagination data, assume it handles slicing
    if (pagination && pagination.total !== undefined) {
      return skaters;
    }
    // Fallback: Frontend pagination
    const startIndex = page * rowsPerPage;
    return skaters.slice(startIndex, startIndex + rowsPerPage);
  }, [skaters, pagination, page, rowsPerPage]);

  const totalSkatersCount = useMemo(() => {
    if (pagination && pagination.total !== undefined) {
      return pagination.total;
    }
    return skaters.length;
  }, [skaters, pagination]);

  useEffect(() => {
    loadSkaters();
  }, [loadSkaters]);

  const handleChangePage = (_, nextPage) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleGenderFilterChange = (event) => {
    setGenderFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const closeBlockDialog = () => setPendingBlockSkater(null);
  const closeDeleteDialog = () => setPendingDeleteSkater(null);

  const handleConfirmBlockToggle = async () => {
    if (!pendingBlockSkater) return;
    const nextBlocked = !pendingBlockSkater.isBlocked;
    const success = await toggleSkaterBlock(pendingBlockSkater._id, nextBlocked);
    if (success) closeBlockDialog();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteSkater) return;
    const success = await deleteSkater(pendingDeleteSkater._id);
    if (success) closeDeleteDialog();
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${skatersHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Skaters</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Skater Resource Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage KRSA skater registrations, update athlete details, and keep records together in
              one clean workspace.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Trophy size={16} />}
                label="Competition-ready roster"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<ShieldCheck size={16} />}
                label="Live KRSA tracking"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.7)",
          overflow: "hidden"
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Skaters Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Search and filter registered skaters by gender or status.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { sm: "center" },
              flexWrap: "wrap",
              width: { xs: "100%", lg: "auto" },
              justifyContent: { sm: "flex-end" },
              ml: { lg: "auto" }
            }}
          >
            <TextField
              select
              label="Gender"
              value={genderFilter}
              onChange={handleGenderFilterChange}
              sx={{ minWidth: { xs: "100%", sm: 140 } }}
            >
              {GENDER_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              sx={{ minWidth: { xs: "100%", sm: 140 } }}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by ID, name, district..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
            />
            <MemberAddMenuButton
              label="Add skater"
              singleLabel="Add skater"
              singleDescription="Single registration form"
              bulkLabel="Bulk upload (Excel)"
              bulkDescription="Upload .xlsx / .xls / .csv"
              singleTo="/skaters/create"
              bulkTo="/skaters/bulk"
              sx={{
                backgroundColor: "#f6765e",
                "&:hover": { backgroundColor: "#ea6b54" },
                whiteSpace: "nowrap",
                ml: { sm: 0.5 }
              }}
            />
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#f6765e" }} />
            </Box>
          ) : paginatedSkaters.length > 0 ? (
            paginatedSkaters.map((skater) => (
              <Paper
                key={skater._id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {skater.krsaId || "-"}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 700, color: "#2f2829" }}>
                        {skater.fullName}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="Phone" value={skater.phone} />
                    <DetailItem label="Email" value={skater.email} />
                    <DetailItem label="Gender" value={formatGender(skater.gender)} />
                    <DetailItem label="District" value={getSkaterDistrictName(skater)} />
                  </div>

                  <Chip
                    size="small"
                    label={skater.isBlocked ? "Blocked" : "Active"}
                    sx={getStatusChipSx(skater.isBlocked)}
                  />

                  <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/skaters/${skater._id}`)}
                      fullWidth
                    >
                      View details
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/skaters/${skater._id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant={skater.isBlocked ? "contained" : "outlined"}
                      color={skater.isBlocked ? "success" : "error"}
                      startIcon={
                        skater.isBlocked ? (
                          <LockOpenOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                        )
                      }
                      onClick={() => setPendingBlockSkater(skater)}
                      fullWidth
                    >
                      {skater.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => setPendingDeleteSkater(skater)}
                      fullWidth
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
              No skaters found for the current search or filters.
            </Paper>
          )}
        </Stack>

        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {[
                  "KRSA ID",
                  "Full Name",
                  "Phone",
                  "Email",
                  "Gender",
                  "District",
                  "Status",
                  "Actions"
                ].map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      borderBottom: "1px solid #f0e1da",
                      color: "#7e716d",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: "center" }}>
                    <CircularProgress sx={{ color: "#f6765e" }} />
                  </TableCell>
                </TableRow>
              ) : paginatedSkaters.length > 0 ? (
                paginatedSkaters.map((skater) => (
                  <TableRow
                    key={skater._id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "top"
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap" }}>
                      {skater.krsaId || "-"}
                    </TableCell>
                    <TableCell>{skater.fullName}</TableCell>
                    <TableCell>{skater.phone || "-"}</TableCell>
                    <TableCell>{skater.email || "-"}</TableCell>
                    <TableCell>{formatGender(skater.gender)}</TableCell>
                    <TableCell>{getSkaterDistrictName(skater)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={skater.isBlocked ? "Blocked" : "Active"}
                        sx={getStatusChipSx(skater.isBlocked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View details">
                          <IconButton
                            onClick={() => navigate(`/skaters/${skater._id}`)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#fff8f4"
                            }}
                            aria-label={`View ${skater.fullName}`}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit skater">
                          <IconButton
                            onClick={() => navigate(`/skaters/${skater._id}/edit`)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#fff8f4",
                              color: "#f6765e"
                            }}
                            aria-label={`Edit ${skater.fullName}`}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={skater.isBlocked ? "Unblock skater" : "Block skater"}>
                          <IconButton
                            onClick={() => setPendingBlockSkater(skater)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: skater.isBlocked ? "#e8f5e9" : "#fff1f0",
                              color: skater.isBlocked ? "#2e7d32" : "#c62828"
                            }}
                            aria-label={
                              skater.isBlocked
                                ? `Unblock ${skater.fullName}`
                                : `Block ${skater.fullName}`
                            }
                          >
                            {skater.isBlocked ? (
                              <LockOpenOutlinedIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete skater">
                          <IconButton
                            onClick={() => setPendingDeleteSkater(skater)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#fff1f0",
                              color: "#c62828"
                            }}
                            aria-label={`Delete ${skater.fullName}`}
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No skaters found for the current search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalSkatersCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows:"
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 0.5,
              py: 1
            },
            "& .MuiTablePagination-spacer": { display: "none" },
            overflowX: "hidden"
          }}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingBlockSkater)}
        title={pendingBlockSkater?.isBlocked ? "Unblock skater" : "Block skater"}
        description={
          pendingBlockSkater?.isBlocked
            ? "This skater will be able to log in again and access the KRSA platform."
            : "This skater will be blocked from logging in. They will see a message that their account was blocked by the administrator."
        }
        itemLabel={pendingBlockSkater?.fullName}
        confirmLabel={pendingBlockSkater?.isBlocked ? "Unblock" : "Block"}
        onClose={closeBlockDialog}
        onConfirm={handleConfirmBlockToggle}
      />

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteSkater)}
        title="Delete skater"
        description="This will permanently remove the skater account. This action cannot be undone."
        itemLabel={pendingDeleteSkater?.fullName}
        confirmLabel="Delete"
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};
