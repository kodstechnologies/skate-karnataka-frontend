import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import { ChevronRight, Image, PencilLine, Plus, Search, Trash2, X, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import galleryHero from "@/assets/Circular_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useGalleryStore } from "@/features/admin/gallery/store/gallery-store";

export const GalleryPage = () => {
  const navigate = useNavigate();
  const { items, pagination, isLoading, fetchItems, deleteItem } = useGalleryStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [activeType, setActiveType] = useState("all");

  // Media Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchItems(activeType, page + 1, rowsPerPage);
  }, [fetchItems, activeType, page, rowsPerPage]);

  const handleDelete = async () => {
    if (!pendingDeleteItem) {
      return;
    }

    await deleteItem(pendingDeleteItem._id);
    setPendingDeleteItem(null);
  };

  const handleViewMedia = (url, type) => {
    setSelectedMedia({ url, type });
    setViewerOpen(true);
  };

  const filteredItems = items.filter((item) =>
    (item.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4.5 },
          minHeight: { xs: 220, md: 300 },
          borderRadius: { xs: "24px", md: "32px" },
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(83, 199, 197, 0.23) 100%), url("${galleryHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
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
              Publish gallery items with image, video banner, and targeted delivery for state,
              district, and club audiences.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              {["all", "state", "district", "club"].map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  onClick={() => {
                    setActiveType(type);
                    setPage(0);
                  }}
                  sx={{
                    color: "white",
                    backgroundColor: activeType === type ? "#f6765e" : "rgba(255,255,255,0.14)",
                    "&:hover": {
                      backgroundColor: activeType === type ? "#f6765e" : "rgba(255,255,255,0.24)"
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "24px", md: "32px" },
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)",
          minHeight: 400
        }}
      >
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
              Gallery Registry{" "}
              {activeType !== "all"
                ? `(${activeType.charAt(0).toUpperCase() + activeType.slice(1)})`
                : "(All Items)"}
            </Typography>
            <Typography
              sx={{ mt: 0.75, color: "#8d7f7b", fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              View and manage gallery items.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              width: { xs: "100%", sm: "auto" },
              alignItems: "stretch", // Stretch to match heights
              flexGrow: { xs: 0, sm: 1 },
              maxWidth: { xs: "100%", sm: "600px" }
            }}
          >
            <TextField
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              placeholder="Search owner name..."
              fullWidth
              size="small"
              sx={{
                "& .MuiInputBase-root": { height: "48px", borderRadius: "12px" }
              }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/gallery/create")}
              sx={{
                height: "48px",
                px: 4,
                borderRadius: "12px",
                whiteSpace: "nowrap",
                minWidth: { xs: "100%", sm: "200px" }, // Give it more width as requested
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(246, 118, 94, 0.25)",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(246, 118, 94, 0.35)"
                }
              }}
            >
              Add gallery item
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {[...Array(6)].map((_, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background: "white"
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={240}
                    sx={{ borderRadius: "20px 20px 0 0" }}
                  />
                  <Box sx={{ p: 2.5 }}>
                    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="50%" height={20} />
                    <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                      <Skeleton
                        variant="rectangular"
                        width={70}
                        height={36}
                        sx={{ borderRadius: "10px" }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={36}
                        sx={{ borderRadius: "10px" }}
                      />
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : filteredItems.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {filteredItems.map((item) => (
                <Paper
                  key={item._id}
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,250,248,1) 100%)",
                    boxShadow: "0 20px 50px rgba(56, 36, 29, 0.08)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(56, 36, 29, 0.12)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 220, sm: 240 }, // Fixed exact height for consistency
                      position: "relative",
                      background: item.imageUrl
                        ? `url("${item.imageUrl}")`
                        : `linear-gradient(180deg, rgba(24,18,18,0.2) 0%, rgba(24,18,18,0.56) 100%), url("${galleryHero}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        "& .view-overlay": { opacity: 1 },
                        "& .play-icon": { transform: "scale(1.1)" }
                      }
                    }}
                    onClick={() =>
                      handleViewMedia(
                        item.videoUrl ? item.videoUrl : item.imageUrl,
                        item.videoUrl ? "video" : "image"
                      )
                    }
                  >
                    {/* Glassy View Overlay */}
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
                          className="play-icon"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(12px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.4)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                        >
                          <Play size={24} color="white" fill="white" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(12px)",
                            px: 2,
                            py: 0.75,
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem"
                          }}
                        >
                          View Image
                        </Box>
                      )}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      useFlexGap
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 2
                      }}
                    >
                      <Chip
                        size="small"
                        label={item.ownerType}
                        sx={{
                          backgroundColor: "#53c7c5",
                          color: "white",
                          fontWeight: 700,
                          backdropFilter: "blur(4px)"
                        }}
                      />
                    </Stack>
                  </Box>

                  <Stack
                    spacing={1.25}
                    sx={{
                      p: 2,
                      position: "relative"
                    }}
                  >
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#2f2829" }}>
                      {item.ownerName || "Unknown Owner"}
                    </Typography>

                    <Typography sx={{ color: "#7e716d", fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        mt: 2,
                        justifyContent: "flex-end"
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PencilLine size={14} />}
                        onClick={() => navigate(`/gallery/${item._id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Trash2 size={14} />}
                        onClick={() => setPendingDeleteItem(item)}
                        sx={{
                          backgroundColor: "#f6765e",
                          "&:hover": { backgroundColor: "#ea6b54" }
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
                color: "#978a86"
              }}
            >
              No gallery items found.
            </Paper>
          )}
        </Box>

        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 9, 12]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "center" },
              gap: { xs: 1, sm: 0 }
            }
          }}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteItem)}
        title="Delete gallery item"
        itemLabel={pendingDeleteItem?.ownerName}
        description="This item will be permanently removed. You can’t undo this action."
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
            overflow: "hidden", // Remove all scrollbars
            "&::-webkit-scrollbar": { display: "none" }, // Safari/Chrome
            msOverflowStyle: "none", // IE/Edge
            scrollbarWidth: "none" // Firefox
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
          {/* Internal Close Button - Positioned in the corner of the media */}
          <IconButton
            onClick={() => setViewerOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
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
                position: "relative",
                backgroundColor: "white",
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              >
                Your browser does not support the video tag.
              </video>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
                backgroundColor: "#ffffff",
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
                  width: "auto",
                  height: "auto",
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
