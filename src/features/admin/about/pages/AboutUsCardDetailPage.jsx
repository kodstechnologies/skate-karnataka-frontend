import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  TablePagination,
  Typography
} from "@mui/material";
import {
  ChevronRight,
  Mail,
  PencilLine,
  Phone,
  Plus,
  Trash2,
  UserRound
} from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { aboutUsCardHero } from "../about-us-card-assets";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useAboutUsCardStore } from "../store/about-us-card-store";
import { AboutUsCardVisual } from "../components/AboutUsCardVisual";

export const AboutUsCardDetailPage = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();

  const currentCard = useAboutUsCardStore((s) => s.currentCard);
  const members = useAboutUsCardStore((s) => s.members);
  const membersPagination = useAboutUsCardStore((s) => s.membersPagination);
  const isLoading = useAboutUsCardStore((s) => s.isLoading);
  const membersLoading = useAboutUsCardStore((s) => s.membersLoading);
  const fetchCardById = useAboutUsCardStore((s) => s.fetchCardById);
  const fetchMembers = useAboutUsCardStore((s) => s.fetchMembers);
  const deleteMember = useAboutUsCardStore((s) => s.deleteMember);
  const clearCurrent = useAboutUsCardStore((s) => s.clearCurrent);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!cardId) return;
    fetchCardById(cardId);
    return () => clearCurrent();
  }, [cardId, fetchCardById, clearCurrent]);

  useEffect(() => {
    if (!cardId) return;
    fetchMembers(cardId, page + 1, rowsPerPage);
  }, [cardId, fetchMembers, page, rowsPerPage]);

  const handleDeleteMember = async () => {
    if (!pendingDelete) return;
    const ok = await deleteMember(cardId, pendingDelete._id);
    if (ok) setPendingDelete(null);
  };

  const card = currentCard;
  const loading = isLoading || membersLoading;

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 250 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18, 14, 16, 0.82) 0%, rgba(38, 25, 26, 0.62) 34%, rgba(246, 118, 94, 0.2) 100%), url("${aboutUsCardHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28, 18, 16, 0.22)"
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" }
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
              to="/about-us-card"
              sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              About usCard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>
              {card?.title || "Card Details"}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
            {card?.title || "Card Details"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 640, lineHeight: 1.7 }}>
            Manage people and details inside this card.
          </Typography>
        </Stack>
      </Paper>

      {isLoading && !card ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: "28px" }} />
      ) : card ? (
        <Box sx={{ maxWidth: 420 }}>
          <AboutUsCardVisual
            title={card.title}
            photoUrl={card.photo}
            placeholderUrl={aboutUsCardHero}
            height={200}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PencilLine size={14} />}
              onClick={() => navigate(`/about-us-card/${cardId}/edit`, { state: { card } })}
              sx={{ borderRadius: "12px", textTransform: "none" }}
            >
              Edit Card
            </Button>
          </Stack>
        </Box>
      ) : null}

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
              Card Members
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 14 }}>
              {membersPagination.total} member{membersPagination.total === 1 ? "" : "s"} total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate(`/about-us-card/${cardId}/members/create`)}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
            }}
          >
            Add Member
          </Button>
        </Stack>

        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                gap: 2
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: "24px" }} />
              ))}
            </Box>
          ) : membersPagination.total === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 5, md: 7 },
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
                <UserRound size={32} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2829" }}>
                No members yet
              </Typography>
              <Typography sx={{ mt: 1.5, color: "#8d7f7b", maxWidth: 400, mx: "auto" }}>
                Add members with display name, designation, and photo.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => navigate(`/about-us-card/${cardId}/members/create`)}
                sx={{
                  mt: 3,
                  borderRadius: "14px",
                  textTransform: "none",
                  backgroundColor: "#f6765e",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                }}
              >
                Add Member
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
              {members.map((member) => (
                <Paper
                  key={member._id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: "24px",
                    border: "1px solid #f0ddd5",
                    background: "linear-gradient(180deg,#fff 0%,#fffaf8 100%)",
                    boxShadow: "0 16px 40px rgba(56,36,29,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 1.5
                  }}
                >
                  <Avatar
                    src={member.photo}
                    alt={member.displayName}
                    sx={{
                      width: 88,
                      height: 88,
                      borderRadius: "22px",
                      border: "2px solid #f0e1da"
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#2f2829",
                      fontSize: 16,
                      lineHeight: 1.35
                    }}
                  >
                    {member.displayName}
                  </Typography>

                  {member.designation && (
                    <Chip
                      label={member.designation}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "#fdf0eb",
                        color: "#c56b53"
                      }}
                    />
                  )}

                  {member.description && (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#8d7f7b",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {member.description}
                    </Typography>
                  )}

                  <Stack spacing={0.5} sx={{ width: "100%" }}>
                    {member.email && (
                      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                        <Mail size={14} color="#a28f89" />
                        <Typography sx={{ fontSize: 12, color: "#756968" }}>{member.email}</Typography>
                      </Stack>
                    )}
                    {member.phoneNo && (
                      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                        <Phone size={14} color="#a28f89" />
                        <Typography sx={{ fontSize: 12, color: "#756968" }}>{member.phoneNo}</Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: "auto", pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PencilLine size={14} />}
                      onClick={() =>
                        navigate(`/about-us-card/${cardId}/members/${member._id}/edit`)
                      }
                      sx={{ borderRadius: "10px", textTransform: "none" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => setPendingDelete(member)}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#f6765e",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <TablePagination
          component="div"
          count={membersPagination.total}
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
        title="Delete Member"
        description={`Remove "${pendingDelete?.displayName || "this member"}" from this card?`}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteMember}
      />
    </Box>
  );
};
