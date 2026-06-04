import {
  Box,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { categoryRowName, normalizeCategoryRow } from "@/features/admin/events/utils/categoryFormUtils";
import { getFormulaDisplayName } from "@/features/admin/events/utils/formulaFormUtils";

export default function CategoryInlineEditor({
  form,
  errors = {},
  formulas = [],
  formulasLoading = false,
  showFormula = true,
  isOrgOverride = false,
  isCreate = false,
  readOnly = false,
  onTypeNameChange,
  onCategoryNameChange,
  onCategoryFormulaChange,
  onAddCategoryRow,
  onRemoveCategoryRow
}) {
  return (
    <Box sx={{ px: 2.5, pb: 2 }}>
      {!isOrgOverride && isCreate ? (
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 1 }}>
            Type Name <span style={{ color: "#f6765e" }}>*</span>
          </Typography>
          <TextField
            placeholder='e.g. "Speed Skating"'
            value={form.typeName}
            onChange={(e) => onTypeNameChange(e.target.value)}
            error={Boolean(errors.typeName)}
            helperText={errors.typeName}
            fullWidth
            disabled={readOnly}
          />
        </Box>
      ) : (
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 800, color: "#2f2829", fontSize: 18 }}>
            {form.typeName || "—"}
          </Typography>
          {isOrgOverride ? (
            <Chip size="small" label="KRSA type" sx={{ fontSize: 11, fontWeight: 700 }} />
          ) : null}
        </Stack>
      )}

      <Divider sx={{ borderColor: "#f5ebe7", mb: 2 }} />

      <Typography sx={{ fontWeight: 700, color: "#2f2829", mb: 0.5 }}>
        Age Groups & Categories
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#8d7f7b", mb: 2 }}>
        Use + on the right to add rows. Each lap name must have a formula selected. Update at the
        bottom saves this type only.
        {showFormula && !formulasLoading && formulas.length === 0 ? (
          <>
            {" "}
            <Box
              component={RouterLink}
              to="/events/formula/create"
              sx={{
                display: "inline",
                color: "#f6765e",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Create a formula first
            </Box>
          </>
        ) : null}
      </Typography>

      <Stack spacing={2}>
        {form.ageGroups.map((ag, ageIdx) => {
          const filledCount = ag.categories.filter((c) => categoryRowName(c).trim()).length;
          return (
            <Paper
              key={ag.label}
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1px solid #f0e8e5",
                overflow: "hidden",
                background: "rgba(255,255,255,0.65)"
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f5ebe7" }}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Chip
                    label={ag.label}
                    size="small"
                    sx={{
                      backgroundColor: "#fff1eb",
                      color: "#f6765e",
                      fontWeight: 700,
                      fontSize: 12
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                    {filledCount} categor{filledCount === 1 ? "y" : "ies"}
                  </Typography>
                </Stack>
                {!readOnly ? (
                  <Tooltip title="Add row">
                    <IconButton
                      size="small"
                      onClick={() => onAddCategoryRow(ageIdx)}
                      sx={{
                        color: "#f6765e",
                        border: "1px solid #f5d5c8",
                        backgroundColor: "#fff1eb",
                        "&:hover": { backgroundColor: "#ffe3d9" }
                      }}
                    >
                      <Plus size={15} />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>

              <Stack spacing={1} sx={{ p: 1.5 }}>
                {ag.categories.map((catRow, catIdx) => {
                  const row = normalizeCategoryRow(catRow);
                  const rowKey = `${ageIdx}-${catIdx}`;
                  const formulaError = errors?.categoryRows?.[rowKey]?.formula;
                  return (
                    <Stack
                      key={catIdx}
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ sm: "center" }}
                      gap={1}
                    >
                      <TextField
                        size="small"
                        placeholder={`Category ${catIdx + 1} e.g. "1 Lap"`}
                        value={row.name}
                        onChange={(e) => onCategoryNameChange(ageIdx, catIdx, e.target.value)}
                        fullWidth
                        disabled={readOnly}
                      />
                      {showFormula ? (
                        <TextField
                          select
                          required
                          size="small"
                          label="Formula"
                          value={row.formula || ""}
                          onChange={(e) =>
                            onCategoryFormulaChange(ageIdx, catIdx, e.target.value)
                          }
                          disabled={readOnly || formulasLoading}
                          error={Boolean(formulaError)}
                          helperText={formulaError}
                          sx={{ minWidth: { xs: "100%", sm: 200 }, flexShrink: 0 }}
                        >
                          <MenuItem value="" disabled>
                            <em>{formulasLoading ? "Loading…" : "Select formula"}</em>
                          </MenuItem>
                          {formulas.map((f) => {
                            const id = String(f._id ?? f.id ?? "");
                            return (
                              <MenuItem key={id} value={id}>
                                {getFormulaDisplayName(f)}
                              </MenuItem>
                            );
                          })}
                        </TextField>
                      ) : null}
                      {!readOnly ? (
                        <Tooltip title="Remove row">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onRemoveCategoryRow(ageIdx, catIdx)}
                              disabled={ag.categories.length === 1}
                              sx={{ color: "#f6765e", flexShrink: 0, alignSelf: { xs: "flex-end", sm: "center" } }}
                            >
                              <X size={15} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
