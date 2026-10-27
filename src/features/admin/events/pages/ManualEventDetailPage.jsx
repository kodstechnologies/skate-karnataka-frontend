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
  Building2
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

const sectionCardStyles = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: "28px",
  border: "1px solid rgba(246, 228, 221, 0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(255,249,246,0.99) 100%)",
  boxShadow: "0 20px 60px rgba(48, 30, 24, 0.05)"
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

  const handleUploadAttendance = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select an Excel file to upload");
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
          ? `Skater Excel document re-uploaded successfully for ${activeDistrictName}!`
          : `Skater Excel document uploaded successfully for ${activeDistrictName}!`
      );
    } catch (err) {
      console.error("Failed to upload attendance:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload Excel file");
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
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "auto" } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(backListPath)}
              sx={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "white",
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                py: 1,
                "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" }
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
                  backgroundColor: "#f6765e",
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: "0 10px 24px rgba(246,118,94,0.4)",
                  "&:hover": { backgroundColor: "#ea6b54" }
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
                <Typography variant="caption" sx={{ color: "#9c8a85", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>
                  Registration Window
                </Typography>
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

          {/* Section: All District Attendance Submissions (For Admin or Overview) */}
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
                                borderColor: "#e0d5ce",
                                color: "#16a34a",
                                "&:hover": { borderColor: "#16a34a", bgcolor: "#f0fdf4" }
                              }}
                            >
                              Download Excel
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
        </Box>

        {/* Right Column (4 cols): District Excel Upload & Attendance Submission Card */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 4" } }} className="space-y-4">
          <Paper elevation={0} sx={sectionCardStyles}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2f2829", mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
              <UploadCloud size={20} color="#f6765e" /> District Skater Submission
            </Typography>
            <Typography variant="caption" sx={{ color: "#7f7270", display: "block", mb: 2 }}>
              Upload your district's filled skater registration Excel sheet for this competition.
            </Typography>

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
                  helperText="Choose which district this sheet belongs to"
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
                  bgcolor: "rgba(246,118,94,0.06)",
                  border: "1px solid rgba(246,118,94,0.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2
                }}
              >
                <Building2 size={18} color="#f6765e" />
                <Box>
                  <Typography variant="caption" sx={{ color: "#9c8a85", display: "block", fontSize: "0.72rem" }}>
                    Submitting for District
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#2f2829" }}>
                    {activeDistrictName || "Your District"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Existing District Submission Status */}
            {myAttendance && !isReuploading ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "20px",
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  mb: 2.5
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#15803d" }}>
                      Excel Document Submitted
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#166534", display: "block", mt: 0.25 }}>
                      District: <strong>{myAttendance.districtName || activeDistrictName}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#166534", display: "block" }}>
                      Uploaded: {fmtDateTime(myAttendance.uploadedAt)}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        component="a"
                        href={myAttendance.skaterExcelDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="contained"
                        startIcon={<Download size={13} />}
                        sx={{
                          bgcolor: "#16a34a",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          "&:hover": { bgcolor: "#15803d" }
                        }}
                      >
                        Download File
                      </Button>
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
                        Re-upload Excel
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ) : null}

            {/* Upload Form (Shown if not submitted yet or if re-uploading) */}
            {(!myAttendance || isReuploading) && (
              <Box component="form" onSubmit={handleUploadAttendance} className="space-y-3">
                {isReuploading && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#c2410c" }}>
                      Overwriting previous submission
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setIsReuploading(false);
                        setUploadFile(null);
                      }}
                      sx={{ fontSize: "0.72rem", textTransform: "none", color: "#7f7270" }}
                    >
                      Cancel Re-upload
                    </Button>
                  </Stack>
                )}

                {/* File Dropzone / Select */}
                <Box
                  sx={{
                    border: "2px dashed #ebdcd5",
                    borderRadius: "20px",
                    p: 3,
                    textAlign: "center",
                    bgcolor: uploadFile ? "#f0fdf4" : "#ffffff",
                    borderColor: uploadFile ? "#16a34a" : "#ebdcd5",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#f6765e", backgroundColor: "#fffcfb" }
                  }}
                  onClick={() => document.getElementById("attendance-excel-input")?.click()}
                >
                  <input
                    id="attendance-excel-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      bgcolor: uploadFile ? "rgba(22,163,74,0.12)" : "rgba(246,118,94,0.12)",
                      color: uploadFile ? "#16a34a" : "#f6765e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1
                    }}
                  >
                    {uploadFile ? <FileSpreadsheet size={22} /> : <Upload size={22} />}
                  </Box>

                  {uploadFile ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#166534" }}>
                        {uploadFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#7f7270", display: "block", mt: 0.5 }}>
                        {(uploadFile.size / 1024).toFixed(1)} KB — Click to change file
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2f2829" }}>
                        Choose Skater Excel Document
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9c8a85", display: "block", mt: 0.5 }}>
                        Supports .xlsx, .xls, .csv up to 25MB
                      </Typography>
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
                    ? "Uploading Excel..."
                    : isReuploading
                      ? "Submit Revised Excel"
                      : "Upload District Skaters Excel"}
                </Button>
              </Box>
            )}

            {/* Helpful Guide */}
            <Divider sx={{ my: 2.5, borderColor: "rgba(246,228,221,0.7)" }} />
            <Typography variant="caption" sx={{ color: "#9c8a85", lineHeight: 1.5, display: "block" }}>
              💡 <strong>Step-by-step:</strong> First download the <strong>Skater Excel Template</strong> from the documents section, fill in all participant skater details for your district, and upload it here before the registration deadline.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ManualEventDetailPage;
