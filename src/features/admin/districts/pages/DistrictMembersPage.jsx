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
  Tooltip,
  Typography
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import { CheckCircle2, ChevronRight, PencilLine, Search, Star, Trash2, Users } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import districtHero from "@/assets/District_header.jpg";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { MemberAddMenuButton } from "@/components/members/MemberAddMenuButton";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useDistrictMembersStore } from "@/features/admin/districts/store/district-members-store";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";
import { canApproveMembers, getMemberApprovalChipProps } from "@/utils/memberApprovalStatus";

export const DistrictMembersPage = () => {
  const navigate = useNavigate();
  const { districtId: districtIdParam } = useParams();
  const role = useAuthStore((s) => s.role);
  const authUser = useAuthStore((s) => s.user);
  const isDistrictPortal = String(role || "").toLowerCase() === "district";
  const canApprove = canApproveMembers(role);
  const districtId = districtIdParam || (isDistrictPortal ? authUser?.districtId : null);

  const districts = useDistrictsStore((s) => s.districts);
  const district = useMemo(() => {
    if (districtIdParam) {
      return districts.find((d) => d.id === districtIdParam) ?? null;
    }
    if (isDistrictPortal) {
      return { id: districtId, name: authUser?.districtName || authUser?.name || "District" };
    }
    return null;
  }, [
    districts,
    districtIdParam,
    isDistrictPortal,
    districtId,
    authUser?.districtName,
    authUser?.name
  ]);

  const membersBasePath = isDistrictPortal
    ? "/district/members"
    : `/districts/${districtId}/members`;
  const createMemberPath = `${membersBasePath}/create`;
  const bulkMemberPath = `${membersBasePath}/bulk`;
  const editMemberPath = (memberId) => `${membersBasePath}/${memberId}/edit`;

  const {
    members,
    isLoading,
    fetchMembers,
    deleteMember,
    toggleMemberBlock,
    approveMember,
    setMainMember,
    pagination
  } = useDistrictMembersStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingBlock, setPendingBlock] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers(districtId, { search: debouncedSearch, page: page + 1, limit: rowsPerPage });
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

  const handleConfirmBlockToggle = async () => {
    if (!pendingBlock) return;
    const nextBlocked = !pendingBlock.isBlocked;
    const ok = await toggleMemberBlock(pendingBlock.id, nextBlocked);
    if (ok) setPendingBlock(null);
  };

  const handleSetMain = async (member) => {
    if (!member || member.isMain) return;
    await setMainMember(districtId, member.id);
  };

  const districtName = district?.districtName || district?.name || "District";

  if (!districtId) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          District not found
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate(isDistrictPortal ? "/district/dashboard" : "/districts")}
        >
          Go back
        </Button>
      </Paper>
    );
  }

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
              to={isDistrictPortal ? "/district/dashboard" : "/dashboard"}
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            {!isDistrictPortal && (
              <Typography
                component={RouterLink}
                to="/districts"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Districts
              </Typography>
            )}
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
              {isDistrictPortal
                ? "Search and manage district members. Add or edit member details."
                : "Search, add, edit, or remove members for this district. Choose one member as main."}
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
            <MemberAddMenuButton
              label="Add member"
              singleTo={createMemberPath}
              bulkTo={bulkMemberPath}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            />
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
                    sx={{ alignItems: "center", justifyContent: "space-between" }}
                    direction="row"
                    spacing={1.5}
                  >
                    <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
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
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                          <Typography sx={{ fontSize: 12, color: "#8d7f7b" }}>
                            {member.role}
                          </Typography>
                          {member.isMain && (
                            <Chip
                              size="small"
                              label="Main"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: "#fff3e0",
                                color: "#e65100"
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: "#6b5e5a" }}>
                    {member.phone} · {member.email || "—"}
                  </Typography>
                  <Chip size="small" {...getMemberApprovalChipProps(member)} />
                  <Stack direction="row" spacing={1}>
                    {canApprove && !member.verify && (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle2 size={15} />}
                        onClick={() => approveMember(member.id)}
                        fullWidth
                        size="small"
                        sx={{
                          backgroundColor: "#2e7d32",
                          "&:hover": { backgroundColor: "#1b5e20" }
                        }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<PencilLine size={15} />}
                      onClick={() => navigate(editMemberPath(member.id))}
                      fullWidth
                      size="small"
                    >
                      Edit
                    </Button>
                    {!isDistrictPortal && !member.isMain && (
                      <Button
                        variant="outlined"
                        startIcon={<Star size={15} />}
                        onClick={() => handleSetMain(member)}
                        fullWidth
                        size="small"
                        sx={{ borderColor: "#f0c987", color: "#e65100" }}
                      >
                        Set main
                      </Button>
                    )}
                    {!isDistrictPortal && (
                      <Button
                        variant={member.isBlocked ? "contained" : "outlined"}
                        color={member.isBlocked ? "success" : "error"}
                        startIcon={
                          member.isBlocked ? (
                            <LockOpenOutlinedIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <BlockOutlinedIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={() => setPendingBlock(member)}
                        fullWidth
                        size="small"
                      >
                        {member.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    )}
                    {!isDistrictPortal && (
                      <Button
                        variant="contained"
                        startIcon={<Trash2 size={15} />}
                        onClick={() => setPendingDelete(member)}
                        fullWidth
                        size="small"
                        sx={{
                          backgroundColor: "#f6765e",
                          "&:hover": { backgroundColor: "#ea6b54" }
                        }}
                      >
                        Delete
                      </Button>
                    )}
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
                      <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
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
                          <Stack direction="row" spacing={0.75} sx={{ mt: 0.25, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: 11, color: "#f6765e", fontWeight: 600 }}>
                              {member.role}
                            </Typography>
                            {member.isMain && (
                              <Chip
                                size="small"
                                label="Main"
                                sx={{
                                  height: 20,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  bgcolor: "#fff3e0",
                                  color: "#e65100"
                                }}
                              />
                            )}
                          </Stack>
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
                      <Chip size="small" {...getMemberApprovalChipProps(member)} />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {canApprove && !member.verify && (
                          <Tooltip title="Approve member (state admin)">
                            <IconButton
                              onClick={() => approveMember(member.id)}
                              sx={{
                                border: "1px solid #c8e6c9",
                                color: "#2e7d32",
                                backgroundColor: "#e8f5e9"
                              }}
                              aria-label={`Approve ${member.fullName}`}
                            >
                              <CheckCircle2 size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit member">
                          <IconButton
                            onClick={() => navigate(editMemberPath(member.id))}
                            sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                            aria-label={`Edit ${member.fullName}`}
                          >
                            <PencilLine size={16} />
                          </IconButton>
                        </Tooltip>
                        {!isDistrictPortal && !member.isMain && (
                          <Tooltip title="Set as main member">
                            <IconButton
                              onClick={() => handleSetMain(member)}
                              sx={{
                                border: "1px solid #f0c987",
                                color: "#e65100",
                                backgroundColor: "#fff8ef"
                              }}
                              aria-label={`Set ${member.fullName} as main`}
                            >
                              <Star size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!isDistrictPortal && (
                          <Tooltip title={member.isBlocked ? "Unblock member" : "Block member"}>
                            <IconButton
                              onClick={() => setPendingBlock(member)}
                              sx={{
                                border: "1px solid #efe2dc",
                                backgroundColor: member.isBlocked ? "#e8f5e9" : "#fff1f0",
                                color: member.isBlocked ? "#2e7d32" : "#c62828"
                              }}
                              aria-label={
                                member.isBlocked
                                  ? `Unblock ${member.fullName}`
                                  : `Block ${member.fullName}`
                              }
                            >
                              {member.isBlocked ? (
                                <LockOpenOutlinedIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        {!isDistrictPortal && (
                          <Tooltip title="Delete member">
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
                          </Tooltip>
                        )}
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
        title="Delete member"
        itemLabel={pendingDelete?.fullName}
        description={
          pendingDelete?.isMain
            ? "This is the main member. Deleting will remove them from the district and clear the main member."
            : "This member will be permanently removed from the district."
        }
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      {!isDistrictPortal && (
        <ConfirmDeleteModal
          open={Boolean(pendingBlock)}
          title={pendingBlock?.isBlocked ? "Unblock member" : "Block member"}
          description={
            pendingBlock?.isBlocked
              ? "This member will be able to log in again and access the KRSA platform."
              : "This member will be blocked from logging in. They will see a message that their account was blocked by the administrator."
          }
          itemLabel={pendingBlock?.fullName}
          confirmLabel={pendingBlock?.isBlocked ? "Unblock" : "Block"}
          onClose={() => setPendingBlock(null)}
          onConfirm={handleConfirmBlockToggle}
        />
      )}
    </Box>
  );
};
