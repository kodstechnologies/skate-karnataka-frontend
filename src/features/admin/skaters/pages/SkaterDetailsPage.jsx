import { Box, Breadcrumbs, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SportsOutlinedIcon from "@mui/icons-material/SportsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
};

const formatGender = (gender) => {
  if (!gender) {
    return "-";
  }
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: "20px",
      border: "1px solid #f4e5de",
      backgroundColor: "#fffaf8"
    }}
  >
    <Typography
      sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 0.9, fontSize: 15, fontWeight: 600, color: "#2f2829", lineHeight: 1.7 }}>
      {value || "-"}
    </Typography>
  </Box>
);

const SummaryCard = ({ icon, label, value, accent }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: "24px",
      border: "1px solid rgba(243, 222, 215, 0.9)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,247,243,0.98) 100%)",
      boxShadow: "0 22px 60px rgba(55, 33, 26, 0.06)"
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          color: accent,
          backgroundColor: `${accent}1A`
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9f8e89"
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 700, color: "#2f2829" }}>
          {value || "-"}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const SectionCard = ({ title, description, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.25, md: 2.75 },
      borderRadius: "28px",
      border: "1px solid rgba(246, 228, 221, 0.95)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
      boxShadow: "0 24px 70px rgba(48, 30, 24, 0.06)"
    }}
  >
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#2f2829" }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.75, color: "#8d7f7b", lineHeight: 1.7 }}>{description}</Typography>
    </Box>
    {children}
  </Paper>
);

export const SkaterDetailsPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const skaters = useSkatersStore((state) => state.skaters);
  const skater = useMemo(
    () => skaters.find((item) => item.id === skaterId) ?? null,
    [skaterId, skaters]
  );

  if (!skater) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Skater not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The skater details you are looking for are not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/skaters")}>
          Back to skaters
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.92) 0%, rgba(38, 25, 26, 0.76) 34%, rgba(246, 118, 94, 0.28) 100%), url("${skatersHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 760 }}>
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
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to="/skaters"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Skaters
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Details</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1 }}>
              {skater.fullName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Complete registered profile details for this athlete, including identity, parent,
              school, and discipline information.
            </Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
              <Chip
                label={skater.krsaId}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={skater.category || "-"}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={formatGender(skater.gender)}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))"
          },
          gap: 2
        }}
      >
        <SummaryCard
          icon={<BadgeOutlinedIcon sx={{ fontSize: 24 }} />}
          label="KRSA ID"
          value={skater.krsaId}
          accent="#f6765e"
        />
        <SummaryCard
          icon={<SportsOutlinedIcon sx={{ fontSize: 24 }} />}
          label="Discipline"
          value={skater.discipline}
          accent="#2aa876"
        />
        <SummaryCard
          icon={<LocationOnOutlinedIcon sx={{ fontSize: 24 }} />}
          label="District"
          value={skater.district}
          accent="#9c5cff"
        />
        <SummaryCard
          icon={<EventOutlinedIcon sx={{ fontSize: 24 }} />}
          label="DOB"
          value={formatDate(skater.dob)}
          accent="#c86f3d"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 3, justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
            >
              Skater details
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Full registered profile information.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/skaters")}>
            Back to skaters
          </Button>
        </Stack>

        <Stack spacing={2.5}>
          <SectionCard
            title="Identity and Registration"
            description="Core identity, registration, and sport classification details."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="KRSA ID" value={skater.krsaId} />
              <DetailItem label="Full name" value={skater.fullName} />
              <DetailItem label="Phone" value={skater.phone} />
              <DetailItem label="RSFI ID" value={skater.rsfiId} />
              <DetailItem label="DOB" value={formatDate(skater.dob)} />
              <DetailItem label="Aadhaar Number" value={skater.aadharNumber} />
              <DetailItem label="Gender" value={formatGender(skater.gender)} />
              <DetailItem label="Category" value={skater.category} />
              <DetailItem label="Discipline" value={skater.discipline} />
              <DetailItem label="Blood Group" value={skater.bloodGroup} />
            </Box>
          </SectionCard>

          <SectionCard
            title="Club and Family"
            description="Associated district/club and guardian information."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="District" value={skater.district} />
              <DetailItem label="Club" value={skater.club} />
              <DetailItem label="Parent" value={skater.parent} />
              <DetailItem label="Address" value={skater.address} />
            </Box>
          </SectionCard>

          <SectionCard
            title="Education and Signature"
            description="School and profile completeness details."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="School" value={skater.school} />
              <DetailItem label="Grade" value={skater.grade} />
              <DetailItem label="Signature" value={skater.signature} />
            </Box>
          </SectionCard>
        </Stack>
      </Paper>
    </Box>
  );
};
