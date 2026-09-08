import { useEffect, useState } from "react";
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
  Tooltip,
  Typography
} from "@mui/material";

import { Check, ChevronRight, PencilLine, Plus, Search, ShieldCheck, Trash2, Trophy, UserPlus, Users, X } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import clubHero from "@/assets/Club_header.jpg";
import { districtPortalApi } from "@/api/district-portal-api";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import toast from "react-hot-toast";

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "-"}</Typography>
  </div>
);

const mapClub = (club) => ({
  id: club._id,
  clubId: club.clubId || "",
  name: club.name || "",
  districtName: club.districtName || "",
  districtStatus: club.districtStatus || "",
  img: club.img || "",
  officeAddress: club.officeAddress || club.address || "",
  about: club.about || "",
  memberCount: club.memberCount ?? club.skaters ?? 0
});

const statusChipSx = (status) => ({
  fontWeight: 600,
  fontSize: 11,
  backgroundColor:
    status === "join"
      ? "#e8f5e9"
      : status === "apply"
        ? "#fff8e1"
        : status === "leave" || status === "apply-leave"
          ? "#fce4ec"
          : "#f5f5f5",
  color:
    status === "join"
      ? "#2e7d32"
      : status === "apply"
        ? "#f57f17"
        : status === "leave" || status === "apply-leave"
          ? "#c62828"
          : "#666"
});

