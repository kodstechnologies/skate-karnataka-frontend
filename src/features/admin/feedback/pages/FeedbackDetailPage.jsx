import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Paperclip,
  Phone
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import feedbackHero from "@/assets/Feedback_header.png";
import { feedbackApi } from "@/api/feedback-api";
import { mapFeedbackToFrontend } from "@/features/admin/feedback/store/feedback-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
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
  "Failed to load feedback details.";

const getFileMeta = (fileUrl) => {
  if (!fileUrl) return { label: "Attachment", extension: "", isImage: false };
  const rawName = decodeURIComponent(fileUrl.split("/").pop() || "attachment");
  const extension = rawName.split(".").pop()?.toLowerCase() || "";
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const isImage = imageExtensions.includes(extension);
  const label = isImage ? "Image attachment" : "File attachment";
  return { label, extension: extension.toUpperCase(), isImage, rawName };
};

const ContactCard = ({ icon, label, value, href }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: "18px",
      border: "1px solid #f0e1da",
      backgroundColor: "#fffdfb",
      height: "100%"
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          backgroundColor: "rgba(246,118,94,0.12)",
          color: "#f6765e",
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
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
    {href ? (
      <Typography
        component="a"
        href={href}
        sx={{
          fontSize: 15,
          fontWeight: 600,
          color: "#2f2829",
          textDecoration: "none",
          wordBreak: "break-all",
          "&:hover": { color: "#f6765e" }
        }}
      >
        {value || "—"}
      </Typography>
    ) : (
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#2f2829", wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    )}
  </Paper>
);

export const FeedbackDetailPage = () => {
  const navigate = useNavigate();
  const { feedbackId } = useParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    if (!feedbackId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await feedbackApi.getById(feedbackId);
      const payload = response?.data ?? response;
      setItem(mapFeedbackToFrontend(payload));
    } catch (error) {
      setFetchError(extractErrorMessage(error));
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  }, [feedbackId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const fileMeta = useMemo(() => getFileMeta(item?.file), [item?.file]);
  const senderInitial = (item?.fullName || "?").charAt(0).toUpperCase();

  const handleDownload = useCallback(async () => {
    if (!item?.file) return;
    const fileName =
      fileMeta.rawName || `feedback-attachment.${fileMeta.extension.toLowerCase() || "file"}`;

    try {
      const response = await fetch(item.file);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.href = item.file;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [item?.file, fileMeta.extension, fileMeta.rawName]);

  if (isLoading) {
    return (
      <Box className="space-y-5">
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: "28px" }} />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: "28px" }} />
      </Box>
    );
  }

  if (fetchError || !item) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 6, borderRadius: "28px", textAlign: "center", border: "1px solid #f0e1da" }}
      >
        <Mail size={48} color="#e0cbc4" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Message not found
        </Typography>
        {fetchError && (
          <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
            {fetchError}
          </Alert>
        )}
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
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 160, md: 180 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.68) 38%, rgba(246,118,94,0.22) 100%), url("${feedbackHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.18)"
        }}
      >
        <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/feedback"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Feedback
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Message</Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                sx={{
                  mb: 0.75,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(246,118,94,0.95)"
                }}
              >
                Feedback Details
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2 }}
              >
                Message from {item.fullName}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate("/feedback")}
              sx={{
                flexShrink: 0,
                borderColor: "rgba(255,255,255,0.45)",
                color: "white",
                borderRadius: "14px",
                textTransform: "none",
                "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.08)" }
              }}
            >
              Back to inbox
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(240,219,210,0.95)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)",
          overflow: "hidden"
        }}
      >
        {/* Sender profile strip */}
        <Box
          sx={{
            px: { xs: 2.5, md: 4 },
            py: { xs: 2.5, md: 3 },
            borderBottom: "1px solid #f0e1da",
            background:
              "linear-gradient(90deg, rgba(246,118,94,0.06) 0%, rgba(255,255,255,0) 55%)"
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                fontWeight: 800,
                fontSize: 22,
                background: "linear-gradient(135deg, #f6765e 0%, #ea6b54 100%)",
                boxShadow: "0 10px 24px rgba(246,118,94,0.28)"
              }}
            >
              {senderInitial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#2f2829", lineHeight: 1.2 }}>
                {item.fullName}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 14, color: "#8d7f7b" }}>
                Submitted feedback via the public form
              </Typography>
            </Box>
            <Chip
              icon={<CalendarDays size={15} />}
              label={formatDate(item.createdAt)}
              sx={{
                height: 36,
                px: 0.5,
                fontWeight: 600,
                color: "#6b5e5a",
                backgroundColor: "#fff8f4",
                border: "1px solid #f0e1da"
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={3.5}>
            {/* Contact cards */}
            <Box>
              <Typography
                sx={{
                  mb: 1.5,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#2f2829",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}
              >
                Contact Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2
                }}
              >
                <ContactCard
                  icon={<Mail size={16} />}
                  label="Email"
                  value={item.email}
                  href={item.email ? `mailto:${item.email}` : undefined}
                />
                <ContactCard
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={item.phone}
                  href={item.phone ? `tel:${item.phone}` : undefined}
                />
              </Box>
            </Box>

            {/* Message */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <MessageSquare size={16} color="#f6765e" />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#2f2829",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}
                >
                  Message
                </Typography>
              </Stack>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "20px",
                  border: "1px solid #f0e1da",
                  backgroundColor: "#fffdfb",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 4,
                    height: "100%",
                    background: "linear-gradient(180deg, #f6765e 0%, #ea6b54 100%)"
                  }}
                />
                <Typography
                  sx={{
                    pl: 1.5,
                    fontSize: { xs: 15, md: 16 },
                    color: "#3a3130",
                    lineHeight: 1.85,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {item.message || "No message provided."}
                </Typography>
              </Paper>
            </Box>

            {/* Attachment */}
            {item.file && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Paperclip size={16} color="#f6765e" />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#2f2829",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em"
                    }}
                  >
                    Attachment
                  </Typography>
                  {fileMeta.extension && (
                    <Chip
                      label={fileMeta.extension}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "rgba(246,118,94,0.12)",
                        color: "#f6765e"
                      }}
                    />
                  )}
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    position: "relative",
                    borderRadius: "20px",
                    border: "1px solid #f0e1da",
                    overflow: "hidden",
                    backgroundColor: "#fffdfb"
                  }}
                >
                  <Tooltip title="Download">
                    <IconButton
                      onClick={handleDownload}
                      aria-label="Download attachment"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        width: 40,
                        height: 40,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid #f0e1da",
                        color: "#f6765e",
                        boxShadow: "0 8px 24px rgba(48,30,24,0.12)",
                        "&:hover": {
                          backgroundColor: "#fff8f4",
                          color: "#ea6b54"
                        }
                      }}
                    >
                      <Download size={18} />
                    </IconButton>
                  </Tooltip>

                  {fileMeta.isImage ? (
                    <Box
                      sx={{
                        width: "100%",
                        maxHeight: 420,
                        overflow: "hidden",
                        backgroundColor: "#f8f2ee"
                      }}
                    >
                      <img
                        src={item.file}
                        alt="Feedback attachment"
                        style={{
                          width: "100%",
                          maxHeight: 420,
                          objectFit: "contain",
                          display: "block"
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        pr: 7,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        backgroundColor: "#fdf7f3"
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: "rgba(246,118,94,0.12)",
                          color: "#f6765e"
                        }}
                      >
                        <FileText size={22} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                          {fileMeta.label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: 13,
                            color: "#8d7f7b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {fileMeta.rawName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
