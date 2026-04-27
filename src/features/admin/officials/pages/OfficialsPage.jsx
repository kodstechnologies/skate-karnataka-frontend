import {
  Box,
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
  Typography,
  Tooltip,
  Skeleton,
  Avatar
} from "@mui/material";
import {
  ChevronRight,
  Search,
  PencilLine,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import officialHero from "@/assets/State_official_header.jpg";
import { useOfficialsStore } from "../store/officials-store";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

export const OfficialsPage = () => {
  const navigate = useNavigate();
  const { officials, isLoading, fetchOfficials, deleteOfficial } = useOfficialsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingDeleteOfficial, setPendingDeleteOfficial] = useState(null);

  useEffect(() => {
    fetchOfficials();
  }, [fetchOfficials]);

  const filteredOfficials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return officials;
    return officials.filter((o) =>
      [o.fullName, o.email, o.phone].join(" ").toLowerCase().includes(normalizedSearch)
    );
  }, [officials, searchTerm]);

  const paginatedOfficials = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOfficials.slice(start, start + rowsPerPage);
  }, [filteredOfficials, page, rowsPerPage]);

  const handleDelete = async () => {
    if (pendingDeleteOfficial) {
      try {
        await deleteOfficial(pendingDeleteOfficial._id);
        setPendingDeleteOfficial(null);
      } catch (error) {
        console.error("Failed to delete official:", error);
      }
    }
  };

  return (
    <Box className="space-y-5">
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 280 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.9) 0%, rgba(35,23,23,0.72) 38%, rgba(246,118,94,0.3) 100%), url("${officialHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)",
            pointerEvents: "none"
          }}
        />
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
              <Typography
                component={RouterLink}
                to="/dashboard"
                sx={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 14 }}
              >
                Dashboard
              </Typography>
              <ChevronRight size={14} className="text-white/60" />
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                State Officials
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1.5 }}>
              Manage Officials
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 600, lineHeight: 1.7 }}>
              Create and manage sub-admin accounts for state officials.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${officials.length} Total`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${officials.filter((o) => o.status === true || o.status === "true").length} Active`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                label={`${officials.filter((o) => o.status === false || o.status === "false").length} Inactive`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Main List */}
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
              Official Registry
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 14 }}>
              Showing {filteredOfficials.length} officials
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
              sx={{ minWidth: { xs: "100%", sm: 300 } }}
            />
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={() => navigate("/officials/create")}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Add Official
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <TableContainer className="custom-scrollbar">
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Official Name
                </TableCell>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Contact Details
                </TableCell>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Modules
                </TableCell>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton variant="text" width={150} />
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={200} />
                      <Skeleton variant="text" width={150} />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rectangular"
                        width={100}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rectangular"
                        width={120}
                        height={36}
                        sx={{ borderRadius: 2 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedOfficials.length > 0 ? (
                paginatedOfficials.map((official) => (
                  <TableRow key={official._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Avatar
                          src={official.img}
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "14px",
                            bgcolor: "#f6765e",
                            fontWeight: 700
                          }}
                        >
                          {official.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                            {official.fullName}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Mail size={14} className="text-[#f6765e]" />
                          <Typography sx={{ fontSize: 14 }}>{official.email}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Phone size={14} className="text-[#f6765e]" />
                          <Typography sx={{ fontSize: 14 }}>{official.phone}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        {official.allowedModule &&
                          (Array.isArray(official.allowedModule)
                            ? official.allowedModule
                            : JSON.parse(official.allowedModule)
                          )
                            .slice(0, 2)
                            .map((mod) => (
                              <Chip
                                key={mod}
                                label={mod}
                                size="small"
                                sx={{
                                  backgroundColor: "#f3efff",
                                  color: "#6e56cf",
                                  fontWeight: 600
                                }}
                              />
                            ))}
                        {official.allowedModule &&
                          (Array.isArray(official.allowedModule)
                            ? official.allowedModule
                            : JSON.parse(official.allowedModule)
                          ).length > 2 && (
                            <Chip
                              label={`+${(Array.isArray(official.allowedModule) ? official.allowedModule : JSON.parse(official.allowedModule)).length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {isLoading ? (
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={24}
                          sx={{ borderRadius: 1 }}
                        />
                      ) : (
                        <Chip
                          label={
                            official.status === true || official.status === "true"
                              ? "Active"
                              : "Inactive"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              official.status === true || official.status === "true"
                                ? "#edf8ef"
                                : "#fef1f1",
                            color:
                              official.status === true || official.status === "true"
                                ? "#2f8f4e"
                                : "#d32f2f",
                            fontWeight: 700
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => navigate(`/officials/${official._id}/edit`)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#fff8f4",
                              color: "#f6765e"
                            }}
                          >
                            <PencilLine size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => setPendingDeleteOfficial(official)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#fef1f1",
                              color: "#d32f2f"
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 8, textAlign: "center", color: "#978a86" }}>
                    No officials found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredOfficials.length}
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
        open={Boolean(pendingDeleteOfficial)}
        title="Delete Official Account"
        itemLabel={pendingDeleteOfficial?.fullName}
        description="This will permanently remove the sub-admin account and all associated access. This action cannot be undone."
        onClose={() => setPendingDeleteOfficial(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
