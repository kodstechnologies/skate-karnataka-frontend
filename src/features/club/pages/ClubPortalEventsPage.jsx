import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Hand,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    panel: "rgba(0,0,0,0.16)",
    panelBorder: "rgba(255,255,255,0.14)",
    text,
    muted,
    accent,
    label: event?.textColor || "#f6a192"
  };
};

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

const EVENT_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "coming_soon", label: "Coming soon" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const APPROVAL_FILTERS = [
  { value: "", label: "All approval" },
  { value: "pending", label: "Pending approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

export const ClubPortalEventsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingModeId, setTogglingModeId] = useState(null);
  const searchDebounceRef = useRef(null);

  const displayName = user?.name || "Club";

  const fetchEvents = useCallback(
    async (currentPage = 1, limit = 9, search = "", status = "", adminApprovalStatus = "") => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: currentPage, limit };
        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;
        if (adminApprovalStatus) params.adminApprovalStatus = adminApprovalStatus;

        const response = await eventsApi.getClubPortalEvents(params);
        const { events: list, total } = parseClubEventsListResponse(response);
        setEvents(list);
        setTotalCount(total);
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to fetch club events";
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents(page + 1, rowsPerPage, searchTerm, statusFilter, approvalFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter, approvalFilter, fetchEvents]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchEvents(1, rowsPerPage, value, statusFilter, approvalFilter);
    }, 400);
  };

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter || approvalFilter);

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

  const handleToggleChestNumberMode = async (event) => {
    const id = event._id || event.id;
    if (!id || togglingModeId) return;

    const nextIsAutomated = event.isAutomated === false;

    setTogglingModeId(id);
    try {
      const response = await eventsApi.updateClubChestNumberMode(id, nextIsAutomated);
      const payload = response?.data?.data ?? response?.data ?? response;
      const savedIsAutomated =
        typeof payload?.isAutomated === "boolean" ? payload.isAutomated : nextIsAutomated;

      setEvents((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id ? { ...item, isAutomated: savedIsAutomated } : item
        )
      );
      toast.success(
        payload?.message || (savedIsAutomated ? "Switched to automatic" : "Switched to manual")
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update mode");
    } finally {
      setTogglingModeId(null);
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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.5}
            sx={{ mb: 3, alignItems: { lg: "center" } }}
          >
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title, description, location..."
              sx={{ flex: 1, minWidth: { xs: "100%", sm: 280 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
                }
              }}
            />
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <InputLabel>Event status</InputLabel>
              <Select
                value={statusFilter}
                label="Event status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                {EVENT_STATUS_FILTERS.map((opt) => (
                  <MenuItem key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
              <InputLabel>Approval</InputLabel>
              <Select
                value={approvalFilter}
                label="Approval"
                onChange={(e) => {
                  setApprovalFilter(e.target.value);
                  setPage(0);
                }}
              >
                {APPROVAL_FILTERS.map((opt) => (
                  <MenuItem key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

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
              <Button
                onClick={() =>
                  fetchEvents(page + 1, rowsPerPage, searchTerm, statusFilter, approvalFilter)
                }
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Paper>
          ) : events.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: "center", borderRadius: "22px" }}>
              <Typography color="#8d7f7b">
                {hasActiveFilters
                  ? "No events found for the current filters."
                  : "No events found for your club yet."}
              </Typography>
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
                const eventId = event._id || event.id;
                const isAutomated = event.isAutomated !== false;
                const isTogglingMode = togglingModeId === eventId;
                const eventTimeLabel =
                  event.eventStartTime &&
                  `${fmtTime(event.eventStartTime)}${
                    event.eventEndTime ? ` – ${fmtTime(event.eventEndTime)}` : ""
                  }`;

                return (
                  <Paper
                    key={eventId}
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
                      },
                      "@keyframes chestModeSpin": {
                        from: { transform: "rotate(0deg)" },
                        to: { transform: "rotate(360deg)" }
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
                        <Chip
                          size="small"
                          label="Club"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.16)",
                            color: palette.text,
                            fontWeight: 700
                          }}
                        />
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

                    <Stack spacing={1.5} sx={{ px: 2.25, pb: 2.25, pt: 0, flex: 1 }}>
                      <Box>
                        <Typography
                          title={event.header || "Event"}
                          sx={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: palette.text,
                            lineHeight: 1.35,
                            letterSpacing: "-0.02em",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "2.7em"
                          }}
                        >
                          {event.header || "Event"}
                        </Typography>
                        <Typography
                          title={event.about || "No description provided."}
                          sx={{
                            mt: 0.75,
                            color: palette.muted,
                            lineHeight: 1.55,
                            fontSize: 13.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "4.65em"
                          }}
                        >
                          {event.about || "No description provided."}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "16px",
                          backgroundColor: palette.panel,
                          border: `1px solid ${palette.panelBorder}`,
                          backdropFilter: "blur(6px)"
                        }}
                      >
                        <Stack spacing={1.15}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                            <Box
                              sx={{
                                mt: 0.15,
                                color: palette.label,
                                display: "inline-flex",
                                flexShrink: 0
                              }}
                            >
                              <CalendarDays size={15} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: palette.label,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  mb: 0.25
                                }}
                              >
                                Registration
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: palette.text,
                                  fontWeight: 600,
                                  lineHeight: 1.35
                                }}
                              >
                                {fmtDate(event.registerStartDate)} →{" "}
                                {fmtDate(event.registerEndDate)}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                            <Box
                              sx={{
                                mt: 0.15,
                                color: palette.label,
                                display: "inline-flex",
                                flexShrink: 0
                              }}
                            >
                              <Clock3 size={15} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: palette.label,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  mb: 0.25
                                }}
                              >
                                Event
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: palette.text,
                                  fontWeight: 600,
                                  lineHeight: 1.35
                                }}
                              >
                                {fmtDate(event.eventStartDate)} → {fmtDate(event.eventEndDate)}
                              </Typography>
                              {eventTimeLabel ? (
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: palette.muted,
                                    mt: 0.25,
                                    lineHeight: 1.35
                                  }}
                                >
                                  {eventTimeLabel}
                                </Typography>
                              ) : null}
                            </Box>
                          </Stack>
                        </Stack>
                      </Box>

                      {isAutomated ? (
                        <Tooltip title="Click to switch to manual" arrow>
                          <Button
                            disabled={isTogglingMode}
                            onClick={() => handleToggleChestNumberMode(event)}
                            aria-label="Switch to manual chest numbers"
                            startIcon={
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-flex",
                                  animation: isTogglingMode
                                    ? "chestModeSpin 0.75s linear infinite"
                                    : "none"
                                }}
                              >
                                <RefreshCw size={15} />
                              </Box>
                            }
                            sx={{
                              alignSelf: "flex-start",
                              borderRadius: "999px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: 12.5,
                              px: 1.5,
                              py: 0.6,
                              minHeight: 34,
                              color: "#14532d",
                              backgroundColor: "rgba(134,239,172,0.92)",
                              border: "1px solid",
                              borderColor: "rgba(74,222,128,0.85)",
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "rgba(187,247,208,0.95)",
                                boxShadow: "none"
                              },
                              "&.Mui-disabled": {
                                color: "#14532d",
                                opacity: 0.8
                              }
                            }}
                          >
                            Switch to manual
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Click to switch to automatic" arrow>
                          <Button
                            disabled={isTogglingMode}
                            onClick={() => handleToggleChestNumberMode(event)}
                            aria-label="Switch to automatic chest numbers"
                            startIcon={
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-flex",
                                  animation: isTogglingMode
                                    ? "chestModeSpin 0.75s linear infinite"
                                    : "none"
                                }}
                              >
                                <Hand size={15} />
                              </Box>
                            }
                            sx={{
                              alignSelf: "flex-start",
                              borderRadius: "999px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: 12.5,
                              px: 1.5,
                              py: 0.6,
                              minHeight: 34,
                              color: palette.text,
                              backgroundColor: "rgba(255,255,255,0.18)",
                              border: "1px solid",
                              borderColor: "rgba(255,255,255,0.35)",
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.26)",
                                boxShadow: "none"
                              },
                              "&.Mui-disabled": {
                                color: palette.text,
                                opacity: 0.8
                              }
                            }}
                          >
                            Switch to automatic
                          </Button>
                        </Tooltip>
                      )}

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
                          onClick={() => navigate(`/club/events/${eventId}/edit`)}
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
