import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
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

import {
  ChevronRight,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UserPlus,
  Users
} from "lucide-react";
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
  const fetchClubs = useClubsStore((state) => state.fetchClubs);
  const deleteClub = useClubsStore((state) => state.deleteClub);
  const pagination = useClubsStore((state) => state.pagination);
  const isLoading = useClubsStore((state) => state.isLoading);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDeleteClub, setPendingDeleteClub] = useState(null);

  useEffect(() => {
    // Determine if pagination is supported by checking if we have a limit param
    fetchClubs({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm
    });
  }, [fetchClubs, page, rowsPerPage, searchTerm]);

  // If backend pagination is not returned, we fallback to frontend logic.
  // Note: if backend returns paginated data, `clubs` will be length <= rowsPerPage
  const isBackendPagination = !!pagination;

  const displayClubs = useMemo(() => {
    if (isBackendPagination) {
      return clubs;
    }
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? clubs.filter((club) =>
          [club.clubId, club.name, club.districtName]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : clubs;
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [clubs, isBackendPagination, page, rowsPerPage, searchTerm]);

  const totalCount = useMemo(() => {
    if (isBackendPagination) {
      return pagination.total || 0;
    }
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return normalizedSearch
      ? clubs.filter((club) =>
          [club.clubId, club.name, club.districtName]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        ).length
      : clubs.length;
  }, [clubs, isBackendPagination, pagination, searchTerm]);

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
              placeholder="Search by club name, district, club ID..."
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
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "22px" }} />
            ))
          ) : displayClubs.length > 0 ? (
            displayClubs.map((club) => (
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
                  <div className="flex items-center gap-3">
                    <Avatar src={club.img} sx={{ width: 48, height: 48 }} alt={club.name} />
                    <div className="flex-1">
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                        {club.name}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {club.clubId}
                      </Typography>
                    </div>
                    <Chip
                      label={club.districtName}
                      size="small"
                      sx={{
                        backgroundColor: "#fff1eb",
                        color: "#f6765e",
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Box
                      onClick={() => navigate(`/clubs/${club.id}/members`)}
                      sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                    >
                      <DetailItem label="Members" value={club.memberCount} />
                    </Box>
                    <DetailItem label="Status" value={club.districtStatus || "-"} />
                    <Box sx={{ gridColumn: "span 2" }}>
                      <DetailItem label="Address" value={club.officeAddress} />
                    </Box>
                  </div>

                  <Stack direction="row" spacing={1}>
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
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {[
                  "Icon",
                  "Club ID",
                  "Club Name",
                  "District",
                  "District Status",
                  "Members",
                  "Address",
                  "About",
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
              {isLoading ? (
                [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <TableCell key={j}>
                        <Skeleton variant="rounded" height={32} sx={{ borderRadius: "10px" }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayClubs.length > 0 ? (
                displayClubs.map((club) => (
                  <TableRow
                    key={club.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "middle"
                      }
                    }}
                  >
                    <TableCell>
                      <Avatar src={club.img} alt={club.name} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap" }}>
                      {club.clubId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{club.name}</TableCell>
                    <TableCell>{club.districtName || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={club.districtStatus || "-"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          backgroundColor:
                            club.districtStatus === "join"
                              ? "#e8f5e9"
                              : club.districtStatus === "apply"
                                ? "#fff8e1"
                                : club.districtStatus === "leave"
                                  ? "#fce4ec"
                                  : "#f5f5f5",
                          color:
                            club.districtStatus === "join"
                              ? "#2e7d32"
                              : club.districtStatus === "apply"
                                ? "#f57f17"
                                : club.districtStatus === "leave"
                                  ? "#c62828"
                                  : "#666"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        onClick={() => navigate(`/clubs/${club.id}/members`)}
                        sx={{
                          cursor: "pointer",
                          "&:hover .members-icon": { backgroundColor: "#ffe0d9" }
                        }}
                      >
                        <Box
                          className="members-icon"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            backgroundColor: "#fff0ed",
                            border: "1px solid #f2d9d1",
                            transition: "background-color 0.2s"
                          }}
                        >
                          <Users size={15} color="#f6765e" />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#2f2829" }}>
                          {club.memberCount}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Typography
                        title={club.officeAddress}
                        sx={{
                          fontSize: 13,
                          color: "#6d5c57",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {club.officeAddress || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Typography
                        title={club.about}
                        sx={{
                          fontSize: 13,
                          color: "#6d5c57",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 200
                        }}
                      >
                        {club.about || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75}>
                        <IconButton
                          onClick={() =>
                            navigate(`/clubs/${club.id}/members/create`, {
                              state: { returnTo: "/clubs" }
                            })
                          }
                          sx={{
                            border: "1px solid #dce8fb",
                            color: "#3b82f6",
                            backgroundColor: "#eff6ff",
                            "&:hover": { backgroundColor: "#dbeafe" }
                          }}
                          aria-label={`Add member to ${club.name}`}
                          title="Add Member"
                        >
                          <UserPlus size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/clubs/${club.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${club.name}`}
                          title="Edit"
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
                          aria-label={`Delete ${club.name}`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No clubs found for the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
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
        itemLabel={pendingDeleteClub?.name}
        description="This will permanently remove the club record from the registry. You can’t undo this action."
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
