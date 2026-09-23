import { useEffect, useState, useCallback } from "react";
import {
  Box, Breadcrumbs, Button, CircularProgress, Paper, Stack, TextField,
  Typography, MenuItem, Avatar
} from "@mui/material";
import { ChevronRight, Save } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { districtPortalApi } from "@/api/district-portal-api";
import toast from "react-hot-toast";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const BLOOD_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const Field = ({ label, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.75 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

export const DistrictSkaterEditPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const [skater, setSkater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", gender: "",
    address: "", bloodGroup: "", school: "", grade: "",
  });

  useEffect(() => {
    if (!skaterId) return;
    setLoading(true);
    districtPortalApi.getSkater(skaterId)
      .then((res) => {
        const data = res?.data ?? res;
        setSkater(data);
        setForm({
          fullName: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender || "",
          address: data.address || "",
          bloodGroup: data.bloodGroup || "",
          school: data.school || "",
          grade: data.grade || "",
        });
      })
      .catch(() => toast.error("Failed to load skater"))
      .finally(() => setLoading(false));
  }, [skaterId]);

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) { toast.error("Full name is required"); return; }
    setSaving(true);
    try {
      await districtPortalApi.editSkater(skaterId, form);
      toast.success("Skater updated");
      navigate(`/district/skaters/${skaterId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#f6765e" }} /></Box>;
  }

  if (!skater) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Skater not found</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/district/skaters")}>Back</Button>
      </Paper>
    );
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "#fdf7f4",
      "& fieldset": { border: "1.5px solid #f0e5e1" },
      "&:hover fieldset": { borderColor: "#f6765e" },
      "&.Mui-focused fieldset": { borderColor: "#f6765e", borderWidth: "2px" },
    },
  };

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper elevation={0} sx={{
        p: { xs: 3, md: 4 }, minHeight: { xs: 200, md: 220 }, borderRadius: "28px",
        overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.8)",
        background: `linear-gradient(90deg,rgba(20,17,20,0.84) 0%,rgba(20,17,20,0.58) 44%,rgba(20,17,20,0.18) 100%),url("${skatersHero}")`,
        backgroundPosition: "center", backgroundSize: "cover", color: "white",
      }}>
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: 14 } }}>
            <Typography component={RouterLink} to="/district/dashboard" sx={{ color: "inherit", textDecoration: "none" }}>Dashboard</Typography>
            <Typography component={RouterLink} to="/district/skaters" sx={{ color: "inherit", textDecoration: "none" }}>Skaters</Typography>
            <Typography component={RouterLink} to={`/district/skaters/${skaterId}`} sx={{ color: "inherit", textDecoration: "none" }}>{skater.name}</Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Edit</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1 }}>Edit skater profile</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 560, lineHeight: 1.7 }}>
            Update athlete details for this skater.
          </Typography>
        </Stack>
      </Paper>

      {/* Form card */}
      <Paper elevation={0} sx={{ borderRadius: "28px", border: "1px solid #f0e5e1", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ p: 3, alignItems: { md: "center" }, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={skater.img} alt={skater.name} sx={{ width: 52, height: 52, border: "2px solid #f4e5de" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>{skater.name}</Typography>
              <Typography sx={{ color: "#8d7f7b", fontSize: 13 }}>{skater.krsaId}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate(`/district/skaters/${skaterId}`)}>Cancel</Button>
            <Button variant="contained" startIcon={saving ? null : <Save size={16} />}
              onClick={handleSave} disabled={saving}
              sx={{ bgcolor: "#f6765e", "&:hover": { bgcolor: "#e85d3f" } }}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 4 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2.5 }}>
            <Field label="Full Name">
              <TextField fullWidth value={form.fullName} onChange={handleChange("fullName")} sx={inputSx} />
            </Field>
            <Field label="Phone">
              <TextField fullWidth value={form.phone} onChange={handleChange("phone")} sx={inputSx} />
            </Field>
            <Field label="Email">
              <TextField fullWidth value={form.email} onChange={handleChange("email")} type="email" sx={inputSx} />
            </Field>
            <Field label="Gender">
              <TextField fullWidth select value={form.gender} onChange={handleChange("gender")} sx={inputSx}>
                <MenuItem value="">Select gender</MenuItem>
                {GENDER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Field>
            <Field label="Blood Group">
              <TextField fullWidth select value={form.bloodGroup} onChange={handleChange("bloodGroup")} sx={inputSx}>
                <MenuItem value="">Select</MenuItem>
                {BLOOD_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Field>
            <Field label="School">
              <TextField fullWidth value={form.school} onChange={handleChange("school")} sx={inputSx} />
            </Field>
            <Field label="Grade">
              <TextField fullWidth value={form.grade} onChange={handleChange("grade")} sx={inputSx} />
            </Field>
            <Field label="Address">
              <TextField fullWidth value={form.address} onChange={handleChange("address")} multiline rows={3} sx={inputSx} />
            </Field>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
