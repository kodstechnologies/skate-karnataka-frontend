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
  Tooltip
} from "@mui/material";
import {
  ChevronRight,
  Search,
  Plus,
  PencilLine,
  Trash2,
  History,
  Mail,
  Phone,
  UserPlus
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import officialHero from "@/assets/State_official_header.jpg";
import { useOfficialsStore } from "../store/officials-store";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

export const OfficialsPage = () => {
  const navigate = useNavigate();
  const officials = useOfficialsStore((state) => state.officials);
  const deleteOfficial = useOfficialsStore((state) => state.deleteOfficial);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDeleteOfficial, setPendingDeleteOfficial] = useState(null);

  const filteredOfficials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return officials;
    return officials.filter((o) =>
      [o.fullName, o.email, o.phone, o.designation]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [officials, searchTerm]);

  const paginatedOfficials = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOfficials.slice(start, start + rowsPerPage);
  }, [filteredOfficials, page, rowsPerPage]);

  const handleDelete = () => {
    if (pendingDeleteOfficial) {
      deleteOfficial(pendingDeleteOfficial.id);
      setPendingDeleteOfficial(null);
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
              Create and manage sub-admin accounts for state officials. Monitor their activities
              through system logs.
            </Typography>
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
              Showing {filteredOfficials.length} sub-admins in Karnataka
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, email..."
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
                  Designation
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
              {paginatedOfficials.length > 0 ? (
                paginatedOfficials.map((official) => (
                  <TableRow key={official.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
                        {official.fullName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                        ID: {official.id}
                      </Typography>
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
                      <Chip
                        label={official.designation}
                        size="small"
                        sx={{ backgroundColor: "#f3efff", color: "#6e56cf", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={official.status}
                        size="small"
                        sx={{
                          backgroundColor: official.status === "active" ? "#edf8ef" : "#fef1f1",
                          color: official.status === "active" ? "#2f8f4e" : "#d32f2f",
                          fontWeight: 700,
                          textTransform: "capitalize"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Logs">
                          <IconButton
                            onClick={() => navigate(`/officials/${official.id}/logs`)}
                            sx={{
                              border: "1px solid #efe2dc",
                              backgroundColor: "#f8f3ff",
                              color: "#6e56cf"
                            }}
                          >
                            <History size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => navigate(`/officials/${official.id}/edit`)}
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
