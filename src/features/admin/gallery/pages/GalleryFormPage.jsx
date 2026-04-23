import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography, Skeleton } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import galleryHero from "@/assets/Circular_header.jpg";
import { useGalleryStore } from "@/features/admin/gallery/store/gallery-store";

export const GalleryFormPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = Boolean(itemId);
  const { items, isLoading, addItem, updateItem } = useGalleryStore();

  const existingItem = items.find((item) => item._id === itemId);

  const [imgFile, setImgFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(existingItem?.imageUrl || null);
  const [videoPreview, setVideoPreview] = useState(existingItem?.videoUrl || null);
  const [errors, setErrors] = useState({});
  const [lastSyncedId, setLastSyncedId] = useState(null);

  // Sync state when existingItem becomes available or changes
  if (existingItem && existingItem._id !== lastSyncedId) {
    setLastSyncedId(existingItem._id);
    setImgPreview(existingItem.imageUrl);
    setVideoPreview(existingItem.videoUrl);
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(file.name);
    }
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

    const formData = new FormData();
    if (imgFile) formData.append("img", imgFile);
    if (videoFile) formData.append("video", videoFile);

    try {
      if (isEditing) {
        await updateItem(itemId, formData);
      } else {
        await addItem(formData);
      }
      navigate("/gallery");
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (isEditing && !existingItem && !isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Item not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The item you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/gallery")}>
          Back to gallery
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4.5 },
          minHeight: { xs: 210, md: 280 },
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
            Upload an image or a video to the gallery.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: { xs: "24px", md: "32px" },
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)",
          position: "relative"
        }}
      >
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Box className="space-y-2">
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: "16px" }} />
              <Skeleton variant="rectangular" height={240} sx={{ mt: 2, borderRadius: "24px" }} />
            </Box>
            <Box className="space-y-2">
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: "16px" }} />
              <Skeleton variant="rectangular" height={240} sx={{ mt: 2, borderRadius: "24px" }} />
            </Box>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#36406a]">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-2xl border border-dashed border-[#bbc7ff] bg-[#f4f7ff] px-3 py-2.5 text-sm text-[#4a578f] file:mr-3 file:rounded-xl file:border-0 file:bg-[#6f53ff] file:px-3 file:py-1.5 file:text-white"
              />
              {imgPreview && (
                <Box sx={{ mt: 2, position: "relative" }}>
                  <img
                    src={imgPreview}
                    alt="Preview"
                    className="h-60 w-full rounded-2xl object-cover"
                  />
                </Box>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[#36406a]">Upload video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full rounded-2xl border border-dashed border-[#b8e8f7] bg-[#eefbff] px-3 py-2.5 text-sm text-[#2a6a82] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0ea5d5] file:px-3 file:py-1.5 file:text-white"
              />
              {videoPreview && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: "#eefbff", borderRadius: "16px" }}>
                  <Typography variant="body2" sx={{ color: "#2a6a82" }}>
                    {typeof videoPreview === "string" && videoPreview.startsWith("http")
                      ? "Existing video: " + videoPreview.split("/").pop()
                      : "New video selected: " + videoPreview}
                  </Typography>
                  {typeof videoPreview === "string" && videoPreview.startsWith("http") && (
                    <video
                      src={videoPreview}
                      controls
                      className="mt-2 w-full rounded-xl h-40 object-cover"
                    />
                  )}
                </Box>
              )}
            </label>
          </div>
        )}

        {errors.general && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
            {errors.general}
          </Typography>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid rgba(240, 219, 210, 0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/gallery")}
            fullWidth={false}
            sx={{ width: { xs: "100%", sm: "auto" }, py: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSubmit}
            disabled={isLoading}
            fullWidth={false}
            sx={{ width: { xs: "100%", sm: "auto" }, py: 1 }}
          >
            {isEditing ? "Save changes" : "Create gallery item"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
