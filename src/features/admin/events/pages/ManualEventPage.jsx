import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  TablePagination,
  IconButton,
  Tooltip,
  Skeleton,
  Alert
} from "@mui/material";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Layers,
  MapPin,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
  X
} from "lucide-react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import toast from "react-hot-toast";
import eventsHero from "@/assets/Events_header.jpg";
import { manualEventsApi } from "@/api/manual-events-api";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

const fmtDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getStatusBadgeProps = (status) => {
  switch (status) {
    case "published":
      return { label: "Published", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
    case "ongoing":
      return { label: "Ongoing", bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
    case "completed":
      return { label: "Completed", bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" };
    case "cancelled":
      return { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
    case "draft":
    default:
      return { label: "Draft", bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  }
};

export const ManualEventPage = ({ portalMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useAuthStore((s) => s.role);

  const activeMode =
    portalMode ||
    (location.pathname.startsWith("/district")
      ? "district"
      : location.pathname.startsWith("/club")
        ? "club"
        : String(userRole || "").toLowerCase());

  const isDistrict = activeMode === "district";
  const isClub = activeMode === "club";
  const isAdmin = !isDistrict && !isClub;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering
  const [page, setPage] = useState(0); // 0-indexed for MUI
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete modal state
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getEventDetailPath = (eventId) => {
    if (isDistrict) return `/district/manual-events/${eventId}`;
    if (isClub) return `/club/manual-events/${eventId}`;
    return `/events/manual/${eventId}`;
  };

  const searchDebounceRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const response = await manualEventsApi.getAll(params);
      const payload = response?.data?.data || response?.data || {};
      const list = payload.events || payload || [];
      const pagination = payload.pagination || {};

      setEvents(Array.isArray(list) ? list : []);
      setTotal(pagination.total ?? (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      console.error("Failed to load manual events:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load manual events");
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(0);
      setSearch(val);
    }, 350);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEvent) return;
    const eventId = deleteEvent._id || deleteEvent.id;
    setDeleting(true);
    try {
      await manualEventsApi.delete(eventId);
      toast.success("Manual event deleted successfully");
      setDeleteEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete manual event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Enhanced Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "20px", md: "28px" },
          overflow: "hidden",
          position: "relative",
          mb: 4,
          background: `linear-gradient(135deg, rgba(26, 20, 19, 0.88) 0%, rgba(18, 14, 13, 0.94) 100%), url(${eventsHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          p: { xs: 3, sm: 4, md: 5 },
          boxShadow: "0 24px 70px rgba(0,0,0,0.18)"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          {/* Left Hero Details */}
          <Box sx={{ maxWidth: 680 }}>
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              sx={{
                mb: 1.5,
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
                "& .MuiBreadcrumbs-li": {
                  color: "rgba(255,255,255,0.85)",
                  fontSize: { xs: 13, md: 15 }
                }
              }}
            >
              <Typography
                component={RouterLink}
                to={isDistrict ? "/district/dashboard" : isClub ? "/club/dashboard" : "/dashboard"}
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                {isDistrict ? "District Dashboard" : isClub ? "Club Dashboard" : "Dashboard"}
              </Typography>
              {!isDistrict && !isClub && (
                <Typography
                  component={RouterLink}
                  to="/events/detail"
                  sx={{
                    color: "inherit",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { color: "white" }
                  }}
                >
                  Events
                </Typography>
              )}
              <Typography sx={{ color: "white", fontWeight: 700 }}>Manual Events</Typography>
            </Breadcrumbs>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.85rem", sm: "2.35rem", md: "2.65rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1.2,
                mb: 1.2
              }}
            >
              {isAdmin ? "Manual Event Management" : "State Manual Events"}
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontSize: { xs: "0.95rem", md: "1.02rem" },
                lineHeight: 1.6,
                mb: 2.5
              }}
            >
              {isAdmin
                ? "Create standalone manual skating championships, publish official circulars, configure skater excel templates, and track event attendance statewide."
                : "Explore official manual skating championships, circulars, guidelines, and registration templates published by Karnataka Roller Skating Association (KRSA)."}
            </Typography>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip
                icon={<Timer size={14} color="#f97316" />}
                label={`${total} Total Events`}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontWeight: 600,
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
              />
              <Chip
                label="Manual Competition Engine"
                size="small"
                sx={{
                  backgroundColor: "rgba(249, 115, 22, 0.2)",
                  color: "#ffedd5",
                  fontWeight: 600,
                  border: "1px solid rgba(249, 115, 22, 0.4)"
                }}
              />
            </Stack>
          </Box>

          {/* Right Hero Action Card */}
          <Box
            sx={{
              p: 3,
              borderRadius: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", sm: "center" },
              textAlign: { xs: "left", sm: "center" },
              minWidth: { xs: "100%", sm: 260 }
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "16px",
                backgroundColor: "rgba(246, 118, 94, 0.2)",
                color: "#f6765e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5
              }}
            >
              {isAdmin ? <Trophy size={24} /> : <CalendarDays size={24} />}
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "white", mb: 0.5 }}>
              {isAdmin ? "Host a Competition" : "Official Events"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
              {isAdmin ? "Launch a new championship bracket" : "State association manual competitions"}
            </Typography>

            {isAdmin ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<Plus size={18} />}
                onClick={() => navigate("/events/manual/create")}
                sx={{
                  backgroundColor: "#f6765e",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  px: 3.5,
                  py: 1.4,
                  borderRadius: "16px",
                  boxShadow: "0 10px 28px rgba(246, 118, 94, 0.45)",
                  textTransform: "none",
                  width: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#ea6b54",
                    boxShadow: "0 14px 34px rgba(246, 118, 94, 0.55)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                Create Manual Event
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshCw size={16} />}
                onClick={fetchEvents}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  px: 3,
                  py: 1.2,
                  borderRadius: "16px",
                  textTransform: "none",
                  width: "100%",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
              >
                Refresh List
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* ── Toolbar: Search & Filters ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: "1px solid #f0ddd5",
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 20px rgba(56, 36, 29, 0.03)"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
            <TextField
              defaultValue={search}
              onChange={handleSearchChange}
              placeholder="Search by event title, category, discipline, venue..."
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 340 } }}
              InputProps={{
                startAdornment: <Search size={16} color="#8d7f7b" style={{ marginRight: 8 }} />
              }}
            />

            <TextField
              select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 160 } }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
            <Tooltip title="Refresh event list">
              <IconButton
                onClick={fetchEvents}
                disabled={loading}
                sx={{
                  border: "1px solid #ebdcd5",
                  borderRadius: "12px",
                  "&:hover": { backgroundColor: "#fff5f2", borderColor: "#f6765e" }
                }}
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-[#f6765e]" : "text-[#7f7270]"} />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/events/manual/create")}
              sx={{
                backgroundColor: "#f6765e",
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                py: 1,
                "&:hover": { backgroundColor: "#ea6b54" }
              }}
            >
              Add Event
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Error Alert ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "16px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Events Grid / List ── */}
      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 3
          }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rounded"
              height={320}
              sx={{ borderRadius: "24px", bgcolor: "rgba(240, 221, 213, 0.4)" }}
            />
          ))}
        </Box>
      ) : events.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: "28px",
            border: "2px dashed #eedad1",
            textAlign: "center",
            backgroundColor: "#fffdfb"
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "20px",
              backgroundColor: "#fef0ea",
              color: "#f6765e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2
            }}
          >
            <Sparkles size={28} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829", mb: 1 }}>
            No Manual Events Found
          </Typography>
          <Typography sx={{ color: "#7f7270", maxWidth: 500, mx: "auto", mb: 3 }}>
            {search || statusFilter !== "all"
              ? "No events match your search or filter criteria. Try clearing filters or creating a new event."
              : "No manual events have been created yet. Click the button below to open the create event page."}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus size={18} />}
            onClick={() => navigate("/events/manual/create")}
            sx={{
              backgroundColor: "#f6765e",
              borderRadius: "16px",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              boxShadow: "0 10px 25px rgba(246, 118, 94, 0.4)",
              "&:hover": { backgroundColor: "#ea6b54" }
            }}
          >
            Create First Manual Event
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 3
          }}
        >
          {events.map((evt) => {
            const eventId = evt._id || evt.id;
            const statusProps = getStatusBadgeProps(evt.status);
            const bg1 = evt.backgroundColor1 || "#FFFFFF";
            const bg2 = evt.backgroundColor2 || "#FFF9F6";
            const txtColor = evt.textColor || "#2f2829";

            return (
              <Paper
                key={eventId}
                elevation={0}
                onClick={() => navigate(getEventDetailPath(eventId))}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid #ebdcd5",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.25s ease",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 36px rgba(56, 36, 29, 0.08)",
                    borderColor: "#f6765e"
                  }
                }}
              >
                {/* Custom Styled Header Card Area */}
                <Box
                  sx={{
                    p: 2.5,
                    background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`,
                    borderBottom: "1px solid #f0e2da",
                    position: "relative"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Chip
                      label={statusProps.label}
                      size="small"
                      sx={{
                        backgroundColor: statusProps.bg,
                        color: statusProps.color,
                        border: `1px solid ${statusProps.border}`,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: 24
                      }}
                    />

                    {evt.entryFee !== undefined && evt.entryFee > 0 ? (
                      <Chip
                        icon={<IndianRupee size={12} />}
                        label={`₹${evt.entryFee}`}
                        size="small"
                        sx={{
                          backgroundColor: "#fef0ea",
                          color: "#f6765e",
                          border: "1px solid #ffd6c9",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          height: 24
                        }}
                      />
                    ) : (
                      <Chip
                        label="Free Entry"
                        size="small"
                        sx={{
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          height: 24
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: txtColor,
                      letterSpacing: "-0.02em",
                      mt: 1.5,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {evt.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {evt.eventCategory && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: "6px",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          color: "#5c504d",
                          fontWeight: 600
                        }}
                      >
                        {evt.eventCategory}
                      </Typography>
                    )}
                    {evt.discipline && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: "6px",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          color: "#5c504d",
                          fontWeight: 600
                        }}
                      >
                        {evt.discipline}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Event Details Body */}
                <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {evt.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#7f7270",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {evt.description}
                    </Typography>
                  )}

                  <Stack spacing={1} sx={{ mt: "auto", pt: 1, color: "#6e605d", fontSize: "0.85rem" }}>
                    {/* Dates */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarDays size={15} color="#f6765e" />
                      <Typography variant="caption" sx={{ color: "#4f4442", fontWeight: 600 }}>
                        {evt.startDate ? fmtDate(evt.startDate) : "Date TBA"}
                        {evt.endDate && evt.endDate !== evt.startDate ? ` – ${fmtDate(evt.endDate)}` : ""}
                      </Typography>
                    </Stack>

                    {/* Timings */}
                    {(evt.eventStartTime || evt.eventEndTime) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Clock size={15} color="#f97316" />
                        <Typography variant="caption" sx={{ color: "#6e605d" }}>
                          {evt.eventStartTime || ""}{evt.eventStartTime && evt.eventEndTime ? " – " : ""}{evt.eventEndTime || ""}
                        </Typography>
                      </Stack>
                    )}

                    {/* Venue */}
                    {evt.address && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MapPin size={15} color="#8d7f7b" />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6e605d",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {evt.address}
                        </Typography>
                      </Stack>
                    )}

                    {/* Attached Documents */}
                    {(evt.circularDocument || evt.excelTemplate) && (
                      <Stack direction="row" spacing={1} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                        {evt.circularDocument && (
                          <Button
                            href={evt.circularDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                            startIcon={<FileText size={12} />}
                            sx={{
                              fontSize: "11px",
                              py: 0.2,
                              px: 1,
                              borderRadius: "8px",
                              borderColor: "#e0d5ce",
                              color: "#2f2829",
                              textTransform: "none",
                              "&:hover": { borderColor: "#f6765e", backgroundColor: "#fff5f2" }
                            }}
                          >
                            Circular PDF
                          </Button>
                        )}
                        {evt.excelTemplate && (
                          <Button
                            href={evt.excelTemplate}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                            startIcon={<FileSpreadsheet size={12} />}
                            sx={{
                              fontSize: "11px",
                              py: 0.2,
                              px: 1,
                              borderRadius: "8px",
                              borderColor: "#e0d5ce",
                              color: "#16a34a",
                              textTransform: "none",
                              "&:hover": { borderColor: "#16a34a", backgroundColor: "#f0fdf4" }
                            }}
                          >
                            Excel Template
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Box>

                {/* Card Action Footer */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    borderTop: "1px solid #f2e7e1",
                    backgroundColor: "#fdfbfa",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#a1938f" }}>
                    Created: {fmtDate(evt.createdAt)}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="View event full page">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={13} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(getEventDetailPath(eventId));
                        }}
                        sx={{
                          border: "1px solid #ebdcd5",
                          borderRadius: "10px",
                          color: "#475569",
                          fontSize: "12px",
                          py: 0.4,
                          px: 1.2,
                          textTransform: "none",
                          "&:hover": { borderColor: "#f6765e", color: "#f6765e", backgroundColor: "#fff5f2" }
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>

                    {isAdmin && (
                      <>
                        <Tooltip title="Edit event">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/manual/${eventId}/edit`);
                            }}
                            sx={{
                              border: "1px solid #ebdcd5",
                              borderRadius: "10px",
                              color: "#475569",
                              "&:hover": { borderColor: "#f6765e", color: "#f6765e", backgroundColor: "#fff5f2" }
                            }}
                          >
                            <PencilLine size={15} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete event">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteEvent(evt);
                            }}
                            sx={{
                              border: "1px solid #ebdcd5",
                              borderRadius: "10px",
                              color: "#dc2626",
                              "&:hover": { borderColor: "#dc2626", backgroundColor: "#fef2f2" }
                            }}
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* ── Pagination ── */}
      {total > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: "18px",
            border: "1px solid #f0ddd5",
            overflow: "hidden",
            backgroundColor: "#ffffff"
          }}
        >
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 9, 18, 36]}
          />
        </Paper>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmDeleteModal
        open={Boolean(deleteEvent)}
        title="Delete Manual Event"
        description={`Are you sure you want to delete "${deleteEvent?.title}"? All associated details will be permanently removed.`}
        confirmLabel={deleting ? "Deleting..." : "Delete Event"}
        onClose={() => setDeleteEvent(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default ManualEventPage;
