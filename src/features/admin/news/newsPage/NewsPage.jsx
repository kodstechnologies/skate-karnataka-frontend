import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
  Skeleton
} from "@mui/material";
import {
  ChevronRight,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Newspaper
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * Extracts a human-readable error message from an Axios error.
 */
const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
};

/* ─────────────────────────────────────────────
   NewsPage
───────────────────────────────────────────── */
export default function NewsPage() {
  const navigate = useNavigate();

  /* ── Data state ── */
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  /* ── Server-side pagination state ── */
  const [currentPage, setCurrentPage] = useState(1); // 1-indexed (backend)
  const [totalCount, setTotalCount] = useState(0); // from data.pagination.total

  /* ── Search state ── */
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Delete state ── */
  const [pendingDeleteNews, setPendingDeleteNews] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /* ── Search debounce ref ── */
  const searchDebounceRef = useRef(null);

  /* ─────────────────────────────────────────
     Fetch news — server-side pagination + search
     Sends: ?page=<n>&limit=10[&search=<term>]
     Reads: data.data (items), data.pagination.total
  ───────────────────────────────────────── */
  const fetchNews = useCallback(async (search = "", page = 1) => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await newsApi.getAll(search, page);
      setNews(data?.data || []);
      setTotalCount(data?.pagination?.total ?? 0);
    } catch (error) {
      setFetchError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews();
  }, [fetchNews]);

  /* Re-fetch when page navigation changes */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews(searchTerm, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* ─────────────────────────────────────────
     Debounced search handler (400 ms)
     Resets to page 1 and fires API with search
  ───────────────────────────────────────── */
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // reset to first page on new search

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!value.trim()) {
      fetchNews("", 1);
    } else {
      searchDebounceRef.current = setTimeout(() => {
        fetchNews(value, 1);
      }, 400);
    }
  };

  /* ─────────────────────────────────────────
     Delete
  ───────────────────────────────────────── */
  const handleDelete = async () => {
    if (!pendingDeleteNews) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await newsApi.delete(pendingDeleteNews._id ?? pendingDeleteNews.id);
      setNews((prev) =>
        prev.filter(
          (item) => (item._id ?? item.id) !== (pendingDeleteNews._id ?? pendingDeleteNews.id)
        )
      );
      setPendingDeleteNews(null);
    } catch (error) {
      setDeleteError(extractErrorMessage(error));
      setPendingDeleteNews(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(12,20,38,0.82) 0%, rgba(20,38,70,0.62) 34%, rgba(56,100,220,0.20) 100%), url("${newsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(12, 20, 52, 0.22)"
        }}
      >
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>News</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              News Control Center
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Publish, manage, and keep the community informed with the latest news, announcements,
              and updates from Skate Karnataka.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${news.length} Total`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Delete error alert ── */}
      {deleteError && (
        <Alert severity="error" onClose={() => setDeleteError(null)} sx={{ borderRadius: "16px" }}>
          {deleteError}
        </Alert>
      )}

      {/* ── Management Panel ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(221, 228, 246, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,255,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(24, 30, 58, 0.07)"
        }}
      >
        {/* Header row */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              News Management
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#7f8dab" }}>
              Manage news articles — search, create, edit, view and delete.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by heading or content..."
              sx={{ minWidth: { xs: "100%", sm: 300 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#a0aec0", marginRight: 8 }} />
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/news/create")}
            >
              Add News
            </Button>
          </Stack>
        </Stack>

        {/* Content area */}
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Loading state */}
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {[1, 2, 3].map((index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #dde3f5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",
                    boxShadow: "0 20px 50px rgba(24, 36, 80, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%"
                  }}
                >
                  {/* Image Placeholder */}
                  <Skeleton variant="rectangular" height={180} animation="wave" />

                  <Box
                    sx={{
                      p: 2.25,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                      {/* Heading Placeholder */}
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={28}
                        animation="wave"
                        sx={{ mb: 0.5 }}
                      />

                      {/* Content Placeholder */}
                      <Box sx={{ minHeight: 52 }}>
                        <Skeleton variant="text" width="100%" animation="wave" />
                        <Skeleton variant="text" width="100%" animation="wave" />
                        <Skeleton variant="text" width="70%" animation="wave" />
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      {/* Date Placeholder */}
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={20}
                        animation="wave"
                        sx={{ mb: 1 }}
                      />

                      {/* Action buttons Placeholder */}
                      <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                        <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
                        <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
                        <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
                      </Stack>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : fetchError ? (
            /* Fetch error state */
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: "22px",
                textAlign: "center",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7"
              }}
            >
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 1 }}>
                Failed to load news
              </Typography>
              <Typography sx={{ color: "#9b2c2c", mb: 3, fontSize: 14 }}>{fetchError}</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={15} />}
                onClick={fetchNews}
                sx={{ borderColor: "#c53030", color: "#c53030" }}
              >
                Retry
              </Button>
            </Paper>
          ) : news.length > 0 ? (
            /* News card grid */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {news.map((item) => {
                const itemId = item._id ?? item.id;
                return (
                  <Paper
                    key={itemId}
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: "1px solid #dde3f5",
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",
                      boxShadow: "0 20px 50px rgba(24, 36, 80, 0.08)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 28px 65px rgba(24, 36, 80, 0.12)"
                      },
                      display: "flex",
                      flexDirection: "column",
                      height: "100%"
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        height: 180,
                        position: "relative",
                        background: item.img
                          ? `linear-gradient(180deg, rgba(12,18,40,0.12) 0%, rgba(12,18,40,0.52) 100%), url("${item.img}")`
                          : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {!item.img && (
                        <ArticleOutlinedIcon
                          sx={{ fontSize: 48, color: "#6366f1", opacity: 0.5 }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        p: 2.25,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        <Typography
                          sx={{ fontSize: 17, fontWeight: 800, color: "#1e2a5a", lineHeight: 1.3 }}
                        >
                          {item.heading || "Untitled"}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#64748b",
                            lineHeight: 1.7,
                            minHeight: 52,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {item.about || "No content provided."}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        {/* Created at */}
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 1 }}>
                          Created: {formatDate(item.createdAt)}
                        </Typography>

                        {/* Action buttons */}
                        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Eye size={15} />}
                            onClick={() => navigate(`/news/${itemId}`)}
                            fullWidth
                            // sx={{
                            //   borderColor: "#c7d2fe",
                            //   color: "#3b5bdb",
                            //   "&:hover": { borderColor: "#3b5bdb", backgroundColor: "#eef2ff" }
                            // }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PencilLine size={15} />}
                            onClick={() => navigate(`/news/${itemId}/edit`)}
                            fullWidth
                            // sx={{
                            //   borderColor: "#c7d2fe",
                            //   color: "#3b5bdb",
                            //   "&:hover": { borderColor: "#3b5bdb", backgroundColor: "#eef2ff" }
                            // }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<Trash2 size={15} />}
                            onClick={() => setPendingDeleteNews(item)}
                            fullWidth
                            sx={{
                              backgroundColor: "#f6765e",
                              "&:hover": { backgroundColor: "#ea6b54" }
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            /* Empty state */
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#8d9ab5" }}
            >
              {searchTerm
                ? "No news found matching your search."
                : "No news articles yet. Click 'Add News' to create the first one."}
            </Paper>
          )}
        </Box>

        {/* Pagination — server-driven, shown when data loaded and total > 10 */}
        {!loading && !fetchError && totalCount > 10 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={currentPage - 1}
            onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
            rowsPerPage={10}
            rowsPerPageOptions={[]}
          />
        )}
      </Paper>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteNews)}
        title="Delete News"
        itemLabel={pendingDeleteNews?.heading}
        description="This news article will be permanently removed. This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onClose={() => setPendingDeleteNews(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
