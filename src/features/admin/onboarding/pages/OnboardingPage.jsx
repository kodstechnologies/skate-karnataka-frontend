import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, Image, PencilLine, Plus, Trash2, X, ZoomIn } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useOnboardingStore } from "../store/onboarding-store";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

const OnboardingImage = ({ src, index, onPreview }) => {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <Box>
      <Typography
        sx={{
          mb: 1,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#a28f89"
        }}
      >
        Image {index + 1}
      </Typography>
      {showFallback ? (
        <Box
          sx={{
            width: "100%",
            height: { xs: 260, sm: 300, md: 340 },
            borderRadius: "20px",
            border: "2px dashed #f0e1da",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fffaf8"
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#c0aba4" }}>No image</Typography>
        </Box>
      ) : (
        <Box
          onClick={() => onPreview(src, `Image ${index + 1}`)}
          sx={{
            position: "relative",
            borderRadius: "20px",
            overflow: "hidden",
            cursor: "pointer",
            border: "2px solid #f0e1da",
            "&:hover .onboarding-zoom-hint": { opacity: 1 },
            "&:hover img": { transform: "scale(1.03)" }
          }}
        >
          <Box
            component="img"
            src={src}
            alt={`Onboarding ${index + 1}`}
            onError={() => setErrored(true)}
            sx={{
              width: "100%",
              height: { xs: 260, sm: 300, md: 340 },
              objectFit: "cover",
              display: "block",
              transition: "transform 0.25s ease"
            }}
          />
          <Stack
            className="onboarding-zoom-hint"
            direction="row"
            spacing={0.5}
            sx={{ position: "absolute",
              right: 12,
              bottom: 12,
              px: 1.25,
              py: 0.6,
              borderRadius: "10px",
              backgroundColor: "rgba(0,0,0,0.55)",
              color: "white",
              opacity: 0,
              transition: "opacity 0.2s ease", alignItems: "center" }}
          >
            <ZoomIn size={14} />
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>View full</Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const ImagesGrid = ({ onboarding, onPreview }) => (
  <Box
    sx={{
      display: { xs: "flex", sm: "grid" },
      gridTemplateColumns: { sm: "repeat(3, 1fr)" },
      flexDirection: { xs: "row" },
      gap: 2.5,
      overflowX: { xs: "auto", sm: "visible" },
      pb: { xs: 1, sm: 0 },
      // smooth momentum scroll on iOS
      WebkitOverflowScrolling: "touch",
      scrollSnapType: { xs: "x mandatory", sm: "none" },
      "&::-webkit-scrollbar": { height: 6 },
      "&::-webkit-scrollbar-track": { borderRadius: 3, backgroundColor: "#f4ede9" },
      "&::-webkit-scrollbar-thumb": { borderRadius: 3, backgroundColor: "#e0c8c0" }
    }}
  >
    {["imgOne", "imgTwo", "imgThree"].map((key, i) => (
      <Box
        key={key}
        sx={{
          flex: { xs: "0 0 80vw", sm: "unset" },
          maxWidth: { xs: "80vw", sm: "unset" },
          scrollSnapAlign: { xs: "start", sm: "unset" }
        }}
      >
        <OnboardingImage src={onboarding[key]} index={i} onPreview={onPreview} />
      </Box>
    ))}
  </Box>
);

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const onboarding = useOnboardingStore((s) => s.onboarding);
  const fetchOnboarding = useOnboardingStore((s) => s.fetchOnboarding);
  const deleteOnboarding = useOnboardingStore((s) => s.deleteOnboarding);
  const isLoading = useOnboardingStore((s) => s.isLoading);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  const handleDelete = async () => {
    const ok = await deleteOnboarding(onboarding._id);
    if (ok) setConfirmOpen(false);
  };

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 200, md: 230 },
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.8)",
          background: "linear-gradient(135deg, #2f2829 0%, #f6765e 100%)",
          color: "white"
        }}
      >
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          sx={{
            mb: 2,
            "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
            "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
          }}
        >
          <Typography
            component={RouterLink}
            to="/dashboard"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ color: "white", fontWeight: 700 }}>Onboarding</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em", mb: 1 }}>
          Onboarding Manager
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 520 }}>
          Manage the three onboarding screen images displayed to new users.
        </Typography>
        <Chip
          label="Single active record — always shows the latest"
          sx={{ mt: 2.5, color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
        />
      </Paper>

      {/* Content */}
      {isLoading ? (
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: "28px" }} />
      ) : !onboarding ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: "28px",
            border: "1px solid #f0e1da",
            textAlign: "center",
            background: "linear-gradient(180deg, #fff 0%, #fff9f6 100%)"
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "24px",
              margin: "0 auto 20px",
              backgroundColor: "rgba(246,118,94,0.1)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <Image size={36} color="#f6765e" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
            No onboarding record yet
          </Typography>
          <Typography sx={{ mt: 1.5, color: "#8d7f7b", maxWidth: 400, mx: "auto" }}>
            Create the first onboarding record to set the three intro images.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/onboarding/edit")}
            sx={{
              mt: 3.5,
              backgroundColor: "#f6765e",
              boxShadow: "none",
              borderRadius: "14px",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Create Onboarding
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "32px",
            border: "1px solid rgba(246,228,221,0.95)",
            background: "linear-gradient(180deg, #fff 0%, #fff9f6 100%)",
            boxShadow: "0 26px 80px rgba(48,30,24,0.07)",
            overflow: "hidden"
          }}
        >
          {/* Action bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              borderBottom: "1px solid #f0e1da"
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
                Current Onboarding Images
              </Typography>
              <Chip
                label={`Updated: ${onboarding.updatedAt ? new Date(onboarding.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}`}
                size="small"
                sx={{ mt: 0.75, backgroundColor: "#fdf0eb", color: "#c56b53", fontWeight: 600 }}
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                startIcon={<PencilLine size={16} />}
                onClick={() => navigate("/onboarding/edit")}
                sx={{ borderRadius: "14px", textTransform: "none" }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<Trash2 size={16} />}
                onClick={() => setConfirmOpen(true)}
                sx={{
                  borderRadius: "14px",
                  textTransform: "none",
                  backgroundColor: "#f6765e",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>

          {/* Images */}
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <ImagesGrid
              onboarding={onboarding}
              onPreview={(src, title) => setPreview({ src, title })}
            />
          </Box>
        </Paper>
      )}

      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            m: 2,
            maxWidth: "min(96vw, 1100px)",
            width: "100%",
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "#111"
          }
        }}
      >
        <Stack
          direction="row"
          sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography sx={{ fontWeight: 700, color: "white" }}>
            {preview?.title || "Full image"}
          </Typography>
          <IconButton onClick={() => setPreview(null)} sx={{ color: "white" }}>
            <X size={20} />
          </IconButton>
        </Stack>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
            minHeight: { xs: "60vh", md: "75vh" }
          }}
        >
          {preview?.src && (
            <Box
              component="img"
              src={preview.src}
              alt={preview.title}
              sx={{
                maxWidth: "100%",
                maxHeight: "85vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block"
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Delete Onboarding"
        description="This will permanently remove the onboarding record. This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
