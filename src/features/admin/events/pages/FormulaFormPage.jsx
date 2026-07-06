import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { getPortalFormulaConfig, isOrgFormulaPortal } from "@/features/admin/events/utils/portalFormulaConfig";
import eventsHero from "@/assets/Events_header.jpg";
import FormulaRoundsEditor from "@/features/admin/events/components/FormulaRoundsEditor";
import {
  buildFormulaFormState,
  buildFormulaPayload,
  initialFormulaForm,
  unwrapFormulaDoc,
  validateFormulaForm
} from "@/features/admin/events/utils/formulaFormUtils";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

export default function FormulaFormPage({ portalMode = "admin" }) {
  const isOrgPortal = isOrgFormulaPortal(portalMode);
  const portal = getPortalFormulaConfig(portalMode);
  const api = portal.api;
  const basePath = portal.basePath;
  const dashboardPath = portal.dashboardPath;
  const navigate = useNavigate();
  const { formulaId } = useParams();
  const isEditing = Boolean(formulaId);

  const [form, setForm] = useState(initialFormulaForm);
  const [errors, setErrors] = useState({});
  const [loadingDoc, setLoadingDoc] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    setLoadingDoc(true);
    api
      .getById(formulaId)
      .then((res) => setForm(buildFormulaFormState(unwrapFormulaDoc(res))))
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoadingDoc(false));
  }, [isEditing, formulaId, api]);

  const handleSubmit = async () => {
    const nextErrors = validateFormulaForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const roundError = Object.values(nextErrors).find((msg) =>
        String(msg).includes("TIME rounds")
      );
      if (roundError) toast.error(roundError);
      return;
    }

    const payload = buildFormulaPayload(form);
    setSaving(true);
    try {
      if (isEditing) {
        const res = await api.update(formulaId, payload);
        toast.success(res?.message || "Rule updated successfully");
      } else {
        const res = await api.create(payload);
        toast.success(res?.message || "Rule created successfully");
      }
      navigate(basePath);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loadingDoc) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "#f6765e" }} />
      </Box>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 250 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(18,14,16,0.88) 0%, rgba(38,25,26,0.60) 44%, rgba(246,118,94,0.18) 100%), url("${eventsHero}")`,
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
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
            }}
          >
            <Typography
              component={RouterLink}
              to={dashboardPath}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            {!isOrgPortal && (
              <Typography
                component={RouterLink}
                to="/events/detail"
                sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
              >
                Events
              </Typography>
            )}
            <Typography
              component={RouterLink}
              to={basePath}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Rules
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {isEditing ? "Edit" : "Create"}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            {isEditing ? "Edit rule" : "Create rule"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620 }}>
            Name the rule and configure round settings for competition promotion.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            label="Rule name"
            placeholder='e.g. "Speed 500m — 6-8"'
            value={form.formulaName}
            onChange={(e) => {
              setForm((f) => ({ ...f, formulaName: e.target.value }));
              setErrors((err) => ({ ...err, formulaName: "" }));
            }}
            error={Boolean(errors.formulaName)}
            helperText={errors.formulaName || "Shown when linking this rule to event categories"}
            fullWidth
            required
          />

          <TextField
            type="number"
            label="Final selection count (medals)"
            value={form.finalSelectionCount}
            onChange={(e) => {
              setForm((f) => ({ ...f, finalSelectionCount: e.target.value }));
              setErrors((err) => ({ ...err, finalSelectionCount: "" }));
            }}
            error={Boolean(errors.finalSelectionCount)}
            helperText={errors.finalSelectionCount || "Usually 3 for gold, silver, bronze"}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <Divider sx={{ borderColor: "#f5ebe7" }} />

          <FormulaRoundsEditor
            rounds={form.rounds}
            onChange={(rounds) => setForm((f) => ({ ...f, rounds }))}
            fieldErrors={errors}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid #f5ebe7", justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={() => navigate(basePath)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={!saving && <Save size={16} />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create rule"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
