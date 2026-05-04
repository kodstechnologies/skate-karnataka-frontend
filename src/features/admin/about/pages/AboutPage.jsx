import { useEffect, useState } from "react";
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
import {
  ChevronRight,
  Info,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import aboutHero from "@/assets/AboutUs_header.png";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useAboutStore } from "@/features/admin/about/store/about-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
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

export const AboutPage = () => {
  const navigate = useNavigate();
  const about = useAboutStore((s) => s.about);
  const fetchAbout = useAboutStore((s) => s.fetchAbout);
  const deleteAbout = useAboutStore((s) => s.deleteAbout);
  const isLoading = useAboutStore((s) => s.isLoading);

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleDelete = async () => {
    const ok = await deleteAbout();
    if (ok) setConfirmOpen(false);
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20,17,20,0.88) 0%, rgba(20,17,20,0.58) 44%, rgba(20,17,20,0.18) 100%), url("${aboutHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(246,118,94,0.16) 0%, rgba(0,0,0,0.04) 100%)",
            pointerEvents: "none"
          }}
        />
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 720 }}>
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>About Us</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              About Us Manager
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage the organisation's public-facing about page — heading, mission, contact details
              and gallery images.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Info size={16} />}
                label="Single active record"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: "28px" }} />
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: "28px" }} />
        </Stack>
      ) : !about ? (
        /* ── Empty State ─────────────────────────────────────────────── */
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: "28px",
            border: "1px solid #f0e1da",
            textAlign: "center",
            background: "linear-gradient(180deg, #fff 0%, #fff9f6 100%)"
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "24px",
              margin: "0 auto 20px",
              backgroundColor: "rgba(246,118,94,0.1)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <Info size={36} color="#f6765e" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
            No About Us record yet
          </Typography>
          <Typography sx={{ mt: 1.5, color: "#8d7f7b", maxWidth: 420, mx: "auto" }}>
            Create the organisation's first About Us record to display it on the public website.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/about/create")}
            sx={{
              mt: 3.5,
              backgroundColor: "#f6765e",
              boxShadow: "none",
              borderRadius: "14px",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Create About Us
          </Button>
        </Paper>
      ) : (
        /* ── Record Card ─────────────────────────────────────────────── */
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
          {/* Top action bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              borderBottom: "1px solid #f0e1da"
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
              >
                {about.heading}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Updated: ${formatDate(about.updatedAt)}`}
                  size="small"
                  sx={{ backgroundColor: "#fdf0eb", color: "#c56b53", fontWeight: 600 }}
                />
                <Chip
                  label={`Created: ${formatDate(about.createdAt)}`}
                  size="small"
                  sx={{ backgroundColor: "#f0f4ff", color: "#4b72c2", fontWeight: 600 }}
                />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                startIcon={<PencilLine size={16} />}
                onClick={() => navigate("/about/edit")}
                sx={{ borderRadius: "14px", textTransform: "none" }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<Trash2 size={16} />}
                onClick={() => setConfirmOpen(true)}
                sx={{
                  borderRadius: "14px",
                  textTransform: "none",
                  backgroundColor: "#f6765e",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>

          {/* Logo + Gallery row */}
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ alignItems: "flex-start" }}
            >
              {/* Logo */}
              <Box sx={{ flexShrink: 0 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#a28f89",
                    mb: 1
                  }}
                >
                  Logo
                </Typography>
                <Avatar
                  src={about.logo}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "20px",
                    border: "3px solid rgba(246,118,94,0.14)"
                  }}
                />
              </Box>

              {/* Gallery images */}
              {about.img?.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#a28f89",
                      mb: 1
                    }}
                  >
                    Gallery Images ({about.img.length})
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    {about.img.map((url, i) => (
                      <Avatar
                        key={i}
                        src={url}
                        variant="rounded"
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: "16px",
                          border: "2px solid #f0e1da"
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "#f0e1da" }} />

          {/* Detail fields */}
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3
              }}
            >
              <DetailField label="Heading" value={about.heading} fullWidth />
              <DetailField label="About" value={about.about} fullWidth />
              <DetailField label="Our Mission" value={about.ourMission} fullWidth />
              <DetailField
                label="Total Students"
                value={about.student?.toString()}
                icon={<Users size={14} />}
              />
              <DetailField label="Address" value={about.address} icon={<MapPin size={14} />} />
              <DetailField label="Email" value={about.email} icon={<Mail size={14} />} />
              <DetailField label="Phone Number" value={about.phoneNo} icon={<Phone size={14} />} />
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────── */}
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Delete About Us"
        description="This will permanently remove the About Us record from the public website. This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
