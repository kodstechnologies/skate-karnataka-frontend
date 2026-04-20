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
import { ChevronRight, PencilLine, Plus, Search, ShieldCheck, Trash2, Trophy } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import stateHero from "@/assets/State_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useStatesStore } from "@/features/admin/states/store/states-store";

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "-"}</Typography>
  </div>
);

export const StatesPage = () => {
  const navigate = useNavigate();
  const states = useStatesStore((store) => store.states);
  const deleteState = useStatesStore((store) => store.deleteState);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDeleteState, setPendingDeleteState] = useState(null);

  const filteredStates = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return states;
    }
    return states.filter((item) =>
      [
        item.stateName,
        item.stateCode,
        item.associationName,
        item.presidentName,
        item.headquartersAddress
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [searchTerm, states]);

  const paginatedStates = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStates.slice(start, start + rowsPerPage);
  }, [filteredStates, page, rowsPerPage]);

  const closeDeleteDialog = () => {
    setPendingDeleteState(null);
  };

  const handleDelete = () => {
    if (!pendingDeleteState) {
      return;
    }

    deleteState(pendingDeleteState.id);
    closeDeleteDialog();
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 250 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.8)",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${stateHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>States</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              State Registry Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage state associations, office bearers, and activity status from one central
              registry.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Trophy size={16} />}
                label="State association records"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<ShieldCheck size={16} />}
                label="Status management"
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
              States Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Create, edit, search, and review state records from one organized registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              placeholder="Search by state, code, president..."
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
              onClick={() => navigate("/states/create")}
            >
              Add state
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {paginatedStates.length > 0 ? (
            paginatedStates.map((state) => (
              <Paper
                key={state.id}
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
                        {state.stateName}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {state.stateCode || "-"}
                      </Typography>
                    </div>
                    <Chip
                      label={state.status === "active" ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: state.status === "active" ? "#e9f9ef" : "#f3ecea",
                        color: state.status === "active" ? "#22a35a" : "#8f817e",
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="President" value={state.presidentName} />
                    <DetailItem label="Phone" value={state.presidentPhone} />
                    <DetailItem label="Association" value={state.associationName} />
                    <DetailItem label="Headquarters" value={state.headquartersAddress} />
                    <DetailItem label="Districts" value={state.totalDistricts} />
                    <DetailItem label="Clubs" value={state.totalClubs} />
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={16} />}
                      onClick={() => navigate(`/states/${state.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => setPendingDeleteState(state)}
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
              No states found for the current search.
            </Paper>
          )}
        </Stack>

        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 1180 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {[
                  "State Name",
                  "Code",
                  "Association",
                  "President",
                  "President Phone",
                  "Headquarters",
                  "Districts",
                  "Clubs",
                  "Status",
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
              {paginatedStates.length > 0 ? (
                paginatedStates.map((state) => (
                  <TableRow
                    key={state.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "top"
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "#2f2829", whiteSpace: "nowrap" }}>
                      {state.stateName}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e" }}>
                      {state.stateCode || "-"}
                    </TableCell>
                    <TableCell>{state.associationName || "-"}</TableCell>
                    <TableCell>{state.presidentName || "-"}</TableCell>
                    <TableCell>{state.presidentPhone || "-"}</TableCell>
                    <TableCell>{state.headquartersAddress || "-"}</TableCell>
                    <TableCell>{state.totalDistricts || "-"}</TableCell>
                    <TableCell>{state.totalClubs || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={state.status === "active" ? "Active" : "Inactive"}
                        sx={{
                          backgroundColor: state.status === "active" ? "#e9f9ef" : "#f3ecea",
                          color: state.status === "active" ? "#22a35a" : "#8f817e",
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => navigate(`/states/${state.id}/edit`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                          aria-label={`Edit ${state.stateName}`}
                        >
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => setPendingDeleteState(state)}
                          sx={{
                            border: "1px solid #f2d9d1",
                            color: "#e06f58",
                            backgroundColor: "#fff6f2"
                          }}
                          aria-label={`Delete ${state.stateName}`}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No states found for the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredStates.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDeleteState)}
        title="Delete state"
        itemLabel={pendingDeleteState?.stateName}
        description="This state record will be removed permanently."
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
