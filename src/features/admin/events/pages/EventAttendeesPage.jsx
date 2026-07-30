import { useCallback, useEffect, useState } from "react";
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
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Button
} from "@mui/material";
import { ChevronRight, Download, Search } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { competitionApi } from "@/api/competition-api";
import { resolveAttendeesPortalContext } from "@/features/admin/events/utils/eventAttendeesNavigation";
import { downloadAttendeesExcel } from "@/features/admin/events/utils/downloadAttendeesExcel";
import { formatGenderLabel } from "@/utils/validationHelper";

const formatAttendeeStatusLabel = (row) => {
  const value = String(row?.attendanceStatus || "")
    .trim()
    .toLowerCase();
  if (!value || value === "pending") return "-";
  if (value === "attend" || value === "attended" || value === "present") return "Attend";
  if (value === "absent") return "Absent";
  return String(row.attendanceStatus).trim();
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const emptySummary = {
  eventName: "",
  eventAddress: "",
  eventStartDate: null,
  eventEndDate: null,
  hostedBy: "",
  totalRegistered: 0,
  totalWithChestNo: 0,
  filters: { ageGroups: [], laps: [], disciplines: [], genders: [] },
  attendees: [],
  skatingCategories: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
};

export const EventAttendeesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [lap, setLap] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloading, setDownloading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadAttendees = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await competitionApi.getChestNumberSummary(eventId, {
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        ageGroup,
        lap,
        discipline,
        gender
      });
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload;
      setSummary({
        ...emptySummary,
        ...data,
        filters: {
          ageGroups: data?.filters?.ageGroups || [],
          laps: data?.filters?.laps || [],
          disciplines: data?.filters?.disciplines || [],
          genders: data?.filters?.genders || []
        },
        attendees: Array.isArray(data?.attendees) ? data.attendees : [],
        skatingCategories: Array.isArray(data?.skatingCategories) ? data.skatingCategories : [],
        pagination: data?.pagination || emptySummary.pagination
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load attendees");
    } finally {
      setLoading(false);
    }
  }, [eventId, page, rowsPerPage, debouncedSearch, ageGroup, lap, discipline, gender]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAttendees();
  }, [loadAttendees]);

  const eventNameFromState = location.state?.eventName ? String(location.state.eventName) : "";
  const eventName = summary?.eventName || eventNameFromState || "Event";
  const portalContext = resolveAttendeesPortalContext(location.pathname, location.state);
  const { returnTo, returnLabel, dashboardPath, dashboardLabel } = portalContext;
  const attendees = summary.attendees || [];
  const pagination = summary.pagination || emptySummary.pagination;
  const filterOptions = summary.filters || emptySummary.filters;
  const canDownloadExcel = (summary.totalWithChestNo ?? 0) > 0;

  const parseSummaryPayload = (response) => {
    const payload = response?.data ?? response;
    return payload?.data ?? payload;
  };

  const fetchAllMatchingAttendees = async () => {
    const pageLimit = 100;
    const firstResponse = await competitionApi.getChestNumberSummary(eventId, {
      page: 1,
      limit: pageLimit,
      search: debouncedSearch,
      ageGroup,
      lap,
      discipline,
      gender
    });
    const firstData = parseSummaryPayload(firstResponse);
    const total = firstData?.pagination?.total ?? 0;
    const collected = Array.isArray(firstData?.attendees) ? [...firstData.attendees] : [];
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));
    const meta = {
      eventName: firstData?.eventName || eventName,
      eventAddress: firstData?.eventAddress || summary.eventAddress || "",
      eventStartDate: firstData?.eventStartDate || summary.eventStartDate || null,
      eventEndDate: firstData?.eventEndDate || summary.eventEndDate || null,
      hostedBy: firstData?.hostedBy || summary.hostedBy || "",
      skatingCategories: Array.isArray(firstData?.skatingCategories)
        ? firstData.skatingCategories
        : summary.skatingCategories || []
    };

    for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
      const response = await competitionApi.getChestNumberSummary(eventId, {
        page: nextPage,
        limit: pageLimit,
        search: debouncedSearch,
        ageGroup,
        lap,
        discipline,
        gender
      });
      const data = parseSummaryPayload(response);
      if (Array.isArray(data?.attendees)) {
        collected.push(...data.attendees);
      }
    }

    return { attendees: collected, meta };
  };

  const handleDownloadExcel = async () => {
    if (!canDownloadExcel || downloading) return;

    setDownloading(true);
    try {
      const { attendees: rows, meta } = await fetchAllMatchingAttendees();
      if (rows.length === 0) {
        toast.error("No attendees to download for the selected filters");
        return;
      }
      await downloadAttendeesExcel({
        attendees: rows,
        eventName: meta.eventName || eventName,
        eventAddress: meta.eventAddress,
        eventStartDate: meta.eventStartDate,
        eventEndDate: meta.eventEndDate,
        hostedBy: meta.hostedBy,
        skatingCategories: meta.skatingCategories
      });
      toast.success("Excel downloaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

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
          <Typography
            component={RouterLink}
            to={dashboardPath}
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            {dashboardLabel}
          </Typography>
          <Typography
            component={RouterLink}
            to={returnTo}
            sx={{ textDecoration: "none", color: "inherit" }}
          >
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
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>{eventName}</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              onClick={handleDownloadExcel}
              disabled={!canDownloadExcel || downloading}
              sx={{
                bgcolor: "#f6765e",
                "&:hover": { bgcolor: "#e45f47" },
                "&.Mui-disabled": { bgcolor: "#f3e8e4", color: "#b19f99" }
              }}
            >
              {downloading ? "Downloading..." : "Download Excel"}
            </Button>
            <Button variant="outlined" onClick={() => navigate(returnTo)}>
              Back to {returnLabel.toLowerCase()}
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${summary.totalRegistered ?? 0} total registered`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`${summary.totalWithChestNo ?? 0} with chest no`}
            sx={{ fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}
          />
          <Chip
            label={`${pagination.total ?? 0} matching`}
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ p: 2.5, flexWrap: "wrap" }}
        >
          <TextField
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, chest no, KRSA ID, RSFI ID, email, phone"
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
            {filterOptions.disciplines.map((option) => (
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
            {filterOptions.ageGroups.map((option) => (
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
            {filterOptions.laps.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Gender"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { xs: "100%", md: 140 } }}
          >
            <MenuItem value="">All</MenuItem>
            {(filterOptions.genders || []).map((option) => (
              <MenuItem key={option} value={option}>
                {formatGenderLabel(option)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TableContainer sx={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.2s ease" }}>
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
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone no</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Discipline</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Skater district</TableCell>
                {/* <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ color: "#8d7f7b", py: 5 }}>
                    Loading attendees...
                  </TableCell>
                </TableRow>
              ) : attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ color: "#8d7f7b", py: 5 }}>
                    No attendees found for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                attendees.map((row) => (
                  <TableRow key={row.id || `${row.krsaId}-${row.lap}-${row.ageGroup}`}>
                    <TableCell>{row.fullName || "-"}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1d4ed8" }}>
                      {row.chestNo || "-"}
                    </TableCell>
                    <TableCell>{row.ageGroup || "-"}</TableCell>
                    <TableCell>{row.lap || "-"}</TableCell>
                    <TableCell>{row.krsaId || "-"}</TableCell>
                    <TableCell>{row.rsfiId || "-"}</TableCell>
                    <TableCell>{formatGenderLabel(row.gender)}</TableCell>
                    <TableCell>{row.email || "-"}</TableCell>
                    <TableCell>{row.phone || "-"}</TableCell>
                    <TableCell>{row.discipline || "-"}</TableCell>
                    <TableCell>{row.district || "-"}</TableCell>
                    {/* <TableCell>{row.remarks || row.remark || "-"}</TableCell>
                    <TableCell>{formatAttendeeStatusLabel(row)}</TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total ?? 0}
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
      </Paper>
    </Box>
  );
};
