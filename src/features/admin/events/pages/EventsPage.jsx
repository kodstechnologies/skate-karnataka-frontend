import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  Skeleton
} from "@mui/material";
import { ChevronRight, Hand, PencilLine, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { eventsApi } from "@/api/events-api";
import EventCardActionsMenu from "@/features/admin/events/components/EventCardActionsMenu";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { canApproveEvents, getEventApprovalChipProps } from "@/utils/eventApprovalStatus";
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

export const EventsPage = () => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const canApprove = canApproveEvents(role);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingModeId, setTogglingModeId] = useState(null);
  const searchDebounceRef = useRef(null);

  const fetchEvents = useCallback(async (search = "", currentPage = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getWebStateEvents(search, currentPage, limit);
      const payload = response?.data ?? response;

      setEvents(payload?.data || []);
      setTotalCount(payload?.pagination?.total || 0);
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
      const deletedId = pendingDeleteEvent._id || pendingDeleteEvent.id;
      setEvents((prev) => prev.filter((item) => (item._id || item.id) !== deletedId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success(message || "Event deleted successfully");
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
      toast.success("Delete request cancelled");
      fetchEvents(searchTerm, page + 1, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel delete request");
    }
  };

  const handleToggleChestNumberMode = async (event) => {
    const id = event._id || event.id;
    if (!id || togglingModeId) return;

    const nextIsAutomated = event.isAutomated === false;

    setTogglingModeId(id);
    try {
      const response = await eventsApi.updateStateChestNumberMode(id, nextIsAutomated);
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
                    border: "1px solid rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #141012 0%, #2a2224 100%)",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Stack direction="row" spacing={0.75}>
                      <Skeleton
                        variant="rounded"
                        width={92}
                        height={24}
                        sx={{ borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)" }}
                      />
                      <Skeleton
                        variant="rounded"
                        width={76}
                        height={24}
                        sx={{ borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)" }}
                      />
                    </Stack>
                    <Skeleton
                      variant="circular"
                      width={34}
                      height={34}
                      sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                    />
                  </Box>

                  <Stack spacing={1.35} sx={{ p: 2.25, pt: 0 }}>
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
              {events.map((event) => {
                const palette = getEventCardPalette(event);
                const eventId = event._id || event.id;
                const isAutomated = event.isAutomated !== false;
                const isTogglingMode = togglingModeId === eventId;

                return (
                  <Paper
                    key={eventId}
                    elevation={0}
                    sx={{
                      position: "relative",
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
                      "@keyframes chestModePulse": {
                        "0%, 100%": {
                          boxShadow: "0 0 0 0 rgba(34,197,94,0.5), 0 8px 24px rgba(0,0,0,0.25)"
                        },
                        "50%": {
                          boxShadow: "0 0 0 12px rgba(34,197,94,0), 0 8px 24px rgba(0,0,0,0.25)"
                        }
                      },
                      "@keyframes chestModeSpin": {
                        from: { transform: "rotate(0deg)" },
                        to: { transform: "rotate(360deg)" }
                      }
                    }}
                  >
                    <Tooltip
                      title={
                        isAutomated
                          ? "Automatic chest numbers — click for Manual"
                          : "Manual chest numbers — click for Automatic"
                      }
                      arrow
                      placement="left"
                    >
                      <IconButton
                        disabled={isTogglingMode}
                        onClick={() => handleToggleChestNumberMode(event)}
                        aria-label={
                          isAutomated
                            ? "Switch to manual chest numbers"
                            : "Switch to automatic chest numbers"
                        }
                        sx={{
                          position: "absolute",
                          right: 10,
                          top: "52%",
                          transform: "translateY(-50%)",
                          zIndex: 3,
                          width: 78,
                          height: 78,
                          border: "2px solid",
                          borderColor: isAutomated
                            ? "rgba(134,239,172,0.85)"
                            : "rgba(255,255,255,0.55)",
                          color: isAutomated ? "#86efac" : palette.text,
                          background: isAutomated
                            ? "linear-gradient(145deg, rgba(34,197,94,0.45), rgba(22,163,74,0.25))"
                            : "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
                          backdropFilter: "blur(8px)",
                          animation:
                            !isTogglingMode && isAutomated
                              ? "chestModePulse 2.2s ease-in-out infinite"
                              : "none",
                          transition:
                            "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
                          flexDirection: "column",
                          gap: 0.35,
                          borderRadius: "50%",
                          "&:hover": {
                            background: isAutomated
                              ? "linear-gradient(145deg, rgba(34,197,94,0.55), rgba(22,163,74,0.35))"
                              : "linear-gradient(145deg, rgba(255,255,255,0.3), rgba(255,255,255,0.12))",
                            borderColor: isAutomated ? "#bbf7d0" : "rgba(255,255,255,0.8)"
                          },
                          "&.Mui-disabled": {
                            color: isAutomated ? "#86efac" : palette.text,
                            opacity: 0.85
                          }
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            animation: isTogglingMode
                              ? "chestModeSpin 0.75s linear infinite"
                              : "none"
                          }}
                        >
                          {isAutomated ? <RefreshCw size={18} /> : <Hand size={18} />}
                        </Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "0.58rem",
                            fontWeight: 800,
                            letterSpacing: 0.2,
                            lineHeight: 1.1,
                            textTransform: "uppercase"
                          }}
                        >
                          {isAutomated ? "Automatic" : "Manual"}
                        </Typography>
                      </IconButton>
                    </Tooltip>

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
                        <Chip size="small" {...getEventApprovalChipProps(event)} />
                      </Stack>

                      <EventCardActionsMenu event={event} role={role} />
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
                        {event.header}
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

                        {event.eventStartTime && (
                          <Typography sx={{ fontSize: 13, color: palette.text, mt: 0.5 }}>
                            {fmtTime(event.eventStartTime)}
                            {event.eventEndTime && ` – ${fmtTime(event.eventEndTime)}`}
                          </Typography>
                        )}
                      </Box>

                      {(canApprove && event.adminApprovalStatus === "pending") ||
                      (canApprove && event.deleteApprovalStatus === "pending") ? (
                        <Stack direction="row" spacing={1} sx={{ pt: 0.5, display: "flex" }}>
                          {canApprove && event.adminApprovalStatus === "pending" && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApprove(event._id || event.id)}
                                sx={{ backgroundColor: "#2e7d32", flex: 1, borderRadius: "14px" }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleReject(event._id || event.id)}
                                sx={{
                                  flex: 1,
                                  borderRadius: "14px",
                                  borderColor: "rgba(255,255,255,0.35)",
                                  color: palette.text
                                }}
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
                                onClick={() => handleApproveDelete(event._id || event.id)}
                                sx={{ backgroundColor: "#c62828", flex: 1, borderRadius: "14px" }}
                              >
                                Approve delete
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRejectDelete(event._id || event.id)}
                                sx={{
                                  flex: 1,
                                  borderRadius: "14px",
                                  borderColor: "rgba(255,255,255,0.35)",
                                  color: palette.text
                                }}
                              >
                                Cancel delete
                              </Button>
                            </>
                          )}
                        </Stack>
                      ) : null}

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
                          onClick={() => navigate(`/events/${event._id || event.id}/edit`)}
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
