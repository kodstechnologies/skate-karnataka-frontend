import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Button
} from "@mui/material";
import { ChevronRight, Search } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { competitionApi } from "@/api/competition-api";
import { resolveAttendeesPortalContext } from "@/features/admin/events/utils/eventAttendeesNavigation";

const norm = (value) => String(value || "").trim();

const flattenRows = (summary) => {
  const rows = [];
  for (const skatingCategory of summary?.skatingCategories || []) {
    for (const ageGroup of skatingCategory?.ageGroups || []) {
      for (const lap of ageGroup?.categories || []) {
        for (const skater of lap?.skaters || []) {
          rows.push({
            id: `${skatingCategory.id}-${ageGroup.label}-${lap.name}-${skater.chestNo}-${skater.krsaId}-${skater.fullName}`,
            skatingCategory: norm(skatingCategory.typeName),
            ageGroup: norm(ageGroup.label),
            lap: norm(lap.name),
            fullName: norm(skater.fullName),
            chestNo: norm(skater.chestNo),
            krsaId: norm(skater.krsaId),
            rsfiId: norm(skater.rsfiId),
            gender: norm(skater.gender),
            paymentStatus: norm(skater.paymentStatus),
          });
        }
      }
    }
  }
  return rows;
};

export const EventAttendeesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [lap, setLap] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await competitionApi.getChestNumberSummary(eventId);
        const payload = response?.data ?? response;
        const data = payload?.data ?? payload;
        setSummary(data || null);
        setRows(flattenRows(data || {}));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load attendees");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [eventId]);

  const ageGroupOptions = useMemo(
    () => [...new Set(rows.map((row) => row.ageGroup).filter(Boolean))],
    [rows]
  );
  const lapOptions = useMemo(
    () => [...new Set(rows.map((row) => row.lap).filter(Boolean))],
    [rows]
  );
  const disciplineOptions = useMemo(
    () => [...new Set(rows.map((row) => row.skatingCategory).filter(Boolean))],
    [rows]
  );

  const filteredRows = useMemo(() => {
    const term = norm(search).toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.fullName.toLowerCase().includes(term) ||
        row.chestNo.toLowerCase().includes(term) ||
        row.krsaId.toLowerCase().includes(term) ||
        row.rsfiId.toLowerCase().includes(term);
      const matchesAgeGroup = !ageGroup || row.ageGroup === ageGroup;
      const matchesLap = !lap || row.lap === lap;
      const matchesDiscipline = !discipline || row.skatingCategory === discipline;
      return matchesSearch && matchesAgeGroup && matchesLap && matchesDiscipline;
    });
  }, [rows, search, ageGroup, lap, discipline]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const eventNameFromState = location.state?.eventName ? String(location.state.eventName) : "";
  const eventName = summary?.eventName || eventNameFromState || "Event";
  const portalContext = resolveAttendeesPortalContext(location.pathname, location.state);
  const { returnTo, returnLabel, dashboardPath, dashboardLabel } = portalContext;

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "28px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 20px 64px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2 }}>
          <Typography component={RouterLink} to={dashboardPath} sx={{ textDecoration: "none", color: "inherit" }}>
            {dashboardLabel}
          </Typography>
          <Typography component={RouterLink} to={returnTo} sx={{ textDecoration: "none", color: "inherit" }}>
            {returnLabel}
          </Typography>
          <Typography sx={{ color: "#2f2829", fontWeight: 700 }}>Attendees</Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
              Who will attend
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              {eventName}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate(returnTo)}>
            Back to {returnLabel.toLowerCase()}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
          <Chip label={`${summary?.totalRegistered ?? 0} total registered`} sx={{ fontWeight: 700 }} />
          <Chip
            label={`${summary?.totalWithChestNo ?? 0} with chest no`}
            sx={{ fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}
          />
          <Chip
            label={`${filteredRows.length} showing`}
            sx={{ fontWeight: 700, bgcolor: "#f3f4f6" }}
          />
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          background: "#fff"
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ p: 2.5, flexWrap: "wrap" }}>
          <TextField
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, chest no, KRSA ID, RSFI ID"
            fullWidth
            sx={{ minWidth: { xs: "100%", md: 260 }, flex: 1 }}
            slotProps={{
              input: {
                startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
              }
            }}
          />
          <TextField
            select
            label="Discipline"
            value={discipline}
            onChange={(e) => {
              setDiscipline(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="">All</MenuItem>
            {disciplineOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Age group"
            value={ageGroup}
            onChange={(e) => {
              setAgeGroup(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { xs: "100%", md: 140 } }}
          >
            <MenuItem value="">All</MenuItem>
            {ageGroupOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Lap / round"
            value={lap}
            onChange={(e) => {
              setLap(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { xs: "100%", md: 160 } }}
          >
            <MenuItem value="">All</MenuItem>
            {lapOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Skater name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Chest no</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Age group</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lap / round</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>KRSA ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RSFI ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Discipline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: "#8d7f7b", py: 5 }}>
                      No attendees found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.fullName || "-"}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1d4ed8" }}>
                        {row.chestNo || "-"}
                      </TableCell>
                      <TableCell>{row.ageGroup || "-"}</TableCell>
                      <TableCell>{row.lap || "-"}</TableCell>
                      <TableCell>{row.krsaId || "-"}</TableCell>
                      <TableCell>{row.rsfiId || "-"}</TableCell>
                      <TableCell>{row.gender || "-"}</TableCell>
                      <TableCell>{row.skatingCategory || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredRows.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Rows:"
            />
          </>
        )}
      </Paper>
    </Box>
  );
};
