import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { clubApi } from "@/api/club-api";
import { districtApi } from "@/api/district-api";
import { eventsApi } from "@/api/events-api";
import { SkaterForm } from "@/features/admin/skaters/components/SkaterForm";
import {
  buildSkaterUpdateFormData,
  createSkaterFormValues,
  skaterFieldLabels
} from "@/features/admin/skaters/components/skaterFormConfig";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

const mapDistrictOption = (district) => ({
  id: district._id || district.id,
  districtName: district.name || district.districtName || ""
});

const mapClubOption = (club) => ({
  id: club._id || club.id,
  name: club.name || "",
  clubCode: club.clubId || "",
  districtName: club.districtName || club.district?.name || "",
  districtId: club.district?._id || club.districtId || club.district || ""
});

const mapSkaterClubOption = (skater) => {
  const club = skater?.club;
  if (!club?._id && !club) return null;
  return mapClubOption({
    _id: club._id || club,
    name: club.name || skater.clubName || "",
    clubId: club.clubId || "",
    districtName: club.districtName || club.district?.name || "",
    district: club.district
  });
};

const mapCategoryOption = (category) => ({
  id: category._id || category.id,
  name: category.typeName || category.name || ""
});

const validateSkaterForm = (formData) => {
  const errors = {};

  if (!String(formData.fullName ?? "").trim()) {
    errors.fullName = `${skaterFieldLabels.fullName} is required`;
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  }

  if (!String(formData.phone ?? "").trim()) {
    errors.phone = `${skaterFieldLabels.phone} is required`;
  } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
    errors.phone = "Phone must be a valid 10-digit Indian mobile number";
  }

  if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (formData.aadharNumber.trim() && !/^\d{12}$/.test(formData.aadharNumber.trim())) {
    errors.aadharNumber = "Aadhaar number must be 12 digits";
  }

  if (formData.address.trim().length > 200) {
    errors.address = "Address must be 200 characters or less";
  }

  return errors;
};

export const SkaterFormPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const {
    selectedSkater,
    isLoadingDetail,
    isSaving,
    fetchSkaterById,
    updateSkater
  } = useSkatersStore();

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    if (skaterId) {
      fetchSkaterById(skaterId);
    }
  }, [skaterId, fetchSkaterById]);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [districtRes, clubRes, categoryRes] = await Promise.all([
          districtApi.getAll({ page: 1, limit: 500 }),
          clubApi.getAll({ page: 1, limit: 500 }),
          eventsApi.getSkatingCategories({ source: "standard" })
        ]);

        if (!active) return;

        const districtRows = districtRes?.data?.data ?? districtRes?.data ?? [];
        const clubRows = clubRes?.data?.data ?? clubRes?.data ?? [];
        const categoryRows = Array.isArray(categoryRes?.data)
          ? categoryRes.data
          : categoryRes?.data?.data ?? categoryRes?.data ?? [];

        setDistricts(Array.isArray(districtRows) ? districtRows.map(mapDistrictOption) : []);
        setClubs(Array.isArray(clubRows) ? clubRows.map(mapClubOption) : []);
        setCategories(Array.isArray(categoryRows) ? categoryRows.map(mapCategoryOption) : []);
      } catch (error) {
        console.error("Failed to load skater form options:", error);
      } finally {
        if (active) setOptionsLoading(false);
      }
    };

    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedSkater?._id !== skaterId) return;

    setFormData(createSkaterFormValues(selectedSkater));

    const currentClub = mapSkaterClubOption(selectedSkater);
    if (!currentClub?.id) return;

    setClubs((prev) => {
      if (prev.some((club) => club.id === currentClub.id)) return prev;
      return [currentClub, ...prev];
    });
  }, [selectedSkater, skaterId]);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      const value = event.target.value;
      setFormData((current) => {
        const next = { ...current, [field]: value };

        if (field === "clubId") {
          const selectedClub = clubs.find((club) => club.id === value);
          next.clubName = selectedClub?.name || "";
          next.clubCode = selectedClub?.clubCode || "";
          next.clubDistrictName = selectedClub?.districtName || "";
          if (value && selectedClub?.districtId) {
            next.districtId = String(selectedClub.districtId);
          }
          if (!value) {
            next.clubName = "";
            next.clubCode = "";
            next.clubDistrictName = "";
          }
        }

        if (field === "categoryId") {
          const selectedCategory = categories.find((category) => category.id === value);
          next.categoryName = selectedCategory?.name || "";
        }

        return next;
      });
      setErrors((current) => ({ ...current, [field]: "" }));
    },
    [clubs, categories]
  );

  const handlePhotoChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((current) => ({
      ...current,
      photoFile: file,
      photoPreview: previewUrl
    }));
    event.target.value = "";
  }, []);

  const handleDocumentsChange = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setFormData((current) => ({
      ...current,
      newDocumentFiles: [...(current.newDocumentFiles || []), ...files]
    }));
    event.target.value = "";
  }, []);

  const handleRemoveExistingDocument = useCallback((url) => {
    setFormData((current) => ({
      ...current,
      removedDocumentUrls: [...(current.removedDocumentUrls || []), url]
    }));
  }, []);

  const handleRemoveNewDocument = useCallback((index) => {
    setFormData((current) => ({
      ...current,
      newDocumentFiles: (current.newDocumentFiles || []).filter((_, i) => i !== index)
    }));
  }, []);

  const isPageLoading = isLoadingDetail || !formData || optionsLoading;

  const handleSubmit = async () => {
    if (!formData || !skaterId) return;

    const nextErrors = validateSkaterForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const success = await updateSkater(skaterId, buildSkaterUpdateFormData(formData));
    if (success) {
      navigate(`/skaters/${skaterId}`);
    }
  };

  if (isPageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  if (!selectedSkater) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Skater not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The skater you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/skaters")}>
          Back to skaters
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 240 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.84) 0%, rgba(20, 17, 20, 0.58) 44%, rgba(20, 17, 20, 0.18) 100%), url("${skatersHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& a": { color: "rgba(255,255,255,0.86)", textDecoration: "none", fontSize: 14 },
              "& .MuiTypography-root": { color: "white", fontSize: 14, fontWeight: 600 }
            }}
          >
            <Typography component={RouterLink} to="/dashboard">
              Dashboard
            </Typography>
            <Typography component={RouterLink} to="/skaters">
              Skaters
            </Typography>
            <Typography component={RouterLink} to={`/skaters/${skaterId}`}>
              {selectedSkater.fullName}
            </Typography>
            <Typography>Edit</Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            Edit skater profile
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
            Update athlete details, change district or club affiliation, edit category, and manage
            profile photo and documents.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.7)",
          overflow: "hidden"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              {selectedSkater.fullName}
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Changes are saved to the KRSA registry immediately.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate(`/skaters/${skaterId}`)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={isSaving ? null : <Save size={16} />}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          <SkaterForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            districts={districts}
            clubs={clubs}
            categories={categories}
            onPhotoChange={handlePhotoChange}
            onDocumentsChange={handleDocumentsChange}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            onRemoveNewDocument={handleRemoveNewDocument}
          />
        </Box>
      </Paper>
    </Box>
  );
};
