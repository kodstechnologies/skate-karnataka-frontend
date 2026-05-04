import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  Skeleton
} from "@mui/material";
import { ChevronRight, Image, Save, Video } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import galleryHero from "@/assets/Gallery_header.jpg";
import { useGalleryStore } from "@/features/admin/gallery/store/gallery-store";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

export const GalleryFormPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = Boolean(itemId);

  const items = useGalleryStore((s) => s.items);
  const isLoading = useGalleryStore((s) => s.isLoading);
  const fetchItems = useGalleryStore((s) => s.fetchItems);
  const addItem = useGalleryStore((s) => s.addItem);
  const updateItem = useGalleryStore((s) => s.updateItem);

  // Load items from store if empty (direct URL access to edit page)
  useEffect(() => {
    if (isEditing && items.length === 0) {
      fetchItems("all", 1, 100);
    }
  }, [isEditing, items.length, fetchItems]);

  // Find the existing item by _id
  const existingItem = useMemo(
    () => (isEditing ? (items.find((i) => i._id === itemId) ?? null) : null),
    [isEditing, itemId, items]
  );

  // Form state — exactly matching API fields: title, about, img (file), video (file)
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [synced, setSynced] = useState(false);

  // Sync form when existingItem loads
  if (isEditing && existingItem && !synced) {
    setSynced(true);
    setTitle(existingItem.title || "");
    setAbout(existingItem.about || "");
    setImgPreview(existingItem.imageUrl || null);
    setVideoPreview(existingItem.videoUrl || null);
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, img: "Only image files are allowed" }));
      return;
    }
    setImgFile(file);
    setErrors((prev) => ({ ...prev, img: "" }));
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setErrors((prev) => ({ ...prev, video: "Only video files are allowed" }));
      return;
    }
    setVideoFile(file);
    setVideoPreview(file.name);
    setErrors((prev) => ({ ...prev, video: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!isEditing && !imgFile && !videoFile) {
      nextErrors.general = "Please upload at least an image or a video";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Build FormData — all 4 API fields
    const formData = new FormData();
    if (imgFile) formData.append("img", imgFile);
    if (videoFile) formData.append("video", videoFile);
    if (title.trim()) formData.append("title", title.trim());
    if (about.trim()) formData.append("about", about.trim());

    try {
      if (isEditing) {
        await updateItem(itemId, formData);
      } else {
        await addItem(formData);
      }
      navigate("/gallery");
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ── Item not found after items loaded ──
  if (isEditing && !isLoading && items.length > 0 && !existingItem) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Item not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The gallery item you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/gallery")}>
          Back to gallery
        </Button>
      </Paper>
    );
  }

  // Loading state (fetching items for edit)
  const isFetchingForEdit = isEditing && isLoading && !existingItem;

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4.5 },
          minHeight: { xs: 210, md: 280 },
          borderRadius: { xs: "24px", md: "32px" },
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.68) 40%, rgba(83,199,197,0.20) 100%), url("${galleryHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
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
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>

          <Typography
            sx={{
              mb: 1.25,
              fontSize: { xs: 13, md: 14 },
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.72)"
            }}
          >
            Gallery Upload Workspace
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
            {isEditing ? "Update Gallery Item" : "Create Gallery Item"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            {isEditing
              ? "Update the title, description, image, or video for this gallery entry."
              : "Add a title, description, and upload a photo or video to create a new gallery entry."}
          </Typography>
        </Stack>
      </Paper>

      {/* ── Form Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: { xs: "24px", md: "32px" },
          border: "1px solid rgba(246,228,221,0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
          >
            {isEditing ? "Update gallery entry" : "New gallery entry"}
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#8d7f7b", lineHeight: 1.7 }}>
            {isEditing
              ? "Edit the fields below. Leave file inputs empty to keep existing media."
              : "Fill in the details and upload at least one media file."}
          </Typography>
        </Box>

        {isFetchingForEdit ? (
          <Stack spacing={2.5}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "16px" }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
                gap: 3
              }}
            >
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: "22px" }} />
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: "22px" }} />
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {/* ── Title & About ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2
              }}
            >
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this gallery item"
                fullWidth
                sx={inputStyles}
              />
              <TextField
                label="About / Description"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Short description (optional)"
                multiline
                minRows={3}
                fullWidth
                sx={inputStyles}
              />
            </Box>

            {/* ── Image & Video uploads ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
                gap: 3
              }}
            >
              {/* Image */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "22px",
                  border: "1px solid #f4e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "grid",
                      placeItems: "center",
                      color: "#f6765e",
                      backgroundColor: "rgba(246,118,94,0.12)",
                      flexShrink: 0
                    }}
                  >
                    <Image size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 15 }}>
                      Photo Upload
                    </Typography>
                    <Typography sx={{ color: "#9b8d88", fontSize: 12 }}>
                      JPG, PNG, WebP — max 10 MB
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: "14px", mb: 2, justifyContent: "flex-start", py: 1.25 }}
                >
                  <Image size={16} style={{ marginRight: 8 }} />
                  {imgFile ? imgFile.name : "Choose Image"}
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>

                {errors.img && (
                  <Typography sx={{ color: "#d32f2f", fontSize: 12, mb: 1 }}>
                    {errors.img}
                  </Typography>
                )}

                {imgPreview ? (
                  <Box sx={{ position: "relative", borderRadius: "18px", overflow: "hidden" }}>
                    <img
                      src={imgPreview}
                      alt="Preview"
                      style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                    />
                    {imgFile && (
                      <Chip
                        size="small"
                        label="New"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor: "#f6765e",
                          color: "white",
                          fontWeight: 700
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 110,
                      borderRadius: "18px",
                      border: "2px dashed #f4e5de",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c5b3ac"
                    }}
                  >
                    <Stack alignItems="center" spacing={0.75}>
                      <Image size={30} />
                      <Typography sx={{ fontSize: 13 }}>No image selected</Typography>
                    </Stack>
                  </Box>
                )}
              </Paper>

              {/* Video */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "22px",
                  border: "1px solid #d4eef6",
                  backgroundColor: "#f4fbff"
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "grid",
                      placeItems: "center",
                      color: "#0ea5d5",
                      backgroundColor: "rgba(14,165,213,0.12)",
                      flexShrink: 0
                    }}
                  >
                    <Video size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 15 }}>
                      Video Upload
                    </Typography>
                    <Typography sx={{ color: "#5a9ab0", fontSize: 12 }}>
                      MP4, WebM, MOV — max 100 MB
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: "14px",
                    mb: 2,
                    justifyContent: "flex-start",
                    py: 1.25,
                    borderColor: "#b8e8f7",
                    color: "#2a6a82",
                    "&:hover": { borderColor: "#0ea5d5" }
                  }}
                >
                  <Video size={16} style={{ marginRight: 8 }} />
                  {videoFile ? videoFile.name : "Choose Video"}
                  <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
                </Button>

                {errors.video && (
                  <Typography sx={{ color: "#d32f2f", fontSize: 12, mb: 1 }}>
                    {errors.video}
                  </Typography>
                )}

                {typeof videoPreview === "string" && videoPreview.startsWith("http") ? (
                  <Box
                    sx={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #b8e8f7" }}
                  >
                    <video
                      src={videoPreview}
                      controls
                      style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                    />
                  </Box>
                ) : videoPreview ? (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#eefbff",
                      borderRadius: "18px",
                      border: "1px solid #b8e8f7"
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Video size={18} color="#0ea5d5" />
                      <Typography sx={{ fontSize: 13, color: "#2a6a82", fontWeight: 600 }}>
                        {videoPreview}
                      </Typography>
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "#5a9ab0" }}>
                      Ready to upload
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 110,
                      borderRadius: "18px",
                      border: "2px dashed #b8e8f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8ac8d8"
                    }}
                  >
                    <Stack alignItems="center" spacing={0.75}>
                      <Video size={30} />
                      <Typography sx={{ fontSize: 13 }}>No video selected</Typography>
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Box>
          </Stack>
        )}

        {errors.general && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, fontWeight: 600, textAlign: "center" }}
          >
            {errors.general}
          </Typography>
        )}

        {/* ── Actions ── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid rgba(240,219,210,0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/gallery")}
            sx={{ width: { xs: "100%", sm: "auto" }, py: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ width: { xs: "100%", sm: "auto" }, py: 1 }}
          >
            {isEditing ? "Save changes" : "Create gallery item"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
