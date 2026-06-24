import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Skeleton,
  Stack,
  TablePagination,
  Typography
} from "@mui/material";
import { ChevronRight, CreditCard, PencilLine, Plus, Trash2 } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { aboutUsCardHero } from "../about-us-card-assets";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useAboutUsCardStore } from "../store/about-us-card-store";
import { AboutUsCardVisual } from "../components/AboutUsCardVisual";

export const AboutUsCardPage = () => {
  const navigate = useNavigate();
  const cards = useAboutUsCardStore((s) => s.cards);
  const pagination = useAboutUsCardStore((s) => s.pagination);
  const isLoading = useAboutUsCardStore((s) => s.isLoading);
  const fetchCards = useAboutUsCardStore((s) => s.fetchCards);
  const deleteCard = useAboutUsCardStore((s) => s.deleteCard);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchCards(page + 1, rowsPerPage);
  }, [fetchCards, page, rowsPerPage]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const ok = await deleteCard(pendingDelete._id);
    if (ok) setPendingDelete(null);
  };

  return (
    <Box className="space-y-5">
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 220, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 4 },
          background: `linear-gradient(90deg, rgba(20,17,20,0.88) 0%, rgba(20,17,20,0.58) 44%, rgba(20,17,20,0.18) 100%), url("${aboutUsCardHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}>
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>About usCard</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              About usCard Manager
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Click a card to manage members inside. Each card can have people with photos and details.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(246,228,221,0.95)",
          overflow: "hidden",
          background: "linear-gradient(180deg, #fff 0%, #fff9f6 100%)",
          boxShadow: "0 26px 80px rgba(48,30,24,0.07)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            borderBottom: "1px solid #f0e1da"
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
              Cards
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 14 }}>
              {pagination.total} card{pagination.total === 1 ? "" : "s"} total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/about-us-card/create")}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Add Card
          </Button>
        </Stack>

        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                gap: 2
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: "20px" }} />
              ))}
            </Box>
          ) : cards.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 5, md: 8 },
                borderRadius: "24px",
                border: "1px solid #f0e1da",
                textAlign: "center",
                backgroundColor: "#fffaf8"
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "20px",
                  margin: "0 auto 20px",
                  backgroundColor: "rgba(246,118,94,0.1)",
                  display: "grid",
                  placeItems: "center",
                  color: "#f6765e"
                }}
              >
                <CreditCard size={32} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
                No cards yet
              </Typography>
              <Typography sx={{ mt: 1.5, color: "#8d7f7b", maxWidth: 400, mx: "auto" }}>
                Create your first card with a title and photo.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => navigate("/about-us-card/create")}
                sx={{
                  mt: 3,
                  borderRadius: "14px",
                  textTransform: "none",
                  backgroundColor: "#f6765e",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                }}
              >
                Add Card
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                gap: 2
              }}
            >
              {cards.map((card) => (
                <Box key={card._id}>
                  <Box
                    onClick={() => navigate(`/about-us-card/${card._id}`)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "20px",
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "translateY(-3px)" }
                    }}
                  >
                    <AboutUsCardVisual title={card.title} photoUrl={card.photo} height={260} />
                  </Box>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PencilLine size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/about-us-card/${card._id}/edit`, { state: { card } });
                      }}
                      sx={{ borderRadius: "12px", textTransform: "none" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Trash2 size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(card);
                      }}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        backgroundColor: "#f6765e",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <TablePagination
          component="div"
          count={pagination.total}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 9, 12]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 0.5,
              py: 1
            },
            "& .MuiTablePagination-spacer": { display: "none" },
            overflowX: "hidden"
          }}
          labelRowsPerPage="Rows:"
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete Card"
        description={`This will permanently remove "${pendingDelete?.title || "this card"}". This action cannot be undone.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
