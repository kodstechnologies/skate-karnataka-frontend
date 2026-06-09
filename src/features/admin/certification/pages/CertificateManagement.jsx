import { useState, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Award, Plus, ChevronRight, FileText, CheckCircle, RefreshCw, Search } from "lucide-react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  Skeleton,
  TextField,
  Divider
} from "@mui/material";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import eventsHero from "@/assets/Events_header.jpg";

function CertificateManagement() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMount = true;
    if (!isMount) return;
    async function fetchTemplates() {
      setLoading(true);
      try {
        const { data } = await api.get("/certificate/v1/templates");
        setTemplates(data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load template list");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();

    return () => {
      isMount = false;
    };
  }, []);

  const filteredTemplates = templates.filter((tpl) =>
    tpl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 240, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(28, 24, 18, 0.82) 0%, rgba(45, 38, 25, 0.62) 34%, rgba(246, 194, 94, 0.2) 100%), url("${eventsHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(45, 38, 25, 0.22)"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 720 }}>
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Certification</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Certification Control Center
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Design, manage, and issue premium digital certificates. Create custom templates with
              dynamic fields to recognize excellence.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${templates.length} Templates`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Management Panel ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246, 238, 221, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,252,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(58, 48, 24, 0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Certificate Templates
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d847f" }}>
              Manage your certificate designs and active templates.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#b1a799", marginRight: 8 }} />
                }
              }}
            />

            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/certification/create")}
            >
              New Template
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {[...Array(3)].map((_, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #f0e6d5",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fffcf7 0%, #fef5eb 100%)",
                    boxShadow: "0 20px 50px rgba(58, 48, 29, 0.08)"
                  }}
                >
                  <Stack spacing={2} sx={{ p: 2.5 }}>
                    <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                      <Skeleton
                        variant="rounded"
                        width={42}
                        height={42}
                        sx={{ borderRadius: "14px" }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" height={24} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </Stack>
                    <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />
                    <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
                      <Skeleton
                        variant="rounded"
                        width={60}
                        height={20}
                        sx={{ borderRadius: "10px" }}
                      />
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={32}
                        sx={{ borderRadius: "10px" }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : filteredTemplates.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: "24px",
                textAlign: "center",
                backgroundColor: "#fffcf7",
                border: "2px dashed #f0e6d5"
              }}
            >
              <Award size={48} style={{ color: "#f6965e", margin: "0 auto 16px", opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: "#2f2b28", fontWeight: 700 }}>
                {searchTerm ? "No matching templates" : "No templates found"}
              </Typography>
              <Typography sx={{ color: "#8d847f", mt: 1, mb: 3 }}>
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Start by creating your first certificate template."}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => navigate("/certification/create")}
                  // sx={{ backgroundColor: "#f6965e", "&:hover": { backgroundColor: "#ea8b54" } }}
                >
                  Create Template
                </Button>
              )}
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {filteredTemplates.map((tpl) => (
                <Paper
                  key={tpl._id}
                  elevation={0}
                  onClick={() => navigate(`/certification/${tpl._id}/edit`)}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #f0e6d5",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #fffcf7 0%, #fef5eb 100%)",
                    boxShadow: "0 20px 50px rgba(58, 48, 29, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(58, 48, 29, 0.12)",
                      borderColor: "#f6965e"
                    }
                  }}
                >
                  <Stack spacing={2} sx={{ p: 2.5 }}>
                    <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 42,
                          height: 42,
                          borderRadius: "14px",
                          backgroundColor: "#fff1eb",
                          color: "#f6965e",
                          flexShrink: 0
                        }}
                      >
                        <FileText size={22} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: "#2f2b28",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            mb: 0.5
                          }}
                        >
                          {tpl.name}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ flexWrap: "wrap", gap: 0.5, alignItems: "center" }}
                        >
                          <Chip
                            label={tpl.applyTo || "STATE"}
                            size="small"
                            sx={{
                              backgroundColor:
                                (tpl.applyTo || "STATE") === "STATE"
                                  ? "#e0f2fe"
                                  : (tpl.applyTo || "STATE") === "DISTRICT"
                                    ? "#fef3c7"
                                    : "#f3e8ff",
                              color:
                                (tpl.applyTo || "STATE") === "STATE"
                                  ? "#0369a1"
                                  : (tpl.applyTo || "STATE") === "DISTRICT"
                                    ? "#b45309"
                                    : "#6b21a8",
                              fontWeight: 800,
                              fontSize: 10,
                              height: 20
                            }}
                          />
                          <Typography sx={{ fontSize: 11, color: "#8d847f" }}>
                            ID: {tpl._id.slice(-6).toUpperCase()}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />

                    <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
                      <Box>
                        {tpl.isActive && (
                          <Chip
                            icon={<CheckCircle size={14} style={{ color: "#10b981" }} />}
                            label="Active"
                            size="small"
                            sx={{
                              backgroundColor: "#ecfdf5",
                              color: "#047857",
                              fontWeight: 700,
                              fontSize: 11,
                              "& .MuiChip-icon": { marginLeft: "4px" }
                            }}
                          />
                        )}
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          color: "#f6965e",
                          fontWeight: 700,
                          "&:hover": { backgroundColor: "rgba(246, 150, 94, 0.08)" }
                        }}
                      >
                        Edit Details
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default CertificateManagement;
