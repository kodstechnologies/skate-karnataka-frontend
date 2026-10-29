import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem
} from "@mui/material";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Layers,
  MapPin,
  PencilLine,
  RefreshCw,
  Upload,
  UploadCloud,
  FileCheck2,
  Building2,
  X,
  File,
  Lock,
  AlertCircle
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import eventsHero from "@/assets/Events_header.jpg";
import { manualEventsApi } from "@/api/manual-events-api";
import { districtPortalApi } from "@/api/district-portal-api";
import { districtApi } from "@/api/district-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

const fmtDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtDateTime = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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

const getFileMeta = (urlOrName = "") => {
  if (!urlOrName) {
    return {
      label: "Document",
      ext: "DOC",
      icon: FileText,
      color: "#64748b",
      bg: "#f1f5f9",
      border: "#e2e8f0"
    };
  }
  const clean = String(urlOrName).split("?")[0].toLowerCase();
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";

  if (["xlsx", "xls", "csv"].includes(ext)) {
    return {
      label: "Excel Spreadsheet",
      ext: ext.toUpperCase(),
      icon: FileSpreadsheet,
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#bbf7d0"
    };
  }
  if (["pdf"].includes(ext)) {
    return {
      label: "PDF Document",
      ext: "PDF",
      icon: FileText,
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca"
    };
  }
  if (["doc", "docx"].includes(ext)) {
    return {
      label: "Word Document",
      ext: ext.toUpperCase(),
      icon: FileText,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe"
    };
  }
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return {
      label: "Image",
      ext: ext.toUpperCase(),
      icon: File,
      color: "#9333ea",
      bg: "#faf5ff",
      border: "#e9d5ff"
    };
  }
  if (["zip", "rar", "7z"].includes(ext)) {
    return {
      label: "Archive ZIP",
      ext: ext.toUpperCase(),
      icon: File,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a"
    };
  }
  return {
    label: "Document",
    ext: ext ? ext.toUpperCase() : "DOC",
    icon: FileText,
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd"
  };
};

const sectionCardStyles = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: "28px",
  border: "1px solid rgba(246, 228, 221, 0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(255,249,246,0.99) 100%)",
  boxShadow: "0 20px 60px rgba(48, 30, 24, 0.05)"
};

const disabledSectionCardStyles = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: "28px",
  border: "1px solid #cbd5e1",
  background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.04)"
};

