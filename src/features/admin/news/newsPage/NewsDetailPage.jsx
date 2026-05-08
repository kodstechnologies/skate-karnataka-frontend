import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { ArrowLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { newsApi } from "@/api/news-api";
import newsHero from "@/assets/Skating_header.jpg";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const extractErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "An unexpected error occurred. Please try again.";

/* ─────────────────────────────────────────────
   NewsDetailPage
───────────────────────────────────────────── */
export const NewsDetailPage = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();

  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchNewsItem = useCallback(async () => {
    if (!newsId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const response = await newsApi.getById(newsId);
      // Support both { data: {} } and {} shaped responses
      const item = response?.data ?? response;
      setNewsItem(item);
    } catch (error) {
      setFetchError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNewsItem();
  }, [fetchNewsItem]);

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 200, md: 240 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${newsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
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
              to="/news"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              News
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {loading ? "Loading…" : (newsItem?.heading ?? "Article")}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
            News Article
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7, mb: 3 }}
          >
            Detailed view of the latest announcements, updates, and community news from Skate
            Karnataka.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/news")}
            sx={{
              alignSelf: "flex-start",
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.08)" }
            }}
          >
            Back to News
          </Button>
        </Stack>
      </Paper>

      {/* ── Content ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#f6765e" }} />
          </Box>
        ) : fetchError ? (
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<RefreshCw size={14} />}
                  onClick={fetchNewsItem}
                >
                  Retry
                </Button>
              }
              sx={{ borderRadius: "16px" }}
            >
              {fetchError}
            </Alert>
          </Box>
        ) : newsItem ? (
          <Box>
            {/* Cover Image */}
            {newsItem.img ? (
              <Box
                sx={{
                  width: "100%",
                  maxHeight: { xs: 260, md: 420 },
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <img
                  src={newsItem.img}
                  alt={newsItem.heading}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(246,118,94,0.15) 0%, rgba(246,118,94,0.3) 100%)"
                }}
              >
                <ArticleOutlinedIcon sx={{ fontSize: 72, color: "#f6765e", opacity: 0.4 }} />
              </Box>
            )}

            <Stack spacing={2} sx={{ p: { xs: 3, md: 5 } }}>
              {/* Heading */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#2f2829",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.25
                }}
              >
                {newsItem.heading}
              </Typography>

              {/* Meta — created date */}
              <Typography sx={{ fontSize: 14, color: "#8d7f7b" }}>
                Published: {formatDate(newsItem.createdAt)}
              </Typography>

              {/* Divider */}
              <Box sx={{ height: 1, backgroundColor: "#efe2dc" }} />

              {/* About / Body */}
              <Typography
                sx={{
                  color: "#4b3e3c",
                  lineHeight: 1.9,
                  fontSize: { xs: 15, md: 17 },
                  whiteSpace: "pre-wrap"
                }}
              >
                {newsItem.about}
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
};
