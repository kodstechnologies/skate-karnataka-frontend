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
import { CalendarDays, ChevronRight, PencilLine, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventsApi } from "@/api/events-api";
import EventCardActionsMenu from "@/features/admin/events/components/EventCardActionsMenu";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getEventApprovalChipProps } from "@/utils/eventApprovalStatus";
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

const getEventCardPalette = (event) => {
  const text = event?.textColor || "#ffffff";
  const muted = event?.textColor ? `${event.textColor}cc` : "rgba(255,255,255,0.78)";
  const accent = event?.textColor || "#f6a192";

  return {
    background: `linear-gradient(135deg, ${event?.colorOne || "#141012"} 0%, ${event?.colorTwo || "#2a2224"} 100%)`,
    text,
    muted,
    accent,
    label: event?.textColor || "#f6a192"
  };
};

const isClubOwnedEvent = (event) => String(event?.eventType || "").trim().toLowerCase() === "club";

const filterClubOwnedEvents = (rows = []) => rows.filter(isClubOwnedEvent);

/** Club list API returns `{ data: Event[], pagination }` at top level (not nested under `data.data`). */
const parseClubEventsListResponse = (response) => {
  if (Array.isArray(response?.data)) {
    return {
      events: response.data,
      total: response.pagination?.total ?? response.data.length
    };
  }
  const payload = response?.data ?? response;
  return {
    events: payload?.data || [],
    total: payload?.pagination?.total ?? 0
  };
};

export const ClubPortalEventsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const displayName = user?.name || "Club";

  const fetchEvents = useCallback(async (currentPage = 1, limit = 9) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getClubEvents({ page: currentPage, limit });
      const { events: list, total } = parseClubEventsListResponse(response);
      const clubOnly = filterClubOwnedEvents(list);
      setEvents(clubOnly);
      setTotalCount(clubOnly.length !== list.length ? clubOnly.length : total);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch club events";
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
      const response = await eventsApi.deleteClubEvent(id);
      const payload = response?.data?.data ?? response?.data ?? response;
      if (payload?.pendingDelete) {
        setEvents((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, deleteApprovalStatus: "pending" } : item
          )
        );
      } else {
        setEvents((prev) => prev.filter((item) => (item._id || item.id) !== id));
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

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${clubHero}")`,
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
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: 15 }
            }}
          >
            <Typography
              component={RouterLink}
              to="/club/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Club Events</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em" }}>
            {displayName}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 640, lineHeight: 1.7 }}>
            Only club events created by your organization are shown here.
          </Typography>
          <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" spacing={1.5}>
            <Chip
              icon={<CalendarDays size={14} />}
              label={`${totalCount} Events`}
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/club/events/create")}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "white",
                color: "#f6765e",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                "&:hover": { bgcolor: "#fff8f5" }
              }}
            >
              Add club event
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: 3,
            pb: 4,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)"
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { md: "1fr 1fr", xl: "1fr 1fr 1fr" }
              }}
            >
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={280}
                  sx={{
                    borderRadius: "24px",
                    bgcolor: "rgba(20,16,18,0.08)"
                  }}
                />
              ))}
            </Box>
          ) : error ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: "22px", bgcolor: "#fff5f5" }}>
              <Typography color="error">{error}</Typography>
              <Button onClick={() => fetchEvents(page + 1, rowsPerPage)} sx={{ mt: 2 }}>
                Retry
              </Button>
            </Paper>
          ) : events.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: "center", borderRadius: "22px" }}>
              <Typography color="#8d7f7b">No events found for your club yet.</Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => navigate("/club/events/create")}
                sx={{ mt: 2, borderRadius: "14px", textTransform: "none", fontWeight: 700 }}
              >
                Add club event
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { md: "1fr 1fr", xl: "1fr 1fr 1fr" }
              }}
            >
              {events.map((event) => {
                const palette = getEventCardPalette(event);

                return (
                  <Paper
                    key={event._id || event.id}
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      background: palette.background,
                      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 28px 65px rgba(0, 0, 0, 0.24)"
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
                        gap: 1
                      }}
                    >
                      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
                        <Chip
                          size="small"
                          label={getStatusLabel(event.status)}
                          sx={{
                            backgroundColor: getStatusColor(event.status),
                            color: "white",
                            fontWeight: 700
                          }}
                        />
                        <Chip size="small" label="Club" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: palette.text, fontWeight: 700 }} />
                        <Chip size="small" {...getEventApprovalChipProps(event)} />
                      </Stack>

                      <EventCardActionsMenu
                        event={event}
                        role={role}
                        returnTo="/club/events"
                        returnLabel="Club events"
                        dashboardPath="/club/dashboard"
                      />
                    </Stack>

                    <Stack spacing={1.35} sx={{ px: 2.25, pb: 2.25, pt: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 19,
                          fontWeight: 800,
                          color: palette.text,
                          lineHeight: 1.3
                        }}
                      >
                        {event.header || "Event"}
                      </Typography>
                      <Typography
                        sx={{
                          color: palette.muted,
                          lineHeight: 1.7,
                          minHeight: 48,
                          fontSize: 14
                        }}
                      >
                        {event.about || "No description provided."}
                      </Typography>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: palette.label,
                            mb: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}
                        >
                          Registration
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: palette.text }}>
                          {fmtDate(event.registerStartDate)} → {fmtDate(event.registerEndDate)}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: palette.label,
                            mt: 1.25,
                            mb: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}
                        >
                          Event
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: palette.text }}>
                          {fmtDate(event.eventStartDate)} → {fmtDate(event.eventEndDate)}
                        </Typography>
                        {event.eventStartTime ? (
                          <Typography sx={{ fontSize: 13, color: palette.text, mt: 0.5 }}>
                            {fmtTime(event.eventStartTime)}
                            {event.eventEndTime ? ` – ${fmtTime(event.eventEndTime)}` : ""}
                          </Typography>
                        ) : null}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          width: "100%",
                          mt: "auto",
                          pt: 1.5
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<PencilLine size={16} />}
                          onClick={() =>
                            navigate(`/club/events/${event._id || event.id}/edit`)
                          }
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              borderRadius: "14px",
                              textTransform: "none",
                              fontWeight: 600,
                              py: 1.1,
                              borderColor: "rgba(246,118,94,0.55)",
                              color: palette.accent,
                              backgroundColor: "rgba(0,0,0,0.12)",
                              "&:hover": {
                                borderColor: palette.accent,
                                backgroundColor: "rgba(246,118,94,0.12)"
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<Trash2 size={16} />}
                            onClick={() => setPendingDeleteEvent(event)}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              borderRadius: "14px",
                              textTransform: "none",
                              fontWeight: 700,
                              py: 1.1,
                              color: "#2f2829",
                              backgroundColor: "#f4a598",
                              boxShadow: "none",
                              "&:hover": { backgroundColor: "#f08f82", boxShadow: "none" }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                    </Stack>
                  </Paper>
                );
              })}
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
        description="This will permanently remove the club event."
      />
    </Box>
  );
};
