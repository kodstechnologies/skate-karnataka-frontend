import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { eventCategoriesApi } from "@/api/event-categories-api";
import CategoryInlineEditor from "@/features/admin/events/components/CategoryInlineEditor";
import { useFormulasList } from "@/features/admin/events/hooks/useFormulasList";
import {
  getOrgFormulaCreatePath,
  getOrgFormulaPortalMode
} from "@/features/admin/events/utils/portalFormulaConfig";
import { buildFormState } from "@/features/admin/events/utils/categoryFormUtils";
import eventsHero from "@/assets/Events_header.jpg";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "An unexpected error occurred.";

const getCategoryId = (cat) => String(cat?._id ?? cat?.id ?? "");

const PORTAL_CONFIG = {
  club: { dashboard: "/club/dashboard", list: "/club/event-categories", label: "Club" },
  district: { dashboard: "/district/dashboard", list: "/district/event-categories", label: "District" }
};

const CategoryTypeTabs = ({ categories, activeId, onSelect }) => (
  <Box
    sx={{
      display: "flex",
      gap: 0,
      overflowX: "auto",
      px: 2,
      pt: 1.5,
      borderBottom: "1px solid #e8dcd6",
      "&::-webkit-scrollbar": { height: 4 },
      "&::-webkit-scrollbar-thumb": { backgroundColor: "#e8dcd6", borderRadius: 4 }
    }}
  >
    {categories.map((cat) => {
      const catId = getCategoryId(cat);
      const isActive = catId === activeId;
      return (
        <Box
          key={catId}
          component="button"
          type="button"
          onClick={() => onSelect(catId)}
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.25,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#f6765e" : "#8d7f7b",
            borderBottom: isActive ? "2px solid #f6765e" : "2px solid transparent",
            marginBottom: "-1px",
            "&:hover": { color: isActive ? "#f6765e" : "#5f5552" }
          }}
        >
          {cat.typeName || "Unnamed"}
        </Box>
      );
    })}
  </Box>
);

const EDITOR_CARD_SX = {
  borderRadius: "24px",
  border: "1px solid #f0ddd5",
  overflow: "hidden",
  background: "linear-gradient(135deg, #fff9f7 0%, #fef0eb 100%)",
  boxShadow: "0 20px 50px rgba(56,36,29,0.08)"
};

export default function OrgStandardCategoriesPage({ orgType }) {
  const portal = PORTAL_CONFIG[orgType];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [form, setForm] = useState(() => buildFormState(null));
  const { formulas, formulasLoading } = useFormulasList({
    portalMode: getOrgFormulaPortalMode(orgType)
  });
  const formulaCreatePath = getOrgFormulaCreatePath(orgType);

  const loadFormForId = useCallback(
    (id) => {
      const cat = categories.find((c) => getCategoryId(c) === id);
      setForm(buildFormState(cat ?? null));
    },
    [categories]
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await eventCategoriesApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      // auto-select first tab
      if (list.length > 0) {
        const firstId = getCategoryId(list[0]);
        setActiveCategoryId(firstId);
        setForm(buildFormState(list[0]));
      }
      return list;
    } catch (err) {
      toast.error(extractError(err));
      setFetchError(extractError(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleTabSelect = (id) => {
    setActiveCategoryId(id);
    loadFormForId(id);
  };

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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)",
            pointerEvents: "none"
          }}
        />
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: { xs: 14, md: 16 } }
            }}
          >
            <Typography
              component={RouterLink}
              to={portal.dashboard}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to={portal.list}
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}
            >
              Event Categories
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Standard</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            Standard Categories
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
            KRSA official categories — read-only. Switch tabs to view each type.
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
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Standard Category Types
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Switch tabs to view another type.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={fetchCategories}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>

        <Box sx={{ px: 3, pb: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: "24px" }} />
          ) : fetchError ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", bgcolor: "#fff5f5" }}>
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 2 }}>{fetchError}</Typography>
              <Button variant="outlined" startIcon={<RefreshCw size={15} />} onClick={fetchCategories}>
                Retry
              </Button>
            </Paper>
          ) : categories.length === 0 ? (
            <Paper elevation={0} sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>
              No standard categories configured yet.
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ ...EDITOR_CARD_SX, maxWidth: 960, mx: "auto", width: "100%", cursor: "default" }}>
              <CategoryTypeTabs
                categories={categories}
                activeId={activeCategoryId}
                onSelect={handleTabSelect}
              />
              <CategoryInlineEditor
                form={form}
                errors={{}}
                formulas={formulas}
                formulasLoading={formulasLoading}
                showFormula
                isOrgOverride={false}
                isCreate={false}
                readOnly={true}
                onTypeNameChange={() => {}}
                onCategoryNameChange={() => {}}
                onCategoryFormulaChange={() => {}}
                onAddCategoryRow={() => {}}
                onRemoveCategoryRow={() => {}}
              />
              <Divider sx={{ borderColor: "#f5ebe7", mx: 2.5 }} />
              <Stack direction="row" sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
                  Standard KRSA type — read only.
                </Typography>
              </Stack>
            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
