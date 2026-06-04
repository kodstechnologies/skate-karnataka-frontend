import { useCallback, useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography
} from "@mui/material";
import { clubFormulaApi } from "@/api/club-formula-api";
import { districtFormulaApi } from "@/api/district-formula-api";
import toast from "react-hot-toast";

const OPTIONS_BY_PORTAL = {
  club: [
    {
      value: "both",
      label: "State + club formulas",
      description:
        "Use state admin formulas, your club formulas, or both when assigning laps."
    },
    {
      value: "admin",
      label: "State formulas only",
      description: "Only formulas created by KRSA state admin appear in event categories."
    },
    {
      value: "club",
      label: "Club formulas only",
      description: "Only formulas you create below appear in event categories."
    }
  ],
  district: [
    {
      value: "both",
      label: "State + district formulas",
      description:
        "Use state admin formulas, your district formulas, or both when assigning laps."
    },
    {
      value: "admin",
      label: "State formulas only",
      description: "Only formulas created by KRSA state admin appear in event categories."
    },
    {
      value: "district",
      label: "District formulas only",
      description: "Only formulas you create below appear in event categories."
    }
  ]
};

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Failed to update preference.";

export function OrgFormulaSourceSettings({ portalMode = "club", onUpdated }) {
  const api = portalMode === "district" ? districtFormulaApi : clubFormulaApi;
  const orgLabel = portalMode === "district" ? "district" : "club";
  const options = OPTIONS_BY_PORTAL[portalMode] ?? OPTIONS_BY_PORTAL.club;

  const [value, setValue] = useState("both");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSource();
      const payload = res?.data?.data ?? res?.data ?? res;
      setValue(payload?.formulaSource ?? "both");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = async (next) => {
    setValue(next);
    setSaving(true);
    try {
      const res = await api.patchSource(next);
      toast.success(res?.message || "Formula preference updated");
      onUpdated?.(next);
    } catch (err) {
      toast.error(extractError(err));
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "24px",
        border: "1px solid rgba(246,228,221,0.95)",
        bgcolor: "rgba(255,251,249,0.98)"
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        Formula source for event categories
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#8d7f7b", mb: 2 }}>
        Choose whether your {orgLabel} uses state admin formulas, your own {orgLabel} formulas, or
        both when linking laps in Event Categories.
      </Typography>
      <FormControl disabled={loading || saving} fullWidth>
        <FormLabel sx={{ fontWeight: 600, color: "#5c4f4b", mb: 1 }}>Active source</FormLabel>
        <RadioGroup value={value} onChange={(_, v) => handleChange(v)}>
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio sx={{ color: "#f6765e", "&.Mui-checked": { color: "#f6765e" } }} />}
              label={
                <Stack>
                  <Typography sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                  <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>{opt.description}</Typography>
                </Stack>
              }
              sx={{ alignItems: "flex-start", mb: 1 }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  );
}
