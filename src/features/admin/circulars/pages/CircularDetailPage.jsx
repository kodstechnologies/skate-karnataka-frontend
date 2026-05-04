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
import { CalendarDays, ChevronRight, FileText, PencilLine } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import circularsHero from "@/assets/Circulars_header.png";
import { useCircularsStore } from "@/features/admin/circulars/store/circulars-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "long" });
};

const DetailField = ({ label, value, icon, fullWidth = false }) => (
  <Box sx={{ gridColumn: fullWidth ? { md: "span 2" } : undefined }}>
    <Stack direction="row" spacing={1} sx={{ mb: 0.75, alignItems: "center" }}>
      {icon && <Box sx={{ color: "#f6765e" }}>{icon}</Box>}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#a28f89"
        }}
      >
        {label}
      </Typography>
    </Stack>
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

export const CircularDetailPage = () => {
  const navigate = useNavigate();
  const { circularId } = useParams();

  const circulars = useCircularsStore((s) => s.circulars);
  const fetchCirculars = useCircularsStore((s) => s.fetchCirculars);
  const isLoading = useCircularsStore((s) => s.isLoading);

  useEffect(() => {
    if (circulars.length === 0) fetchCirculars({ limit: 100 });
  }, [circulars.length, fetchCirculars]);

  const item = circulars.find((c) => c.id === circularId) ?? null;

  if (isLoading && !item) {
    return (
      <Box className="space-y-5">
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: "28px" }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: "28px" }} />
      </Box>
    );
  }

  if (!isLoading && !item) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 6, borderRadius: "28px", textAlign: "center", border: "1px solid #f0e1da" }}
      >
        <FileText size={48} color="#e0cbc4" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Circular not found
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#f6765e",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
          }}
          onClick={() => navigate("/circulars")}
        >
          Back to Circulars
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,28,0.92) 0%, rgba(30,20,50,0.76) 34%, rgba(80,60,160,0.28) 100%), url("${circularsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(18,14,28,0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 34%)",
            pointerEvents: "none"
          }}
        />
        <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
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
                to="/circulars"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Circulars & Guidelines
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {item?.heading || "View"}
              </Typography>
            </Breadcrumbs>

            <Typography
              sx={{
                mb: 1.25,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              Circular Details
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {item?.heading}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              {item?.text}
            </Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<CalendarDays size={16} />}
                label={formatDate(item?.date)}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Content Card ─────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(240,219,210,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)",
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: { sm: "flex-start" } }}
          >
            <Avatar
              src={item?.img}
              variant="rounded"
              alt={item?.heading}
              sx={{
                width: { xs: "100%", sm: 160 },
                height: { xs: 200, sm: 160 },
                borderRadius: "20px",
                flexShrink: 0,
                border: "3px solid rgba(80,60,160,0.14)"
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.05em", color: "#2f2829" }}
              >
                {item?.heading}
              </Typography>
              <Typography sx={{ mt: 1, color: "#7a6a65", lineHeight: 1.7 }}>
                {item?.text}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Chip
                  label={`Date: ${formatDate(item?.date)}`}
                  size="small"
                  sx={{ backgroundColor: "#f0f4ff", color: "#4b72c2", fontWeight: 600 }}
                />
                <Chip
                  label={`Updated: ${formatDate(item?.updatedAt)}`}
                  size="small"
                  sx={{ backgroundColor: "#fdf0eb", color: "#c56b53", fontWeight: 600 }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />

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
            <DetailField label="Heading" value={item?.heading} />
            <DetailField
              label="Date"
              value={formatDate(item?.date)}
              icon={<CalendarDays size={14} />}
            />
            <DetailField label="Text" value={item?.text} fullWidth />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ p: { xs: 2.5, md: 4 }, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/circulars")}
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Back to list
          </Button>
          <Button
            variant="contained"
            startIcon={<PencilLine size={16} />}
            onClick={() => navigate(`/circulars/${circularId}/edit`)}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Edit circular
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
