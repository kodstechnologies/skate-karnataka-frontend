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
import { ChevronRight, PencilLine, Plus, Search, Trash2, Users } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useDistrictMembersStore } from "@/features/admin/districts/store/district-members-store";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";

export const DistrictMembersPage = () => {
  const navigate = useNavigate();
  const { districtId } = useParams();

  const districts = useDistrictsStore((s) => s.districts);
  const district = useMemo(
    () => districts.find((d) => d.id === districtId) ?? null,
    [districts, districtId]
  );

  const { members, isLoading, fetchMembers, deleteMember, pagination } = useDistrictMembersStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers(districtId, { name: debouncedSearch, page: page + 1, limit: rowsPerPage });
  }, [districtId, fetchMembers, debouncedSearch, page, rowsPerPage]);

  const filtered = useMemo(() => {
    if (pagination) return members;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.fullName, m.email, m.phone, m.address].join(" ").toLowerCase().includes(q)
    );
  }, [searchTerm, members, pagination]);

  const paginated = useMemo(() => {
    if (pagination) return members;
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage, pagination, members]);

  const totalCount = pagination ? pagination.total : filtered.length;

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const ok = await deleteMember(pendingDelete.id);
    if (ok) setPendingDelete(null);
  };

  const districtName = district?.districtName || "District";

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 240, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(18,14,16,0.92) 0%, rgba(38,25,26,0.76) 34%, rgba(246,118,94,0.28) 100%), url("${districtHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(28,18,16,0.22)"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none"
          }}
        />
        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
              "& .MuiBreadcrumbs-li": {
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 13, md: 15 }
              }
            }}
          >
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/districts"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Districts
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Members</Typography>
          </Breadcrumbs>

          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.72)",
                mb: 1
              }}
            >
              District Member Registry
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.06em", mb: 1 }}>
              {districtName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 580 }}>
              View and manage all members registered under this district.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              icon={<Users size={14} />}
              label={`${members.length} Members`}
              sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Table Card */}
      <Paper
        elevation={0}
        sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Members
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Search, add, edit, or remove members for this district.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, email, phone..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate(`/districts/${districtId}/members/create`)}
            >
              Add member
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* Mobile Cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: "18px" }} />
            ))
          ) : paginated.length > 0 ? (
            paginated.map((member) => (
              <Paper
                key={member.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={member.profile}
                        alt={member.fullName}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          border: "1px solid #f0e4dd"
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 14 }}>
                          {member.fullName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                          {member.role}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={member.isActive ? "Active" : "Inactive"}
                      sx={{
                        backgroundColor: member.isActive ? "#e9f9ef" : "#f3ecea",
                        color: member.isActive ? "#22a35a" : "#8f817e",
                        fontWeight: 700
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: "#6b5e5a" }}>
                    {member.phone} · {member.email || "—"}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={15} />}
                      onClick={() => navigate(`/districts/${districtId}/members/${member.id}/edit`)}
                      fullWidth
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={15} />}
                      onClick={() => setPendingDelete(member)}
                      fullWidth
                      size="small"
                      sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
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
              No members found.
            </Paper>
          )}
        </Stack>

        {/* Desktop Table */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Member", "Phone", "Email", "Address", "Gender", "Status", "Actions"].map(
                  (col) => (
                    <TableCell
                      key={col}
                      sx={{
                        borderBottom: "1px solid #f0e1da",
                        color: "#7e716d",
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {col}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((member) => (
                  <TableRow
                    key={member.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "middle"
                      }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={member.profile}
                          alt={member.fullName}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "10px",
                            border: "1px solid #f0e4dd"
                          }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 14 }}>
                            {member.fullName}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#f6765e", fontWeight: 600 }}>
                            {member.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>
                      {member.phone || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>
                      {member.email || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c", maxWidth: 200 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {member.address || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#5a4f4c", textTransform: "capitalize" }}>
                      {member.gender || "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={member.isActive ? "Active" : "Inactive"}
                        sx={{
                          backgroundColor: member.isActive ? "#e9f9ef" : "#f3ecea",
                          color: member.isActive ? "#22a35a" : "#8f817e",
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() =>
                            navigate(`/districts/${districtId}/members/${member.id}/edit`)
                          }
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${member.fullName}`}
                        >
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => setPendingDelete(member)}
                          sx={{
                            border: "1px solid #f2d9d1",
                            color: "#e06f58",
                            backgroundColor: "#fff6f2"
                          }}
                          aria-label={`Delete ${member.fullName}`}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No members found for this district.
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
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete member"
        itemLabel={pendingDelete?.fullName}
        description="This member will be permanently removed from the district."
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
