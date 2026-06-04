import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  TablePagination,
  TextField,
  Typography
} from "@mui/material";
import { CalendarDays, CheckCircle2, ChevronRight, PencilLine, Search, Trash2, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { districtApi } from "@/api/district-api";
import { eventsApi } from "@/api/events-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";
import { canApproveEvents, getEventApprovalChipProps } from "@/utils/eventApprovalStatus";
import GenerateEventCertificatesButton from "@/features/admin/events/components/GenerateEventCertificatesButton";
import toast from "react-hot-toast";

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtTime = (v) => {
  if (!v) return null;
  try {
    let date;
    if (v.includes(":") && !v.includes("T")) {
      const [h, m] = v.split(":");
      date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    } else {
      date = new Date(v);
    }
    if (Number.isNaN(date.getTime())) return v;
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
      .format(date)
      .toUpperCase();
  } catch {
    return v;
  }
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
      return "#22c55e";
    case "coming_soon":
      return "#f59e0b";
    case "cancelled":
      return "#ef4444";
    case "completed":
      return "#3b82f6";
    default:
      return "#8b7e7a";
  }
};

export const DistrictEventsPage = () => {
  const navigate = useNavigate();
  const { districtId } = useParams();
  const role = useAuthStore((s) => s.role);
  const canApprove = canApproveEvents(role);

  const districts = useDistrictsStore((s) => s.districts);
  const districtFromStore = useMemo(
    () => districts.find((d) => d.id === districtId) ?? null,
    [districts, districtId]
  );

  const [events, setEvents] = useState([]);
  const [districtName, setDistrictName] = useState(districtFromStore?.districtName || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchDebounceRef = useRef(null);

  const fetchEvents = useCallback(
    async (search = "", currentPage = 1, limit = 9) => {
      if (!districtId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await districtApi.getDistrictEvents(districtId, {
          page: currentPage,
          limit,
          ...(search.trim() ? { search: search.trim() } : {})
        });
        const payload = response?.data ?? response;
        setEvents(payload?.data || []);
        setTotalCount(payload?.pagination?.total || 0);
        if (payload?.district?.name) {
          setDistrictName(payload.district.name);
        }
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to fetch district events";
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [districtId]
  );

  useEffect(() => {
    fetchEvents(searchTerm, page + 1, rowsPerPage);
  }, [districtId, page, rowsPerPage, fetchEvents]);

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
      const response = await eventsApi.delete(pendingDeleteEvent._id || pendingDeleteEvent.id);
      const payload = response?.data?.data ?? response?.data ?? response;
      const eventId = pendingDeleteEvent._id || pendingDeleteEvent.id;

      if (payload?.pendingDelete) {
        setEvents((prev) =>
          prev.map((item) =>
            item._id === eventId || item.id === eventId
              ? { ...item, deleteApprovalStatus: "pending" }
              : item
          )
        );
      } else {
        setEvents((prev) =>
          prev.filter((item) => item._id !== eventId && item.id !== eventId)
        );
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
      toast.success(payload?.message || response?.message || "Event deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
      setPendingDeleteEvent(null);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await eventsApi.approveEvent(eventId);
      toast.success("Event approved");
      fetchEvents(searchTerm, page + 1, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve event");
    }
  };

  const handleReject = async (eventId) => {
    try {
      await eventsApi.rejectEvent(eventId);
      toast.success("Event rejected");
      fetchEvents(searchTerm, page + 1, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject event");
    }
  };

  const handleApproveDelete = async (eventId) => {
    try {
      await eventsApi.approveEventDelete(eventId);
      toast.success("Event deleted");
      fetchEvents(searchTerm, page + 1, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve delete");
    }
  };

  const handleRejectDelete = async (eventId) => {
    try {
      await eventsApi.rejectEventDelete(eventId);
      toast.success("Delete request rejected");
      fetchEvents(searchTerm, page + 1, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject delete");
    }
  };

  const displayName = districtName || districtFromStore?.districtName || "District";

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 240, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${districtHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/districts"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Districts
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Events</Typography>
          </Breadcrumbs>

          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)",
                mb: 1
              }}
            >
              District Events
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
              {displayName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 620 }}>
              All events created for this district — schedules, registration windows, and status.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              icon={<CalendarDays size={14} />}
              label={`${totalCount} Events`}
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
            />
          </Stack>
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
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: { xs: 2.5, md: 3 },
            pb: { xs: 2, md: 2.5 },
            alignItems: { lg: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Events for {displayName}
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              District-level events linked to this district.
            </Typography>
          </Box>

          <TextField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by event title..."
            sx={{ minWidth: { xs: "100%", sm: 320 } }}
            slotProps={{
              input: {
                startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
              }
            }}
          />
        </Stack>

        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: { xs: 0.5, md: 1 },
            pb: { xs: 3.5, md: 4 },
            background: `linear-gradient(180deg, transparent 0%, rgba(246,118,94,0.04) 100%), url("${eventsHero}")`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
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
                  sx={{ borderRadius: "24px", border: "1px solid #f0ddd5", p: 2.25 }}
                >
                  <Skeleton variant="rounded" width={80} height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="70%" />
                </Paper>
              ))}
            </Box>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                py: { xs: 5, md: 6 },
                px: { xs: 3, md: 5 },
                borderRadius: "22px",
                textAlign: "center",
                backgroundColor: "#fff5f5"
              }}
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
                    direction="row"
                    spacing={1}
                    sx={{
                      px: 2,
                      py: 1.5,
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        label={getStatusLabel(event.status)}
                        sx={{
                          backgroundColor: getStatusColor(event.status),
                          color: "white",
                          fontWeight: 700
                        }}
                      />
                      <Chip size="small" {...getEventApprovalChipProps(event)} />
                    </Stack>
                    <GenerateEventCertificatesButton
                      event={event}
                      role={role}
                      variant="corner"
                    />
                  </Stack>

                  <Stack spacing={1.35} sx={{ p: 2.25, pt: 0 }}>
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
                          {fmtTime(event.eventStartTime)}
                          {event.eventEndTime && ` – ${fmtTime(event.eventEndTime)}`}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ pt: 1, flexWrap: "wrap" }}>
                      {canApprove && event.adminApprovalStatus === "pending" && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircle2 size={16} />}
                            onClick={() => handleApprove(event._id || event.id)}
                            sx={{ backgroundColor: "#2e7d32", flex: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<XCircle size={16} />}
                            onClick={() => handleReject(event._id || event.id)}
                            sx={{ flex: 1 }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {canApprove && event.deleteApprovalStatus === "pending" && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircle2 size={16} />}
                            onClick={() => handleApproveDelete(event._id || event.id)}
                            sx={{ backgroundColor: "#c62828", flex: 1 }}
                          >
                            Approve delete
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleRejectDelete(event._id || event.id)}
                            sx={{ flex: 1 }}
                          >
                            Cancel delete
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<PencilLine size={16} />}
                        onClick={() =>
                          navigate(`/events/${event._id || event.id}/edit`, {
                            state: { event, fromDistrictId: districtId }
                          })
                        }
                        fullWidth
                      >
                        Edit
                      </Button>
                      {event.deleteApprovalStatus !== "pending" && (
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
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                py: { xs: 6, md: 8 },
                px: { xs: 3, md: 5 },
                borderRadius: "22px",
                textAlign: "center",
                border: "1px dashed rgba(240, 221, 213, 0.95)",
                backgroundColor: "rgba(255, 251, 249, 0.92)"
              }}
            >
              <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, mx: "auto" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(246, 118, 94, 0.12)",
                    color: "#f6765e"
                  }}
                >
                  <CalendarDays size={28} strokeWidth={1.75} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 17, md: 18 }, color: "#5f5552" }}>
                  No events found for this district.
                </Typography>
                <Typography sx={{ color: "#978a86", lineHeight: 1.7, fontSize: 14 }}>
                  {searchTerm.trim()
                    ? "Try a different search term or clear the filter to see all events."
                    : "Events created for this district will appear here once they are added."}
                </Typography>
              </Stack>
            </Paper>
          )}
        </Box>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
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
        description="This event will be permanently removed. You can't undo this action."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onClose={() => setPendingDeleteEvent(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