export const ManualEventDetailPage = ({ portalMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
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

  // District identity resolution
  const member = user?.currentMember || user?.memberDetails || {};
  const [districtInfo, setDistrictInfo] = useState({
    id:
      user?.districtId ||
      member?.districtId ||
      user?.district?._id ||
      (typeof user?.district === "string" ? user?.district : null) ||
      member?.district ||
      null,
    name:
      user?.districtName ||
      user?.district?.name ||
      member?.districtName ||
      (isDistrict ? user?.name || user?.fullName : "") ||
      ""
  });

  // For Admin: fetch all districts so admin can also upload/view per district
  const [allDistricts, setAllDistricts] = useState([]);
  const [selectedAdminDistrictId, setSelectedAdminDistrictId] = useState("");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attendance upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isReuploading, setIsReuploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
    }
  };

  // If district user, ensure district info is loaded
  useEffect(() => {
    if (isDistrict && (!districtInfo.id || !districtInfo.name)) {
      districtPortalApi
        .getProfile()
        .then((res) => {
          const profile = res?.data?.data || res?.data || {};
          setDistrictInfo((prev) => ({
            id: profile.districtId || profile.district?._id || prev.id,
            name: profile.districtName || profile.name || prev.name
          }));
        })
        .catch((err) => {
          console.warn("Could not fetch district profile details:", err);
        });
    }
  }, [isDistrict, districtInfo.id, districtInfo.name]);

  // If Admin, load districts list
  useEffect(() => {
    if (isAdmin) {
      districtApi
        .getAll({ limit: 100 })
        .then((res) => {
          const list = res?.data?.data || res?.data || [];
          setAllDistricts(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.warn("Could not load districts list for admin:", err);
        });
    }
  }, [isAdmin]);

  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await manualEventsApi.getById(id);
      const data = res?.data?.data || res?.data || null;
      if (!data) throw new Error("Event details not found");
      setEvent(data);
    } catch (err) {
      console.error("Failed to load manual event details:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  // Resolved active district for attendance upload
  const activeDistrictId = isDistrict ? districtInfo.id : selectedAdminDistrictId;
  const activeDistrictName = isDistrict
    ? districtInfo.name || "District"
    : allDistricts.find((d) => String(d._id || d.id) === String(selectedAdminDistrictId))?.name || "";

  // Check if target district has already uploaded attendance
  const myAttendance = useMemo(() => {
    if (!event?.attendance || !Array.isArray(event.attendance)) return null;

    const targetId = activeDistrictId;
    const targetName = activeDistrictName;

    return event.attendance.find((item) => {
      if (targetId && item.districtId && String(item.districtId) === String(targetId)) {
        return true;
      }
      if (targetName && item.districtName) {
        const a = item.districtName.toLowerCase().replace(/district/gi, "").trim();
        const b = targetName.toLowerCase().replace(/district/gi, "").trim();
        if (a && b && (a === b || a.includes(b) || b.includes(a))) {
          return true;
        }
      }
      return false;
    });
  }, [event?.attendance, activeDistrictId, activeDistrictName]);

  // Determine if registration deadline has passed (e.g. today is 29 and register event date was 28)
  const isRegistrationClosed = useMemo(() => {
    if (!event) return false;
    if (event.status === "completed" || event.status === "cancelled") {
      return true;
    }

    const deadlineStr =
      event.registrationEndDate ||
      event.registrationEndDateTime ||
      event.endDate ||
      event.startDate;

    if (!deadlineStr) return false;

    try {
      let deadlineEndOfDay;
      const dStr =
        typeof deadlineStr === "string"
          ? deadlineStr
          : deadlineStr.toISOString?.() || String(deadlineStr);

      if (dStr.includes("T00:00:00")) {
        const [y, m, d] = dStr.split("T")[0].split("-").map(Number);
        deadlineEndOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else if (typeof deadlineStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deadlineStr.trim())) {
        const [y, m, d] = deadlineStr.trim().split("-").map(Number);
        deadlineEndOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        const d = new Date(deadlineStr);
        if (Number.isNaN(d.getTime())) return false;
        if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
          deadlineEndOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        } else {
          deadlineEndOfDay = d;
        }
      }
      return new Date() > deadlineEndOfDay;
    } catch {
      return false;
    }
  }, [
    event?.registrationEndDate,
    event?.registrationEndDateTime,
    event?.endDate,
    event?.startDate,
    event?.status
  ]);

  const handleUploadAttendance = async (e) => {
    e.preventDefault();
    if (isRegistrationClosed && !isAdmin) {
      toast.error("Registration deadline has passed. Submissions are closed.");
      return;
    }
    if (!uploadFile) {
      toast.error("Please select a document (Excel, PDF, Word, etc.) to upload");
      return;
    }

    if (isAdmin && !selectedAdminDistrictId) {
      toast.error("Please select a District before uploading");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("skaterExcelDocument", uploadFile);
      fd.append("fileName", uploadFile.name);
      if (activeDistrictId) fd.append("districtId", activeDistrictId);
      if (activeDistrictName) fd.append("districtName", activeDistrictName);
      fd.append("stateName", "Karnataka");

      const res = await manualEventsApi.uploadAttendance(id, fd);
      const updated = res?.data?.data || res?.data || null;
      if (updated) {
        setEvent(updated);
      } else {
        await fetchEventDetails();
      }

      setUploadFile(null);
      setIsReuploading(false);
      toast.success(
        myAttendance
          ? `Skater document re-uploaded successfully for ${activeDistrictName}!`
          : `Skater document uploaded successfully for ${activeDistrictName}!`
      );
    } catch (err) {
      console.error("Failed to upload skater document:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const backListPath = isDistrict
    ? "/district/manual-events"
    : isClub
      ? "/club/manual-events"
      : "/events/manual";

  const dashboardPath = isDistrict
    ? "/district/dashboard"
    : isClub
      ? "/club/dashboard"
      : "/dashboard";

  const dashboardLabel = isDistrict
    ? "District Dashboard"
    : isClub
      ? "Club Dashboard"
      : "Dashboard";

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 8, borderRadius: "28px", textAlign: "center" }}>
        <CircularProgress sx={{ color: "#f6765e", mb: 2 }} />
        <Typography variant="body1" sx={{ color: "#7f7270", fontWeight: 600 }}>
          Loading manual event details...
        </Typography>
      </Paper>
    );
  }

  if (error || !event) {
    return (
      <Paper elevation={0} sx={{ p: 5, borderRadius: "28px", textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: "16px" }}>
          {error || "Event not found"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backListPath)}
          sx={{ borderRadius: "12px", textTransform: "none", bgcolor: "#f6765e" }}
        >
          Back to Manual Events
        </Button>
      </Paper>
    );
  }

  const statusProps = getStatusBadgeProps(event.status);

  return (
    <Box sx={{ pb: 6 }} className="space-y-5">
      {/* ── Top Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "20px", md: "32px" },
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, rgba(26, 20, 19, 0.88) 0%, rgba(18, 14, 13, 0.94) 100%), url(${eventsHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          p: { xs: 3, sm: 4, md: 4.5 },
          boxShadow: "0 24px 70px rgba(0,0,0,0.18)"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 3 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              sx={{
                mb: 2,
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
                "& .MuiBreadcrumbs-li": {
                  color: "rgba(255,255,255,0.85)",
                  fontSize: { xs: 13, md: 15 }
                }
              }}
            >
              <Typography
                component={RouterLink}
                to={dashboardPath}
                sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
              >
                {dashboardLabel}
              </Typography>
              <Typography
                component={RouterLink}
                to={backListPath}
                sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
              >
                Manual Events
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {event.title || "Event Details"}
              </Typography>
            </Breadcrumbs>

            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <Chip
                label={statusProps.label}
                size="small"
                sx={{
                  backgroundColor: statusProps.bg,
                  color: statusProps.color,
                  fontWeight: 700,
                  border: `1px solid ${statusProps.border}`
                }}
              />
              {event.eventCategory && (
                <Chip
                  label={event.eventCategory}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
                />
              )}
              {event.discipline && (
                <Chip
                  label={event.discipline}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.16)", color: "white", fontWeight: 600 }}
                />
              )}
              <Chip
                label={Number(event.entryFee) > 0 ? `Entry Fee: ₹${event.entryFee}` : "Free Entry"}
                size="small"
                sx={{ backgroundColor: "rgba(246,118,94,0.3)", color: "#ffedd5", fontWeight: 700 }}
              />
            </Stack>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.6rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {event.title}
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {event.description || "Official state manual event and championship details."}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "flex-start", md: "center" },
              mt: { xs: 2, md: 0 }
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(backListPath)}
              sx={{
                height: 42,
                minHeight: 42,
                maxHeight: 42,
                px: 2.5,
                borderRadius: "14px",
                borderColor: "rgba(255,255,255,0.35)",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  transform: "translateY(-1px)"
                }
              }}
            >
              Back
            </Button>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<PencilLine size={16} />}
                onClick={() => navigate(`/events/manual/${id}/edit`)}
                sx={{
                  height: 42,
                  minHeight: 42,
                  maxHeight: 42,
                  px: 3,
                  borderRadius: "14px",
                  backgroundColor: "#f6765e",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 20px rgba(246,118,94,0.35)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#ea6b54",
                    boxShadow: "0 10px 24px rgba(246,118,94,0.45)",
                    transform: "translateY(-1px)"
                  }
                }}
              >
                Edit Event
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Main Content Grid ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
          gap: 3
        }}
      >
        {/* Left Column (8 cols): Event Overview, Schedule & Downloads */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 8" } }} className="space-y-4">
          {/* Section: Event Dates & Venue */}
          <Paper elevation={0} sx={sectionCardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2f2829", mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarDays size={20} color="#f6765e" /> Event Schedule & Location
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2.5
              }}
            >
              {/* Event Dates */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "20px",
                  backgroundColor: "rgba(246,118,94,0.04)",
                  border: "1px solid rgba(246,118,94,0.12)"
                }}
              >
                <Typography variant="caption" sx={{ color: "#9c8a85", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>
                  Event Dates
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: "#2f2829" }}>
                  {event.startDate ? fmtDate(event.startDate) : "Date TBA"}
                  {event.endDate && event.endDate !== event.startDate ? ` – ${fmtDate(event.endDate)}` : ""}
                </Typography>
                {(event.eventStartTime || event.eventEndTime) && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: "#6e605d" }}>
                    <Clock size={14} color="#f97316" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {event.eventStartTime || ""}{event.eventStartTime && event.eventEndTime ? " – " : ""}{event.eventEndTime || ""}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Registration Dates */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "20px",
                  backgroundColor: "rgba(246,118,94,0.04)",
                  border: "1px solid rgba(246,118,94,0.12)"
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#9c8a85", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                    Registration Window
                  </Typography>
                  {isRegistrationClosed ? (
                    <Chip
                      size="small"
                      label="Closed"
                      sx={{
                        height: 20,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        bgcolor: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca"
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Open"
                      sx={{
                        height: 20,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        bgcolor: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #bbf7d0"
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 800, color: "#2f2829" }}>
                  {event.registrationStartDate ? fmtDate(event.registrationStartDate) : "Open"}
                  {event.registrationEndDate ? ` to ${fmtDate(event.registrationEndDate)}` : ""}
                </Typography>
                <Typography variant="caption" sx={{ color: "#7f7270", display: "block", mt: 1 }}>
                  Entry Fee: {Number(event.entryFee) > 0 ? `₹${event.entryFee}` : "Free"}
                </Typography>
              </Box>

              {/* Address / Venue */}
              {event.address && (
                <Box
                  sx={{
                    gridColumn: { sm: "span 2" },
                    p: 2.5,
                    borderRadius: "20px",
                    backgroundColor: "#fdfbf9",
                    border: "1px solid #f0e6e0"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#9c8a85", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>
                    Venue / Address
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <MapPin size={18} color="#f6765e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", lineHeight: 1.6 }}>
                      {event.address}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Section: Official Event Downloads */}
          <Paper elevation={0} sx={sectionCardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2f2829", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Download size={20} color="#f6765e" /> Official Event Documents
            </Typography>
            <Typography variant="body2" sx={{ color: "#7f7270", mb: 2.5 }}>
              Download the official competition circular guidelines and the standard Excel registration template.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Circular PDF */}
              {event.circularDocument ? (
                <Button
                  component="a"
                  href={event.circularDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "18px",
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "#ebdcd5",
                    color: "#2f2829",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 1.5,
                    "&:hover": { borderColor: "#f6765e", backgroundColor: "#fff5f2" }
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Official Circular PDF
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9c8a85" }}>
                      Click to download & view guidelines
                    </Typography>
                  </Box>
                </Button>
              ) : (
                <Box sx={{ flex: 1, p: 2, borderRadius: "18px", border: "1px dashed #e0d5ce", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#a1938f" }}>
                    No circular PDF attached yet
                  </Typography>
                </Box>
              )}

              {/* Excel Template */}
              {event.excelTemplate ? (
                <Button
                  component="a"
                  href={event.excelTemplate}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<FileSpreadsheet size={18} />}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "18px",
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#16a34a",
                    color: "white",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 1.5,
                    boxShadow: "0 8px 20px rgba(22, 163, 74, 0.25)",
                    "&:hover": { backgroundColor: "#15803d" }
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Skater Excel Template
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Download template to fill district skaters
                    </Typography>
                  </Box>
                </Button>
              ) : (
                <Box sx={{ flex: 1, p: 2, borderRadius: "18px", border: "1px dashed #e0d5ce", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#a1938f" }}>
                    No Excel template attached yet
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Section: All District Attendance Submissions (For Admin only) */}
          {isAdmin && (
            <Paper elevation={0} sx={sectionCardStyles}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#2f2829", display: "flex", alignItems: "center", gap: 1 }}>
                    <FileCheck2 size={20} color="#f6765e" /> District Skater Submissions
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#7f7270" }}>
                    {event.attendance?.length || 0} district{event.attendance?.length !== 1 ? "s" : ""} submitted registration sheets
                  </Typography>
                </Box>

                <Chip
                  label={`${event.attendance?.length || 0} Submissions`}
                  size="small"
                  sx={{ bgcolor: "#f1f5f9", fontWeight: 700 }}
                />
              </Stack>

              {!event.attendance || event.attendance.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, px: 2, borderRadius: "18px", bgcolor: "#fdfbfa" }}>
                  <Typography variant="body2" sx={{ color: "#9c8a85", fontWeight: 600 }}>
                    No district has uploaded skater attendance documents yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: "16px", border: "1px solid #f2e7e1" }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#faf7f5" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: "#2f2829" }}>District Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#2f2829" }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#2f2829" }}>Submitted On</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#2f2829" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {event.attendance.map((att, idx) => {
                        const isMyDistrict =
                          (activeDistrictId && att.districtId && String(att.districtId) === String(activeDistrictId)) ||
                          (activeDistrictName && att.districtName && (
                            att.districtName.toLowerCase().replace(/district/gi, "").trim() ===
                            activeDistrictName.toLowerCase().replace(/district/gi, "").trim()
                          ));

                        const meta = getFileMeta(att.fileName || att.skaterExcelDocument);
                        const IconComp = meta.icon;

                        return (
                          <TableRow key={idx} sx={{ bgcolor: isMyDistrict ? "rgba(246,118,94,0.04)" : "inherit" }}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {att.districtName || att.stateName || "District Submission"}
                              {isMyDistrict && (
                                <Chip
                                  label={isDistrict ? "Your District" : "Selected District"}
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    height: 20,
                                    fontSize: "0.65rem",
                                    bgcolor: "#ffedd5",
                                    color: "#c2410c",
                                    fontWeight: 700
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <Chip
                                  icon={<IconComp size={12} color={meta.color} />}
                                  label={meta.ext || "DOC"}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "0.7rem",
                                    fontWeight: 800,
                                    bgcolor: meta.bg,
                                    color: meta.color,
                                    border: `1px solid ${meta.border}`,
                                    "& .MuiChip-icon": { ml: 0.5 }
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    maxWidth: 140,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: { xs: "none", sm: "inline-block" }
                                  }}
                                >
                                  {att.fileName || meta.label}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ color: "#7f7270", fontSize: "0.8rem" }}>
                              {att.uploadedAt ? fmtDateTime(att.uploadedAt) : "—"}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                component="a"
                                href={att.skaterExcelDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                variant="outlined"
                                startIcon={<Download size={13} />}
                                sx={{
                                  borderRadius: "8px",
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  py: 0.3,
                                  px: 1.2,
                                  borderColor: meta.border || "#e0d5ce",
                                  color: meta.color || "#16a34a",
                                  "&:hover": {
                                    borderColor: meta.color,
                                    bgcolor: meta.bg || "#f0fdf4"
                                  }
                                }}
                              >
                                Download / View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}
        </Box>

        {/* Right Column (4 cols): District Document Upload & Attendance Submission Card */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 4" } }} className="space-y-4">
          <Paper elevation={0} sx={isRegistrationClosed ? disabledSectionCardStyles : sectionCardStyles}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }} flexWrap="wrap" gap={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: isRegistrationClosed ? "#64748b" : "#2f2829",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <UploadCloud size={20} color={isRegistrationClosed ? "#94a3b8" : "#f6765e"} /> District Skater Submission
              </Typography>
              {isRegistrationClosed && (
                <Chip
                  size="small"
                  icon={<Lock size={12} color="#64748b" />}
                  label="Closed"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    bgcolor: "#e2e8f0",
                    color: "#475569",
                    border: "1px solid #cbd5e1"
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              sx={{ color: isRegistrationClosed ? "#94a3b8" : "#7f7270", display: "block", mb: 2 }}
            >
              {isRegistrationClosed
                ? "The registration deadline has passed. Submissions and revisions are closed."
                : "Upload your district's filled skater registration document (Excel, PDF, Word, etc.) for this competition."}
            </Typography>

            {/* Registration Deadline Alert Banner */}
            {isRegistrationClosed && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: "14px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.2
                }}
              >
                <Clock size={18} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>
                    Registration Closed
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.75rem", lineHeight: 1.4 }}>
                    Deadline ended on{" "}
                    <strong>
                      {fmtDate(event.registrationEndDate || event.registrationEndDateTime || event.endDate || event.startDate) || "deadline"}
                    </strong>
                    . District skater submissions are disabled.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Admin: District Selector */}
            {isAdmin && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select District"
                  value={selectedAdminDistrictId}
                  onChange={(e) => {
                    setSelectedAdminDistrictId(e.target.value);
                    setIsReuploading(false);
                    setUploadFile(null);
                  }}
                  helperText={
                    isRegistrationClosed
                      ? "Viewing district submissions (Registration window closed)"
                      : "Choose which district this submission belongs to"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      bgcolor: "white"
                    }
                  }}
                >
                  <MenuItem value="">-- Select District --</MenuItem>
                  {allDistricts.map((d) => (
                    <MenuItem key={d._id || d.id} value={d._id || d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}

            {/* District Member Indicator */}
            {isDistrict && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: "14px",
                  bgcolor: isRegistrationClosed ? "#ffffff" : "rgba(246,118,94,0.06)",
                  border: isRegistrationClosed ? "1px solid #e2e8f0" : "1px solid rgba(246,118,94,0.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2
                }}
              >
                <Building2 size={18} color={isRegistrationClosed ? "#94a3b8" : "#f6765e"} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isRegistrationClosed ? "#94a3b8" : "#9c8a85",
                      display: "block",
                      fontSize: "0.72rem"
                    }}
                  >
                    {isRegistrationClosed ? "Registered District" : "Submitting for District"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: isRegistrationClosed ? "#475569" : "#2f2829" }}
                  >
                    {activeDistrictName || "Your District"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Existing District Submission Status */}
            {myAttendance && !isReuploading ? (
              (() => {
                const attMeta = getFileMeta(myAttendance.fileName || myAttendance.skaterExcelDocument);
                const attDocName = myAttendance.fileName || (myAttendance.skaterExcelDocument ? myAttendance.skaterExcelDocument.split("/").pop() : "Skater Registration Document");

                return (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "20px",
                      bgcolor: isRegistrationClosed ? "#ffffff" : "#f0fdf4",
                      border: isRegistrationClosed ? "1px solid #cbd5e1" : "1px solid #bbf7d0",
                      mb: 2.5
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircle2
                        size={24}
                        color={isRegistrationClosed ? "#94a3b8" : "#16a34a"}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: isRegistrationClosed ? "#475569" : "#15803d"
                            }}
                          >
                            {isRegistrationClosed ? "Document Submitted (Locked)" : "Document Submitted"}
                          </Typography>
                          <Chip
                            size="small"
                            label={attMeta.ext || "FILE"}
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              bgcolor: isRegistrationClosed ? "#f1f5f9" : attMeta.bg,
                              color: isRegistrationClosed ? "#64748b" : attMeta.color,
                              border: `1px solid ${isRegistrationClosed ? "#e2e8f0" : attMeta.border}`
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: isRegistrationClosed ? "#334155" : "#166534",
                            wordBreak: "break-all",
                            mb: 0.5
                          }}
                        >
                          {attDocName}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ color: isRegistrationClosed ? "#64748b" : "#166534", display: "block" }}
                        >
                          District: <strong>{myAttendance.districtName || activeDistrictName}</strong>
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: isRegistrationClosed ? "#64748b" : "#166534", display: "block" }}
                        >
                          Uploaded: {fmtDateTime(myAttendance.uploadedAt)}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                          <Button
                            component="a"
                            href={myAttendance.skaterExcelDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="contained"
                            startIcon={<Download size={13} />}
                            sx={{
                              bgcolor: isRegistrationClosed ? "#64748b" : "#16a34a",
                              color: "white",
                              borderRadius: "10px",
                              textTransform: "none",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              "&:hover": {
                                bgcolor: isRegistrationClosed ? "#475569" : "#15803d"
                              }
                            }}
                          >
                            Download / View
                          </Button>
                          {isRegistrationClosed ? (
                            <Tooltip title="Registration closed. Submissions can no longer be replaced.">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled
                                  startIcon={<RefreshCw size={13} />}
                                  sx={{
                                    borderColor: "#e2e8f0 !important",
                                    color: "#94a3b8 !important",
                                    bgcolor: "#f8fafc",
                                    borderRadius: "10px",
                                    textTransform: "none",
                                    fontSize: "0.78rem",
                                    fontWeight: 700
                                  }}
                                >
                                  Replace File (Locked)
                                </Button>
                              </span>
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RefreshCw size={13} />}
                              onClick={() => setIsReuploading(true)}
                              sx={{
                                borderColor: "#16a34a",
                                color: "#16a34a",
                                borderRadius: "10px",
                                textTransform: "none",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                "&:hover": { bgcolor: "#dcfce7" }
                              }}
                            >
                              Replace File
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                );
              })()
            ) : null}

            {/* When registration is closed and no document was submitted */}
            {isRegistrationClosed && !myAttendance && (
              <Box
                sx={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "20px",
                  p: 3.5,
                  textAlign: "center",
                  bgcolor: "#ffffff",
                  cursor: "not-allowed"
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: "#f1f5f9",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5
                  }}
                >
                  <Lock size={24} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>
                  Submission Window Closed
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5, mb: 2 }}>
                  Registration ended on{" "}
                  <strong>
                    {fmtDate(event.registrationEndDate || event.registrationEndDateTime || event.endDate || event.startDate) || "deadline"}
                  </strong>
                  . Skater submissions are no longer accepted.
                </Typography>
                <Button
                  fullWidth
                  disabled
                  variant="contained"
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.2,
                    bgcolor: "#e2e8f0 !important",
                    color: "#94a3b8 !important",
                    boxShadow: "none"
                  }}
                >
                  Submissions Disabled
                </Button>
              </Box>
            )}

            {/* Upload Form (Shown only if registration is open AND (not submitted yet OR isReuploading)) */}
            {!isRegistrationClosed && (!myAttendance || isReuploading) && (
              <Box component="form" onSubmit={handleUploadAttendance} className="space-y-3">
                {isReuploading && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#c2410c" }}>
                      Replacing previous submission
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setIsReuploading(false);
                        setUploadFile(null);
                      }}
                      sx={{ fontSize: "0.72rem", textTransform: "none", color: "#7f7270" }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}

                {/* File Dropzone / Select */}
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: "2px dashed",
                    borderColor: isDragging
                      ? "#f6765e"
                      : uploadFile
                        ? "#16a34a"
                        : "#ebdcd5",
                    borderRadius: "20px",
                    p: 3,
                    textAlign: "center",
                    bgcolor: isDragging
                      ? "rgba(246,118,94,0.08)"
                      : uploadFile
                        ? "#f0fdf4"
                        : "#ffffff",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#f6765e", backgroundColor: "#fffcfb" }
                  }}
                  onClick={() => document.getElementById("attendance-document-input")?.click()}
                >
                  <input
                    id="attendance-document-input"
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadFile ? (
                    (() => {
                      const selMeta = getFileMeta(uploadFile.name);
                      const SelIcon = selMeta.icon;
                      return (
                        <Box>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "14px",
                              bgcolor: selMeta.bg || "rgba(22,163,74,0.12)",
                              color: selMeta.color || "#16a34a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 1.5
                            }}
                          >
                            <SelIcon size={24} />
                          </Box>
                          <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center" sx={{ mb: 0.5 }}>
                            <Chip
                              label={selMeta.ext}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                bgcolor: selMeta.bg,
                                color: selMeta.color,
                                border: `1px solid ${selMeta.border}`
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {uploadFile.name}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ color: "#7f7270", display: "block" }}>
                            {(uploadFile.size / 1024).toFixed(1)} KB — Click to change file
                          </Typography>
                        </Box>
                      );
                    })()
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          bgcolor: "rgba(246,118,94,0.12)",
                          color: "#f6765e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 1.5
                        }}
                      >
                        <UploadCloud size={24} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2f2829" }}>
                        Choose Skater Document
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9c8a85", display: "block", mt: 0.5, mb: 1 }}>
                        Click or drag & drop file here
                      </Typography>
                      <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        {["XLSX", "PDF"].map((fmt) => (
                          <Chip
                            key={fmt}
                            label={fmt}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              bgcolor: "#f1f5f9",
                              color: "#64748b"
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={uploading || !uploadFile}
                  startIcon={uploading ? <CircularProgress size={16} sx={{ color: "white" }} /> : <Upload size={16} />}
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.2,
                    bgcolor: "#f6765e",
                    boxShadow: "0 8px 20px rgba(246,118,94,0.35)",
                    "&:hover": { bgcolor: "#ea6b54" }
                  }}
                >
                  {uploading
                    ? "Uploading Document..."
                    : isReuploading
                      ? "Submit Revised Document"
                      : "Upload District Skaters Document"}
                </Button>
              </Box>
            )}

            {/* Helpful Guide */}
            <Divider sx={{ my: 2.5, borderColor: isRegistrationClosed ? "#e2e8f0" : "rgba(246,228,221,0.7)" }} />
            <Typography
              variant="caption"
              sx={{
                color: isRegistrationClosed ? "#94a3b8" : "#9c8a85",
                lineHeight: 1.5,
                display: "block"
              }}
            >
              {isRegistrationClosed ? (
                <>
                  🔒 <strong>Registration Closed:</strong> The deadline for district skater entries has passed. File uploads and replacements are disabled.
                </>
              ) : (
                <>
                  💡 <strong>Flexible formats:</strong> You can upload an Excel spreadsheet, PDF document, Word document, or scanned entry form containing your district's skater entries before the registration deadline.
                </>
              )}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ManualEventDetailPage;
