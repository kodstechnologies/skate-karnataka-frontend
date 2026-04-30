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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {
  ChevronRight,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
  Trash2,
  Users
} from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";

export const DistrictsPage = () => {
  const navigate = useNavigate();
  const districts = useDistrictsStore((store) => store.districts);
  const deleteDistrict = useDistrictsStore((store) => store.deleteDistrict);
  const fetchDistricts = useDistrictsStore((store) => store.fetchDistricts);
  const isLoading = useDistrictsStore((store) => store.isLoading);
  const pagination = useDistrictsStore((store) => store.pagination);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDeleteDistrict, setPendingDeleteDistrict] = useState(null);

  // Debounce search term to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch districts with params. If backend supports it, it will use them.
  useEffect(() => {
    fetchDistricts({ name: debouncedSearch, page: page + 1, limit: rowsPerPage });
  }, [fetchDistricts, debouncedSearch, page, rowsPerPage]);

  const filteredDistricts = useMemo(() => {
    if (pagination) return districts; // Backend handled search

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return districts;
    return districts.filter((item) =>
      [item.districtName, item.officeAddress, item.about]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [searchTerm, districts, pagination]);

  const paginatedDistricts = useMemo(() => {
    if (pagination) return districts; // Backend handled pagination

    const start = page * rowsPerPage;
    return filteredDistricts.slice(start, start + rowsPerPage);
  }, [filteredDistricts, page, rowsPerPage, pagination, districts]);

  const totalCount = pagination ? pagination.total : filteredDistricts.length;

  const closeDeleteDialog = () => setPendingDeleteDistrict(null);

  const handleDelete = async () => {
    if (!pendingDeleteDistrict) return;
    const success = await deleteDistrict(pendingDeleteDistrict.id);
    if (success) closeDeleteDialog();
  };

  return (
    <Box className="space-y-5">
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 250 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${districtHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Districts</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              District Registry Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage district records, office addresses, members, and more from one workspace.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Trophy size={16} />}
                label="District records"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<ShieldCheck size={16} />}
                label="Member mapping"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
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
              Districts Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Create, edit, search, and review district records from one organized registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search by district, address..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: "#b19f99" }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 300 } }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/districts/create")}
            >
              Add district
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* Mobile Cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {paginatedDistricts.length > 0 ? (
            paginatedDistricts.map((district) => (
              <Paper
                key={district.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  border: "1px solid #f2e5de",
                  backgroundColor: "#fffaf8"
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={district.img}
                      alt={district.districtName}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        border: "1px solid #f0e4dd"
                      }}
                    />
                    <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                      {district.districtName}
                    </Typography>
                  </Stack>
                  {district.about && (
                    <Typography sx={{ fontSize: 13, color: "#6b5e5a", lineHeight: 1.6 }}>
                      {district.about}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 13, color: "#8d7f7b" }}>
                    <strong>Address:</strong> {district.officeAddress || "-"}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Users size={14} color="#f6765e" />
                    <Typography sx={{ fontSize: 13, color: "#2f2829", fontWeight: 600 }}>
                      {district.members} Members
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={16} />}
                      onClick={() => navigate(`/districts/${district.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => setPendingDeleteDistrict(district)}
                      fullWidth
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
              No districts found.
            </Paper>
          )}
        </Stack>

        {/* Desktop Table */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["District", "Image", "About", "Office Address", "Members", "Actions"].map(
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
                      {col === "Members" ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Users size={14} />
                          <span>Members</span>
                        </Stack>
                      ) : (
                        col
                      )}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDistricts.length > 0 ? (
                paginatedDistricts.map((district) => (
                  <TableRow
                    key={district.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "middle"
                      }
                    }}
                  >
                    {/* Name */}
                    <TableCell sx={{ fontWeight: 700, color: "#2f2829", whiteSpace: "nowrap" }}>
                      {district.districtName}
                    </TableCell>

                    {/* Image */}
                    <TableCell>
                      {district.img ? (
                        <Avatar
                          src={district.img}
                          alt={district.districtName}
                          variant="rounded"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "10px",
                            border: "1px solid #f0e4dd"
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "10px",
                            backgroundColor: "#f3ecea",
                            color: "#c0a8a2",
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          No img
                        </Avatar>
                      )}
                    </TableCell>

                    {/* About */}
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Tooltip title={district.about || ""} placement="top" arrow>
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#5a4f4c",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {district.about || <span style={{ color: "#bbb" }}>—</span>}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    {/* Office Address */}
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#5a4f4c",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {district.officeAddress || <span style={{ color: "#bbb" }}>—</span>}
                      </Typography>
                    </TableCell>

                    {/* Members */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        onClick={() => navigate(`/districts/${district.id}/members`)}
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
                          {district.members}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => navigate(`/districts/${district.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${district.districtName}`}
                        >
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => setPendingDeleteDistrict(district)}
                          sx={{
                            border: "1px solid #f2d9d1",
                            color: "#e06f58",
                            backgroundColor: "#fff6f2"
                          }}
                          aria-label={`Delete ${district.districtName}`}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    {isLoading
                      ? "Loading districts..."
                      : "No districts found for the current search."}
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
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteDistrict)}
        title="Delete district"
        itemLabel={pendingDeleteDistrict?.districtName}
        description="This district record will be removed permanently."
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
