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
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  PencilLine,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { clubApi } from "@/api/club-api";
import { eventsApi } from "@/api/events-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";
import { canApproveEvents, getEventApprovalChipProps } from "@/utils/eventApprovalStatus";
import EventCardActionsMenu from "@/features/admin/events/components/EventCardActionsMenu";
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

const parseHexColor = (color) => {
  if (!color || typeof color !== "string") return null;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const blendHexColors = (colorA, colorB, weightB = 0.5) => {
  const a = parseHexColor(colorA);
  const b = parseHexColor(colorB);
  if (!a || !b) return null;
  return {
    r: Math.round(a.r * (1 - weightB) + b.r * weightB),
    g: Math.round(a.g * (1 - weightB) + b.g * weightB),
    b: Math.round(a.b * (1 - weightB) + b.b * weightB)
  };
};

const getRelativeLuminance = (rgb) => {
  const transform = (value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
};

const contrastRatio = (lum1, lum2) => {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

const isLightHexColor = (color) => {
  const rgb = parseHexColor(color);
  if (!rgb) return false;
  return getRelativeLuminance(rgb) > 0.62;
};

const getReadableTextOnBackground = (bgHex, preferredHex) => {
  const bgRgb = parseHexColor(bgHex);
  if (!bgRgb) return "#ffffff";

  const bgLum = getRelativeLuminance(bgRgb);
  const preferredRgb = parseHexColor(preferredHex);

  if (preferredRgb && contrastRatio(bgLum, getRelativeLuminance(preferredRgb)) >= 4.5) {
    return preferredHex;
  }

  const whiteLum = getRelativeLuminance({ r: 255, g: 255, b: 255 });
  const darkLum = getRelativeLuminance({ r: 47, g: 40, b: 41 });
  return contrastRatio(bgLum, whiteLum) >= contrastRatio(bgLum, darkLum) ? "#ffffff" : "#2f2829";
};

const getEventCardPalette = (event) => {
  const colorOne = event?.colorOne || "#141012";
  const colorTwo = event?.colorTwo || "#2a2224";
  const blended = blendHexColors(colorOne, colorTwo, 0.55);
  const bgSample = blended ? rgbToHex(blended) : colorOne;
  const isLight = isLightHexColor(colorOne) || isLightHexColor(colorTwo);
  const text = getReadableTextOnBackground(bgSample, event?.textColor);
  const textRgb = parseHexColor(text);
  const muted = textRgb
    ? `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.78)`
    : isLight
      ? "rgba(47,40,41,0.72)"
      : "rgba(255,255,255,0.78)";

  return {
    background: `linear-gradient(135deg, ${colorOne} 0%, ${colorTwo} 100%)`,
    text,
    muted,
    label: isLight ? "#f6765e" : "#f6a192",
    accent: text,
    isLight
  };
};

const actionButtonSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: "14px",
  textTransform: "none",
  fontWeight: 600,
  py: 1.1,
  boxShadow: "none"
};

const reviewButtonSx = {
  ...actionButtonSx,
  fontWeight: 700
};

const EventReviewPanel = ({ title, message, tone = "danger", onColorful = false, children }) => {
  const isDanger = tone === "danger";

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "16px",
        border: onColorful
          ? "1px solid rgba(255,255,255,0.28)"
          : isDanger
            ? "1px solid #f5c4c0"
            : "1px solid #b8e6cc",
        backgroundColor: onColorful ? "rgba(255,255,255,0.9)" : isDanger ? "#fff5f4" : "#f0fdf4",
        backdropFilter: onColorful ? "blur(8px)" : "none"
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: isDanger ? "#b42318" : "#1f7a45",
          mb: 0.5
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: isDanger ? "#7f1d1d" : "#166534",
          mb: 1.25,
          lineHeight: 1.55
        }}
      >
        {message}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, width: "100%" }}>{children}</Box>
    </Box>
  );
};

