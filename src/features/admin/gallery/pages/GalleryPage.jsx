import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  Typography,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import { ChevronRight, Image, PencilLine, Plus, Trash2, X, Play, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import galleryHero from "@/assets/Gallery_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useGalleryStore } from "@/features/admin/gallery/store/gallery-store";

export const GalleryPage = () => {
  const navigate = useNavigate();
  const { items, pagination, isLoading, fetchItems, deleteItem } = useGalleryStore();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [activeType, setActiveType] = useState("all");

  // Media viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchItems(activeType, page + 1, rowsPerPage);
  }, [fetchItems, activeType, page, rowsPerPage]);

  const handleDelete = async () => {
    if (!pendingDeleteItem) return;
    await deleteItem(pendingDeleteItem._id);
    setPendingDeleteItem(null);
  };

  const handleViewMedia = (url, type) => {
    setSelectedMedia({ url, type });
    setViewerOpen(true);
  };

  // ── Pagination: prefer backend total, fall back to frontend slicing ──
  const isBackendPagination = !!(pagination && pagination.total > 0);

  const displayItems = useMemo(() => {
    if (isBackendPagination) {
      // Backend already returns the correct page slice
      return items;
    }
    // Frontend slicing
    const start = page * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, isBackendPagination, page, rowsPerPage]);

  const totalCount = useMemo(() => {
    if (isBackendPagination) {
      return pagination.total;
    }
    return items.length;
  }, [items.length, isBackendPagination, pagination]);

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4.5 },
          minHeight: { xs: 220, md: 300 },
          borderRadius: { xs: "24px", md: "32px" },
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.85) 0%, rgba(38,25,26,0.66) 40%, rgba(83,199,197,0.20) 100%), url("${galleryHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Gallery</Typography>
            </Breadcrumbs>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.05em",
                mb: 1.5,
                fontSize: { xs: "1.65rem", md: "3rem" }
              }}
            >
              Gallery Management Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Upload and manage photos and videos for state, district, and club audiences — all from
              one clean workspace.
            </Typography>

            {/* Type filter chips (Commented out as requested) */}
            {/* <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              {["all", "state", "district", "club"].map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  onClick={() => { setActiveType(type); setPage(0); }}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    backgroundColor: activeType === type ? "#f6765e" : "rgba(255,255,255,0.14)",
                    "&:hover": { backgroundColor: activeType === type ? "#f6765e" : "rgba(255,255,255,0.24)" }
                  }}
                />
              ))}
            </Stack> */}
          </Box>
        </Stack>
      </Paper>

      {/* ── Gallery List ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "24px", md: "32px" },
          border: "1px solid rgba(246,228,221,0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)",
          minHeight: 400
        }}
      >
        {/* Toolbar */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            p: { xs: 2, md: 3 },
            alignItems: { lg: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.04em",
                fontSize: { xs: "1.25rem", sm: "1.5rem" }
              }}
            >
              Gallery Registry
            </Typography>
            <Typography
              sx={{ mt: 0.75, color: "#8d7f7b", fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              View and manage gallery photos and videos.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/gallery/create")}
              sx={{
                height: "48px",
                px: 3,
                borderRadius: "12px",
                whiteSpace: "nowrap",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(246,118,94,0.25)",
                "&:hover": { boxShadow: "0 10px 25px rgba(246,118,94,0.35)" }
              }}
            >
              Add gallery item
            </Button>
          </Stack>
        </Stack>

        {/* Grid */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                gap: 2
              }}
            >
              {[...Array(rowsPerPage)].map((_, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{ borderRadius: "20px", border: "1px solid #f0ddd5", overflow: "hidden" }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={220}
                    sx={{ borderRadius: "20px 20px 0 0" }}
                  />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="70%" height={24} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="50%" height={18} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="40%" height={16} />
                    <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
                      <Skeleton
                        variant="rectangular"
                        width={65}
                        height={32}
                        sx={{ borderRadius: "10px" }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={75}
                        height={32}
                        sx={{ borderRadius: "10px" }}
                      />
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : displayItems.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                gap: 2
              }}
            >
              {displayItems.map((item) => (
                <Paper
                  key={item._id}
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background: "linear-gradient(180deg,#fff 0%,#fffaf8 100%)",
                    boxShadow: "0 20px 50px rgba(56,36,29,0.08)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(56,36,29,0.12)"
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      height: { xs: 200, sm: 220 },
                      position: "relative",
                      background: item.imageUrl
                        ? `url("${item.imageUrl}")`
                        : "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover .view-overlay": { opacity: 1 }
                    }}
                    onClick={() =>
                      handleViewMedia(
                        item.videoUrl ? item.videoUrl : item.imageUrl,
                        item.videoUrl ? "video" : "image"
                      )
                    }
                  >
                    {/* Hover overlay */}
                    <Box
                      className="view-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1
                      }}
                    >
                      {item.videoUrl ? (
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(12px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.4)"
                          }}
                        >
                          <Play size={26} color="white" fill="white" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(12px)",
                            px: 2.5,
                            py: 1,
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                          }}
                        >
                          <Image size={16} /> View Image
                        </Box>
                      )}
                    </Box>

                    {/* No media placeholder */}
                    {!item.imageUrl && !item.videoUrl && (
                      <Stack
                        alignItems="center"
                        spacing={0.75}
                        sx={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        <Image size={36} />
                        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          No media
                        </Typography>
                      </Stack>
                    )}

                    {/* ownerType badge (Commented out as requested) */}
                    {/* {item.ownerType && (
                      <Chip
                        size="small"
                        label={item.ownerType}
                        sx={{
                          position: "absolute", top: 10, left: 10, zIndex: 2,
                          backgroundColor: "#53c7c5", color: "white",
                          fontWeight: 700, textTransform: "capitalize"
                        }}
                      />
                    )} */}

                    {/* Video badge */}
                    {item.videoUrl && (
                      <Chip
                        size="small"
                        label="Video"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 2,
                          backgroundColor: "rgba(246,118,94,0.9)",
                          color: "white",
                          fontWeight: 700
                        }}
                      />
                    )}
                  </Box>

                  {/* Card body — only API fields */}
                  <Stack
                    spacing={0.5}
                    sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    {/* title (API field) */}
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#2f2829" }}>
                      {item.title || "—"}
                    </Typography>

                    {/* about (API field) */}
                    {item.about && (
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#7e716d",
                          lineHeight: 1.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {item.about}
                      </Typography>
                    )}

                    {/* ownerName (API field) */}
                    {item.ownerName && (
                      <Typography sx={{ fontSize: 12, color: "#9e8c87", fontWeight: 600 }}>
                        {item.ownerName}
                      </Typography>
                    )}

                    {/* createdAt (API field) */}
                    <Typography sx={{ fontSize: 11, color: "#b8a8a4" }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: "auto", pt: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gallery/${item._id}`);
                        }}
                        sx={{
                          flex: 1,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#53c7c5",
                          color: "#2a6a82",
                          "&:hover": {
                            borderColor: "#0ea5d5",
                            backgroundColor: "rgba(83,199,197,0.1)"
                          }
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PencilLine size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gallery/${item._id}/edit`);
                        }}
                        sx={{
                          flex: 1,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 600
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Trash2 size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteItem(item);
                        }}
                        sx={{
                          flex: 1,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 600,
                          backgroundColor: "#f6765e",
                          "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" },
                          boxShadow: "none"
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: "22px",
                textAlign: "center",
                color: "#978a86",
                border: "1px dashed #f0ddd5"
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Image size={40} style={{ opacity: 0.35 }} />
                <Typography>No gallery items found.</Typography>
              </Stack>
            </Paper>
          )}
        </Box>

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
          rowsPerPageOptions={[6, 9, 12]}
        />
      </Paper>

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteItem)}
        title="Delete gallery item"
        itemLabel={pendingDeleteItem?.title || pendingDeleteItem?.ownerName || "this item"}
        description="This item will be permanently removed from the gallery. You can't undo this action."
        onClose={() => setPendingDeleteItem(null)}
        onConfirm={handleDelete}
      />

      {/* Media Viewer Dialog */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth={selectedMedia?.type === "video" ? "md" : "sm"}
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
            maxWidth: selectedMedia?.type === "video" ? "900px" : "600px",
            margin: { xs: 2, sm: 4 },
            overflow: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" }
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            overflow: "hidden"
          }}
        >
          <IconButton
            onClick={() => setViewerOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.65)" },
              zIndex: 100,
              border: "1px solid rgba(255,255,255,0.2)",
              p: 0.5
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </IconButton>

          {selectedMedia?.type === "video" ? (
            <Box
              sx={{
                width: "100%",
                aspectRatio: "16/9",
                backgroundColor: "black",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 24px 50px rgba(0,0,0,0.5)"
              }}
            >
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: { xs: "300px", sm: "400px" }
              }}
            >
              <img
                src={selectedMedia?.url}
                alt="Gallery Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
