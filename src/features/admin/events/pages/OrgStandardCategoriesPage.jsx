import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import toast from "react-hot-toast";

import { eventCategoriesApi } from "@/api/event-categories-api";
import eventsHero from "@/assets/Events_header.jpg";

const extractError = (err) =>
  err?.response?.data?.message ||
  err?.message ||
  "An unexpected error occurred.";

const getCategoryId = (category) =>
  String(category?._id ?? category?.id ?? "");

const getCategoryName = (category) =>
  category?.name || category?.typeName || "Unnamed Category";

const getCategoryCount = (category) => {
  if (Array.isArray(category?.disciplines)) {
    return category.disciplines.reduce((total, discipline) => {
      return (
        total +
        (discipline.ageGroups || []).reduce((ageTotal, ageGroup) => {
          return ageTotal + (ageGroup.categories || []).length;
        }, 0)
      );
    }, 0);
  }

  return (category?.ageGroups || []).reduce(
    (total, ageGroup) => total + (ageGroup.categories || []).length,
    0
  );
};

const PORTAL_CONFIG = {
  club: {
    dashboard: "/club/dashboard",
    list: "/club/event-categories",
    label: "Club",
  },
  district: {
    dashboard: "/district/dashboard",
    list: "/district/event-categories",
    label: "District",
  },
};

/* ============================================================
   TAB BAR
============================================================ */

const TabBar = ({
  items = [],
  activeId,
  onSelect,
  getItemId,
  getItemLabel,
}) => (
  <Box
    sx={{
      display: "flex",
      gap: 0.5,
      overflowX: "auto",
      pb: 0,
      borderBottom: "1px solid #eee4df",
      "&::-webkit-scrollbar": {
        height: 4,
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#dfd2cc",
        borderRadius: 4,
      },
    }}
  >
    {items.map((item, index) => {
      const id = getItemId(item, index);
      const isActive = id === activeId;

      return (
        <Box
          key={id}
          component="button"
          type="button"
          onClick={() => onSelect(id)}
          sx={{
            flexShrink: 0,
            px: { xs: 2, md: 2.5 },
            py: 1.4,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#f16f56" : "#766a66",
            borderBottom: isActive
              ? "2px solid #f16f56"
              : "2px solid transparent",
            marginBottom: "-1px",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",

            "&:hover": {
              color: "#f16f56",
              backgroundColor: "#fff8f5",
            },
          }}
        >
          {getItemLabel(item)}
        </Box>
      );
    })}
  </Box>
);

/* ============================================================
   CATEGORY CHIP
============================================================ */

const CategoryChip = ({ category }) => {
  const name = String(category?.name || "").trim();

  if (!name) return null;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.8,
        borderRadius: "9px",
        backgroundColor: "#fff8f5",
        border: "1px solid #f2ddd6",
        color: "#493734",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.2,
        display: "inline-flex",
        alignItems: "center",
        minHeight: 34,
      }}
    >
      {name}
    </Box>
  );
};

/* ============================================================
   AGE GROUP CARD
============================================================ */

const AgeGroupCard = ({ ageGroup }) => {
  const categories = (ageGroup?.categories || []).filter((category) =>
    String(category?.name || "").trim()
  );

  if (!categories.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid #eee3de",
        background: "#ffffff",
        overflow: "hidden",
        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "#e9cfc6",
          boxShadow: "0 8px 24px rgba(60, 35, 28, 0.06)",
        },
      }}
    >
      {/* Age header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.75,
          py: 1.2,
          backgroundColor: "#fffaf8",
          borderBottom: "1px solid #f2e7e2",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "#332a28",
          }}
        >
          {ageGroup?.label || "Unknown Age"}
        </Typography>

        <Chip
          label={`${categories.length} ${
            categories.length === 1 ? "category" : "categories"
          }`}
          size="small"
          sx={{
            height: 25,
            backgroundColor: "#fff0eb",
            color: "#ee6f55",
            fontWeight: 700,
            fontSize: 11,
          }}
        />
      </Stack>

      {/* Categories */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {categories.map((category, index) => (
          <CategoryChip
            key={category?._id || `${category?.name}-${index}`}
            category={category}
          />
        ))}
      </Box>
    </Paper>
  );
};

/* ============================================================
   AGE GROUP LIST
============================================================ */

