import { useEffect } from "react";
import {
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
import { CalendarDays, ChevronRight, Mail, Phone, User } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import feedbackHero from "@/assets/Feedback_header.png";
import { useFeedbackStore } from "@/features/admin/feedback/store/feedback-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

export const FeedbackDetailPage = () => {
  const navigate = useNavigate();
  const { feedbackId } = useParams();

  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const fetchFeedbacks = useFeedbackStore((s) => s.fetchFeedbacks);
  const isLoading = useFeedbackStore((s) => s.isLoading);

  useEffect(() => {
    if (feedbacks.length === 0) fetchFeedbacks({ limit: 100 });
  }, [feedbacks.length, fetchFeedbacks]);

  // Handle both id mapping (id or _id depending on the store mapping)
  const item = feedbacks.find((f) => f.id === feedbackId || f._id === feedbackId) ?? null;

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
        <Mail size={48} color="#e0cbc4" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Message not found
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#f6765e",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
          }}
          onClick={() => navigate("/feedback")}
        >
          Back to Feedback
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.9) 0%, rgba(35,23,23,0.72) 38%, rgba(246,118,94,0.3) 100%), url("${feedbackHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)",
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
                to="/feedback"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Feedback
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Message</Typography>
            </Breadcrumbs>

            <Typography
              sx={{
                mb: 1.25,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(246,118,94,0.90)"
              }}
            >
              Feedback Details
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              Message from {item?.fullName}
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<CalendarDays size={16} />}
                label={formatDate(item?.createdAt)}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Content Card */}
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
            {/* Sender Info Sidebar */}
            <Box sx={{ width: { xs: "100%", sm: 280 }, flexShrink: 0 }}>
              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#2f2829",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}
              >
                Sender Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <User size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Name
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#2f2829" }}>
                    {item?.fullName}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "#f0e1da" }} />
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <Mail size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Email
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, color: "#2f2829", wordBreak: "break-all" }}>
                    {item?.email || "—"}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "#f0e1da" }} />
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <Phone size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Phone
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, color: "#2f2829" }}>
                    {item?.phone || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", sm: "block" }, borderColor: "#f0e1da" }}
            />
            <Divider sx={{ display: { xs: "block", sm: "none" }, borderColor: "#f0e1da", my: 3 }} />

            {/* Message Body */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#2f2829",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}
              >
                Message Content
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  backgroundColor: "#fdf7f3",
                  border: "1px solid #f0e1da"
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    color: "#3a3130",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {item?.message || "No message provided."}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/feedback")}
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Back to inbox
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