export const DistrictClubsPage = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [districtName, setDistrictName] = useState("District");
  const [pagination, setPagination] = useState({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // clubId of in-progress action

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await districtPortalApi.getClubs({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      const payload = response?.data ?? response;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setClubs(list.map(mapClub));
      setPagination(payload?.pagination || { total: list.length });
      if (payload?.district?.name) setDistrictName(payload.district.name);
    } catch (error) {
      setClubs([]);
      setPagination({ total: 0 });
      toast.error(error.response?.data?.message || "Failed to fetch clubs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const response = await districtPortalApi.getClubs({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        });
        const payload = response?.data ?? response;
        if (cancelled) return;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        setClubs(list.map(mapClub));
        setPagination(payload?.pagination || { total: list.length });
        if (payload?.district?.name) setDistrictName(payload.district.name);
      } catch (error) {
        if (!cancelled) {
          setClubs([]);
          setPagination({ total: 0 });
          toast.error(error.response?.data?.message || "Failed to fetch clubs");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [page, rowsPerPage, searchTerm]);

  const runAction = async (clubId, apiFn, successMsg) => {
    setActionLoading(clubId);
    try {
      await apiFn(clubId);
      toast.success(successMsg);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setActionLoading(pendingDelete.id);
    try {
      await districtPortalApi.deleteClub(pendingDelete.id);
      toast.success("Club deleted");
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete club");
    } finally {
      setActionLoading(null);
    }
  };

  const totalCount = pagination.total || 0;

  const ActionButtons = ({ club }) => {
    const busy = actionLoading === club.id;
    const status = club.districtStatus;
    return (
      <Stack direction="row" spacing={0.75}>
        {/* Approve join */}
        {status === "apply" && (
          <Tooltip title="Approve join">
            <IconButton
              disabled={busy}
              onClick={() => runAction(club.id, districtPortalApi.acceptJoin, "Club approved")}
              sx={{ border: "1px solid #c8e6c9", color: "#2e7d32", backgroundColor: "#f1f8f2", "&:hover": { backgroundColor: "#dcedc8" } }}
              aria-label="Approve join"
            >
              <Check size={16} />
            </IconButton>
          </Tooltip>
        )}
        {/* Reject join */}
        {status === "apply" && (
          <Tooltip title="Reject join">
            <IconButton
              disabled={busy}
              onClick={() => runAction(club.id, districtPortalApi.rejectJoin, "Join request rejected")}
              sx={{ border: "1px solid #f2d9d1", color: "#c62828", backgroundColor: "#fff6f2", "&:hover": { backgroundColor: "#fce4ec" } }}
              aria-label="Reject join"
            >
              <X size={16} />
            </IconButton>
          </Tooltip>
        )}
        {/* Approve leave */}
        {(status === "leave" || status === "apply-leave") && (
          <Tooltip title="Approve leave">
            <IconButton
              disabled={busy}
              onClick={() => runAction(club.id, districtPortalApi.acceptLeave, "Leave approved")}
              sx={{ border: "1px solid #c8e6c9", color: "#2e7d32", backgroundColor: "#f1f8f2", "&:hover": { backgroundColor: "#dcedc8" } }}
              aria-label="Approve leave"
            >
              <Check size={16} />
            </IconButton>
          </Tooltip>
        )}
        {/* Reject leave */}
        {(status === "leave" || status === "apply-leave") && (
          <Tooltip title="Reject leave">
            <IconButton
              disabled={busy}
              onClick={() => runAction(club.id, districtPortalApi.rejectLeave, "Leave request rejected")}
              sx={{ border: "1px solid #f2d9d1", color: "#c62828", backgroundColor: "#fff6f2", "&:hover": { backgroundColor: "#fce4ec" } }}
              aria-label="Reject leave"
            >
              <X size={16} />
            </IconButton>
          </Tooltip>
        )}
        {/* Add Member */}
        <Tooltip title="Add Member">
          <IconButton
            disabled={busy}
            onClick={() => navigate(`/district/clubs/${club.id}/members/create`, { state: { returnTo: "/district/clubs", clubName: club.name } })}
            sx={{ border: "1px solid #dce8fb", color: "#3b82f6", backgroundColor: "#eff6ff", "&:hover": { backgroundColor: "#dbeafe" } }}
            aria-label={`Add member to ${club.name}`}
          >
            <UserPlus size={16} />
          </IconButton>
        </Tooltip>
        {/* Edit */}
        <Tooltip title="Edit">
          <IconButton
            disabled={busy}
            onClick={() => navigate(`/district/clubs/${club.id}/edit`)}
            sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
            aria-label={`Edit ${club.name}`}
          >
            <PencilLine size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            disabled={busy}
            onClick={() => setPendingDelete(club)}
            sx={{ border: "1px solid #f2d9d1", color: "#e06f58", backgroundColor: "#fff6f2" }}
            aria-label={`Delete ${club.name}`}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    );
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
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(246,118,94,0.18) 0%, rgba(0,0,0,0.04) 100%)", pointerEvents: "none" }} />
        <Stack sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}>
          <Box sx={{ maxWidth: 720 }}>
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: { xs: 14, md: 16 } } }}
            >
              <Typography component={RouterLink} to="/district/dashboard" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600, "&:hover": { color: "white" } }}>
                Dashboard
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Clubs</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Club Resource Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Review every affiliated club in {districtName}, including registration details, office addresses, and skater counts.
            </Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip icon={<Trophy size={16} />} label="Affiliated club registry" sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }} />
              <Chip icon={<ShieldCheck size={16} />} label={`${districtName} clubs`} sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Clubs Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Search and review clubs affiliated with this district.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
            <TextField
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              placeholder="Search by club name, club ID, address..."
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} style={{ color: "#b19f99" }} /></InputAdornment> } }}
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/district/clubs/create")}
              sx={{ backgroundColor: "#f6765e", boxShadow: "none", borderRadius: "14px", textTransform: "none", whiteSpace: "nowrap", "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" } }}
            >
              Add Club
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* Mobile cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "22px" }} />)
          ) : clubs.length > 0 ? (
            clubs.map((club) => (
              <Paper key={club.id} elevation={0} sx={{ p: 2, borderRadius: "22px", border: "1px solid #f2e5de", backgroundColor: "#fffaf8" }}>
                <Stack spacing={1.5}>
                  <div className="flex items-center gap-3">
                    <Avatar src={club.img} sx={{ width: 48, height: 48 }} alt={club.name} />
                    <div className="flex-1">
                      <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>{club.name}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#f6765e" }}>{club.clubId}</Typography>
                    </div>
                    <Chip label={club.districtStatus || "-"} size="small" sx={statusChipSx(club.districtStatus)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Box
                      onClick={() => navigate(`/district/clubs/${club.id}/members`)}
                      sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                    >
                      <DetailItem label="Members" value={club.memberCount} />
                    </Box>
                    <DetailItem label="Status" value={club.districtStatus || "-"} />
                    <Box sx={{ gridColumn: "span 2" }}><DetailItem label="Address" value={club.officeAddress} /></Box>
                  </div>
                  <ActionButtons club={club} />
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper elevation={0} sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>
              No clubs found for the current search.
            </Paper>
          )}
        </Stack>

        {/* Desktop table */}
        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Icon", "Club ID", "Club Name", "District", "Status", "Members", "Address", "About", "Actions"].map((col) => (
                  <TableCell key={col} sx={{ borderBottom: "1px solid #f0e1da", color: "#7e716d", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    {[0,1,2,3,4,5,6,7,8].map((j) => (
                      <TableCell key={j}><Skeleton variant="rounded" height={32} sx={{ borderRadius: "10px" }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : clubs.length > 0 ? (
                clubs.map((club) => (
                  <TableRow key={club.id} hover sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f5e9e3", verticalAlign: "middle" } }}>
                    <TableCell><Avatar src={club.img} alt={club.name} /></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap" }}>{club.clubId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{club.name}</TableCell>
                    <TableCell>{club.districtName || districtName || "-"}</TableCell>
                    <TableCell>
                      <Chip label={club.districtStatus || "-"} size="small" sx={statusChipSx(club.districtStatus)} />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        onClick={() => navigate(`/district/clubs/${club.id}/members`)}
                        sx={{ alignItems: "center", cursor: "pointer" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "8px", backgroundColor: "#fff0ed", border: "1px solid #f2d9d1" }}>
                          <Users size={15} color="#f6765e" />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#2f2829" }}>{club.memberCount}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography title={club.officeAddress} sx={{ fontSize: 13, color: "#6d5c57", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {club.officeAddress || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography title={club.about} sx={{ fontSize: 13, color: "#6d5c57", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                        {club.about || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ActionButtons club={club} />
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
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ "& .MuiTablePagination-toolbar": { flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5, py: 1 }, "& .MuiTablePagination-spacer": { display: "none" }, overflowX: "hidden" }}
          labelRowsPerPage="Rows:"
        />
      </Paper>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete club"
        itemLabel={pendingDelete?.name}
        description="This will permanently remove the club from the registry. This action cannot be undone."
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};