const AgeGroups = ({ ageGroups = [] }) => {
  const validAgeGroups = ageGroups.filter((ageGroup) =>
    (ageGroup?.categories || []).some((category) =>
      String(category?.name || "").trim()
    )
  );

  if (!validAgeGroups.length) {
    return (
      <Box
        sx={{
          py: 5,
          textAlign: "center",
          borderRadius: "16px",
          border: "1px dashed #e6d9d4",
          backgroundColor: "#fffdfc",
        }}
      >
        <Typography
          sx={{
            color: "#a99c97",
            fontSize: 14,
          }}
        >
          No age groups configured.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 1.5,
      }}
    >
      {validAgeGroups.map((ageGroup, index) => (
        <AgeGroupCard
          key={ageGroup?._id || `${ageGroup?.label}-${index}`}
          ageGroup={ageGroup}
        />
      ))}
    </Box>
  );
};

/* ============================================================
   DISCIPLINE PANEL
============================================================ */

const DisciplinePanel = ({ discipline }) => {
  return (
    <Box>
      {/* Discipline header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
        sx={{ mb: 2.5 }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "#302725",
          }}
        >
          {discipline?.name || "Unnamed Discipline"}
        </Typography>

        <Chip
          label={discipline?.categoryStatus || "standard"}
          size="small"
          sx={{
            height: 25,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "capitalize",
            backgroundColor: "#f1f4ff",
            color: "#4056b5",
          }}
        />
      </Stack>

      <AgeGroups ageGroups={discipline?.ageGroups || []} />
    </Box>
  );
};

/* ============================================================
   CATEGORY DETAIL
============================================================ */

const CategoryDetail = ({ category }) => {
  const disciplines = Array.isArray(category?.disciplines)
    ? category.disciplines
    : [];

  const hasDisciplines = disciplines.length > 0;

  const [activeDisciplineIdx, setActiveDisciplineIdx] = useState(0);

  useEffect(() => {
    setActiveDisciplineIdx(0);
  }, [category?._id]);

  if (!hasDisciplines) {
    return <AgeGroups ageGroups={category?.ageGroups || []} />;
  }

  const activeDiscipline =
    disciplines[activeDisciplineIdx] || disciplines[0];

  return (
    <Box>
      {/* Discipline tabs */}
      {disciplines.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: "#968681",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1,
            }}
          >
            Disciplines
          </Typography>

          <TabBar
            items={disciplines}
            activeId={String(activeDisciplineIdx)}
            onSelect={(id) => setActiveDisciplineIdx(Number(id))}
            getItemId={(_, index) => String(index)}
            getItemLabel={(discipline) =>
              discipline?.name || "Unnamed"
            }
          />
        </Box>
      )}

      <DisciplinePanel discipline={activeDiscipline} />
    </Box>
  );
};

/* ============================================================
   MAIN PAGE
============================================================ */

