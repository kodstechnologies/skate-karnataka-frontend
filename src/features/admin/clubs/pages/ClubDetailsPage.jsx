import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import { Box, Breadcrumbs, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";

const formatYesNo = (value) => {
  if (!value) {
    return "-";
  }

  return value === "yes" ? "Yes" : "No";
};

const getDisplayValue = (value) => value || "-";

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
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: "20px",
      border: "1px solid #f4e5de",
      backgroundColor: "#fffaf8",
      minHeight: "100%"
    }}
  >
    <Typography
      sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 0.9, fontSize: 15, fontWeight: 600, color: "#2f2829", lineHeight: 1.7 }}>
      {getDisplayValue(value)}
    </Typography>
  </Box>
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

const PdfCard = ({ label, fileValue }) => (
  <Box
    sx={{
      p: 2.25,
      borderRadius: "22px",
      border: "1px solid #f4e5de",
      backgroundColor: "#fffaf8"
    }}
  >
    <Typography
      sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label}
    </Typography>

    {fileValue?.name ? (
      <Stack spacing={1.75} sx={{ mt: 1.5 }}>
        <div className="flex items-center gap-3 rounded-2xl border border-[#efe2dc] bg-white px-3 py-3 text-sm text-[#6f6462] shadow-sm">
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 22, color: "#f6765e" }} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-[#2f2829]">{fileValue.name}</div>
            <div className="text-xs text-[#978883]">PDF document attached</div>
          </div>
        </div>

        {fileValue.dataUrl ? (
          <>
            <Box
              sx={{
                overflow: "hidden",
                borderRadius: "20px",
                border: "1px solid #ead8d1",
                backgroundColor: "white",
                boxShadow: "0 10px 24px rgba(40, 25, 20, 0.06)"
              }}
            >
              <Box
                component="iframe"
                title={`${label} preview`}
                src={fileValue.dataUrl}
                sx={{
                  width: "100%",
                  height: 320,
                  border: 0,
                  display: "block",
                  backgroundColor: "white"
                }}
              />
            </Box>

            <Button
              variant="contained"
              component="a"
              href={fileValue.dataUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ alignSelf: "flex-start" }}
            >
              Open PDF
            </Button>
          </>
        ) : (
          <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
            Preview is not available for this file.
          </Typography>
        )}
      </Stack>
    ) : (
      <Typography sx={{ mt: 1.25, fontSize: 14, color: "#8d7f7b" }}>No PDF uploaded</Typography>
    )}
  </Box>
);

export const ClubDetailsPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const clubs = useClubsStore((state) => state.clubs);
  const club = useMemo(() => clubs.find((item) => item.id === clubId) ?? null, [clubId, clubs]);
  const totalSkaters =
    Number(club?.tenacitySkatersCount || 0) +
    Number(club?.recreationalSkatersCount || 0) +
    Number(club?.quadSkatersCount || 0) +
    Number(club?.proInlineSkatersCount || 0);

  if (!club) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Club not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The club details you are looking for are not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/clubs")}>
          Back to clubs
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
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.92) 0%, rgba(38, 25, 26, 0.76) 34%, rgba(246, 118, 94, 0.28) 100%), url("${clubHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: { xs: -40, md: 24 },
            top: { xs: -30, md: 24 },
            width: { xs: 140, md: 220 },
            height: { xs: 140, md: 220 },
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none"
          }}
        />

        <Stack
          spacing={3}
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
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to="/clubs"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Clubs
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Details</Typography>
            </Breadcrumbs>

            <Typography
              sx={{
                mb: 1.25,
                fontSize: { xs: 13, md: 14 },
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              Club Profile Overview
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {club.clubName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Review the complete club registration, leadership contacts, facility readiness, skater
              mix, and uploaded documents from one polished detail view.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                label={club.krsaClubId}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              />
              <Chip
                label={club.district}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              />
              <Chip
                label={`${totalSkaters} skaters`}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
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
          label="Club ID"
          value={getDisplayValue(club.krsaClubId)}
          accent="#f6765e"
        />
        <SummaryCard
          icon={<LocationOnOutlinedIcon sx={{ fontSize: 24 }} />}
          label="District"
          value={getDisplayValue(club.district)}
          accent="#c86f3d"
        />
        <SummaryCard
          icon={<GroupsOutlinedIcon sx={{ fontSize: 24 }} />}
          label="President"
          value={getDisplayValue(club.clubPresidentName)}
          accent="#9c5cff"
        />
        <SummaryCard
          icon={<SportsScoreOutlinedIcon sx={{ fontSize: 24 }} />}
          label="Total Skaters"
          value={String(totalSkaters)}
          accent="#2aa876"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.05fr 0.95fr" },
          gap: 2.5
        }}
      >
        <Stack spacing={2.5}>
          <SectionCard
            title="Club Identity"
            description="Core registration and administrative details for this affiliated club."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="KRSA Club ID" value={club.krsaClubId} />
              <DetailItem label="Club login" value={club.clubLogin} />
              <DetailItem label="Name of club" value={club.clubName} />
              <DetailItem label="District" value={club.district} />
              <DetailItem label="ROS number" value={club.rosNumber} />
              <DetailItem label="Registration address" value={club.registrationAddress} />
            </Box>
          </SectionCard>

          <SectionCard
            title="Leadership Contacts"
            description="Primary office-bearer information used for communication and coordination."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="Club president name" value={club.clubPresidentName} />
              <DetailItem label="Club president number" value={club.clubPresidentPhone} />
              <DetailItem label="Club secretary name" value={club.clubSecretaryName} />
              <DetailItem label="Club secretary number" value={club.clubSecretaryPhone} />
            </Box>
          </SectionCard>
        </Stack>

        <Stack spacing={2.5}>
          <SectionCard
            title="Training and Facility"
            description="Skater capacity, coaching availability, and facility readiness for the club."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <DetailItem label="Tenacity skaters" value={club.tenacitySkatersCount} />
              <DetailItem label="Recreational skaters" value={club.recreationalSkatersCount} />
              <DetailItem label="Quad skaters" value={club.quadSkatersCount} />
              <DetailItem label="Pro inline skaters" value={club.proInlineSkatersCount} />
              <DetailItem label="Track address" value={club.trackAddress} />
              <DetailItem label="Track measurements" value={club.trackMeasurements} />
              <DetailItem label="No of trainers" value={club.trainersCount} />
              <DetailItem
                label="Trainers / coaches available"
                value={formatYesNo(club.coachesAvailable)}
              />
            </Box>
          </SectionCard>

          <SectionCard
            title="Documents"
            description="Uploaded PDFs and club paperwork stored with this record."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <PdfCard label="ROS certificate" fileValue={club.rosCertificate} />
              <PdfCard label="Documents" fileValue={club.documents} />
            </Box>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "22px",
                border: "1px dashed #f0d6ce",
                background: "linear-gradient(180deg, #fff8f5 0%, #fffdfb 100%)"
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DescriptionOutlinedIcon sx={{ color: "#f6765e" }} />
                <Typography sx={{ color: "#7f7270", lineHeight: 1.7 }}>
                  Use the edit page whenever you want to update the uploaded files or replace old
                  PDFs with new ones.
                </Typography>
              </Stack>
            </Paper>
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
};
