import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
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
import { ChevronRight, Search, Users } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { districtPortalApi } from "@/api/district-portal-api";
import toast from "react-hot-toast";

const formatGender = (g) => {
  if (!g) return "—";
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
};

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>{label}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "—"}</Typography>
  </div>
);

export const DistrictSkatersPage = () => {
  const [skaters, setSkaters] = useState([]);
  const [districtName, setDistrictName] = useState("District");
  const [pagination, setPagination] = useState({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await districtPortalApi.getSkaters({
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
        });
        if (cancelled) return;
        const payload = res?.data ?? res;
        setSkaters(Array.isArray(payload?.data) ? payload.data : []);
        setPagination(payload?.pagination || { total: 0 });
        if (payload?.district?.name) setDistrictName(payload.district.name);
      } catch (err) {
        if (!cancelled) {
          setSkaters([]);
          toast.error(err.response?.data?.message || "Failed to fetch skaters");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, rowsPerPage, debouncedSearch]);

  const totalCount = pagination.total || 0;

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20,17,20,0.85) 0%, rgba(20,17,20,0.55) 44%, rgba(20,17,20,0.15) 100%), url("${skatersHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}>
          <Box sx={{ maxWidth: 720 }}>
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" } }}
            >
              <Typography component={RouterLink} to="/district/dashboard" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}>
                Dashboard
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Skaters</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Skaters Registry
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 580, lineHeight: 1.7 }}>
              All skaters registered under {districtName}.
            </Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Users size={15} />}
                label={`${totalCount} Skaters`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Table Card */}
      <Paper elevation={0} sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>All Skaters</Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>Search skaters by name, KRSA ID, phone, or club.</Typography>
          </Box>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, KRSA ID, phone..."
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} style={{ color: "#b19f99" }} /></InputAdornment> } }}
            sx={{ minWidth: { xs: "100%", sm: 320 } }}
          />
        </Stack>

        <Divider />

        {/* Mobile cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            [0,1,2].map((i) => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: "22px" }} />)
          ) : skaters.length > 0 ? (
            skaters.map((s) => (
              <Paper key={s.id} elevation={0} sx={{ p: 2, borderRadius: "22px", border: "1px solid #f2e5de", backgroundColor: "#fffaf8" }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar src={s.img} alt={s.name} sx={{ width: 44, height: 44 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>{s.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#f6765e", fontWeight: 600 }}>{s.krsaId || "—"}</Typography>
                    </Box>
                    <Chip label={formatGender(s.gender)} size="small" sx={{ backgroundColor: "#f4ede9", color: "#7a5c52", fontWeight: 600, fontSize: 11 }} />
                  </Stack>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="Phone" value={s.phone} />
                    <DetailItem label="Club" value={s.clubName} />
                    <Box sx={{ gridColumn: "span 2" }}><DetailItem label="Address" value={s.address} /></Box>
                  </div>
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper elevation={0} sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>No skaters found.</Paper>
          )}
        </Stack>

        {/* Desktop table */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Photo", "KRSA ID", "Name", "Phone", "Email", "Gender", "Club", "Address"].map((col) => (
                  <TableCell key={col} sx={{ borderBottom: "1px solid #f0e1da", color: "#7e716d", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [0,1,2,3].map((i) => (
                  <TableRow key={i}>
                    {[0,1,2,3,4,5,6,7].map((j) => (
                      <TableCell key={j}><Skeleton variant="rounded" height={28} sx={{ borderRadius: "8px" }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : skaters.length > 0 ? (
                skaters.map((s) => (
                  <TableRow key={s.id} hover sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f5e9e3", verticalAlign: "middle" } }}>
                    <TableCell>
                      <Avatar src={s.img} alt={s.name} sx={{ width: 36, height: 36 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap", fontSize: 13 }}>{s.krsaId || "—"}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>{s.name}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.phone || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.email || "—"}</TableCell>
                    <TableCell>
                      <Chip label={formatGender(s.gender)} size="small" sx={{ backgroundColor: "#f4ede9", color: "#7a5c52", fontWeight: 600, fontSize: 11 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.clubName || "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography title={s.address} sx={{ fontSize: 13, color: "#6d5c57", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                        {s.address || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>No skaters found for the current search.</TableCell>
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
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ "& .MuiTablePagination-toolbar": { flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5, py: 1 }, "& .MuiTablePagination-spacer": { display: "none" }, overflowX: "hidden" }}
          labelRowsPerPage="Rows:"
        />
      </Paper>
    </Box>
  );
};
