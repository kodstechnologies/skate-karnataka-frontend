import { useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { SkaterForm } from "@/features/admin/skaters/components/SkaterForm";
import {
  createSkaterFormValues,
  initialSkaterFormValues,
  skaterFieldLabels
} from "@/features/admin/skaters/components/skaterFormConfig";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

const validateSkaterForm = (formData) => {
  const errors = {};
  const requiredFields = [
    "fullName",
    "phone",
    "dob",
    "aadharNumber",
    "gender",
    "category",
    "discipline",
    "address",
    "district",
    "club",
    "parent",
    "bloodGroup"
  ];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = `${skaterFieldLabels[field]} is required`;
    }
  });

  if (formData.fullName.trim() && formData.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  if (formData.phone.trim() && !/^[0-9]{10}$/.test(formData.phone.trim())) {
    errors.phone = "Phone must be a 10 digit number";
  }

  if (formData.aadharNumber.trim() && !/^[0-9]{12}$/.test(formData.aadharNumber.trim())) {
    errors.aadharNumber = "Aadhaar number must be 12 digits";
  }

  if (formData.address.trim() && formData.address.trim().length > 200) {
    errors.address = "Address must be 200 characters or less";
  }

  return errors;
};

export const SkaterFormPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const isEditing = Boolean(skaterId);
  const skaters = useSkatersStore((state) => state.skaters);
  const addSkater = useSkatersStore((state) => state.addSkater);
  const updateSkater = useSkatersStore((state) => state.updateSkater);

  const existingSkater = useMemo(
    () => skaters.find((skater) => skater.id === skaterId) ?? null,
    [skaterId, skaters]
  );

  const [formData, setFormData] = useState(
    isEditing && existingSkater ? createSkaterFormValues(existingSkater) : initialSkaterFormValues
  );
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = () => {
    const nextErrors = validateSkaterForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (isEditing && existingSkater) {
      updateSkater(existingSkater.id, formData);
    } else {
      addSkater(formData);
    }

    navigate("/skaters");
  };

  if (isEditing && !existingSkater) {
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)",
            pointerEvents: "none"
          }}
        />

        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              sx={{
                mb: 2,
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
                "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.78)", fontSize: 12 }
              }}
            >
              <span>Dashboard</span>
              <span>Skaters</span>
              <span>{isEditing ? "Edit" : "Create"}</span>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              {isEditing ? "Update Skater Profile" : "Create Skater Profile"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Fill in athlete identity, guardian, school, and club details to keep the KRSA registry
              accurate and event-ready.
            </Typography>
          </Box>
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
              {isEditing ? "Edit registry entry" : "New registry entry"}
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              {isEditing
                ? "Update the stored details for this athlete."
                : "Add a new athlete to the KRSA skater registry."}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate("/skaters")}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSubmit}>
              {isEditing ? "Save changes" : "Create skater"}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          <SkaterForm formData={formData} errors={errors} onFieldChange={handleFieldChange} />
        </Box>
      </Paper>
    </Box>
  );
};
