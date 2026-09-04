import { useCallback, useEffect, useRef, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trophy
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "@/assets/karnataka-roller-skating-logo.png";
import heroImage from "@/assets/Skating_header.jpg";
import { authApi } from "@/api/auth-api";
import { eventsApi } from "@/api/events-api";
import { SkaterEventRegister } from "@/features/admin/dev-test/components/SkaterEventRegister";

const BRAND = "#f6765e";
const SESSION_KEY = "krsa-dev-test-skater";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

const unwrapError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const unwrapLoginPayload = (response) => response?.data ?? response ?? {};

const unwrapVerifyResult = (response) =>
  unwrapLoginPayload(response)?.result ?? unwrapLoginPayload(response);

const unwrapEvents = (response) => {
  const body = unwrapLoginPayload(response);
  if (Array.isArray(body)) return { items: body, total: body.length };
  if (Array.isArray(body?.data)) {
    return { items: body.data, total: body.total ?? body.data.length };
  }
  return { items: [], total: 0 };
};

const normalizeRole = (value) => String(value || "").trim().toLowerCase();

const fmtDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtTime = (value) => {
  if (!value) return null;
  try {
    let date;
    if (value.includes(":") && !value.includes("T")) {
      const [hours, minutes] = value.split(":");
      date = new Date();
      date.setHours(Number(hours), Number(minutes), 0, 0);
    } else {
      date = new Date(value);
    }
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
      .format(date)
      .toUpperCase();
  } catch {
    return value;
  }
};

const statusLabel = (status) => {
  if (status === "coming_soon") return "Coming soon";
  if (status === "active") return "Active";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return status || "Unknown";
};

const statusColor = (status) => {
  if (status === "active") return "#22c55e";
  if (status === "coming_soon") return "#f59e0b";
  if (status === "cancelled") return "#ef4444";
  if (status === "completed") return "#3b82f6";
  return "#8b7e7a";
};

const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

const categoryNames = (event) => {
  const list = Array.isArray(event?.skatingEventCategories) ? event.skatingEventCategories : [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.typeName || item?.name || ""))
    .filter(Boolean);
};

