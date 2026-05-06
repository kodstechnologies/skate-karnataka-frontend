import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Mail, Phone, Save, Clock, Headphones, ShieldCheck } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import contactHero from "@/assets/contect.png";
import { useContactUsStore } from "@/features/admin/contact-us/store/contact-us-store";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.92)"
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number";
  }
  return errors;
};

export const ContactUsPage = () => {
  const { contactInfo, isLoading, isSaving, fetchContactUs, saveContactUs } = useContactUsStore();

  const [formData, setFormData] = useState(() => {
    const info = useContactUsStore.getState().contactInfo;
    return { email: info?.email || "", phone: info?.phone || "" };
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchContactUs();
  }, [fetchContactUs]);

  // Sync form when server data arrives for the first time
  useEffect(() => {
    if (contactInfo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ email: contactInfo.email || "", phone: contactInfo.phone || "" });

      setHasChanges(false);
    }
  }, [contactInfo]);

  const handleField = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const ok = await saveContactUs({
      email: formData.email.trim(),
      phone: formData.phone.trim()
    });
    if (ok) setHasChanges(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <Box className="space-y-5">
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.9) 0%, rgba(35,23,23,0.72) 38%, rgba(246,118,94,0.3) 100%), url("${contactHero}")`,
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)",
            pointerEvents: "none"
          }}
        />

        <Stack
          spacing={2}
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.5)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.80)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Contact Us</Typography>
          </Breadcrumbs>

          <Box sx={{ maxWidth: 680 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(246,118,94,0.90)",
                mb: 1
              }}
            >
              Public Contact Info
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1.5 }}>
              Contact Us Settings
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75, maxWidth: 560 }}>
              Manage the public-facing contact details for Karnataka Skating Association. This
              information is displayed to all visitors on the website.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<Headphones size={14} />}
              label="Support Contact"
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.13)" }}
            />
            <Chip
              icon={<ShieldCheck size={14} />}
              label="Public Visibility"
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.13)" }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Content Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
          alignItems: "start"
        }}
      >
        {/* Edit Form Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.7)",
            overflow: "hidden"
          }}
        >
          <Stack sx={{ p: 3, pb: 2.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Edit Contact Details
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b", fontSize: 14 }}>
              Update the support email and phone number shown to the public.
            </Typography>
          </Stack>

          <Divider />

          <Box sx={{ p: 3 }}>
            {isLoading ? (
              <Stack spacing={3}>
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: "16px" }} />
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: "16px" }} />
                <Skeleton variant="rounded" height={44} width={160} sx={{ borderRadius: "14px" }} />
              </Stack>
            ) : (
              <Stack spacing={3}>
                {/* Email */}
                <TextField
                  fullWidth
                  label="Support Email *"
                  type="email"
                  value={formData.email}
                  onChange={handleField("email")}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  sx={inputStyles}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} style={{ color: "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />

                {/* Phone */}
                <TextField
                  fullWidth
                  label="Support Phone *"
                  value={formData.phone}
                  onChange={handleField("phone")}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  sx={inputStyles}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={18} style={{ color: "#b19f99" }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />

                <Divider sx={{ my: 0.5 }} />

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<Save size={16} />}
                    onClick={handleSubmit}
                    loading={isSaving}
                    disabled={!hasChanges || isSaving}
                    sx={{
                      backgroundColor: "#f6765e",
                      borderRadius: "14px",
                      px: 3,
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#ea6b54",
                        boxShadow: "0 8px 24px rgba(246,118,94,0.32)"
                      }
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Current Info Preview Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.7)",
            overflow: "hidden"
          }}
        >
          <Stack sx={{ p: 3, pb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
              Current Info
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 13 }}>
              Live data pulled from the backend.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={0} sx={{ p: 3 }}>
            {isLoading ? (
              <Stack spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i}>
                    <Skeleton variant="text" width={80} height={14} />
                    <Skeleton variant="text" width={180} height={20} sx={{ mt: 0.5 }} />
                  </Box>
                ))}
              </Stack>
            ) : contactInfo ? (
              <Stack spacing={2.5}>
                {/* Email row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    p: 2,
                    borderRadius: "16px",
                    backgroundColor: "#fdf7f3",
                    border: "1px solid #f0e1da"
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      backgroundColor: "#fff1eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Mail size={16} color="#f6765e" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#a28f89",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                      }}
                    >
                      Email
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#2f2829",
                        mt: 0.25,
                        wordBreak: "break-all"
                      }}
                    >
                      {contactInfo.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Phone row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    p: 2,
                    borderRadius: "16px",
                    backgroundColor: "#fdf7f3",
                    border: "1px solid #f0e1da"
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      backgroundColor: "#fff1eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Phone size={16} color="#f6765e" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#a28f89",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                      }}
                    >
                      Phone
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#2f2829", mt: 0.25 }}>
                      {contactInfo.phone}
                    </Typography>
                  </Box>
                </Box>

                {/* Last updated */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    pt: 0.5
                  }}
                >
                  <Clock size={13} color="#b3a5a0" />
                  <Typography sx={{ fontSize: 12, color: "#b3a5a0" }}>
                    Last updated: {formatDate(contactInfo.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center",
                  color: "#978a86"
                }}
              >
                <Headphones size={32} color="#d4c5c0" style={{ margin: "0 auto 12px" }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#7e716d" }}>
                  No contact info yet
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#a29390", mt: 0.5 }}>
                  Fill in the form and save to set contact details.
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};
