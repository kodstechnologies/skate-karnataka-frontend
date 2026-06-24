import {
  Box,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import {
  FORMULA_QUALIFICATION_TYPES,
  FORMULA_QUALIFY_PER_GROUP_VALUES,
  FORMULA_ROUND_NAMES,
  emptyRound,
  isFirstFormulaRound
} from "@/features/admin/events/utils/formulaFormUtils";

const numberField = (label, value, onChange, disabled, helperText, error) => (
  <TextField
    size="small"
    type="number"
    label={label}
    value={value}
    onChange={onChange}
    disabled={disabled}
    helperText={helperText}
    error={Boolean(error)}
    fullWidth
    inputProps={{ min: 0 }}
  />
);

const fieldsForQualificationType = (type, roundName) => {
  const first = isFirstFormulaRound(roundName);
  if (type === "TIME") {
    if (first) {
      return {
        qualificationType: "TIME",
        groupSize: "",
        qualifyPerGroup: "",
        qualifyCount: ""
      };
    }
    return {
      qualificationType: "TIME",
      maxParticipants: "",
      qualifyCountLessThan65: "",
      qualifyCountMoreThan65: ""
    };
  }
  return {
    qualificationType: "POSITION",
    maxParticipants: "",
    qualifyCountLessThan65: "",
    qualifyCountMoreThan65: ""
  };
};

const fieldsForRoundName = (roundName, qualificationType) => {
  const first = isFirstFormulaRound(roundName);
  if (qualificationType === "TIME") {
    if (first) {
      return { qualifyCount: "" };
    }
    return {
      maxParticipants: "",
      qualifyCountLessThan65: "",
      qualifyCountMoreThan65: ""
    };
  }
  return {};
};

export default function FormulaRoundsEditor({
  rounds,
  onChange,
  disabled = false,
  fieldErrors = {}
}) {
  const updateRound = (index, patch) => {
    onChange(rounds.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRound = () => onChange([...rounds, emptyRound()]);

  const removeRound = (index) => {
    if (rounds.length <= 1) return;
    onChange(rounds.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={2}>
      <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
        <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>Rounds</Typography>
        {!disabled ? (
          <Tooltip title="Add round">
            <IconButton
              size="small"
              onClick={addRound}
              sx={{
                color: "#f6765e",
                border: "1px solid #f5d5c8",
                backgroundColor: "#fff1eb"
              }}
            >
              <Plus size={16} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <Typography sx={{ fontSize: 13, color: "#7a6f6c" }}>
        <strong>1st round (TIME):</strong> if total skaters are below the threshold, use the
        first pass count; if at or above, use the second.{" "}
        <strong>Later rounds:</strong> enter one fixed number — how many advance to the next
        round.
      </Typography>

      {rounds.map((round, index) => {
        const isFirst = isFirstFormulaRound(round.roundName);
        const isTime = round.qualificationType === "TIME";

        return (
          <Paper
            key={index}
            elevation={0}
            sx={{ p: 2, borderRadius: "16px", border: "1px solid #f0e8e5", bgcolor: "#fffdfb" }}
          >
            <Stack
              direction="row"
              sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#5f5552" }}>
                {round.roundName || `Round ${index + 1}`}
                {isFirst ? " — threshold rules" : " — fixed qualify count"}
              </Typography>
              {!disabled && rounds.length > 1 ? (
                <IconButton
                  size="small"
                  onClick={() => removeRound(index)}
                  sx={{ color: "#f6765e" }}
                >
                  <Trash2 size={15} />
                </IconButton>
              ) : null}
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5
              }}
            >
              <TextField
                select
                size="small"
                label="Round name"
                value={round.roundName}
                onChange={(e) =>
                  updateRound(index, {
                    roundName: e.target.value,
                    ...fieldsForRoundName(e.target.value, round.qualificationType)
                  })
                }
                disabled={disabled}
                fullWidth
              >
                {FORMULA_ROUND_NAMES.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Qualification type"
                value={round.qualificationType}
                onChange={(e) =>
                  updateRound(
                    index,
                    fieldsForQualificationType(e.target.value, round.roundName)
                  )
                }
                disabled={disabled}
                fullWidth
              >
                {FORMULA_QUALIFICATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              {isTime && isFirst ? (
                <>
                  {numberField(
                    "Skater count threshold",
                    round.maxParticipants,
                    (e) => updateRound(index, { maxParticipants: e.target.value }),
                    disabled,
                    "e.g. 65 — compare total skaters in 1st round to this number",
                    fieldErrors[`rounds.${index}.maxParticipants`]
                  )}
                  {numberField(
                    "How many pass (below threshold)",
                    round.qualifyCountLessThan65,
                    (e) =>
                      updateRound(index, { qualifyCountLessThan65: e.target.value }),
                    disabled,
                    round.maxParticipants
                      ? `When skaters in 1st round are less than ${round.maxParticipants}`
                      : "When below the threshold",
                    fieldErrors[`rounds.${index}.qualifyCountLessThan65`]
                  )}
                  {numberField(
                    "How many pass (at or above threshold)",
                    round.qualifyCountMoreThan65,
                    (e) =>
                      updateRound(index, { qualifyCountMoreThan65: e.target.value }),
                    disabled,
                    round.maxParticipants
                      ? `When skaters in 1st round are ${round.maxParticipants} or more`
                      : "When at or above the threshold",
                    fieldErrors[`rounds.${index}.qualifyCountMoreThan65`]
                  )}
                </>
              ) : null}

              {isTime && !isFirst ? (
                numberField(
                  "How many advance to next round",
                  round.qualifyCount,
                  (e) => updateRound(index, { qualifyCount: e.target.value }),
                  disabled,
                  "Fixed number (fastest times). No below/above threshold on this round.",
                  fieldErrors[`rounds.${index}.qualifyCount`]
                )
              ) : null}

              {!isTime ? (
                <>
                  {numberField(
                    "Group size",
                    round.groupSize,
                    (e) => updateRound(index, { groupSize: e.target.value }),
                    disabled,
                    "Skaters per group (optional)",
                    fieldErrors[`rounds.${index}.groupSize`]
                  )}
                  <TextField
                    select
                    size="small"
                    label="Qualify per group"
                    value={round.qualifyPerGroup}
                    onChange={(e) =>
                      updateRound(index, { qualifyPerGroup: e.target.value })
                    }
                    disabled={disabled}
                    helperText={
                      fieldErrors[`rounds.${index}.qualifyPerGroup`] ||
                      '0 = time only; 1 = position "1"; 2 = positions "1" and "2"; 3 = positions "1", "2", and "3"'
                    }
                    error={Boolean(fieldErrors[`rounds.${index}.qualifyPerGroup`])}
                    fullWidth
                  >
                    {FORMULA_QUALIFY_PER_GROUP_VALUES.map((value) => (
                      <MenuItem key={value} value={String(value)}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                  {numberField(
                    "How many advance to next round",
                    round.qualifyCount,
                    (e) => updateRound(index, { qualifyCount: e.target.value }),
                    disabled,
                    "Total skaters advancing from this round",
                    fieldErrors[`rounds.${index}.qualifyCount`]
                  )}
                </>
              ) : null}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
