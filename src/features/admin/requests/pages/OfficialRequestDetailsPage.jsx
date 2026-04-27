import { useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Breadcrumbs,
  Grid,
  Divider,
  Button,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Avatar
} from "@mui/material";
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  Users,
  Trophy,
  Activity,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  History
} from "lucide-react";
import { useRequestsStore } from "@/features/admin/requests/store/requests-store";
import officialHero from "@/assets/Official_header.jpg";

const InfoCard = ({ icon: Icon, label, value, color = "primary.main" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "20px",
      border: "1px solid #f2dfd7",
      background: "linear-gradient(180deg, #fffdfc 0%, #fff8f5 100%)",
      height: "100%",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px rgba(48, 30, 24, 0.06)"
      }
    }}
  >
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: "14px",
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Icon size={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11,
            color: "#a28f89",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            mb: 0.5
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: "#2f2829",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {value || "-"}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const SectionTitle = ({ title, icon: Icon }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3, mt: 1 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "10px",
        bgcolor: "#f6765e",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Icon size={18} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 800, color: "#2f2829", letterSpacing: "-0.02em" }}>
      {title}
    </Typography>
  </Stack>
);

const ShimmerLoading = () => (
  <Box className="space-y-6">
    <Skeleton variant="rectangular" height={260} sx={{ borderRadius: "30px", mb: 4 }} />
    <Box sx={{ px: { xs: 2, md: 0 } }}>
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Skeleton variant="rectangular" height={90} sx={{ borderRadius: "20px" }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);

export const OfficialRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { fetchOfficialDetails, selectedOfficial, loading } = useRequestsStore();

  useEffect(() => {
    if (requestId) {
      fetchOfficialDetails(requestId);
    }
  }, [requestId, fetchOfficialDetails]);

  if (loading) return <ShimmerLoading />;

  if (!selectedOfficial) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 4, borderRadius: "28px", textAlign: "center", border: "1px solid #f2dfd7" }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Official record not found
        </Typography>
      </Paper>
    );
  }

  const official = selectedOfficial;

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          minHeight: { xs: 240, md: 280 },
          borderRadius: "35px",
          overflow: "hidden",
          position: "relative",
          mb: 4,
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.92) 0%, rgba(35,23,23,0.78) 40%, rgba(246,118,94,0.25) 100%), url("${officialHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 3,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.4)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.7)" }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/reports/official"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Official Reports
            </Typography>
            <Typography sx={{ fontWeight: 700, color: "white" }}>Details</Typography>
          </Breadcrumbs>

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Typography
                variant={isMobile ? "h4" : "h2"}
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                {official.fullName || "Unnamed Official"}
              </Typography>
              {official.verify && (
                <Chip
                  icon={<CheckCircle2 size={16} color="white" />}
                  label="Verified"
                  size="small"
                  sx={{
                    bgcolor: "#4caf50",
                    color: "white",
                    fontWeight: 700,
                    px: 0.5,
                    "& .MuiChip-icon": { color: "white" }
                  }}
                />
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1.5, color: "rgba(255,255,255,0.8)", flexWrap: "wrap" }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ShieldCheck size={18} />
                <Typography sx={{ fontWeight: 600 }}>{official.krsaId || "No KRSA ID"}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <MapPin size={18} />
                <Typography>{official.districtName || "N/A District"}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Building2 size={18} />
                <Typography>{official.clubName || "N/A Club"}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - General & Experience */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            {/* Basic Information */}
            <Box>
              <SectionTitle title="Personal Information" icon={User} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Full Name"
                    value={official.fullName}
                    icon={User}
                    color="#f6765e"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Email Address"
                    value={official.email}
                    icon={Mail}
                    color="#4a90e2"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Phone Number"
                    value={`${official.countryCode || "+91"} ${official.phone}`}
                    icon={Phone}
                    color="#50b83c"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Gender" value={official.gender} icon={User} color="#9b51e0" />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Address"
                    value={official.address}
                    icon={MapPin}
                    color="#95a5a6"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Professional Details */}
            <Box>
              <SectionTitle title="Professional Information" icon={Briefcase} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Official Role"
                    value={official.role}
                    icon={ShieldCheck}
                    color="#2ecc71"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="General Experience"
                    value={`${official.experience} Years`}
                    icon={History}
                    color="#f39c12"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Coaching"
                    value={official.coaching}
                    icon={Users}
                    color="#e67e22"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Coaching Experience"
                    value={official.coachingExperience}
                    icon={Award}
                    color="#16a085"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Officiating"
                    value={official.officiating}
                    icon={ShieldCheck}
                    color="#8e44ad"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Is Skater"
                    value={official.isSkater}
                    icon={Activity}
                    color="#27ae60"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Education & Courses */}
            <Box>
              <SectionTitle title="Training & Classes" icon={GraduationCap} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Conducting Classes"
                    value={official.conductingClasses}
                    icon={Users}
                    color="#3498db"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Technical Training"
                    value={official.technicalTrainingCourse}
                    icon={Award}
                    color="#f1c40f"
                  />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Class Details"
                    value={official.conductingClassesDetails}
                    icon={FileText}
                    color="#7f8c8d"
                  />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Skater Details"
                    value={official.skaterDetails}
                    icon={Trophy}
                    color="#c0392b"
                  />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Officiating Details"
                    value={official.officiatingDetails}
                    icon={FileText}
                    color="#2c3e50"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Documents Section */}
            <Box>
              <SectionTitle title="Documents & Certificates" icon={FileText} />
              <Grid container spacing={2}>
                {official.documents && official.documents.length > 0 ? (
                  official.documents.map((doc, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "16px",
                          border: "1px dashed #f2dfd7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#fffefd"
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: "#fff8f5",
                              color: "#f6765e",
                              borderRadius: "10px"
                            }}
                          >
                            <FileText size={20} />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {doc.name || `Document ${index + 1}`}
                          </Typography>
                        </Stack>
                        <Button
                          size="small"
                          component="a"
                          href={doc.url}
                          target="_blank"
                          sx={{
                            fontWeight: 700,
                            minWidth: "unset",
                            p: 1,
                            borderRadius: "10px",
                            bgcolor: "#f6765e15",
                            color: "#f6765e",
                            "&:hover": { bgcolor: "#f6765e25" }
                          }}
                        >
                          View
                        </Button>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: "20px",
                        border: "1px dashed #f2dfd7",
                        textAlign: "center",
                        bgcolor: "#fafafa"
                      }}
                    >
                      <Typography sx={{ color: "#a28f89" }}>No documents uploaded yet.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column - Status & Timeline */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            {/* Official Contact Info */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "30px",
                border: "1px solid #f2dfd7",
                background: "linear-gradient(180deg, #fffdfc 0%, #fff8f5 100%)",
                boxShadow: "0 16px 40px rgba(48, 30, 24, 0.04)"
              }}
            >
              <SectionTitle title="Official Contact" icon={Phone} />
              <Stack spacing={3}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#a28f89",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    Official Email
                  </Typography>
                  <Typography
                    sx={{ color: "#2f2829", fontWeight: 600, overflowWrap: "break-word" }}
                  >
                    {official.officialEmail || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#a28f89",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    Official Contact Number
                  </Typography>
                  <Typography sx={{ color: "#2f2829", fontWeight: 600 }}>
                    {official.officialContactNumber || "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* System Info */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "30px",
                border: "1px solid #f2dfd7",
                bgcolor: "white"
              }}
            >
              <SectionTitle title="Status & Timeline" icon={Calendar} />
              <Stack spacing={3}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#a28f89",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    Registration Status
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={official.isActive ? "Active" : "Inactive"}
                      sx={{
                        bgcolor: official.isActive ? "#e8f5e9" : "#ffebee",
                        color: official.isActive ? "#2e7d32" : "#c62828",
                        fontWeight: 700
                      }}
                    />
                    <Chip
                      label={official.verify ? "Verified" : "Unverified"}
                      sx={{
                        bgcolor: official.verify ? "#e3f2fd" : "#fff3e0",
                        color: official.verify ? "#1565c0" : "#ef6c00",
                        fontWeight: 700
                      }}
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#a28f89",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    Created On
                  </Typography>
                  <Typography sx={{ color: "#2f2829", fontWeight: 600 }}>
                    {official.createdAt
                      ? new Date(official.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                      : "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#a28f89",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    Last Updated
                  </Typography>
                  <Typography sx={{ color: "#2f2829", fontWeight: 600 }}>
                    {official.updatedAt
                      ? new Date(official.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                      : "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
