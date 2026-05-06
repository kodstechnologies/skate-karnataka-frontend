import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Eye, Mail, MessageSquare, Phone, Search, User, X } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import contactHero from "@/assets/contect.png";
import { useFeedbackStore } from "@/features/admin/feedback/store/feedback-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

export const FeedbackPage = () => {
  const { feedbacks, isLoading, fetchFeedbacks, pagination } = useFeedbackStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with params — backend handles pagination if supported
  useEffect(() => {
    fetchFeedbacks({ search: debouncedSearch, page: page + 1, limit: rowsPerPage });
  }, [fetchFeedbacks, debouncedSearch, page, rowsPerPage]);

  // If backend returns pagination, use it; otherwise handle on frontend
  const filtered = useMemo(() => {
    if (pagination) return feedbacks; // backend handled search
    const q = searchTerm.trim().toLowerCase();
    if (!q) return feedbacks;
    return feedbacks.filter((f) =>
      [f.fullName, f.email, f.phone, f.message].join(" ").toLowerCase().includes(q)
    );
  }, [searchTerm, feedbacks, pagination]);

  const paginated = useMemo(() => {
    if (pagination) return feedbacks; // backend handled pagination
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage, pagination, feedbacks]);

  const totalCount = pagination ? pagination.total : filtered.length;

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
          background: `linear-gradient(110deg, rgba(18,14,16,0.9) 0%, rgba(35,23,23,0.72) 38%, rgba(246,118,94,0.3) 100%), url("${contactHero}")`,
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
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

        <Stack
          spacing={2}
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.5)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.80)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Feedback</Typography>
          </Breadcrumbs>

          <Box sx={{ maxWidth: 680 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(246,118,94,0.90)",
                mb: 1
              }}
            >
              User Submissions
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1.5 }}>
              Feedback Inbox
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75, maxWidth: 560 }}>
              View all feedback messages submitted by users on the public website.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<MessageSquare size={14} />}
              label={`${totalCount} Messages`}
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.13)" }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Table Card */}
      <Paper
        elevation={0}
        sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Feedback Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b", fontSize: 14 }}>
              Browse and search all user feedback submissions.
            </Typography>
          </Box>

          <TextField
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, email, phone..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ color: "#b19f99" }} />
                  </InputAdornment>
                )
              }
            }}
            sx={{ minWidth: { xs: "100%", sm: 300 } }}
          />
        </Stack>

        <Divider />

        {/* Mobile Cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: "18px" }} />
            ))
          ) : paginated.length > 0 ? (
            paginated.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        backgroundColor: "#fff1eb",
                        border: "1px solid #f0e4dd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      <User size={18} color="#f6765e" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 14 }}>
                        {item.fullName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#6b5e5a",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75
                      }}
                    >
                      <Mail size={13} color="#f6765e" />
                      {item.email || "—"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#6b5e5a",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75
                      }}
                    >
                      <Phone size={13} color="#f6765e" />
                      {item.phone || "—"}
                    </Typography>
                  </Stack>

                  {item.message && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        backgroundColor: "#f5ede9",
                        border: "1px solid #eeddd5"
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#5a4f4c",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {item.message}
                      </Typography>
                      {item.message.length > 120 && (
                        <Button
                          size="small"
                          onClick={() => setSelectedFeedback(item)}
                          sx={{
                            mt: 0.75,
                            p: 0,
                            fontSize: 12,
                            color: "#f6765e",
                            textTransform: "none",
                            minWidth: 0,
                            "&:hover": { background: "none", textDecoration: "underline" }
                          }}
                        >
                          Read full message
                        </Button>
                      )}
                    </Box>
                  )}
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              <MessageSquare size={32} color="#d4c5c0" style={{ margin: "0 auto 12px" }} />
              <Typography sx={{ fontSize: 14 }}>No feedback found.</Typography>
            </Paper>
          )}
        </Stack>

        {/* Desktop Table */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Name", "Email", "Phone", "Message", "Submitted At", ""].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      borderBottom: "1px solid #f0e1da",
                      color: "#7e716d",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "middle"
                      }
                    }}
                  >
                    {/* Name */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            backgroundColor: "#fff1eb",
                            border: "1px solid #f0e4dd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <User size={16} color="#f6765e" />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#2f2829",
                            fontSize: 14,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.fullName}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>
                      {item.email || "—"}
                    </TableCell>

                    {/* Phone */}
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c", whiteSpace: "nowrap" }}>
                      {item.phone || "—"}
                    </TableCell>

                    {/* Message */}
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#5a4f4c",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6
                        }}
                      >
                        {item.message || <span style={{ color: "#bbb" }}>—</span>}
                      </Typography>
                    </TableCell>

                    {/* Date — must come before action to match header order */}
                    <TableCell sx={{ fontSize: 13, color: "#8d7f7b", whiteSpace: "nowrap" }}>
                      {formatDate(item.createdAt)}
                    </TableCell>

                    {/* View action */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {item.message && (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedFeedback(item)}
                          title="View full message"
                          sx={{
                            border: "1px solid #efe2dc",
                            backgroundColor: "#fff8f4",
                            color: "#f6765e",
                            "&:hover": { backgroundColor: "#fff1eb" }
                          }}
                        >
                          <Eye size={15} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 8, textAlign: "center", color: "#978a86" }}>
                    {isLoading
                      ? "Loading feedback..."
                      : "No feedback found for the current search."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Full Message Dialog */}
      <Dialog
        open={Boolean(selectedFeedback)}
        onClose={() => setSelectedFeedback(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1
          }}
        >
          Full Message
          <IconButton
            onClick={() => setSelectedFeedback(null)}
            size="small"
            sx={{ color: "#8d7f7b" }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {selectedFeedback && (
            <Stack spacing={2.5}>
              {/* Sender info */}
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <User size={14} color="#f6765e" />
                  <Typography sx={{ fontSize: 13, color: "#6b5e5a" }}>
                    <strong>{selectedFeedback.fullName}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Mail size={14} color="#f6765e" />
                  <Typography sx={{ fontSize: 13, color: "#6b5e5a" }}>
                    {selectedFeedback.email || "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone size={14} color="#f6765e" />
                  <Typography sx={{ fontSize: 13, color: "#6b5e5a" }}>
                    {selectedFeedback.phone || "—"}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Message body */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  backgroundColor: "#fdf7f3",
                  border: "1px solid #f0e1da"
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#3a3130",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {selectedFeedback.message}
                </Typography>
              </Box>

              {/* Timestamp */}
              <Typography sx={{ fontSize: 12, color: "#b3a5a0", textAlign: "right" }}>
                Submitted: {formatDate(selectedFeedback.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setSelectedFeedback(null)}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