export default function OrgStandardCategoriesPage({ orgType }) {
  const portal = PORTAL_CONFIG[orgType];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await eventCategoriesApi.getAll();

      const responseData = res?.data?.data;

      const list = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      setCategories(list);

      setActiveCategoryId(
        list.length > 0 ? getCategoryId(list[0]) : null
      );
    } catch (err) {
      const message = extractError(err);

      toast.error(message);
      setFetchError(message);
      setCategories([]);
      setActiveCategoryId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCategory =
    categories.find(
      (category) => getCategoryId(category) === activeCategoryId
    ) || null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ======================================================
          HERO
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          minHeight: { xs: 210, md: 240 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",

          background: `
            linear-gradient(
              90deg,
              rgba(18,14,16,0.92) 0%,
              rgba(38,25,26,0.72) 45%,
              rgba(246,118,94,0.22) 100%
            ),
            url("${eventsHero}")
          `,

          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(246,118,94,0.12) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none",
          }}
        />

        <Stack
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": {
                color: "rgba(255,255,255,0.55)",
              },
            }}
          >
            <Typography
              component={RouterLink}
              to={portal?.dashboard || "/"}
              sx={{
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                "&:hover": {
                  color: "#fff",
                },
              }}
            >
              Dashboard
            </Typography>

            <Typography
              component={RouterLink}
              to={portal?.list || "#"}
              sx={{
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                "&:hover": {
                  color: "#fff",
                },
              }}
            >
              Event Categories
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Standard
            </Typography>
          </Breadcrumbs>

          <Typography
            sx={{
              fontSize: { xs: 30, md: 40 },
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              mb: 1.5,
            }}
          >
            Standard Categories
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.86)",
              maxWidth: 650,
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            KRSA official categories. Browse disciplines, age groups,
            and available event categories.
          </Typography>
        </Stack>
      </Paper>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid #eee2dd",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 18px 60px rgba(48,30,24,0.06)",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            p: { xs: 2, md: 2.5 },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "#2f2829",
              }}
            >
              Standard Category Types
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "#938681",
              }}
            >
              Select a category type to view its configuration.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshCw size={15} />}
            onClick={fetchCategories}
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              alignSelf: { xs: "flex-start", sm: "auto" },
            }}
          >
            Refresh
          </Button>
        </Stack>

        <Divider sx={{ borderColor: "#f1e7e3" }} />

        {/* Content */}
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {/* Loading */}
          {loading && (
            <Stack spacing={2}>
              <Skeleton
                variant="rounded"
                height={45}
                sx={{ borderRadius: "10px" }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rounded"
                    height={120}
                    sx={{ borderRadius: "14px" }}
                  />
                ))}
              </Box>
            </Stack>
          )}

          {/* Error */}
          {!loading && fetchError && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: "18px",
                textAlign: "center",
                backgroundColor: "#fff6f5",
                border: "1px solid #f5d8d4",
              }}
            >
              <Typography
                sx={{
                  color: "#c53030",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {fetchError}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<RefreshCw size={15} />}
                onClick={fetchCategories}
                sx={{ textTransform: "none" }}
              >
                Retry
              </Button>
            </Paper>
          )}

          {/* Empty */}
          {!loading &&
            !fetchError &&
            categories.length === 0 && (
              <Box
                sx={{
                  py: 7,
                  textAlign: "center",
                  borderRadius: "18px",
                  backgroundColor: "#fffcfb",
                  border: "1px dashed #e7dcd7",
                }}
              >
                <Typography
                  sx={{
                    color: "#958983",
                    fontSize: 14,
                  }}
                >
                  No standard categories configured yet.
                </Typography>
              </Box>
            )}

          {/* Data */}
          {!loading &&
            !fetchError &&
            categories.length > 0 && (
              <>
                {/* Category tabs */}
                <Box sx={{ mb: 2.5 }}>
                  <TabBar
                    items={categories}
                    activeId={activeCategoryId}
                    onSelect={setActiveCategoryId}
                    getItemId={(category) =>
                      getCategoryId(category)
                    }
                    getItemLabel={(category) =>
                      getCategoryName(category)
                    }
                  />
                </Box>

                {/* Active category */}
                {activeCategory && (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "20px",
                      border: "1px solid #eadbd5",
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, #fffaf8 0%, #fff 100%)",
                    }}
                  >
                    {/* Active category header */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      sx={{
                        px: { xs: 2, md: 2.5 },
                        py: 2,
                        gap: 1.5,
                        alignItems: {
                          sm: "center",
                        },
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f1e6e1",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#302725",
                          }}
                        >
                          {getCategoryName(activeCategory)}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.4,
                            fontSize: 12,
                            color: "#9a8c87",
                          }}
                        >
                          {getCategoryCount(activeCategory)} total{" "}
                          {getCategoryCount(activeCategory) === 1
                            ? "category"
                            : "categories"}
                        </Typography>
                      </Box>

                      <Chip
                        label="Standard"
                        size="small"
                        sx={{
                          height: 27,
                          backgroundColor: "#edfaf3",
                          color: "#2e7d52",
                          fontWeight: 700,
                          fontSize: 11,
                          alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                          },
                        }}
                      />
                    </Stack>

                    {/* Details */}
                    <Box
                      sx={{
                        p: { xs: 2, md: 2.5 },
                      }}
                    >
                      <CategoryDetail
                        category={activeCategory}
                      />
                    </Box>

                    {/* Footer */}
                    <Divider sx={{ borderColor: "#f1e6e1" }} />

                    <Box
                      sx={{
                        px: { xs: 2, md: 2.5 },
                        py: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#9a8c87",
                        }}
                      >
                        Standard KRSA category — read only.
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </>
            )}
        </Box>
      </Paper>
    </Box>
  );
}
