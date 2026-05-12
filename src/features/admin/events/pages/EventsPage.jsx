import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
  CircularProgress,
  Skeleton
} from "@mui/material";
import { ChevronRight, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventsApi } from "@/api/events-api";
import toast from "react-hot-toast";

/** Format a date string like "2025-06-10" → "10 Jun 2025" */
const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/** Format a time string like "14:30" → "2:30 PM" or "09:30" → "9:30 AM" */
const fmtTime = (v) => {
  if (!v) return null;
  try {
    let date;
    // Handle "HH:mm" or "HH:mm:ss" format
    if (v.includes(":") && !v.includes("T")) {
      const [h, m] = v.split(":");
      date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    } else {
      // Handle ISO or other date-time strings
      date = new Date(v);
    }

    if (isNaN(date.getTime())) return v;

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
      .format(date)
      .toUpperCase();
  } catch (err) {
    return v;
  }
};

const formatCurrency = (value) => {
  if (!value) return "Free";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusLabel = (status) => {
  switch (status) {
    case "coming_soon":
      return "Coming Soon";
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status || "Unknown";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "#22c55e"; // Green
    case "coming_soon":
      return "#f59e0b"; // Orange
    case "cancelled":
      return "#ef4444"; // Red
    case "completed":
      return "#3b82f6"; // Blue
    default:
      return "#8b7e7a"; // Gray
  }
};

export const EventsPage = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchDebounceRef = useRef(null);

  const fetchEvents = useCallback(async (search = "", currentPage = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventsApi.getAll(search, currentPage, limit);

      setEvents(data?.data || []);
      setTotalCount(data?.pagination?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch events");
      setError(err?.response?.data?.message || err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents(searchTerm, page + 1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchEvents(value, 1, rowsPerPage);
    }, 400);
  };

  const handleDelete = async () => {
    if (!pendingDeleteEvent) return;
    setDeleting(true);
    try {
      const { message } = await eventsApi.delete(pendingDeleteEvent._id || pendingDeleteEvent.id);
      setEvents((prev) =>
        prev.filter((item) => item._id !== pendingDeleteEvent._id || pendingDeleteEvent.id)
      );
      toast.success(message || "Event deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
      setPendingDeleteEvent(null);
    }
  };
  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 260, md: 300 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${eventsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Events</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Events Control Center
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Plan, publish, and manage state, district, and club events with registrations,
              schedule windows, and pricing in one place.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${totalCount} Total`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
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
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Events Management
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Event cards with schedule, scope, pricing, and quick actions.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title, type, status, location..."
              sx={{ minWidth: { xs: "100%", sm: 320 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/events/create")}
            >
              Add event
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {[...Array(6)].map((_, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
                    boxShadow: "0 20px 50px rgba(56, 36, 29, 0.08)"
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Skeleton
                      variant="rounded"
                      width={80}
                      height={24}
                      sx={{ borderRadius: "12px" }}
                    />
                  </Box>

                  <Stack spacing={1.35} sx={{ p: 2.25 }}>
                    <Skeleton variant="text" width="80%" height={28} sx={{ mb: 0.5 }} />
                    <Box sx={{ minHeight: 52 }}>
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="70%" />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="50%" height={16} />

                      <Skeleton variant="text" width={60} height={16} sx={{ mt: 1, mb: 0.5 }} />
                      <Skeleton variant="text" width="50%" height={16} />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Skeleton variant="rounded" width="100%" height={40} />
                      <Skeleton variant="rounded" width="100%" height={40} />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", backgroundColor: "#fff5f5" }}
            >
              <Typography color="error">{error}</Typography>
              <Button onClick={() => fetchEvents(searchTerm, page + 1, rowsPerPage)} sx={{ mt: 2 }}>
                Retry
              </Button>
            </Paper>
          ) : events.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {events.map((event) => (
                <Paper
                  key={event._id || event.id}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${event.colorOne || "#fff1eb"} 0%, ${event.colorTwo || "#fce3d9"} 100%)`,

                    boxShadow: "0 20px 50px rgba(56, 36, 29, 0.08)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(56, 36, 29, 0.12)"
                    }
                  }}
                >
                  <Stack
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      alignItems: "center",
                      justifyContent: "space-between", // ✅ correct property
                      width: "100%"
                    }}
                  >
                    <Chip
                      size="small"
                      label={getStatusLabel(event.status)}
                      sx={{
                        backgroundColor: getStatusColor(event.status),
                        color: "white",
                        fontWeight: 700
                      }}
                    />
                  </Stack>

                  <Stack spacing={1.35} sx={{ p: 2.25 }}>
                    <Typography
                      sx={{
                        fontSize: 19,
                        fontWeight: 800,
                        color: event.textColor || "#2f2829",
                        lineHeight: 1.3
                      }}
                    >
                      {event.header}
                    </Typography>
                    <Typography
                      sx={{ color: event.textColor || "#7e716d", lineHeight: 1.7, minHeight: 52 }}
                    >
                      {event.about || "No description provided."}
                    </Typography>

                    {/* Schedule block */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: event.textColor || "#f6765e",
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        Registration
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: event.textColor || "#5f5552" }}>
                        {fmtDate(event.registerStartDate)} → {fmtDate(event.registerEndDate)}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: event.textColor || "#f6765e",
                          mt: 1,
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        Event
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: event.textColor || "#5f5552" }}>
                        {fmtDate(event.eventStartDate)} → {fmtDate(event.eventEndDate)}
                      </Typography>

                      {event.eventStartTime && (
                        <Typography
                          sx={{ fontSize: 12, color: event.textColor || "#5f5552", mt: 0.5 }}
                        >
                          🕐 {fmtTime(event.eventStartTime)}
                          {event.eventEndTime && ` – ${fmtTime(event.eventEndTime)}`}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PencilLine size={16} />}
                        onClick={() =>
                          navigate(`/events/${event._id || event.id}/edit`, { state: { event } })
                        }
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => setPendingDeleteEvent(event)}
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
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              No events found for the current search.
            </Paper>
          )}
        </Box>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 9, 12]}
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
        open={Boolean(pendingDeleteEvent)}
        title="Delete event"
        itemLabel={pendingDeleteEvent?.header}
        description="This event will be permanently removed. You can’t undo this action."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onClose={() => setPendingDeleteEvent(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
