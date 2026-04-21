import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography
} from "@mui/material";
import { ChevronRight, Megaphone, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import circularHero from "@/assets/Circular_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useCircularsStore } from "@/features/admin/circulars/store/circulars-store";

export const CircularsPage = () => {
  const navigate = useNavigate();
  const circulars = useCircularsStore((state) => state.circulars);
  const deleteCircular = useCircularsStore((state) => state.deleteCircular);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [pendingDeleteCircular, setPendingDeleteCircular] = useState(null);

  const filteredCirculars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return circulars;
    }

    return circulars.filter((item) =>
      [
        item.title,
        item.content,
        item.videoTitle,
        item.videoFile?.name,
        item.contentType,
        item.targetType,
        item.audience
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [circulars, searchTerm]);

  const paginatedCirculars = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCirculars.slice(start, start + rowsPerPage);
  }, [filteredCirculars, page, rowsPerPage]);

  const handleDelete = () => {
    if (!pendingDeleteCircular) {
      return;
    }

    deleteCircular(pendingDeleteCircular.id);
    setPendingDeleteCircular(null);
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4.5 },
          minHeight: { xs: 220, md: 300 },
          borderRadius: { xs: "24px", md: "32px" },
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(83, 199, 197, 0.23) 100%), url("${circularHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 760 }}>
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Circulars</Typography>
            </Breadcrumbs>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.05em",
                mb: 1.5,
                fontSize: { xs: "1.65rem", md: "3rem" }
              }}
            >
              Circulars Management Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 660, lineHeight: 1.7 }}>
              Publish notice circulars with image, video banner, and targeted delivery for state,
              district, and club audiences.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${circulars.length} Total Circulars`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${circulars.filter((item) => item.targetType === "State").length} State`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${circulars.filter((item) => item.targetType === "District").length} District`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${circulars.filter((item) => item.targetType === "Club").length} Club`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "24px", md: "32px" },
          border: "1px solid rgba(246, 228, 221, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(48, 30, 24, 0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            p: { xs: 2, md: 3 },
            alignItems: { lg: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Circulars Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              View circular cards and manage published announcements.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              placeholder="Search title, audience, type..."
              sx={{ minWidth: { xs: "100%", sm: 320 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#b19f99", marginRight: 8 }} />
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/circulars/create")}
            >
              Add circular
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
          {paginatedCirculars.length > 0 ? (
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
              {paginatedCirculars.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #f0ddd5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,250,248,1) 100%)",
                    boxShadow: "0 20px 50px rgba(56, 36, 29, 0.08)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 65px rgba(56, 36, 29, 0.12)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 120, sm: 138 },
                      position: "relative",
                      background: (
                        item.contentType === "video"
                          ? item.videoBanner?.dataUrl
                          : item.circularImage?.dataUrl
                      )
                        ? `linear-gradient(180deg, rgba(24,18,18,0.2) 0%, rgba(24,18,18,0.56) 100%), url("${item.contentType === "video" ? item.videoBanner?.dataUrl : item.circularImage?.dataUrl}")`
                        : `linear-gradient(180deg, rgba(24,18,18,0.2) 0%, rgba(24,18,18,0.56) 100%), url("${circularHero}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.75}
                      useFlexGap
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        right: 12,
                        flexWrap: "wrap",
                        maxWidth: "calc(100% - 24px)"
                      }}
                    >
                      <Chip
                        size="small"
                        label={item.targetType}
                        sx={{ backgroundColor: "#f6765e", color: "white", fontWeight: 700 }}
                      />
                      <Chip
                        size="small"
                        label={item.contentType === "video" ? "Video" : "Image"}
                        sx={{ backgroundColor: "#53c7c5", color: "white", fontWeight: 700 }}
                      />
                      <Chip
                        size="small"
                        label={item.audience || "-"}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.86)",
                          color: "#473e3c",
                          fontWeight: 700
                        }}
                      />
                    </Stack>
                  </Box>

                  <Stack
                    spacing={1.25}
                    sx={{
                      p: 1.75,
                      minHeight: { xs: "auto", sm: 205 },
                      position: "relative",
                      pb: { xs: 1.75, sm: 7 }
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 17, fontWeight: 800, color: "#2f2829", lineHeight: 1.25 }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#7e716d",
                        lineHeight: 1.55,
                        minHeight: 48,
                        fontSize: 14,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {item.content}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 18, color: "#f6765e", flexShrink: 0 }} />
                      <Typography sx={{ color: "#5f5552" }}>
                        {item.targetType}: {item.audience || "-"}
                      </Typography>
                    </Stack>

                    {item.contentType === "video" && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <OndemandVideoOutlinedIcon
                          sx={{ fontSize: 18, color: "#f6765e", flexShrink: 0 }}
                        />
                        <Typography
                          sx={{
                            color: "#5f5552",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {item.videoTitle || item.videoFile?.name || "Video uploaded"}
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" sx={{ pt: 0.5, mt: "auto", alignItems: "center" }}>
                      <Chip
                        size="small"
                        icon={<Megaphone size={14} />}
                        label="Published"
                        sx={{ backgroundColor: "#fff1eb", color: "#f6765e", fontWeight: 700 }}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        position: { xs: "static", sm: "absolute" },
                        right: { sm: 14 },
                        bottom: { sm: 14 },
                        mt: { xs: 1, sm: 0 },
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: { xs: "flex-end", sm: "flex-start" }
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PencilLine size={14} />}
                        onClick={() => navigate(`/circulars/${item.id}/edit`)}
                        sx={{ minWidth: { xs: 88, sm: "auto" } }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Trash2 size={14} />}
                        onClick={() => setPendingDeleteCircular(item)}
                        sx={{
                          minWidth: { xs: 92, sm: "auto" },
                          backgroundColor: "#f6765e",
                          "&:hover": { backgroundColor: "#ea6b54" }
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              No circulars found for the current search.
            </Paper>
          )}
        </Box>

        <TablePagination
          component="div"
          count={filteredCirculars.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 9, 12]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: { xs: "wrap", sm: "nowrap" },
              rowGap: 1,
              justifyContent: { xs: "center", sm: "flex-end" }
            }
          }}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteCircular)}
        title="Delete circular"
        itemLabel={pendingDeleteCircular?.title}
        description="This circular will be permanently removed. You can’t undo this action."
        onClose={() => setPendingDeleteCircular(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
