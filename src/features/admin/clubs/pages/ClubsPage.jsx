import { useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ChevronRight, PencilLine, Plus, Search, ShieldCheck, Trash2, Trophy } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useClubsStore } from "@/features/admin/clubs/store/clubs-store";

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "-"}</Typography>
  </div>
);

export const ClubsPage = () => {
  const navigate = useNavigate();
  const clubs = useClubsStore((state) => state.clubs);
  const deleteClub = useClubsStore((state) => state.deleteClub);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDeleteClub, setPendingDeleteClub] = useState(null);

  const filteredClubs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return clubs;
    }

    return clubs.filter((club) =>
      [
        club.krsaClubId,
        club.clubLogin,
        club.clubName,
        club.district,
        club.rosNumber,
        club.registrationAddress,
        club.clubPresidentName,
        club.clubPresidentPhone,
        club.clubSecretaryName,
        club.clubSecretaryPhone,
        club.trackAddress,
        club.trackMeasurements,
        club.documents?.name,
        club.rosCertificate?.name
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [clubs, searchTerm]);

  const paginatedClubs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredClubs.slice(start, start + rowsPerPage);
  }, [filteredClubs, page, rowsPerPage]);

  const openDeleteDialog = (club) => {
    setPendingDeleteClub(club);
  };

  const closeDeleteDialog = () => {
    setPendingDeleteClub(null);
  };

  const handleDelete = () => {
    if (!pendingDeleteClub) {
      return;
    }

    deleteClub(pendingDeleteClub.id);
    closeDeleteDialog();
  };

  const handleChangePage = (_, nextPage) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 230, md: 260 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${clubHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Clubs</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Club Resource Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage affiliated clubs, district registration, office bearers, rink details, and
              supporting documents from one clean workspace.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Trophy size={16} />}
                label="Affiliated club registry"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<ShieldCheck size={16} />}
                label="District-wise management"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
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
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Clubs Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Create, edit, search, and review KRSA clubs from one organized registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by club name, district, club ID, president..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 320 } }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/clubs/create")}
            >
              Add club
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {paginatedClubs.length > 0 ? (
            paginatedClubs.map((club) => (
              <Paper
                key={club.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Typography sx={{ mt: 0.5, fontWeight: 700, color: "#2f2829" }}>
                        {club.clubName}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {club.krsaClubId}
                      </Typography>
                    </div>
                    <Chip
                      label={club.district}
                      size="small"
                      sx={{
                        backgroundColor: "#fff1eb",
                        color: "#f6765e",
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="District" value={club.district} />
                    <DetailItem label="President" value={club.clubPresidentName} />
                    <DetailItem label="President number" value={club.clubPresidentPhone} />
                    <DetailItem label="Club login" value={club.clubLogin} />
                    <DetailItem label="ROS number" value={club.rosNumber} />
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      fullWidth
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={16} />}
                      onClick={() => navigate(`/clubs/${club.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => openDeleteDialog(club)}
                      fullWidth
                      sx={{
                        backgroundColor: "#f6765e",
                        "&:hover": {
                          backgroundColor: "#ea6b54"
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}
            >
              No clubs found for the current search.
            </Paper>
          )}
        </Stack>

        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 1120 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {[
                  "KRSA Club ID",
                  "Club Name",
                  "District",
                  "President Name",
                  "President Number",
                  "Club Login",
                  "ROS Number",
                  "Actions"
                ].map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      borderBottom: "1px solid #f0e1da",
                      color: "#7e716d",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedClubs.length > 0 ? (
                paginatedClubs.map((club) => (
                  <TableRow
                    key={club.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "top"
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap" }}>
                      {club.krsaClubId}
                    </TableCell>
                    <TableCell>{club.clubName}</TableCell>
                    <TableCell>{club.district}</TableCell>
                    <TableCell>{club.clubPresidentName}</TableCell>
                    <TableCell>{club.clubPresidentPhone}</TableCell>
                    <TableCell>{club.clubLogin || "-"}</TableCell>
                    <TableCell>{club.rosNumber || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => navigate(`/clubs/${club.id}`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`View ${club.clubName}`}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/clubs/${club.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${club.clubName}`}
                        >
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => openDeleteDialog(club)}
                          sx={{
                            border: "1px solid #f2d9d1",
                            color: "#e06f58",
                            backgroundColor: "#fff6f2"
                          }}
                          aria-label={`Delete ${club.clubName}`}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No clubs found for the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredClubs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteClub)}
        title="Delete club"
        itemLabel={pendingDeleteClub?.clubName}
        description="This will permanently remove the club record from the registry. You can’t undo this action."
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
