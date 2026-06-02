import { useEffect, useState } from "react";
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
import { SkaterForm } from "@/features/admin/skaters/components/SkaterForm";
import {
  buildSkaterUpdatePayload,
  createSkaterFormValues,
  skaterFieldLabels
} from "@/features/admin/skaters/components/skaterFormConfig";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

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

  useEffect(() => {
    if (skaterId) {
      fetchSkaterById(skaterId);
    }
  }, [skaterId, fetchSkaterById]);

  useEffect(() => {
    if (selectedSkater?._id === skaterId) {
      setFormData(createSkaterFormValues(selectedSkater));
    }
  }, [selectedSkater, skaterId]);

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async () => {
    if (!formData || !skaterId) return;

    const nextErrors = validateSkaterForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const success = await updateSkater(skaterId, buildSkaterUpdatePayload(formData));
    if (success) {
      navigate(`/skaters/${skaterId}`);
    }
  };

  if (isLoadingDetail || !formData) {
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
            Update athlete contact and registration details. KRSA ID, district, and club are shown
            for reference.
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
            readOnlyMeta
          />
        </Box>
      </Paper>
    </Box>
  );
};