export const DevTestPage = () => {
  const otpRefs = useRef([]);
  const [step, setStep] = useState(() => (loadSession()?.accessToken ? "events" : "login"));
  const [identifier, setIdentifier] = useState(() => loadSession()?.identifier || "");
  const [userId, setUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState(() => loadSession());
  const [children, setChildren] = useState([]);
  const [parentName, setParentName] = useState("");
  const [events, setEvents] = useState([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsError, setEventsError] = useState("");
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const otpValue = otpDigits.join("");

  const fetchEvents = useCallback(async (token) => {
    setEventsLoading(true);
    setEventsError("");
    try {
      const response = await eventsApi.getSkaterEvents(token, { page: 1, limit: 100 });
      const { items, total } = unwrapEvents(response);
      setEvents(items);
      setEventsTotal(total);
    } catch (error) {
      setEvents([]);
      setEventsTotal(0);
      setEventsError(unwrapError(error, "Could not load events"));
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const enterSkaterSession = useCallback(
    async (result, extra = {}) => {
      const nextSession = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.userId,
        role: result.role,
        krsaId: result.krsaId || extra.krsaId || "",
        identifier: extra.identifier || identifier
      };
      saveSession(nextSession);
      setSession(nextSession);
      setStep("events");
      await fetchEvents(nextSession.accessToken);
    },
    [fetchEvents, identifier]
  );

  useEffect(() => {
    const existing = loadSession();
    if (!existing?.accessToken) return;
    fetchEvents(existing.accessToken);
  }, [fetchEvents]);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    const value = identifier.trim();
    if (value.length < 3) {
      toast.error("Enter email, phone, or KRSA ID");
      return;
    }

    setBusy(true);
    try {
      const response = await authApi.requestLoginOtp(value);
      const data = unwrapLoginPayload(response);
      if (!data?.id) throw new Error(response?.message || "Failed to send OTP");
      setUserId(data.id);
      setOtpDigits(["", "", "", ""]);
      setStep("otp");
      toast.success(response?.message || "OTP sent to registered email");
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (error) {
      toast.error(unwrapError(error, "Failed to send OTP"));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otpValue.length !== 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }

    setBusy(true);
    try {
      const response = await authApi.verifyLoginOtp({
        userId,
        otp: otpValue,
        firebaseTokens: null
      });
      const result = unwrapVerifyResult(response);
      const role = normalizeRole(result?.role);

      if (role === "parent") {
        const childrenResponse = await authApi.getParentChildren(result.userId || userId);
        const payload = unwrapLoginPayload(childrenResponse);
        const list = Array.isArray(payload?.createdSkaters) ? payload.createdSkaters : [];
        setChildren(list);
        setParentName(payload?.parentName || "Parent");
        setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userId: result.userId,
          role: result.role,
          krsaId: result.krsaId || "",
          identifier
        });
        setStep("children");
        toast.success("Select a skater to continue");
        return;
      }

      if (role !== "skater") {
        toast.error("This page is for skater login only");
        return;
      }

      toast.success(response?.message || "Logged in");
      await enterSkaterSession(result);
    } catch (error) {
      toast.error(unwrapError(error, "OTP verification failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleSelectChild = async (skaterId) => {
    setBusy(true);
    try {
      const response = await authApi.selectAccount({ userId: skaterId, firebaseTokens: null });
      const result = unwrapVerifyResult(response);
      if (normalizeRole(result?.role) !== "skater") {
        toast.error("Please choose a skater account");
        return;
      }
      const child = children.find((item) => String(item.skaterId) === String(skaterId));
      toast.success("Skater selected");
      await enterSkaterSession(result, { krsaId: child?.krsaId });
    } catch (error) {
      toast.error(unwrapError(error, "Could not select skater"));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setChildren([]);
    setEvents([]);
    setEventsTotal(0);
    setEventsError("");
    setSelectedEvent(null);
    setUserId("");
    setOtpDigits(["", "", "", ""]);
    setStep("login");
  };

  const handleOtpChange = (event, index) => {
    const char = event.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    if (char && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg,#fcf8f6 0%,#f5efeb 100%)",
        color: "#2f2829"
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: "1px solid rgba(244,228,221,0.95)",
          background: "rgba(252,248,246,0.92)",
          backdropFilter: "blur(12px)"
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: { xs: 2, md: 4 }, py: 1.25, maxWidth: 1380, mx: "auto" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              component="img"
              src={logo}
              alt="KRSA"
              sx={{ width: 42, height: 42, objectFit: "contain" }}
            />
            <Box>
              <Typography sx={{ fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Skater login
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>Dev / test events</Typography>
            </Box>
          </Stack>
          {session?.accessToken && step === "events" ? (
            <Button
              size="small"
              startIcon={<LogOut size={14} />}
              onClick={handleLogout}
              sx={{ color: "#2f2829", textTransform: "none", fontWeight: 700 }}
            >
              Log out
            </Button>
          ) : (
            <Chip
              icon={<ShieldCheck size={14} />}
              label="Skater OTP login"
              sx={{ color: "#2f2829", backgroundColor: "rgba(246,118,94,0.16)", fontWeight: 700 }}
            />
          )}
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Box sx={{ mx: "auto", width: "100%", maxWidth: 1380 }} className="space-y-5">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4.5 },
              minHeight: { xs: 200, md: 230 },
              borderRadius: "32px",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.7)",
              background: `linear-gradient(90deg, rgba(20, 17, 20, 0.86) 0%, rgba(20, 17, 20, 0.58) 44%, rgba(20, 17, 20, 0.22) 100%), url("${heroImage}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              color: "white"
            }}
          >
            <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
              <Breadcrumbs
                separator={<ChevronRight size={14} />}
                sx={{
                  "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.5)" },
                  "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.8)", fontSize: 14 }
                }}
              >
                <Typography sx={{ color: "inherit", fontWeight: 600 }}>Admin panel</Typography>
                <Typography sx={{ color: "white", fontWeight: 700 }}>Dev / Test</Typography>
              </Breadcrumbs>
              <Box sx={{ maxWidth: 680 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "rgba(246,118,94,0.95)",
                    mb: 1
                  }}
                >
                  {step === "events" ? "Skater session" : "Use existing login API"}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1.5 }}>
                  {step === "events"
                    ? selectedEvent
                      ? "Register for event"
                      : "Your events"
                    : "Skater login"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75, maxWidth: 560 }}>
                  {step === "events"
                    ? selectedEvent
                      ? "Choose skating type, age group, then category, and register."
                      : "Click an event to register: skating category → age → category."
                    : "Sign in with email, phone, or KRSA ID. After OTP, this page lists the skater’s events."}
                </Typography>
              </Box>
              {session?.krsaId ? (
                <Chip
                  label={session.krsaId}
                  sx={{ alignSelf: "flex-start", color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
                />
              ) : null}
            </Stack>
          </Paper>

          {step === "login" || step === "otp" ? (
            <Paper
              elevation={0}
              component="form"
              onSubmit={step === "login" ? handleRequestOtp : handleVerifyOtp}
              sx={{
                maxWidth: 560,
                borderRadius: "28px",
                border: "1px solid rgba(255,255,255,0.7)",
                overflow: "hidden"
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
                  {step === "login" ? "Enter skater identifier" : "Enter OTP"}
                </Typography>
                <Typography sx={{ mt: 0.5, color: "#8d7f7b" }}>
                  {step === "login"
                    ? "Same login API as the mobile app: email, 10-digit phone, or KRSA ID."
                    : `4-digit OTP sent for ${identifier}`}
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={2.5} sx={{ p: 3 }}>
                {step === "login" ? (
                  <TextField
                    label="Email / phone / KRSA ID"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    autoComplete="username"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Mail size={16} style={{ marginRight: 8, color: "#b19f99" }} />
                        )
                      }
                    }}
                    sx={inputStyles}
                  />
                ) : (
                  <Stack direction="row" spacing={1.25} onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <TextField
                        key={index}
                        inputRef={(node) => {
                          otpRefs.current[index] = node;
                        }}
                        value={digit}
                        onChange={(event) => handleOtpChange(event, index)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        inputProps={{
                          maxLength: 1,
                          inputMode: "numeric",
                          style: { textAlign: "center", fontSize: "1.35rem", fontWeight: 800 }
                        }}
                        sx={{
                          width: 64,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "14px",
                            height: 56,
                            backgroundColor: digit ? alpha("#2e7d32", 0.06) : "#fbf6f4"
                          }
                        }}
                      />
                    ))}
                  </Stack>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LogIn size={16} />}
                    sx={{ backgroundColor: BRAND, "&:hover": { backgroundColor: "#ea6b54" } }}
                  >
                    {step === "login" ? "Send OTP" : "Verify & show events"}
                  </Button>
                  {step === "otp" ? (
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={busy}
                      onClick={() => {
                        setStep("login");
                        setOtpDigits(["", "", "", ""]);
                      }}
                    >
                      Change identifier
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          {step === "children" ? (
            <Paper
              elevation={0}
              sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Choose a skater
                </Typography>
                <Typography sx={{ mt: 0.5, color: "#8d7f7b" }}>
                  {parentName} — this login is a parent account. Pick a child to load events.
                </Typography>
              </Box>
              <Divider />
              <Stack divider={<Divider />} sx={{ px: 1.5, py: 1 }}>
                {children.length === 0 ? (
                  <Box sx={{ p: 4, color: "#8d7f7b", textAlign: "center" }}>
                    No skater children found for this parent.
                  </Box>
                ) : (
                  children.map((child) => (
                    <Stack
                      key={child.skaterId}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ px: 1.5, py: 1.75 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={child.photo || undefined} sx={{ width: 44, height: 44 }}>
                          {(child.skaterName || "S").slice(0, 1)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{child.skaterName || "Skater"}</Typography>
                          <Typography sx={{ color: "#8d7f7b", fontSize: 13 }}>
                            {child.krsaId || "No KRSA ID"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        variant="contained"
                        disabled={busy}
                        onClick={() => handleSelectChild(child.skaterId)}
                        sx={{ backgroundColor: BRAND, "&:hover": { backgroundColor: "#ea6b54" } }}
                      >
                        Continue
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>
            </Paper>
          ) : null}

          {step === "events" && selectedEvent ? (
            <SkaterEventRegister
              event={selectedEvent}
              token={session?.accessToken}
              onBack={() => setSelectedEvent(null)}
              onRegistered={async () => {
                setSelectedEvent(null);
                if (session?.accessToken) await fetchEvents(session.accessToken);
              }}
            />
          ) : null}

          {step === "events" && !selectedEvent ? (
            <Paper
              elevation={0}
              sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
            >
              <Box sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
                      All events
                    </Typography>
                    <Typography sx={{ color: "#8d7f7b", fontSize: 14 }}>
                      {eventsLoading
                        ? "Loading events…"
                        : `${eventsTotal} event${eventsTotal === 1 ? "" : "s"} for this skater`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={16} />}
                    disabled={eventsLoading || !session?.accessToken}
                    onClick={() => fetchEvents(session.accessToken)}
                    sx={{ textTransform: "none" }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Box>
              <Divider />

              {eventsLoading ? (
                <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
                  <CircularProgress sx={{ color: BRAND }} />
                </Box>
              ) : eventsError ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <Typography color="error">{eventsError}</Typography>
                  <Button sx={{ mt: 2 }} onClick={() => fetchEvents(session.accessToken)}>
                    Retry
                  </Button>
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ p: 5, textAlign: "center", color: "#8d7f7b" }}>
                  No events found for this skater.
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2.5,
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
                    const eventId = event._id || event.id;
                    const text = event.textColor || "#ffffff";
                    const muted = event.textColor ? `${event.textColor}b8` : "rgba(255,255,255,0.78)";
                    const timeLabel =
                      event.eventStartTime &&
                      `${fmtTime(event.eventStartTime)}${
                        event.eventEndTime ? ` – ${fmtTime(event.eventEndTime)}` : ""
                      }`;
                    const names = categoryNames(event);

                    return (
                      <Paper
                        key={eventId}
                        elevation={0}
                        onClick={() => setSelectedEvent(event)}
                        sx={{
                          borderRadius: "24px",
                          overflow: "hidden",
                          background: `linear-gradient(145deg, ${event.colorOne || "#141012"} 0%, ${
                            event.colorTwo || "#2a2224"
                          } 100%)`,
                          color: text,
                          minHeight: 280,
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: "0 24px 56px rgba(0, 0, 0, 0.2)"
                          }
                        }}
                      >
                        <Stack direction="row" spacing={0.75} useFlexGap sx={{ px: 2.25, pt: 2, flexWrap: "wrap" }}>
                          <Chip
                            size="small"
                            label={statusLabel(event.status)}
                            sx={{ backgroundColor: statusColor(event.status), color: "white", fontWeight: 700 }}
                          />
                          {event.eventType ? (
                            <Chip
                              size="small"
                              label={event.eventType}
                              sx={{ color: text, backgroundColor: "rgba(255,255,255,0.14)" }}
                            />
                          ) : null}
                          {event.isRegister ? (
                            <Chip
                              size="small"
                              icon={<Trophy size={12} color={text} />}
                              label="Registered"
                              sx={{ color: text, backgroundColor: "rgba(255,255,255,0.14)" }}
                            />
                          ) : null}
                        </Stack>

                        <Stack spacing={1.25} sx={{ p: 2.25, pt: 1.5, flex: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                            {event.header || "Untitled event"}
                          </Typography>
                          {event.about ? (
                            <Typography
                              sx={{
                                color: muted,
                                fontSize: 13,
                                lineHeight: 1.6,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {event.about}
                            </Typography>
                          ) : null}
                          <Stack spacing={0.75} sx={{ color: muted, fontSize: 13 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CalendarDays size={14} />
                              <span>
                                {fmtDate(event.eventStartDate)}
                                {event.eventEndDate ? ` – ${fmtDate(event.eventEndDate)}` : ""}
                              </span>
                            </Stack>
                            {timeLabel ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Clock3 size={14} />
                                <span>{timeLabel}</span>
                              </Stack>
                            ) : null}
                            {event.address ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <MapPin size={14} />
                                <span>{event.address}</span>
                              </Stack>
                            ) : null}
                          </Stack>
                          {names.length ? (
                            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
                              {names.slice(0, 4).map((name) => (
                                <Chip
                                  key={name}
                                  size="small"
                                  label={name}
                                  sx={{ color: text, backgroundColor: "rgba(255,255,255,0.12)" }}
                                />
                              ))}
                            </Stack>
                          ) : null}
                          <Typography sx={{ mt: "auto", pt: 1, fontSize: 12, fontWeight: 700, opacity: 0.85 }}>
                            {event.isRegister ? "View registration" : "Tap to register"}
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Paper>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
