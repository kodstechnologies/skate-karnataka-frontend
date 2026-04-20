import { useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { ClubForm } from "@/features/admin/clubs/components/ClubForm";
import {
  clubFieldLabels,
  createClubFormValues,
  initialClubFormValues
} from "@/features/admin/clubs/components/clubFormConfig";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";

const validateClubForm = (formData) => {
  const errors = {};
  const requiredFields = ["clubName", "district", "clubPresidentName", "clubPresidentPhone"];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = `${clubFieldLabels[field]} is required`;
    }
  });

  if (formData.clubName.trim() && formData.clubName.trim().length < 2) {
    errors.clubName = "Name of club must be at least 2 characters";
  }

  if (
    formData.clubPresidentPhone.trim() &&
    !/^[0-9]{10}$/.test(formData.clubPresidentPhone.trim())
  ) {
    errors.clubPresidentPhone = "Club president number must be a 10 digit number";
  }

  if (
    formData.clubSecretaryPhone.trim() &&
    !/^[0-9]{10}$/.test(formData.clubSecretaryPhone.trim())
  ) {
    errors.clubSecretaryPhone = "Club secretary number must be a 10 digit number";
  }

  return errors;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read file"));
    };

    reader.readAsDataURL(file);
  });

export const ClubFormPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const isEditing = Boolean(clubId);
  const clubs = useClubsStore((state) => state.clubs);
  const addClub = useClubsStore((state) => state.addClub);
  const updateClub = useClubsStore((state) => state.updateClub);

  const existingClub = useMemo(
    () => clubs.find((club) => club.id === clubId) ?? null,
    [clubId, clubs]
  );

  const [formData, setFormData] = useState(
    isEditing && existingClub ? createClubFormValues(existingClub) : initialClubFormValues
  );
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleFileChange = (field) => async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrors((current) => ({ ...current, [field]: "Only PDF files are allowed" }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setFormData((current) => ({
        ...current,
        [field]: {
          name: file.name,
          dataUrl
        }
      }));
      setErrors((current) => ({ ...current, [field]: "" }));
    } catch {
      setErrors((current) => ({ ...current, [field]: "Unable to read selected PDF" }));
    }
  };

  const handleSubmit = () => {
    const nextErrors = validateClubForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (isEditing && existingClub) {
      updateClub(existingClub.id, formData);
    } else {
      addClub(formData);
    }

    navigate("/clubs");
  };

  if (isEditing && !existingClub) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Club not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The club you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/clubs")}>
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
                to="/clubs"
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
              Build a complete club profile with identity details, office bearers, rink information,
              skater counts, and supporting PDFs in one elegant admin workflow.
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
            {isEditing ? "Refine club information" : "Start a new club entry"}
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#8d7f7b", lineHeight: 1.7 }}>
            {isEditing
              ? "Review each section below and update the stored club data with a more structured form."
              : "Complete the sections below to register a club in a clean and premium admin experience."}
          </Typography>
        </Box>

        <Box>
          <ClubForm
            formData={formData}
            errors={errors}
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
          <Button variant="outlined" onClick={() => navigate("/clubs")}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSubmit}>
            {isEditing ? "Save changes" : "Create club"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
