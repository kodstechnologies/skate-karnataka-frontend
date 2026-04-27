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
  useMediaQuery
} from "@mui/material";
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Activity
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

export const ParentRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { fetchParentDetails, selectedParent, loading } = useRequestsStore();

  useEffect(() => {
    if (requestId) {
      fetchParentDetails(requestId);
    }
  }, [requestId, fetchParentDetails]);

  if (loading) return <ShimmerLoading />;

  if (!selectedParent) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 4, borderRadius: "28px", textAlign: "center", border: "1px solid #f2dfd7" }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Parent record not found
        </Typography>
      </Paper>
    );
  }

  const parent = selectedParent;

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
              to="/reports/parent"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Parent Reports
            </Typography>
            <Typography sx={{ fontWeight: 700, color: "white" }}>Details</Typography>
          </Breadcrumbs>

          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Typography
                variant={isMobile ? "h4" : "h2"}
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                {parent.fullName || "Unnamed Parent"}
              </Typography>
              {parent.verify && (
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
                <Typography sx={{ fontWeight: 600 }}>{parent.krsaId || "No KRSA ID"}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - General Information */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            {/* Personal Information */}
            <Box>
              <SectionTitle title="Personal Information" icon={User} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Full Name" value={parent.fullName} icon={User} color="#f6765e" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Email Address"
                    value={parent.email}
                    icon={Mail}
                    color="#4a90e2"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Phone Number"
                    value={`${parent.countryCode || "+91"} ${parent.phone}`}
                    icon={Phone}
                    color="#50b83c"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Gender" value={parent.gender} icon={User} color="#9b51e0" />
                </Grid>
                <Grid size={12}>
                  <InfoCard label="Address" value={parent.address} icon={MapPin} color="#95a5a6" />
                </Grid>
              </Grid>
            </Box>

            {/* Account & Notification Settings */}
            <Box>
              <SectionTitle title="Account Details" icon={Activity} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard label="Role" value={parent.role} icon={ShieldCheck} color="#2ecc71" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Notifications"
                    value={parent.isNotificationsEnabled ? "Enabled" : "Disabled"}
                    icon={Bell}
                    color="#f39c12"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Account Status"
                    value={parent.isActive ? "Active" : "Inactive"}
                    icon={Activity}
                    color="#16a085"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoCard
                    label="Verification"
                    value={parent.verify ? "Verified" : "Unverified"}
                    icon={CheckCircle2}
                    color="#8e44ad"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Documents Section */}
            <Box>
              <SectionTitle title="Documents & Certificates" icon={FileText} />
              <Grid container spacing={2}>
                {parent.documents && parent.documents.length > 0 ? (
                  parent.documents.map((doc, index) => (
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
                      label={parent.isActive ? "Active" : "Inactive"}
                      sx={{
                        bgcolor: parent.isActive ? "#e8f5e9" : "#ffebee",
                        color: parent.isActive ? "#2e7d32" : "#c62828",
                        fontWeight: 700
                      }}
                    />
                    <Chip
                      label={parent.verify ? "Verified" : "Unverified"}
                      sx={{
                        bgcolor: parent.verify ? "#e3f2fd" : "#fff3e0",
                        color: parent.verify ? "#1565c0" : "#ef6c00",
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
                    {parent.createdAt
                      ? new Date(parent.createdAt).toLocaleDateString("en-IN", {
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
                    {parent.updatedAt
                      ? new Date(parent.updatedAt).toLocaleDateString("en-IN", {
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
