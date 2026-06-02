import { Box, Breadcrumbs, Button, Chip, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { ChevronRight, Layers, RefreshCw, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { eventCategoriesApi } from "@/api/event-categories-api";
import { unwrapOrgCategoryContext } from "@/features/admin/events/utils/categoryDisplay";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

const CARD_SX = {
  borderRadius: "24px",
  border: "1px solid #f0ddd5",
  overflow: "hidden",
  background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
  boxShadow: "0 20px 50px rgba(56,36,29,0.08)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 28px 65px rgba(56,36,29,0.12)" }
};

export default function DistrictEventCategoriesPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ standard: 0, custom: false });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventCategoriesApi.getOrgContext();
      const ctx = unwrapOrgCategoryContext(res);
      setCounts({ standard: ctx.standardCategories.length, custom: Boolean(ctx.customCategory) });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Box className="space-y-5">
      {/* Hero */}
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
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)", pointerEvents: "none" }} />
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: { xs: 14, md: 16 } } }}
          >
            <Typography component={RouterLink} to="/district/dashboard" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Event Categories</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            District Event Categories
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
            Select a category type below to view or manage.
          </Typography>
        </Stack>
      </Paper>

      {/* Main panel */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Event Category Management
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Select a type below to view or edit.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              {[1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" width={220} height={140} sx={{ borderRadius: "24px" }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, justifyContent: "center", py: 2 }}>
              {/* Standard card */}
              <Paper
                elevation={0}
                onClick={() => navigate("/district/event-categories/standard")}
                sx={{ ...CARD_SX, width: { xs: "100%", sm: 220 }, maxWidth: 280, py: 3.5, px: 2, textAlign: "center" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "14px", backgroundColor: "#e0f7f5", color: "#00897b", mb: 1.5 }}>
                  <Shield size={22} />
                </Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#2f2829" }}>Standard</Typography>
              </Paper>

              {/* Custom card */}
              <Paper
                elevation={0}
                onClick={() => navigate("/district/event-categories/custom")}
                sx={{ ...CARD_SX, width: { xs: "100%", sm: 220 }, maxWidth: 280, py: 3.5, px: 2, textAlign: "center" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "14px", backgroundColor: "#fff1eb", color: "#f6765e", mb: 1.5 }}>
                  <Layers size={22} />
                </Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#2f2829" }}>Custom</Typography>
                <Chip size="small" label={counts.custom ? "Saved" : "Not saved yet"} sx={{ mt: 1.25, height: 22, fontSize: 11, fontWeight: 700, bgcolor: "#fff1eb", color: "#f6765e" }} />
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
