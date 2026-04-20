import { useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import { DistrictForm } from "@/features/admin/districts/components/DistrictForm";
import {
  createDistrictFormValues,
  initialDistrictFormValues
} from "@/features/admin/districts/components/districtFormConfig";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";
import { useStatesStore } from "@/features/admin/states/store/states-store";

const validateDistrictForm = (formData) => {
  const errors = {};
  const requiredFields = ["districtName", "stateName", "coordinatorName", "coordinatorPhone"];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }
  });

  if (formData.coordinatorPhone.trim() && !/^[0-9]{10}$/.test(formData.coordinatorPhone.trim())) {
    errors.coordinatorPhone = "Coordinator phone must be a 10 digit number";
  }

  if (
    formData.assistantCoordinatorPhone.trim() &&
    !/^[0-9]{10}$/.test(formData.assistantCoordinatorPhone.trim())
  ) {
    errors.assistantCoordinatorPhone = "Assistant coordinator phone must be a 10 digit number";
  }

  return errors;
};

export const DistrictFormPage = () => {
  const navigate = useNavigate();
  const { districtId } = useParams();
  const isEditing = Boolean(districtId);
  const districts = useDistrictsStore((store) => store.districts);
  const addDistrict = useDistrictsStore((store) => store.addDistrict);
  const updateDistrict = useDistrictsStore((store) => store.updateDistrict);
  const states = useStatesStore((store) => store.states);
  const stateOptions = useMemo(() => states.map((state) => state.stateName), [states]);
  const existingDistrict = useMemo(
    () => districts.find((item) => item.id === districtId) ?? null,
    [districtId, districts]
  );

  const [formData, setFormData] = useState(
    isEditing && existingDistrict
      ? createDistrictFormValues(existingDistrict)
      : initialDistrictFormValues
  );
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = () => {
    const nextErrors = validateDistrictForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (isEditing && existingDistrict) {
      updateDistrict(existingDistrict.id, formData);
    } else {
      addDistrict(formData);
    }

    navigate("/districts");
  };

  if (isEditing && !existingDistrict) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          District not found
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/districts")}>
          Back to districts
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
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.92) 0%, rgba(38, 25, 26, 0.76) 34%, rgba(246, 118, 94, 0.28) 100%), url("${districtHero}")`,
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
                to="/dashboard"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to="/districts"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Districts
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
              District Registration Workspace
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {isEditing ? "Update District" : "Create District"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Build a complete district profile with state mapping, coordinator details,
              participation counts, and operational status in one structured workspace.
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
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
          >
            {isEditing ? "Refine district information" : "Start a new district entry"}
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#8d7f7b", lineHeight: 1.7 }}>
            {isEditing
              ? "Review each section below and update the stored district data with a structured workflow."
              : "Complete the sections below to register a district in a clean and premium admin experience."}
          </Typography>
        </Box>

        <DistrictForm
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          stateOptions={stateOptions}
        />
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
          <Button variant="outlined" onClick={() => navigate("/districts")}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSubmit}>
            {isEditing ? "Save changes" : "Create district"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
