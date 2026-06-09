import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { Check, ChevronRight, ExternalLink, Image, X } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { galleryApi } from "@/api/gallery-api";
import {
  getMediaApprovalChipSx,
  getMediaApprovalLabel,
  MEDIA_APPROVAL
} from "@/lib/media-approval-status";
import toast from "react-hot-toast";

const orgMediaPath = (item) => {
  if (item.ownerType === "club" && item.ownerId) {
    return `/clubs/${item.ownerId}/media`;
  }
  if (item.ownerType === "district" && item.ownerId) {
    return `/districts/${item.ownerId}/media`;
  }
  return "/gallery";
};

export const GalleryApprovalsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await galleryApi.getPendingApprovals({ page: 1, limit: 100 });
      const payload = response?.data ?? response ?? {};
      const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
      setItems(rows);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load pending media");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const runAction = async (itemId, apiCall, successMessage) => {
    setActionId(itemId);
    try {
      const response = await apiCall();
      toast.success(response?.message || successMessage);
      await loadPending();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const mediaUrl = (item) => item.videoUrl || item.imageUrl;

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: "28px",
          border: "1px solid #f0e3dd",
          background: "linear-gradient(180deg, #fffaf8 0%, #ffffff 100%)"
        }}
      >
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2 }}>
          <Typography component={RouterLink} to="/dashboard" sx={{ textDecoration: "none", color: "#8d7f7b" }}>
            Dashboard
          </Typography>
          <Typography component={RouterLink} to="/gallery" sx={{ textDecoration: "none", color: "#8d7f7b" }}>
            Gallery
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>Pending approvals</Typography>
        </Breadcrumbs>

        <Stack sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Gallery approvals
            </Typography>
            <Typography sx={{ mt: 1, color: "#8d7f7b", maxWidth: 640, lineHeight: 1.6 }}>
              Club and district media appear here until you approve them. Only approved items are
              visible to skaters. Delete requests from clubs also need your confirmation.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/gallery")}>
            Back to gallery
          </Button>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#f6765e" }} />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: "24px", textAlign: "center", color: "#978a86" }}>
          No pending gallery actions. New uploads and delete requests will appear here.
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2
          }}
        >
          {items.map((item) => {
            const deletePending = item.pendingAction === "delete";
            const status = item.adminApprovalStatus || MEDIA_APPROVAL.APPROVED;
            const busy = actionId === item._id;
            const typeLabel = item.ownerType === "district" ? "District" : "Club";

            return (
              <Paper
                key={item._id}
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #f0e3dd",
                  overflow: "hidden",
                  bgcolor: "#fff"
                }}
              >
                <Box
                  sx={{
                    height: 160,
                    bgcolor: "#f5f0ed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  {mediaUrl(item) ? (
                    item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        controls
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={item.imageUrl}
                        alt={item.title}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )
                  ) : (
                    <Image size={32} color="#b19f99" />
                  )}
                </Box>

                <Box sx={{ p: 2 }}>
                  <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      label={deletePending ? "Delete request" : getMediaApprovalLabel(status)}
                      sx={getMediaApprovalChipSx(deletePending ? null : status, deletePending)}
                    />
                    <Chip size="small" label={typeLabel} variant="outlined" />
                  </Stack>

                  <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                    {item.title || "Untitled"}
                  </Typography>
                  {item.orgName && (
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "#8d7f7b" }}>
                      {item.orgName}
                    </Typography>
                  )}

                  <Stack direction="row" gap={0.75} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                    {deletePending ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              item._id,
                              () => galleryApi.approveDelete(item._id),
                              "Media deleted"
                            )
                          }
                        >
                          Approve delete
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              item._id,
                              () => galleryApi.rejectDelete(item._id),
                              "Delete cancelled"
                            )
                          }
                        >
                          Keep media
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={busy}
                          startIcon={<Check size={14} />}
                          onClick={() =>
                            runAction(
                              item._id,
                              () => galleryApi.approve(item._id),
                              "Approved — skaters can see this"
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={busy}
                          startIcon={<X size={14} />}
                          onClick={() =>
                            runAction(
                              item._id,
                              () => galleryApi.reject(item._id),
                              "Media rejected"
                            )
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<ExternalLink size={14} />}
                      onClick={() => navigate(orgMediaPath(item))}
                    >
                      Open org
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
