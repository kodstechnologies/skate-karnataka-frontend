import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  Check,
  ChevronRight,
  Image,
  Plus,
  Trash2
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { galleryApi } from "@/api/gallery-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import {
  getMediaApprovalChipSx,
  getMediaApprovalLabel,
  MEDIA_APPROVAL
} from "@/lib/media-approval-status";
import toast from "react-hot-toast";

const emptyForm = { title: "", about: "", img: null, video: null };

const ORG_LABELS = {
  club: "Club",
  district: "District",
  state: "State"
};

const ORG_LIST_PATHS = {
  club: "/clubs",
  district: "/districts",
  state: "/gallery"
};

const PORTAL_HOME = {
  club: "/club/dashboard",
  district: "/district/dashboard"
};

export const OrgMediaPage = ({ orgType, portalMode = false }) => {
  const navigate = useNavigate();
  const params = useParams();
  const role = useAuthStore((s) => s.role);
  const canApprove = ["admin", "state"].includes(String(role || "").toLowerCase());

  const orgId =
    orgType === "club"
      ? params.clubId
      : orgType === "district"
        ? params.districtId
        : null;
  const listPath = portalMode ? PORTAL_HOME[orgType] : ORG_LIST_PATHS[orgType];
  const orgLabel = ORG_LABELS[orgType] || "Organization";

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionId, setActionId] = useState(null);

  const loadMedia = useCallback(async () => {
    if (!portalMode && !orgId && orgType !== "state") return;
    setIsLoading(true);
    try {
      const response = portalMode
        ? await galleryApi.getMyMedia({ page: 1, limit: 100 })
        : await galleryApi.getByOwner({
            ownerType: orgType,
            ...(orgId ? { ownerId: orgId } : {}),
            page: 1,
            limit: 100
          });
      const payload = response?.data ?? response ?? {};
      const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
      setItems(rows);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load media");
    } finally {
      setIsLoading(false);
    }
  }, [orgId, orgType, portalMode]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const pendingCount = useMemo(
    () =>
      items.filter(
        (item) =>
          item.adminApprovalStatus === MEDIA_APPROVAL.PENDING ||
          item.deleteApprovalStatus === "pending"
      ).length,
    [items]
  );

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.img && !form.video) {
      toast.error("Upload an image or video");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("about", form.about.trim());
    if (!portalMode && orgId) {
      formData.append("targetOwnerType", orgType);
      formData.append("targetOwnerId", orgId);
    }
    if (form.img) formData.append("img", form.img);
    if (form.video) formData.append("video", form.video);

    setIsSaving(true);
    try {
      const response = await galleryApi.create(formData);
      toast.success(
        response?.message ||
          "Media submitted — pending super admin approval before skaters can see it"
      );
      setAddOpen(false);
      setForm(emptyForm);
      await loadMedia();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add media");
    } finally {
      setIsSaving(false);
    }
  };

  const runAction = async (itemId, apiCall, successMessage) => {
    setActionId(itemId);
    try {
      const response = await apiCall();
      toast.success(response?.message || successMessage);
      await loadMedia();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      const response = await galleryApi.delete(pendingDelete._id);
      const result = response?.data ?? response;
      toast.success(
        result?.message ||
          (result?.pendingDelete
            ? "Delete request sent for super admin approval"
            : "Media deleted")
      );
      setPendingDelete(null);
      await loadMedia();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete media");
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
          <Typography
            component={RouterLink}
            to={portalMode ? listPath : "/dashboard"}
            sx={{ textDecoration: "none", color: "#8d7f7b" }}
          >
            Dashboard
          </Typography>
          {!portalMode && (
            <Typography component={RouterLink} to={listPath} sx={{ textDecoration: "none", color: "#8d7f7b" }}>
              {orgType === "state" ? "Gallery" : `${orgLabel}s`}
            </Typography>
          )}
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>Media</Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              {orgLabel} media
            </Typography>
            <Typography sx={{ mt: 1, color: "#8d7f7b", maxWidth: 560, lineHeight: 1.6 }}>
              {orgType === "state"
                ? "State media is visible to skaters and guests as soon as it is uploaded."
                : "Club and district uploads need super admin approval before skaters can see them. Deletes also require approval."}
            </Typography>
            {pendingCount > 0 && (
              <Chip
                size="small"
                label={`${pendingCount} pending action(s)`}
                sx={{ mt: 1.5, ...getMediaApprovalChipSx(MEDIA_APPROVAL.PENDING) }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(listPath)}>
              Back
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Add media
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#f6765e" }} />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: "24px", textAlign: "center", color: "#978a86" }}>
          No media yet. Add photos or videos for this {orgLabel.toLowerCase()}.
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)"
            },
            gap: 2
          }}
        >
          {items.map((item) => {
            const deletePending = item.deleteApprovalStatus === "pending";
            const status = item.adminApprovalStatus || MEDIA_APPROVAL.APPROVED;
            const busy = actionId === item._id;

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
                    height: 180,
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
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    <Chip
                      size="small"
                      label={getMediaApprovalLabel(status)}
                      sx={getMediaApprovalChipSx(status)}
                    />
                    {deletePending && (
                      <Chip
                        size="small"
                        label="Delete pending"
                        sx={getMediaApprovalChipSx(null, true)}
                      />
                    )}
                  </Stack>

                  <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                    {item.title || "Untitled"}
                  </Typography>
                  {item.about && (
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "#8d7f7b" }} noWrap>
                      {item.about}
                    </Typography>
                  )}

                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
                    {canApprove && status === MEDIA_APPROVAL.PENDING && !deletePending && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={busy}
                          startIcon={<Check size={14} />}
                          onClick={() =>
                            runAction(item._id, () => galleryApi.approve(item._id), "Media approved")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={busy}
                          onClick={() =>
                            runAction(item._id, () => galleryApi.reject(item._id), "Media rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {canApprove && deletePending && (
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
                              "Delete approved"
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
                          Cancel delete
                        </Button>
                      </>
                    )}
                    {!deletePending && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Trash2 size={14} />}
                        onClick={() => setPendingDelete(item)}
                      >
                        {status === MEDIA_APPROVAL.APPROVED && orgType !== "state" && !canApprove
                          ? "Request delete"
                          : "Delete"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={addOpen} onClose={() => !isSaving && setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {orgLabel.toLowerCase()} media</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            />
            <Button variant="outlined" component="label">
              {form.img ? form.img.name : "Upload image"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({ ...f, img: e.target.files?.[0] || null }))
                }
              />
            </Button>
            <Button variant="outlined" component="label">
              {form.video ? form.video.name : "Upload video (optional)"}
              <input
                hidden
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setForm((f) => ({ ...f, video: e.target.files?.[0] || null }))
                }
              />
            </Button>
            {orgType !== "state" && (
              <Typography variant="caption" sx={{ color: "#8d7f7b" }}>
                Skaters will only see this after super admin approves it.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAdd} disabled={isSaving}>
            {isSaving
              ? "Uploading…"
              : orgType === "state"
                ? "Upload"
                : "Submit for approval"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete media"
        description={
          pendingDelete?.adminApprovalStatus === MEDIA_APPROVAL.APPROVED &&
          orgType !== "state" &&
          !canApprove
            ? "This will submit a delete request for super admin approval."
            : "Remove this media item?"
        }
        itemLabel={pendingDelete?.title}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
