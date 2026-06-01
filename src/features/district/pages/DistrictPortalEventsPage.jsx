import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  TablePagination,
  Typography
} from "@mui/material";
import { CalendarDays, ChevronRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventsApi } from "@/api/events-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import toast from "react-hot-toast";

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

export const DistrictPortalEventsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const displayName = user?.districtName || "District";

  const fetchEvents = useCallback(async (currentPage = 1, limit = 9) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getDistrictEvents({ page: currentPage, limit });
      const payload = response?.data ?? response;
      setEvents(payload?.data || []);
      setTotalCount(payload?.pagination?.total || 0);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch district events";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(page + 1, rowsPerPage);
  }, [page, rowsPerPage, fetchEvents]);

  const handleDelete = async () => {
    if (!pendingDeleteEvent) return;
    setDeleting(true);
    try {
      const id = pendingDeleteEvent._id || pendingDeleteEvent.id;
      const response = await eventsApi.deleteDistrictEvent(id);
      setEvents((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success(response?.message || "Event deleted successfully");
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
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(83,199,197,0.28) 100%), url("${districtHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Stack spacing={2}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
            }}
          >
            <Typography
              component={RouterLink}
              to="/district/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>District Events</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em" }}>
            {displayName}
          </Typography>
          <Chip
            icon={<CalendarDays size={14} />}
            label={`${totalCount} Events`}
            sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)", width: "fit-content" }}
          />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "32px", border: "1px solid #f0ddd5", overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: 3,
            pb: 4,
            background: `url("${eventsHero}") center/cover`
          }}
        >
          {loading ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: "24px" }} />
          ) : error ? (
            <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#fff5f5" }}>
              <Typography color="error">{error}</Typography>
              <Button onClick={() => fetchEvents(page + 1, rowsPerPage)} sx={{ mt: 2 }}>
                Retry
              </Button>
            </Paper>
          ) : events.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: "center" }}>
              <Typography color="#8d7f7b">No district events yet.</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr", xl: "1fr 1fr 1fr" } }}>
              {events.map((event) => (
                <Paper
                  key={event._id || event.id}
                  elevation={0}
                  sx={{ borderRadius: "24px", border: "1px solid #f0ddd5", p: 2.5 }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Chip label={getStatusLabel(event.status)} size="small" />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setPendingDeleteEvent(event)}
                      sx={{ minWidth: 0, p: 1 }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Stack>
                  <Typography sx={{ mt: 2, fontWeight: 800 }}>
                    {event.title || event.name || "Event"}
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 14, color: "#6f625e" }}>
                    {fmtDate(event.startDate || event.eventDate)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
        {!loading && events.length > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 9, 12]}
          />
        )}
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteEvent)}
        onClose={() => setPendingDeleteEvent(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete event?"
        description="This will permanently remove the district event."
      />
    </Box>
  );
};
