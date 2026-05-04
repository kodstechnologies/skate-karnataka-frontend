import { useEffect } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, Layers, PencilLine } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import disciplinesHero from "@/assets/Disciplines_header.png";
import { useDisciplinesStore } from "@/features/admin/disciplines/store/disciplines-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short"
  });
};

const DetailField = ({ label, value, fullWidth = false }) => (
  <Box sx={{ gridColumn: fullWidth ? { md: "span 2" } : undefined }}>
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#a28f89",
        mb: 0.75
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 15,
        color: "#2f2829",
        lineHeight: 1.75,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

export const DisciplineDetailPage = () => {
  const navigate = useNavigate();
  const { disciplineId } = useParams();

  const disciplines = useDisciplinesStore((s) => s.disciplines);
  const fetchDisciplines = useDisciplinesStore((s) => s.fetchDisciplines);
  const isLoading = useDisciplinesStore((s) => s.isLoading);

  useEffect(() => {
    if (disciplines.length === 0) {
      fetchDisciplines({ limit: 100 });
    }
  }, [disciplines.length, fetchDisciplines]);

  const discipline = disciplines.find((d) => d.id === disciplineId) ?? null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading && !discipline) {
    return (
      <Box className="space-y-5">
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: "28px" }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: "28px" }} />
      </Box>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!isLoading && !discipline) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 6, borderRadius: "28px", textAlign: "center", border: "1px solid #f0e1da" }}
      >
        <Layers size={48} color="#e0cbc4" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Discipline not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          This discipline may have been removed or the link is invalid.
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#f6765e",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
          }}
          onClick={() => navigate("/disciplines")}
        >
          Back to Disciplines
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${disciplinesHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        {/* Overlays */}
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
            {/* Breadcrumbs */}
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
                to="/disciplines"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Disciplines
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {discipline?.title || "View"}
              </Typography>
            </Breadcrumbs>

            {/* Label */}
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
              Discipline Profile
            </Typography>

            {/* Title */}
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {discipline?.title}
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {discipline?.text}
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Layers size={16} />}
                label="Discipline detail"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Content Card ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)",
          overflow: "hidden"
        }}
      >
        {/* Image + header row */}
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: { sm: "flex-start" } }}
          >
            {/* Image */}
            <Avatar
              src={discipline?.img}
              variant="rounded"
              alt={discipline?.title}
              sx={{
                width: { xs: "100%", sm: 160 },
                height: { xs: 200, sm: 160 },
                borderRadius: "20px",
                flexShrink: 0,
                border: "3px solid rgba(246,118,94,0.14)"
              }}
            />

            {/* Basic info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.05em", color: "#2f2829" }}
              >
                {discipline?.title}
              </Typography>
              <Typography sx={{ mt: 1, color: "#7a6a65", lineHeight: 1.7 }}>
                {discipline?.text}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Chip
                  label={`Updated: ${formatDate(discipline?.updatedAt)}`}
                  size="small"
                  sx={{ backgroundColor: "#fdf0eb", color: "#c56b53", fontWeight: 600 }}
                />
                <Chip
                  label={`Created: ${formatDate(discipline?.createdAt)}`}
                  size="small"
                  sx={{ backgroundColor: "#f0f4ff", color: "#4b72c2", fontWeight: 600 }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />

        {/* Detail fields grid */}
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: 17,
              color: "#2f2829",
              letterSpacing: "-0.03em"
            }}
          >
            Full Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3
            }}
          >
            <DetailField label="Title" value={discipline?.title} />
            <DetailField label="Text" value={discipline?.text} />
            <DetailField label="About" value={discipline?.about} fullWidth />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />

        {/* Action footer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ p: { xs: 2.5, md: 4 }, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/disciplines")}
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Back to list
          </Button>
          <Button
            variant="contained"
            startIcon={<PencilLine size={16} />}
            onClick={() => navigate(`/disciplines/${disciplineId}/edit`)}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Edit discipline
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
