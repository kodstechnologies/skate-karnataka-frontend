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
  ArrowLeft,
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
  CheckCircle2
} from "lucide-react";
import { useRequestsStore } from "@/features/admin/requests/store/requests-store";
import academyHero from "@/assets/Academy_header.jpg";

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
    <Stack direction="row" spacing={2} alignItems="center">
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
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, mt: 1 }}>
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

export const AcademyRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { fetchAcademyDetails, selectedAcademy, loading } = useRequestsStore();

  useEffect(() => {
    if (requestId) {
      fetchAcademyDetails(requestId);
    }
  }, [requestId, fetchAcademyDetails]);

  if (loading) return <ShimmerLoading />;

  if (!selectedAcademy) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 4, borderRadius: "28px", textAlign: "center", border: "1px solid #f2dfd7" }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Academy record not found
        </Typography>
      </Paper>
    );
  }

  const academy = selectedAcademy;

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
          background: `linear-gradient(110deg, rgba(18,14,16,0.92) 0%, rgba(35,23,23,0.78) 40%, rgba(246,118,94,0.25) 100%), url("${academyHero}")`,
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
              to="/reports/academy"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Academy Reports
            </Typography>
            <Typography sx={{ fontWeight: 700, color: "white" }}>Details</Typography>
          </Breadcrumbs>

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Typography
                variant={isMobile ? "h4" : "h2"}
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                {academy.clubName || "Unnamed Academy"}
              </Typography>
              {academy.verify && (
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
                <Typography sx={{ fontWeight: 600 }}>{academy.krsaId || "No KRSA ID"}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <MapPin size={18} />
                <Typography>{academy.districtName || "N/A District"}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - General & Personnel */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            {/* Representative Details */}
            <Box>
              <SectionTitle title="Representative Information" icon={User} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Full Name"
                    value={academy.fullName}
                    icon={User}
                    color="#f6765e"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Email Address"
                    value={academy.email}
                    icon={Mail}
                    color="#4a90e2"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Phone Number"
                    value={`${academy.countryCode || "+91"} ${academy.phone}`}
                    icon={Phone}
                    color="#50b83c"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Gender" value={academy.gender} icon={User} color="#9b51e0" />
                </Grid>
              </Grid>
            </Box>

            {/* Academy Core Details */}
            <Box>
              <SectionTitle title="Academy Registration" icon={Building2} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Club Name"
                    value={academy.clubName}
                    icon={Building2}
                    color="#f6765e"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="ROS Number"
                    value={academy.ROSNumber}
                    icon={FileText}
                    color="#f39c12"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="District"
                    value={academy.districtName}
                    icon={MapPin}
                    color="#e74c3c"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Role" value={academy.role} icon={ShieldCheck} color="#2ecc71" />
                </Grid>
              </Grid>
            </Box>

            {/* Personnel */}
            <Box>
              <SectionTitle title="Key Personnel" icon={Users} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="President Name"
                    value={academy.presidentName}
                    icon={User}
                    color="#f6765e"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="President Number"
                    value={academy.presidentNumber}
                    icon={Phone}
                    color="#f6765e"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Secretary Name"
                    value={academy.secretaryName}
                    icon={User}
                    color="#4a90e2"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Secretary Number"
                    value={academy.secretaryNumber}
                    icon={Phone}
                    color="#4a90e2"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Infrastructure */}
            <Box>
              <SectionTitle title="Facility & Infrastructure" icon={Activity} />
              <Grid container spacing={2}>
                <Grid size={12}>
                  <InfoCard
                    label="Communication Address"
                    value={academy.address}
                    icon={MapPin}
                    color="#95a5a6"
                  />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Registration Address"
                    value={academy.RegistrationAddress}
                    icon={MapPin}
                    color="#95a5a6"
                  />
                </Grid>
                <Grid size={12}>
                  <InfoCard
                    label="Track Address"
                    value={academy.trackAddress}
                    icon={MapPin}
                    color="#95a5a6"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Track Measurements"
                    value={academy.trackMeasurements}
                    icon={Activity}
                    color="#16a085"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Trainer Certification"
                    value={academy.trainerCertification}
                    icon={Award}
                    color="#f1c40f"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Documents */}
            {(academy.ROSCertificate || (academy.documents && academy.documents.length > 0)) && (
              <Box>
                <SectionTitle title="Documents & Certificates" icon={FileText} />
                <Grid container spacing={2}>
                  {academy.ROSCertificate && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "16px",
                          border: "1px dashed #f2dfd7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
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
                            ROS Certificate
                          </Typography>
                        </Stack>
                        <Button
                          size="small"
                          component="a"
                          href={academy.ROSCertificate}
                          target="_blank"
                          sx={{ fontWeight: 700 }}
                        >
                          View
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                  {academy.documents?.map((doc, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "16px",
                          border: "1px dashed #f2dfd7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
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
                          sx={{ fontWeight: 700 }}
                        >
                          View
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Right Column - Stats & Status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            {/* Skater Stats */}
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
              <SectionTitle title="Skater Statistics" icon={Trophy} />
              <Stack spacing={2.5}>
                {[
                  { label: "Tenacity Skaters", value: academy.tenacitySkaters, color: "#f6765e" },
                  {
                    label: "Recreational Skaters",
                    value: academy.recreationalSkaters,
                    color: "#4a90e2"
                  },
                  { label: "Quad Skaters", value: academy.QuadSkaters, color: "#50b83c" },
                  { label: "Pro Inline Skaters", value: academy.ProInlineSkaters, color: "#9b51e0" }
                ].map((stat, index) => (
                  <Box key={index}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}
                    >
                      <Typography sx={{ color: "#7e716d", fontWeight: 600, fontSize: 13 }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ color: "#2f2829", fontWeight: 800 }}>
                        {stat.value || 0}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 6,
                        width: "100%",
                        bgcolor: "rgba(0,0,0,0.05)",
                        borderRadius: 3,
                        overflow: "hidden"
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${Math.min((stat.value / 100) * 100, 100)}%`,
                          bgcolor: stat.color,
                          borderRadius: 3
                        }}
                      />
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "rgba(0,0,0,0.04)",
                      color: "#2f2829"
                    }}
                  >
                    <Users size={20} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#a28f89",
                        textTransform: "uppercase",
                        fontWeight: 700
                      }}
                    >
                      Total Trainers
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#2f2829" }}>
                      {academy.numberOfTrainers || academy.noOfTrainers || 0}
                    </Typography>
                  </Box>
                </Stack>
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
                      label={academy.isActive ? "Active" : "Inactive"}
                      sx={{
                        bgcolor: academy.isActive ? "#e8f5e9" : "#ffebee",
                        color: academy.isActive ? "#2e7d32" : "#c62828",
                        fontWeight: 700
                      }}
                    />
                    <Chip
                      label={academy.verify ? "Verified" : "Unverified"}
                      sx={{
                        bgcolor: academy.verify ? "#e3f2fd" : "#fff3e0",
                        color: academy.verify ? "#1565c0" : "#ef6c00",
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
                    {academy.createdAt
                      ? new Date(academy.createdAt).toLocaleDateString("en-IN", {
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
                    {academy.updatedAt
                      ? new Date(academy.updatedAt).toLocaleDateString("en-IN", {
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
