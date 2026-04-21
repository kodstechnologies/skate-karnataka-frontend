import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import eventsHero from "@/assets/Events_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useEventsStore } from "@/features/admin/events/store/events-store";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatCurrency = (value) => {
  if (!value) {
    return "Free";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

const formatScope = (eventType) => {
  if (!eventType) {
    return "-";
  }
  return `${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const events = useEventsStore((state) => state.events);
  const deleteEvent = useEventsStore((state) => state.deleteEvent);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return events;
    }

    return events.filter((event) =>
      [
        event.title,
        event.description,
        event.address,
        event.eventType,
        event.eventFor,
        event.status,
        event.price
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [events, searchTerm]);

  const paginatedEvents = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredEvents.slice(start, start + rowsPerPage);
  }, [filteredEvents, page, rowsPerPage]);

  const handleDelete = () => {
    if (!pendingDeleteEvent) {
      return;
    }

    deleteEvent(pendingDeleteEvent.id);
    setPendingDeleteEvent(null);
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
                label={`${events.length} Total`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${events.filter((event) => event.status === "public").length} Public`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${events.filter((event) => event.status === "draft").length} Draft`}
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
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
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
          {paginatedEvents.length > 0 ? (
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
              {paginatedEvents.map((event) => (
                <Paper
                  key={event.id}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,250,248,1) 100%)",
                    boxShadow: "0 20px 50px rgba(56, 36, 29, 0.08)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(56, 36, 29, 0.12)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      position: "relative",
                      background: event.coverImage?.dataUrl
                        ? `linear-gradient(180deg, rgba(24,18,18,0.14) 0%, rgba(24,18,18,0.56) 100%), url("${event.coverImage.dataUrl}")`
                        : `linear-gradient(180deg, rgba(24,18,18,0.18) 0%, rgba(24,18,18,0.46) 100%), url("${eventsHero}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ position: "absolute", top: 12, left: 12 }}
                    >
                      <Chip
                        size="small"
                        label={event.status === "public" ? "Public" : "Draft"}
                        sx={{
                          backgroundColor: event.status === "public" ? "#22c55e" : "#8b7e7a",
                          color: "white",
                          fontWeight: 700
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${formatScope(event.eventType)} • ${event.eventFor || "-"}`}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.86)",
                          color: "#473e3c",
                          fontWeight: 700
                        }}
                      />
                    </Stack>
                  </Box>

                  <Stack spacing={1.35} sx={{ p: 2.25 }}>
                    <Typography
                      sx={{ fontSize: 19, fontWeight: 800, color: "#2f2829", lineHeight: 1.3 }}
                    >
                      {event.title}
                    </Typography>
                    <Typography sx={{ color: "#7e716d", lineHeight: 1.7, minHeight: 52 }}>
                      {event.description || "No description provided."}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <FmdGoodOutlinedIcon sx={{ fontSize: 18, color: "#f6765e", flexShrink: 0 }} />
                      <Typography
                        sx={{
                          color: "#5f5552",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {event.address || "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <EventAvailableOutlinedIcon
                        sx={{ fontSize: 18, color: "#f6765e", flexShrink: 0 }}
                      />
                      <Typography sx={{ color: "#5f5552" }}>
                        {formatScope(event.eventType)}: {event.eventFor || "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#f6765e" }} />
                      <Typography sx={{ color: "#5f5552" }}>
                        {formatDateTime(event.registrationStartDateTime)} -{" "}
                        {formatDateTime(event.eventEndDateTime)}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      sx={{ pt: 0.75, justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <PaidOutlinedIcon sx={{ fontSize: 18, color: "#f6765e" }} />
                        <Typography sx={{ color: "#2f2829", fontWeight: 700 }}>
                          {formatCurrency(event.price)}
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label={formatDateTime(event.eventStartDateTime)}
                        sx={{ backgroundColor: "#fff1eb", color: "#f6765e", fontWeight: 700 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PencilLine size={16} />}
                        onClick={() => navigate(`/events/${event.id}/edit`)}
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
          count={filteredEvents.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 9, 12]}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteEvent)}
        title="Delete event"
        itemLabel={pendingDeleteEvent?.title}
        description="This event will be permanently removed. You can’t undo this action."
        onClose={() => setPendingDeleteEvent(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
