import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { districtApi } from "@/api/district-api";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";
import { validateEmail, validatePhone } from "@/utils/validationHelper";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];

const inputStyles = {
  "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.92)" }
};

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  gender: "male",
  districtId: ""
};

const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  }

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(form.email, true);
  if (emailError) errors.email = emailError;

  if (!form.address.trim()) {
    errors.address = "Address is required";
  } else if (form.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters";
  }

  return errors;
};

export const SkaterCreatePage = () => {
  const navigate = useNavigate();
  const { createSkater, isSaving } = useSkatersStore();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    districtApi
      .getAll({ page: 1, limit: 500 })
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? [];
        setDistricts(Array.isArray(payload) ? payload : []);
      })
      .catch(() => setDistricts([]));
  }, []);

  const handleField = (field) => (e) => {
    let value = e.target.value;

    if (field === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      gender: formData.gender
    };

    if (formData.districtId) {
      payload.district = formData.districtId;
    }

    const success = await createSkater(payload);

    if (success) {
      navigate("/skaters");
    }
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 200, md: 220 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${skatersHero}")`,
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
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: 14 }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/skaters"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              Skaters
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Add skater</Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
            Register a new skater
          </Typography>
          <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.86)", maxWidth: 620 }}>
            Add name, contact details, address, and gender for a new KRSA skater. District is
            optional.
          </Typography>
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
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
            Skater details
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#8d7f7b" }}>
            Required: name, contact, email, address, gender. District is optional.
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={2.5} sx={{ p: 3 }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              label="Full name"
              value={formData.fullName}
              onChange={handleField("fullName")}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
              slotProps={{
                input: {
                  startAdornment: <User size={16} style={{ marginRight: 8, color: "#b19f99" }} />
                }
              }}
              sx={inputStyles}
            />
            <TextField
              label="Contact no"
              value={formData.phone}
              onChange={handleField("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              slotProps={{
                input: {
                  startAdornment: <Phone size={16} style={{ marginRight: 8, color: "#b19f99" }} />
                }
              }}
              sx={inputStyles}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleField("email")}
              error={Boolean(errors.email)}
              helperText={errors.email}
              slotProps={{
                input: {
                  startAdornment: <Mail size={16} style={{ marginRight: 8, color: "#b19f99" }} />
                }
              }}
              sx={inputStyles}
            />
            <TextField
              select
              label="Gender"
              value={formData.gender}
              onChange={handleField("gender")}
              sx={inputStyles}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="District (optional)"
              value={formData.districtId}
              onChange={handleField("districtId")}
              sx={inputStyles}
            >
              <MenuItem value="">No district</MenuItem>
              {districts.map((district) => (
                <MenuItem key={district._id || district.id} value={district._id || district.id}>
                  {district.name || district.districtName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Address"
              value={formData.address}
              onChange={handleField("address")}
              error={Boolean(errors.address)}
              helperText={errors.address}
              multiline
              minRows={2}
              slotProps={{
                input: {
                  startAdornment: <MapPin size={16} style={{ marginRight: 8, color: "#b19f99" }} />
                }
              }}
              sx={{ ...inputStyles, gridColumn: { md: "1 / -1" } }}
            />
          </div>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleSubmit}
              disabled={isSaving}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              {isSaving ? "Saving..." : "Add skater"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/skaters")}>
              Cancel
            </Button>
            <Button variant="text" onClick={() => navigate("/skaters/bulk")}>
              Bulk upload instead
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
