import { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight, Layers, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import disciplinesHero from "@/assets/Disciplines_header.png";
import { DisciplineForm } from "@/features/admin/disciplines/components/DisciplineForm";
import {
  createDisciplineFormValues,
  disciplineFieldLabels,
  initialDisciplineFormValues
} from "@/features/admin/disciplines/components/disciplineFormConfig";
import { useDisciplinesStore } from "@/features/admin/disciplines/store/disciplines-store";

const validateDisciplineForm = (formData) => {
  const errors = {};
  const requiredFields = ["title", "text", "about"];

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = `${disciplineFieldLabels[field]} is required`;
    }
  });

  return errors;
};

export const DisciplineFormPage = () => {
  const navigate = useNavigate();
  const { disciplineId } = useParams();
  const isEditing = Boolean(disciplineId);

  const disciplines = useDisciplinesStore((s) => s.disciplines);
  const fetchDisciplines = useDisciplinesStore((s) => s.fetchDisciplines);
  const addDiscipline = useDisciplinesStore((s) => s.addDiscipline);
  const updateDiscipline = useDisciplinesStore((s) => s.updateDiscipline);

  // Fetch list if store is empty (direct URL access)
  useEffect(() => {
    if (disciplines.length === 0) {
      fetchDisciplines({ limit: 100 });
    }
  }, [disciplines.length, fetchDisciplines]);

  const existingDiscipline = useMemo(
    () => disciplines.find((d) => d.id === disciplineId) ?? null,
    [disciplineId, disciplines]
  );

  const [formData, setFormData] = useState(
    isEditing && existingDiscipline
      ? createDisciplineFormValues(existingDiscipline)
      : initialDisciplineFormValues
  );
  const [errors, setErrors] = useState({});

  // Re-populate form once existing data loads (direct URL access)
  useEffect(() => {
    if (isEditing && existingDiscipline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(createDisciplineFormValues(existingDiscipline));
    }
  }, [isEditing, existingDiscipline]);

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleFileChange = (field) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, [field]: "Only image files are allowed" }));
      return;
    }

    setFormData((current) => ({ ...current, [field]: file }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateDisciplineForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const success =
      isEditing && existingDiscipline
        ? await updateDiscipline(existingDiscipline.id, formData)
        : await addDiscipline(formData);

    if (success) {
      navigate("/disciplines");
    }
  };

  // Not found guard (only after data has loaded)
  if (isEditing && disciplines.length > 0 && !existingDiscipline) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Discipline not found
        </Typography>
        <Typography sx={{ mt: 1.5, color: "#8d7f7b" }}>
          The discipline you are trying to edit is not available.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/disciplines")}>
          Back to disciplines
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 280, md: 320 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${disciplinesHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        {/* radial overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none"
          }}
        />
        {/* decorative circle */}
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
            {/* Breadcrumbs */}
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
                to="/disciplines"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "white" }
                }}
              >
                Disciplines
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>
                {isEditing ? "Edit" : "Create"}
              </Typography>
            </Breadcrumbs>

            {/* Label */}
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
              Discipline Registration Workspace
            </Typography>

            {/* Title */}
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1.5 }}>
              {isEditing ? "Update Discipline" : "Create Discipline"}
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              {isEditing
                ? "Review and update the discipline details including its image, title, and descriptions."
                : "Build a complete discipline profile with all the relevant information."}
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Layers size={16} />}
                label={isEditing ? "Editing discipline" : "New discipline"}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Form Card ──────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "32px",
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
            {isEditing ? "Refine discipline information" : "Start a new discipline entry"}
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#8d7f7b", lineHeight: 1.7 }}>
            {isEditing
              ? "Review each section below and update the stored discipline data."
              : "Complete the sections below to register a discipline in the system."}
          </Typography>
        </Box>

        <Box>
          <DisciplineForm
            formData={formData}
            errors={errors}
            existingImg={existingDiscipline?.img || ""}
            onFieldChange={handleFieldChange}
            onFileChange={handleFileChange}
          />
        </Box>

        {/* Action buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(240,219,210,0.9)",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/disciplines")}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            {isEditing ? "Save changes" : "Create discipline"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
