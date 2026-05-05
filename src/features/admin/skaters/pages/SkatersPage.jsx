import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
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
  Typography,
  CircularProgress
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ChevronRight, Search, ShieldCheck, Trophy } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

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

const formatGender = (gender) => {
  if (!gender) {
    return "-";
  }
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "-"}</Typography>
  </div>
);

export const SkatersPage = () => {
  const navigate = useNavigate();
  const { skaters, fetchSkaters, pagination, isLoading } = useSkatersStore();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadSkaters = useCallback(() => {
    fetchSkaters({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearchTerm
    });
  }, [fetchSkaters, page, rowsPerPage, debouncedSearchTerm]);

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
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Skaters Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Search and review registered skaters from one organized registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
              sx={{ minWidth: { xs: "100%", sm: 320 } }}
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
                    <DetailItem label="District" value={skater.district?.name} />
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/skaters/${skater._id}`)}
                      fullWidth
                    >
                      View details
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
              No skaters found for the current search.
            </Paper>
          )}
        </Stack>

        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["KRSA ID", "Full Name", "Phone", "Email", "Gender", "District", "Actions"].map(
                  (column) => (
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
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
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
                    <TableCell>{skater.district?.name || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No skaters found for the current search.
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
        />
      </Paper>
    </Box>
  );
};
