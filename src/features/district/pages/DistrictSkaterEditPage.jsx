import { useEffect, useState, useCallback, useRef } from "react";
import {
  Avatar, Box, Breadcrumbs, Button, CircularProgress,
  Divider, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { ChevronRight, Save, FileText } from "lucide-react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { districtPortalApi } from "@/api/district-portal-api";
import { eventCategoriesApi } from "@/api/event-categories-api";
import toast from "react-hot-toast";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
const BLOOD_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#fdf7f4",
    "& fieldset": { border: "1.5px solid #f0e5e1" },
    "&:hover fieldset": { borderColor: "#f6765e" },
    "&.Mui-focused fieldset": { borderColor: "#f6765e", borderWidth: "2px" },
  },
};

const SectionTitle = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#c4a49c", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2, mt: 1 }}>
    {children}
  </Typography>
);

const Field = ({ label, children, span = 1 }) => (
  <Box sx={{ gridColumn: { md: `span ${span}` } }}>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.75 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

export const DistrictSkaterEditPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const photoInputRef = useRef(null);

  const [skater, setSkater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", gender: "", dob: "",
    address: "", bloodGroup: "", school: "", grade: "",
    parent: "", aadharNumber: "", rsfiId: "", signature: "",
    eventCategory: "", discipline: "",
    photo: null, photoPreview: "",
  });

  useEffect(() => {
    if (!skaterId) return;
    setLoading(true);
    Promise.all([
      districtPortalApi.getSkater(skaterId),
      eventCategoriesApi.getAll({ limit: 100 }),
    ])
      .then(([skaterRes, catRes]) => {
        const data = skaterRes?.data?.data ?? skaterRes?.data ?? skaterRes;
        setSkater(data);

        const cats = catRes?.data?.data ?? catRes?.data ?? catRes;
        const catList = Array.isArray(cats?.data) ? cats.data : Array.isArray(cats) ? cats : [];
        setEventCategories(catList);

        // resolve eventCategory from discipline if not set directly
        const savedEventCatId = data.eventCategory?._id || String(data.eventCategory || "");
        const savedDisciplineId = data.discipline?._id || String(data.discipline || "");
        let resolvedCatId = savedEventCatId;
        if (!resolvedCatId && savedDisciplineId) {
          const ownerCat = catList.find((c) =>
            (c.disciplines || []).some((d) => String(d._id) === savedDisciplineId)
          );
          if (ownerCat) resolvedCatId = String(ownerCat._id);
        }

        setForm({
          fullName: data.fullName || data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          address: data.address || "",
          bloodGroup: data.bloodGroup || "",
          school: data.school || "",
          grade: data.grade || "",
          parent: data.parent || "",
          aadharNumber: data.aadharNumber || "",
          rsfiId: data.rsfiId || "",
          signature: data.signature || "",
          eventCategory: resolvedCatId,
          discipline: savedDisciplineId,
          photo: null,
          photoPreview: data.photo || data.img || "",
        });
      })
      .catch(() => toast.error("Failed to load skater"))
      .finally(() => setLoading(false));
  }, [skaterId]);

  const set = useCallback((field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value })), []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, photo: file, photoPreview: URL.createObjectURL(file) }));
  };

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

  const activeCat = eventCategories.find((c) => String(c._id) === form.eventCategory);
  const disciplines = activeCat?.disciplines ?? [];

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
            <Typography component={RouterLink} to={`/district/skaters/${skaterId}`} sx={{ color: "inherit", textDecoration: "none" }}>{skater.name || skater.fullName}</Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Edit</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1 }}>Edit skater profile</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 560, lineHeight: 1.7 }}>
            Update athlete details for this skater.
          </Typography>
        </Stack>
      </Paper>

      {/* Header bar */}
      <Paper elevation={0} sx={{ borderRadius: "28px", border: "1px solid #f0e5e1", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ p: 3, alignItems: { md: "center" }, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Photo with edit overlay */}
            <Box sx={{ position: "relative", cursor: "pointer" }} onClick={() => photoInputRef.current?.click()}>
              <Avatar src={form.photoPreview} alt={skater.name} sx={{ width: 60, height: 60, border: "2px solid #f4e5de" }} />
              <Box sx={{
                position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%",
                backgroundColor: "#f6765e", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid white",
              }}>
                <EditOutlinedIcon sx={{ fontSize: 11, color: "white" }} />
              </Box>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>{skater.name || skater.fullName}</Typography>
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

        <Divider sx={{ borderColor: "#f5ede9" }} />

        <Box sx={{ p: 3 }}>
          {/* Read-only info */}
          <SectionTitle>Club & District</SectionTitle>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            {skater.club && (
              <Box sx={{ flex: 1, p: 1.5, borderRadius: "14px", backgroundColor: "#fdf7f4", border: "1.5px solid #f0e5e1" }}>
                <Typography sx={{ fontSize: 10, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.06em" }}>Club</Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{skater.club.name}</Typography>
                {skater.club.clubId && <Typography sx={{ fontSize: 12, color: "#a28f89" }}>{skater.club.clubId}</Typography>}
              </Box>
            )}
            {skater.district && (
              <Box sx={{ flex: 1, p: 1.5, borderRadius: "14px", backgroundColor: "#fdf7f4", border: "1.5px solid #f0e5e1" }}>
                <Typography sx={{ fontSize: 10, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.06em" }}>District</Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{skater.district.name}</Typography>
              </Box>
            )}
          </Stack>

          {/* Editable fields grid */}
          <SectionTitle>Basic Info</SectionTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2.5, mb: 3 }}>
            <Field label="Full Name">
              <TextField fullWidth value={form.fullName} onChange={set("fullName")} sx={inputSx} />
            </Field>
            <Field label="Phone">
              <TextField fullWidth value={form.phone} disabled sx={inputSx} />
            </Field>
            <Field label="Email">
              <TextField fullWidth value={form.email} type="email" disabled sx={inputSx} />
            </Field>
            <Field label="Gender">
              <TextField fullWidth select value={form.gender} onChange={set("gender")} sx={inputSx}>
                <MenuItem value="">Select gender</MenuItem>
                {GENDER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Field>
            <Field label="Date of Birth">
              <TextField fullWidth type="date" value={form.dob} onChange={set("dob")} slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
            </Field>
            <Field label="Blood Group">
              <TextField fullWidth select value={form.bloodGroup} onChange={set("bloodGroup")} sx={inputSx}>
                <MenuItem value="">Select</MenuItem>
                {BLOOD_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Field>
            <Field label="Parent / Guardian">
              <TextField fullWidth value={form.parent} onChange={set("parent")} sx={inputSx} />
            </Field>
            <Field label="Aadhaar Number">
              <TextField fullWidth value={form.aadharNumber} onChange={set("aadharNumber")} inputProps={{ maxLength: 12 }} sx={inputSx} />
            </Field>
            <Field label="RSFI ID">
              <TextField fullWidth value={form.rsfiId} onChange={set("rsfiId")} sx={inputSx} />
            </Field>
            <Field label="Signature (URL)">
              <TextField fullWidth value={form.signature} onChange={set("signature")} sx={inputSx} />
            </Field>
            <Field label="School">
              <TextField fullWidth value={form.school} onChange={set("school")} sx={inputSx} />
            </Field>
            <Field label="Grade">
              <TextField fullWidth value={form.grade} onChange={set("grade")} sx={inputSx} />
            </Field>
            <Field label="Address" span={2}>
              <TextField fullWidth value={form.address} onChange={set("address")} multiline rows={3} sx={inputSx} />
            </Field>
          </Box>

          {/* Event Category & Discipline */}
          <SectionTitle>Event Category & Discipline</SectionTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2.5, mb: 3 }}>
            <Field label="Event Category">
              <TextField fullWidth select value={form.eventCategory} onChange={(e) => setForm((p) => ({ ...p, eventCategory: e.target.value, discipline: "" }))} sx={inputSx}>
                <MenuItem value=""><em>Select category</em></MenuItem>
                {eventCategories.map((cat) => (
                  <MenuItem key={String(cat._id)} value={String(cat._id)}>{cat.name || cat.typeName || "—"}</MenuItem>
                ))}
              </TextField>
            </Field>
            {disciplines.length > 0 && (
              <Field label="Discipline">
                <TextField fullWidth select value={form.discipline} onChange={set("discipline")} sx={inputSx}>
                  <MenuItem value=""><em>Select discipline</em></MenuItem>
                  {disciplines.map((d) => (
                    <MenuItem key={String(d._id)} value={String(d._id)}>{d.name || "—"}</MenuItem>
                  ))}
                </TextField>
              </Field>
            )}
          </Box>

          {/* Documents */}
          {(skater.documents || []).length > 0 && (
            <>
              <SectionTitle>Documents</SectionTitle>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {skater.documents.map((doc, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="center"
                    sx={{ p: 1.5, borderRadius: "14px", border: "1.5px solid #f0e5e1", backgroundColor: "#fdf7f4" }}>
                    <FileText size={18} color="#f6765e" style={{ flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.name || `Document ${i + 1}`}
                      </Typography>
                      {doc.uploadedAt && (
                        <Typography sx={{ fontSize: 11, color: "#a28f89" }}>
                          {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </Typography>
                      )}
                    </Box>
                    {doc.url && (
                      <Button size="small" variant="outlined" href={doc.url} target="_blank" rel="noopener noreferrer"
                        sx={{ borderRadius: "10px", fontSize: 11, borderColor: "#f0e5e1", color: "#f6765e", minWidth: 60 }}>
                        View
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {/* Save footer */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate(`/district/skaters/${skaterId}`)}>Cancel</Button>
            <Button variant="contained" startIcon={saving ? null : <Save size={16} />}
              onClick={handleSave} disabled={saving}
              sx={{ bgcolor: "#f6765e", "&:hover": { bgcolor: "#e85d3f" }, minWidth: 140 }}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
