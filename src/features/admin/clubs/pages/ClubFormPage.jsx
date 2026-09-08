import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress
} from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { UploadProgressBanner } from "@/components/ui/UploadProgressBanner";
import clubHero from "@/assets/Club_header.jpg";
import { ClubForm } from "@/features/admin/clubs/components/ClubForm";
import {
  clubFieldLabels,
  createClubFormValues,
  initialClubFormValues
} from "@/features/admin/clubs/components/clubFormConfig";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { districtPortalApi } from "@/api/district-portal-api";

const validateClubForm = (formData, isDistrictRole) => {
  const errors = {};
  // District users don't pick a district — backend injects it
  const requiredFields = isDistrictRole ? ["name"] : ["name", "district"];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = `${clubFieldLabels[field]} is required`;
    }
  });

  if (formData.name.trim() && formData.name.trim().length < 2) {
    errors.name = "Name of club must be at least 2 characters";
  }

  return errors;
};

export const ClubFormPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const isEditing = Boolean(clubId);
  const role = useAuthStore((s) => s.role);
  const authUser = useAuthStore((s) => s.user);
  const isDistrictRole = String(role || "").toLowerCase() === "district";
  const returnPath = isDistrictRole ? "/district/clubs" : "/clubs";
  const dashboardPath = isDistrictRole ? "/district/dashboard" : "/dashboard";

  const clubs = useClubsStore((state) => state.clubs);
  const isLoading = useClubsStore((state) => state.isLoading);
  const fetchClubs = useClubsStore((state) => state.fetchClubs);
  const addClub = useClubsStore((state) => state.addClub);
  const updateClub = useClubsStore((state) => state.updateClub);

  const districts = useDistrictsStore((state) => state.districts);
  const fetchDistricts = useDistrictsStore((state) => state.fetchDistricts);

  const [formData, setFormData] = useState(initialClubFormValues);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtClub, setDistrictClub] = useState(null);
  const [districtClubLoading, setDistrictClubLoading] = useState(false);

  useEffect(() => {
    if (isDistrictRole || districts.length > 0) return;
    fetchDistricts({ limit: 100 });
  }, [isDistrictRole, districts.length, fetchDistricts]);

  useEffect(() => {
    if (!isEditing || isDistrictRole) return;
    fetchClubs({ limit: 100 });
  }, [isEditing, isDistrictRole, fetchClubs]);

  useEffect(() => {
    if (!isEditing || !isDistrictRole || !clubId) return;
    let cancelled = false;
    const load = async () => {
      setDistrictClubLoading(true);
      try {
        const response = await districtPortalApi.getClub(clubId);
        const data = response?.data ?? response;
        if (cancelled || !data) return;
        setDistrictClub({
          id: data._id || clubId,
          name: data.name || "",
          districtId: data.district || authUser?.districtId || "",
          officeAddress: data.officeAddress || "",
          about: data.about || "",
          img: data.img || ""
        });
      } catch {
        if (!cancelled) setDistrictClub(null);
      } finally {
        if (!cancelled) setDistrictClubLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isEditing, isDistrictRole, clubId, authUser?.districtId]);

  const existingClub = useMemo(() => {
    if (isDistrictRole) return districtClub;
    return clubs.find((club) => String(club.id) === String(clubId)) ?? null;
  }, [isDistrictRole, districtClub, clubs, clubId]);

  useEffect(() => {
    if (!existingClub?.id) return;
    setFormData(createClubFormValues(existingClub));
    setImagePreview(existingClub.img || null);
  }, [existingClub?.id, existingClub]);

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleFileChange = (field) => async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setErrors((current) => ({ ...current, [field]: "Only image files are allowed" }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [field]: file
    }));
    setImagePreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateClubForm(formData, isDistrictRole);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const storeOptions = isDistrictRole ? { skipRefresh: true } : {};
    const success =
      isEditing && existingClub
        ? await updateClub(existingClub.id, formData, storeOptions)
        : await addClub(formData, storeOptions);
    setIsSubmitting(false);

    if (success) {
      navigate(returnPath);
    }
  };

  if (isEditing && (isDistrictRole ? districtClubLoading : isLoading) && !existingClub) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <CircularProgress size={28} sx={{ color: "#f6765e" }} />
        <Typography sx={{ mt: 2, color: "#8d7f7b" }}>Loading club details...</Typography>
      </Paper>
    );
  }

  if (isEditing && !(isDistrictRole ? districtClubLoading : isLoading) && !existingClub) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Club not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The club you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate(returnPath)}>
          Back to clubs
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.92) 0%, rgba(38, 25, 26, 0.76) 34%, rgba(246, 118, 94, 0.28) 100%), url("${clubHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: { xs: -40, md: 24 },
            top: { xs: -30, md: 24 },
            width: { xs: 140, md: 220 },
            height: { xs: 140, md: 220 },
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none"
          }}
        />

        <Stack
          spacing={3}
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
                to={dashboardPath}
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
                to={returnPath}
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Clubs
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
              Club Registration Workspace
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {isEditing ? "Update Club Profile" : "Create Club Profile"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Build a complete club profile with identity details and information.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
          border: "1px solid rgba(246, 228, 221, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <UploadProgressBanner isSubmitting={isSubmitting} isEditing={isEditing} />
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
          >
            {isEditing ? "Refine club information" : "Start a new club entry"}
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#8d7f7b", lineHeight: 1.7 }}>
            {isEditing
              ? "Review each section below and update the stored club data with a more structured form."
              : isDistrictRole
                ? "Complete the sections below. This club will be created under your district."
                : "Complete the sections below to register a club in a clean and premium admin experience."}
          </Typography>
        </Box>

        <Box>
          <ClubForm
            formData={formData}
            existingImageUrl={imagePreview}
            errors={errors}
            districts={districts}
            hideDistrict={isDistrictRole}
            onFieldChange={handleFieldChange}
            onFileChange={handleFileChange}
          />
        </Box>

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
          <Button variant="outlined" onClick={() => navigate(returnPath)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} thickness={5} sx={{ color: "white" }} />
              ) : (
                <Save size={16} />
              )
            }
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Saving changes..."
                : "Creating club..."
              : isEditing
                ? "Save changes"
                : "Create club"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
