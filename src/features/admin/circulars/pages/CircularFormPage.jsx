import { useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import circularHero from "@/assets/Circular_header.jpg";
import { useCircularsStore } from "@/features/admin/circulars/store/circulars-store";

const targetOptions = ["State", "District", "Club"];
const states = ["Karnataka", "Tamil Nadu", "Kerala", "Maharashtra", "Telangana"];

const districtsByState = {
  Karnataka: ["Bengaluru Urban", "Mysuru", "Mangaluru", "Belagavi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
  Maharashtra: ["Pune", "Mumbai", "Nagpur"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"]
};

const clubsByDistrict = {
  "Bengaluru Urban": ["Velocity Blades Club", "Skyline Rollers", "Indiranagar Inline Club"],
  Mysuru: ["Mysuru Aero Wheels", "Royal Rink Club"],
  Mangaluru: ["Coastal Glide Club", "Portline Skaters"],
  Belagavi: ["Belagavi Blitz Club"],
  Chennai: ["Marina Sprint Club", "Chennai Champions Skate"],
  Coimbatore: ["CBE Velocity Club"],
  Madurai: ["Temple City Rollers"],
  Kochi: ["Kochi Bay Skaters"],
  Thiruvananthapuram: ["Capital Wheels Club"],
  Kozhikode: ["Malabar Motion Club"],
  Pune: ["Pune Nitro Skaters"],
  Mumbai: ["Mumbai Metro Skate Club"],
  Nagpur: ["Orange City Gliders"],
  Hyderabad: ["Hyderabad Hawks Skate Club"],
  Warangal: ["Warangal Roll Arena"],
  Nizamabad: ["Nizam Speed Wheels"]
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export const CircularFormPage = () => {
  const navigate = useNavigate();
  const { circularId } = useParams();
  const isEditing = Boolean(circularId);
  const circulars = useCircularsStore((state) => state.circulars);
  const addCircular = useCircularsStore((state) => state.addCircular);
  const updateCircular = useCircularsStore((state) => state.updateCircular);
  const existingCircular = useMemo(
    () => circulars.find((item) => item.id === circularId) ?? null,
    [circularId, circulars]
  );

  const [targetType, setTargetType] = useState(existingCircular?.targetType ?? "State");
  const [selectedState, setSelectedState] = useState(existingCircular?.selectedState ?? "");
  const [selectedDistrict, setSelectedDistrict] = useState(
    existingCircular?.selectedDistrict ?? ""
  );
  const [selectedClub, setSelectedClub] = useState(existingCircular?.selectedClub ?? "");
  const [title, setTitle] = useState(existingCircular?.title ?? "");
  const [content, setContent] = useState(existingCircular?.content ?? "");
  const [contentType, setContentType] = useState(existingCircular?.contentType ?? "image");
  const [videoTitle, setVideoTitle] = useState(existingCircular?.videoTitle ?? "");
  const [circularImage, setCircularImage] = useState(existingCircular?.circularImage ?? null);
  const [videoBanner, setVideoBanner] = useState(existingCircular?.videoBanner ?? null);
  const [videoFile, setVideoFile] = useState(existingCircular?.videoFile ?? null);
  const [errors, setErrors] = useState({});

  const districtOptions = useMemo(
    () => (selectedState ? (districtsByState[selectedState] ?? []) : []),
    [selectedState]
  );

  const clubOptions = useMemo(
    () => (selectedDistrict ? (clubsByDistrict[selectedDistrict] ?? []) : []),
    [selectedDistrict]
  );

  const audience =
    targetType === "State"
      ? selectedState
      : targetType === "District"
        ? selectedDistrict
        : selectedClub;

  const resetTargetValuesForType = (nextType) => {
    if (nextType === "State") {
      setSelectedDistrict("");
      setSelectedClub("");
      return;
    }

    if (nextType === "District") {
      setSelectedClub("");
    }
  };

  const handleImageUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, [field]: "Only image files are allowed" }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const payload = { name: file.name, dataUrl };
      if (field === "circularImage") {
        setCircularImage(payload);
      } else {
        setVideoBanner(payload);
      }
      setErrors((current) => ({ ...current, [field]: "" }));
    } catch {
      setErrors((current) => ({ ...current, [field]: "Unable to read selected image" }));
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrors((current) => ({ ...current, videoFile: "Only video files are allowed" }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setVideoFile({ name: file.name, dataUrl });
      setErrors((current) => ({ ...current, videoFile: "" }));
    } catch {
      setErrors((current) => ({ ...current, videoFile: "Unable to read selected video" }));
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = "Circular title is required";
    if (!content.trim()) nextErrors.content = "Circular content is required";
    if (contentType === "image" && !circularImage)
      nextErrors.circularImage = "Upload image is required";
    if (contentType === "video" && !videoTitle.trim())
      nextErrors.videoTitle = "Video title is required";
    if (contentType === "video" && !videoBanner)
      nextErrors.videoBanner = "Video cover image is required";
    if (contentType === "video" && !videoFile) nextErrors.videoFile = "Video upload is required";
    if (!selectedState) nextErrors.selectedState = "Please select a state";
    if (targetType === "District" && !selectedDistrict)
      nextErrors.selectedDistrict = "Please select a district";
    if (targetType === "Club" && !selectedClub) nextErrors.selectedClub = "Please select a club";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      title,
      content,
      contentType,
      circularImage,
      videoTitle,
      videoBanner,
      videoFile,
      targetType,
      selectedState,
      selectedDistrict,
      selectedClub,
      audience
    };

    if (isEditing && existingCircular) {
      updateCircular(existingCircular.id, payload);
    } else {
      addCircular(payload);
    }

    navigate("/circulars");
  };

  if (isEditing && !existingCircular) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Circular not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The circular you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/circulars")}>
          Back to circulars
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
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(83, 199, 197, 0.23) 100%), url("${circularHero}")`,
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
              to="/circulars"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "white" }
              }}
            >
              Circulars
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
            {isEditing ? "Update Circular" : "Create Circular"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 700, lineHeight: 1.7 }}>
            Choose content type first. For image circular, upload image only. For video circular,
            provide video title, cover image, and video file, then target state, district, or club
            users.
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
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[#36406a]">Circular title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-[#f0ddd5] bg-[#fffaf8] px-4 py-3 text-sm text-[#2f2829] outline-none transition focus:border-[#f6765e] focus:ring-4 focus:ring-[#f6765e]/15"
            />
            {errors.title && <p className="text-xs font-medium text-[#d43c6a]">{errors.title}</p>}
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[#36406a]">Content type</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "image", label: "Image Circular" },
                { value: "video", label: "Video Circular" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setContentType(option.value);
                    setErrors((current) => ({
                      ...current,
                      circularImage: "",
                      videoTitle: "",
                      videoBanner: "",
                      videoFile: ""
                    }));
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    contentType === option.value
                      ? "bg-[#2f2829] text-white shadow-[0_8px_18px_rgba(47,40,41,0.24)]"
                      : "border border-[#f0ddd5] bg-white text-[#6f6462] hover:bg-[#fff5f1]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-[#36406a]">Circular content</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-[#f0ddd5] bg-[#fffaf8] px-4 py-3 text-sm text-[#2f2829] outline-none transition focus:border-[#f6765e] focus:ring-4 focus:ring-[#f6765e]/15"
            />
            {errors.content && (
              <p className="text-xs font-medium text-[#d43c6a]">{errors.content}</p>
            )}
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[#36406a]">Target type</span>
            <div className="grid grid-cols-3 gap-2">
              {targetOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTargetType(type);
                    resetTargetValuesForType(type);
                  }}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                    targetType === type
                      ? "bg-[#f6765e] text-white shadow-[0_8px_18px_rgba(246,118,94,0.3)]"
                      : "border border-[#f0ddd5] bg-white text-[#6f6462] hover:bg-[#fff5f1]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {contentType === "image" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#36406a]">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event, "circularImage")}
                className="w-full rounded-2xl border border-dashed border-[#bbc7ff] bg-[#f4f7ff] px-3 py-2.5 text-sm text-[#4a578f] file:mr-3 file:rounded-xl file:border-0 file:bg-[#6f53ff] file:px-3 file:py-1.5 file:text-white"
              />
              {errors.circularImage && (
                <p className="text-xs font-medium text-[#d43c6a]">{errors.circularImage}</p>
              )}
              {circularImage?.dataUrl && (
                <img
                  src={circularImage.dataUrl}
                  alt={circularImage.name}
                  className="h-40 w-full rounded-2xl object-cover"
                />
              )}
            </label>
          ) : (
            <>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#36406a]">Video title</span>
                <input
                  value={videoTitle}
                  onChange={(event) => setVideoTitle(event.target.value)}
                  className="w-full rounded-2xl border border-[#d8dff9] bg-[#fdfdff] px-4 py-3 text-sm text-[#1f274b] outline-none transition focus:border-[#29a8d4] focus:ring-4 focus:ring-[#29a8d4]/15"
                />
                {errors.videoTitle && (
                  <p className="text-xs font-medium text-[#d43c6a]">{errors.videoTitle}</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#36406a]">Video cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, "videoBanner")}
                  className="w-full rounded-2xl border border-dashed border-[#b8e8f7] bg-[#eefbff] px-3 py-2.5 text-sm text-[#2a6a82] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0ea5d5] file:px-3 file:py-1.5 file:text-white"
                />
                {errors.videoBanner && (
                  <p className="text-xs font-medium text-[#d43c6a]">{errors.videoBanner}</p>
                )}
                {videoBanner?.dataUrl && (
                  <img
                    src={videoBanner.dataUrl}
                    alt={videoBanner.name}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#36406a]">Video upload</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full rounded-2xl border border-dashed border-[#b8e8f7] bg-[#eefbff] px-3 py-2.5 text-sm text-[#2a6a82] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0ea5d5] file:px-3 file:py-1.5 file:text-white"
                />
                {errors.videoFile && (
                  <p className="text-xs font-medium text-[#d43c6a]">{errors.videoFile}</p>
                )}
                {videoFile?.name && (
                  <p className="text-xs font-medium text-[#2a6a82]">{videoFile.name}</p>
                )}
              </label>
            </>
          )}

          <label className="space-y-2">
            <span className="text-sm font-medium text-[#36406a]">State</span>
            <select
              value={selectedState}
              onChange={(event) => {
                setSelectedState(event.target.value);
                setSelectedDistrict("");
                setSelectedClub("");
              }}
              className="w-full rounded-xl border border-[#f0ddd5] bg-white px-3 py-2.5 text-sm text-[#2f2829] outline-none focus:border-[#f6765e]"
            >
              <option value="">Choose state</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.selectedState && (
              <p className="text-xs font-medium text-[#d43c6a]">{errors.selectedState}</p>
            )}
          </label>

          {targetType !== "State" && (
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#36406a]">District</span>
              <select
                value={selectedDistrict}
                onChange={(event) => {
                  setSelectedDistrict(event.target.value);
                  setSelectedClub("");
                }}
                disabled={!selectedState}
                className="w-full rounded-xl border border-[#f0ddd5] bg-white px-3 py-2.5 text-sm text-[#2f2829] outline-none disabled:cursor-not-allowed disabled:bg-[#f6f1ef] focus:border-[#f6765e]"
              >
                <option value="">Choose district</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.selectedDistrict && (
                <p className="text-xs font-medium text-[#d43c6a]">{errors.selectedDistrict}</p>
              )}
            </label>
          )}

          {targetType === "Club" && (
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#36406a]">Club</span>
              <select
                value={selectedClub}
                onChange={(event) => setSelectedClub(event.target.value)}
                disabled={!selectedDistrict}
                className="w-full rounded-xl border border-[#f0ddd5] bg-white px-3 py-2.5 text-sm text-[#2f2829] outline-none disabled:cursor-not-allowed disabled:bg-[#f6f1ef] focus:border-[#f6765e]"
              >
                <option value="">Choose club</option>
                {clubOptions.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
              {errors.selectedClub && (
                <p className="text-xs font-medium text-[#d43c6a]">{errors.selectedClub}</p>
              )}
            </label>
          )}
        </div>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(240, 219, 210, 0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/circulars")}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSubmit}>
            {isEditing ? "Save changes" : "Create circular"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
