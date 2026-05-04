import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { CalendarDays, ChevronRight, Image as ImageIcon, User, Video, Info } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import galleryHero from "@/assets/Gallery_header.jpg";
import { useGalleryStore } from "@/features/admin/gallery/store/gallery-store";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

export const GalleryDetailPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const items = useGalleryStore((s) => s.items);
  const isLoading = useGalleryStore((s) => s.isLoading);
  const fetchItems = useGalleryStore((s) => s.fetchItems);

  useEffect(() => {
    if (items.length === 0) fetchItems("all", 1, 100);
  }, [items.length, fetchItems]);

  const item = useMemo(() => items.find((i) => i._id === itemId) ?? null, [itemId, items]);

  const hasImage = !!item?.imageUrl;
  const hasVideo = !!item?.videoUrl;
  const hasBoth = hasImage && hasVideo;

  const [activeMedia, setActiveMedia] = useState("image");

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (hasVideo && !hasImage) setActiveMedia("video");
      else setActiveMedia("image");
    }
  }, [item, item?._id, hasImage, hasVideo]);

  const activeUrl = activeMedia === "video" ? item?.videoUrl : item?.imageUrl;

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
        <ImageIcon size={48} color="#e0cbc4" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Item not found
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#f6765e",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
          }}
          onClick={() => navigate("/gallery")}
        >
          Back to Gallery
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
          background: `linear-gradient(120deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.68) 40%, rgba(83,199,197,0.20) 100%), url("${galleryHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
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
                to="/gallery"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Gallery
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Details</Typography>
            </Breadcrumbs>

            <Typography
              sx={{
                mb: 1.25,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              Gallery Details
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.06em",
                mb: 1.5,
                fontSize: { xs: "1.6rem", md: "3rem" }
              }}
            >
              {item?.title || "Untitled Media"}
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<CalendarDays size={16} />}
                label={formatDate(item?.createdAt)}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              {hasVideo && (
                <Chip
                  icon={<Video size={16} />}
                  label="Video"
                  sx={{ color: "white", backgroundColor: "rgba(246,118,94,0.8)", fontWeight: 700 }}
                />
              )}
              {hasImage && (
                <Chip
                  icon={<ImageIcon size={16} />}
                  label="Image"
                  sx={{ color: "white", backgroundColor: "rgba(83,199,197,0.75)", fontWeight: 700 }}
                />
              )}
              {/* {item?.ownerType && <Chip label={item.ownerType} sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.18)", fontWeight: 700, textTransform: "capitalize" }} />} */}
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
            {/* ── Sidebar: Media Information ── */}
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
                Media Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <Info size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Title
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#2f2829" }}>
                    {item?.title || "—"}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "#f0e1da" }} />
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <User size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Uploaded By
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, color: "#2f2829" }}>
                    {item?.ownerName || "—"}
                  </Typography>
                  {/* <Typography sx={{ fontSize: 13, color: "#8d7f7b", textTransform: "capitalize", mt: 0.5 }}>Role: {item?.ownerType || "—"}</Typography> */}
                </Box>
                <Divider sx={{ borderColor: "#f0e1da" }} />
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                  >
                    <CalendarDays size={16} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                      Upload Date
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, color: "#2f2829" }}>
                    {formatDate(item?.createdAt)}
                  </Typography>
                </Box>
                {item?.about && (
                  <>
                    <Divider sx={{ borderColor: "#f0e1da" }} />
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 0.5, alignItems: "center", color: "#f6765e" }}
                      >
                        <Info size={16} />
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
                        >
                          About
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 14, color: "#5a4d49", lineHeight: 1.6 }}>
                        {item.about}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", sm: "block" }, borderColor: "#f0e1da" }}
            />
            <Divider sx={{ display: { xs: "block", sm: "none" }, borderColor: "#f0e1da", my: 3 }} />

            {/* ── Main: Media Preview ── */}
            <Box sx={{ flex: 1 }}>
              {/* Preview header + toggle */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#2f2829",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}
                >
                  Media Preview
                </Typography>

                {/* Toggle — only if both image and video exist */}
                {hasBoth && (
                  <ButtonGroup
                    size="small"
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #f0ddd5",
                      "& .MuiButtonGroup-grouped": {
                        border: "none",
                        borderRadius: 0,
                        px: 2,
                        py: 0.75,
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: "none",
                        transition: "all 0.2s ease"
                      }
                    }}
                  >
                    <Button
                      startIcon={<ImageIcon size={14} />}
                      onClick={() => setActiveMedia("image")}
                      variant={activeMedia === "image" ? "contained" : "text"}
                      sx={{
                        backgroundColor: activeMedia === "image" ? "#f6765e" : "transparent",
                        color: activeMedia === "image" ? "white" : "#8d7f7b",
                        "&:hover": {
                          backgroundColor:
                            activeMedia === "image" ? "#ea6b54" : "rgba(246,118,94,0.08)"
                        }
                      }}
                    >
                      Image
                    </Button>
                    <Button
                      startIcon={<Video size={14} />}
                      onClick={() => setActiveMedia("video")}
                      variant={activeMedia === "video" ? "contained" : "text"}
                      sx={{
                        backgroundColor: activeMedia === "video" ? "#f6765e" : "transparent",
                        color: activeMedia === "video" ? "white" : "#8d7f7b",
                        "&:hover": {
                          backgroundColor:
                            activeMedia === "video" ? "#ea6b54" : "rgba(246,118,94,0.08)"
                        }
                      }}
                    >
                      Video
                    </Button>
                  </ButtonGroup>
                )}
              </Stack>

              {/* Media display */}
              <Box
                sx={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: "#0c0c0e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: { xs: 240, sm: 320, md: 400 }
                }}
              >
                {activeUrl ? (
                  activeMedia === "video" ? (
                    <video
                      key={activeUrl}
                      src={activeUrl}
                      controls
                      playsInline
                      style={{
                        width: "100%",
                        maxHeight: "520px",
                        display: "block",
                        objectFit: "contain"
                      }}
                    />
                  ) : (
                    <img
                      key={activeUrl}
                      src={activeUrl}
                      alt={item?.title || "Gallery"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "520px",
                        objectFit: "contain",
                        display: "block"
                      }}
                    />
                  )
                ) : (
                  <Stack alignItems="center" spacing={1} sx={{ color: "rgba(255,255,255,0.3)" }}>
                    <ImageIcon size={48} />
                    <Typography sx={{ fontSize: 13 }}>No media available</Typography>
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#f0e1da" }} />
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/gallery")}
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Back to gallery
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/gallery/${item._id}/edit`)}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Edit Item
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