export const ClubEventsPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const role = useAuthStore((s) => s.role);
  const canApprove = canApproveEvents(role);

  const clubs = useClubsStore((s) => s.clubs);
  const clubFromStore = useMemo(() => clubs.find((c) => c.id === clubId) ?? null, [clubs, clubId]);

  const [events, setEvents] = useState([]);
  const [clubName, setClubName] = useState(clubFromStore?.name || "");
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
      if (!clubId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await clubApi.getClubEvents(clubId, {
          page: currentPage,
          limit,
          ...(search.trim() ? { search: search.trim() } : {})
        });
        const payload = response?.data ?? response;
        setEvents(payload?.data || []);
        setTotalCount(payload?.pagination?.total || 0);
        if (payload?.club?.name) {
          setClubName(payload.club.name);
        }
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to fetch club events";
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [clubId]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents(searchTerm, page + 1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, page, rowsPerPage, fetchEvents]);

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
        setEvents((prev) => prev.filter((item) => item._id !== eventId && item.id !== eventId));
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

  const displayName = clubName || clubFromStore?.name || "Club";

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
              to="/clubs"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Clubs
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
              Club Events
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
              {displayName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 620 }}>
              All events created for this club — schedules, registration windows, and status.
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
              Club-level events linked to this club.
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
            backgroundColor: "#ffffff"
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
                gap: 2,
                alignItems: "stretch"
              }}
            >
              {events.map((event) => {
                const palette = getEventCardPalette(event);
                const eventId = event._id || event.id;
                const isDeletePending = event.deleteApprovalStatus === "pending";
                const isApprovalPending = event.adminApprovalStatus === "pending";

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
                        <Chip size="small" {...getEventApprovalChipProps(event)} />
                      </Stack>
                      <EventCardActionsMenu
                        event={event}
                        role={role}
                        returnTo={`/clubs/${clubId}/events`}
                        returnLabel="Club events"
                      />
                    </Stack>

                    <Box
                      sx={{
                        px: 2.25,
                        pb: 2.25,
                        pt: 0,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0
                      }}
                    >
                      <Stack spacing={1.35} sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 19,
                            fontWeight: 800,
                            color: palette.text,
                            lineHeight: 1.3,
                            textShadow: palette.isLight ? "none" : "0 1px 10px rgba(0,0,0,0.28)"
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
                      </Stack>

                      <Stack spacing={1.25} sx={{ mt: "auto", pt: 1.5, flexShrink: 0 }}>
                        {canApprove && isApprovalPending && (
                          <EventReviewPanel
                            tone="success"
                            onColorful
                            title="Approval required"
                            message="This club event is waiting for your review."
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle2 size={16} />}
                              onClick={() => handleApprove(eventId)}
                              sx={{
                                ...reviewButtonSx,
                                backgroundColor: "#2e7d32",
                                "&:hover": { backgroundColor: "#256b2c", boxShadow: "none" }
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<XCircle size={16} />}
                              onClick={() => handleReject(eventId)}
                              sx={{
                                ...reviewButtonSx,
                                borderColor: "#d1d5db",
                                color: "#5c4f4b",
                                "&:hover": {
                                  borderColor: "#9ca3af",
                                  backgroundColor: "#f9fafb"
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </EventReviewPanel>
                        )}

                        {canApprove && isDeletePending && (
                          <EventReviewPanel
                            tone="danger"
                            onColorful
                            title="Delete request"
                            message="The club asked to remove this event. Approve to delete, or cancel to keep it live."
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle2 size={16} />}
                              onClick={() => handleApproveDelete(eventId)}
                              sx={{
                                ...reviewButtonSx,
                                backgroundColor: "#c62828",
                                color: "white",
                                "&:hover": { backgroundColor: "#b71c1c", boxShadow: "none" }
                              }}
                            >
                              Approve delete
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<XCircle size={16} />}
                              onClick={() => handleRejectDelete(eventId)}
                              sx={{
                                ...reviewButtonSx,
                                borderColor: "#d1d5db",
                                color: "#5c4f4b",
                                "&:hover": {
                                  borderColor: "#9ca3af",
                                  backgroundColor: "#f9fafb"
                                }
                              }}
                            >
                              Cancel delete
                            </Button>
                          </EventReviewPanel>
                        )}

                        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                          <Button
                            variant="outlined"
                            startIcon={<PencilLine size={16} />}
                            onClick={() =>
                              navigate(`/events/${eventId}/edit`, {
                                state: { event, fromClubId: clubId }
                              })
                            }
                            sx={{
                              ...actionButtonSx,
                              borderColor: palette.isLight
                                ? "rgba(246,118,94,0.55)"
                                : "rgba(255,255,255,0.35)",
                              color: palette.accent,
                              backgroundColor: palette.isLight
                                ? "rgba(255,255,255,0.55)"
                                : "rgba(0,0,0,0.12)",
                              "&:hover": {
                                borderColor: palette.isLight ? "#f6765e" : palette.accent,
                                backgroundColor: palette.isLight
                                  ? "rgba(246,118,94,0.08)"
                                  : "rgba(246,118,94,0.12)"
                              }
                            }}
                          >
                            Edit
                          </Button>
                          {!isDeletePending && (
                            <Button
                              variant="contained"
                              startIcon={<Trash2 size={16} />}
                              onClick={() => setPendingDeleteEvent(event)}
                              sx={{
                                ...actionButtonSx,
                                color: "#2f2829",
                                backgroundColor: "#f4a598",
                                "&:hover": {
                                  backgroundColor: "#f08f82",
                                  boxShadow: "none"
                                }
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
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
              <Stack spacing={2} sx={{ maxWidth: 420, mx: "auto", alignItems: "center" }}>
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
                <Typography
                  sx={{ fontWeight: 700, fontSize: { xs: 17, md: 18 }, color: "#5f5552" }}
                >
                  No events found for this club.
                </Typography>
                <Typography sx={{ color: "#978a86", lineHeight: 1.7, fontSize: 14 }}>
                  {searchTerm.trim()
                    ? "Try a different search term or clear the filter to see all events."
                    : "Events created for this club will appear here once they are added."}
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
