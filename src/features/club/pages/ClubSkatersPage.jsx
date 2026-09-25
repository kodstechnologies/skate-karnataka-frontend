import { useEffect, useState } from "react";
import {
  Avatar, Box, Breadcrumbs, Button, Chip, Divider, Drawer, IconButton,
  InputAdornment, MenuItem, Paper, Skeleton, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import { ChevronRight, Search, Users, X, Phone, Mail, User, MapPin, Award, Droplets, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { clubPortalApi } from "@/api/club-portal-api";
import { eventCategoriesApi } from "@/api/event-categories-api";
import toast from "react-hot-toast";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const formatGender = (g) => {
  if (!g) return "—";
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const resolveDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return value.name || value.typeName || value.title || "—";
  return String(value);
};

const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.25, borderBottom: "1px solid #f5ede9" }}>
    <Box sx={{ color: "#f6765e", mt: "2px", flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#b09890", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.88rem", color: "#2f2829", fontWeight: 500, mt: 0.2, wordBreak: "break-word" }}>{resolveDisplayValue(value)}</Typography>
    </Box>
  </Stack>
);

const StatCard = ({ label, value, color = "#2f2829" }) => (
  <Box sx={{ flex: 1, textAlign: "center", p: 1.5, borderRadius: "14px", background: "white", border: "1px solid #f0e6e1" }}>
    <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#b09890", mt: 0.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
  </Box>
);

const SectionLabel = ({ children }) => (
  <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#c4a49c", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1, mt: 0.5 }}>
    {children}
  </Typography>
);

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((v) => ({ value: v, label: v }));

export const ClubSkatersPage = () => {
  const [skaters, setSkaters] = useState([]);
  const [clubName, setClubName] = useState("Club");
  const [pagination, setPagination] = useState({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // View drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSkater, setDrawerSkater] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Edit drawer
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editSkater, setEditSkater] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);

  const [blockingId, setBlockingId] = useState(null);

  const handleViewSkater = async (skater) => {
    setDrawerSkater(null);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const res = await clubPortalApi.getSkater(skater.id);
      const data = res?.data?.data ?? res?.data ?? res;
      setDrawerSkater(data);
    } catch {
      toast.error("Failed to load skater details");
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleEditSkater = async (skater) => {
    setEditSkater(skater);
    setEditForm({});
    setEditDrawerOpen(true);
    setEditLoading(true);
    try {
      const [res, distRes, catRes] = await Promise.all([
        clubPortalApi.getSkater(skater.id),
        districts.length === 0 ? clubPortalApi.listDistricts({ limit: 100 }) : Promise.resolve(null),
        eventCategories.length === 0 ? eventCategoriesApi.getAll() : Promise.resolve(null),
      ]);
      const data = res?.data?.data ?? res?.data ?? res;
      if (distRes) {
        const d = distRes?.data?.data ?? distRes?.data ?? distRes;
        setDistricts(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
      }
      if (catRes) {
        const c = catRes?.data?.data ?? catRes?.data ?? catRes;
        setEventCategories(Array.isArray(c?.data) ? c.data : Array.isArray(c) ? c : []);
      }
      setEditForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        gender: data.gender || "",
        address: data.address || "",
        parent: data.parent || "",
        bloodGroup: data.bloodGroup || "",
        school: data.school || "",
        grade: data.grade || "",
        aadharNumber: data.aadharNumber || "",
        signature: data.signature || "",
        dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
        rsfiId: data.rsfiId || "",
        district: data.district?._id || data.district || "",
        eventCategory: data.eventCategory?._id || String(data.eventCategory || ""),
        discipline: data.discipline?._id || String(data.discipline || ""),
      });
    } catch {
      toast.error("Failed to load skater details");
      setEditDrawerOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editSkater) return;
    setSaving(true);
    try {
      await clubPortalApi.editSkater(editSkater.id, editForm);
      toast.success("Skater updated successfully");
      setEditDrawerOpen(false);
      // Refresh table row
      setSkaters((prev) =>
        prev.map((s) =>
          s.id === editSkater.id
            ? { ...s, name: editForm.fullName || s.name, phone: editForm.phone || s.phone, gender: editForm.gender || s.gender }
            : s
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update skater");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async (skater) => {
    setBlockingId(skater.id);
    try {
      const res = await clubPortalApi.blockSkater(skater.id);
      const result = res?.data?.data ?? res?.data ?? res;
      const isBlocked = result?.blocked ?? (result?.clubStatus === "block");
      toast.success(isBlocked ? `${skater.name} blocked` : `${skater.name} unblocked`);
      setSkaters((prev) =>
        prev.map((s) =>
          s.id === skater.id ? { ...s, clubStatus: isBlocked ? "block" : "join" } : s
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update skater status");
    } finally {
      setBlockingId(null);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await clubPortalApi.getSkaters({ page: page + 1, limit: rowsPerPage, search: debouncedSearch });
        if (cancelled) return;
        const payload = res?.data ?? res;
        setSkaters(Array.isArray(payload?.data) ? payload.data : []);
        setPagination(payload?.pagination || { total: 0 });
        if (payload?.club?.name) setClubName(payload.club.name);
      } catch (err) {
        if (!cancelled) { setSkaters([]); toast.error(err.response?.data?.message || "Failed to fetch skaters"); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, rowsPerPage, debouncedSearch]);

  const totalCount = pagination.total || 0;

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, minHeight: { xs: 230, md: 260 }, borderRadius: "28px", overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.8)", background: `linear-gradient(90deg, rgba(20,17,20,0.85) 0%, rgba(20,17,20,0.55) 44%, rgba(20,17,20,0.15) 100%), url("${skatersHero}")`, backgroundPosition: "center", backgroundSize: "cover", color: "white" }}>
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ maxWidth: 720 }}>
            <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)" } }}>
              <Typography component={RouterLink} to="/club/dashboard" sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>Dashboard</Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Skaters</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1 }}>Club Skaters</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}>All skaters registered under {clubName}.</Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
              <Chip icon={<Users size={15} />} label={`${totalCount} Skaters`} sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Table Card */}
      <Paper elevation={0} sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>All Skaters</Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>Search by name, KRSA ID, or phone.</Typography>
          </Box>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, KRSA ID, phone..."
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} style={{ color: "#b19f99" }} /></InputAdornment> } }}
            sx={{ minWidth: { xs: "100%", sm: 320 } }}
          />
        </Stack>

        <Divider />

        {/* Desktop table */}
        <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {["Photo", "KRSA ID", "Name", "Phone", "Email", "Gender", "Status", "Actions"].map((col) => (
                  <TableCell key={col} sx={{ borderBottom: "1px solid #f0e1da", color: "#7e716d", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [0,1,2,3].map((i) => (
                  <TableRow key={i}>
                    {[0,1,2,3,4,5,6,7,8].map((j) => (
                      <TableCell key={j}><Skeleton variant="rounded" height={28} sx={{ borderRadius: "8px" }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : skaters.length > 0 ? (
                skaters.map((s) => {
                  const isBlocked = s.clubStatus === "block";
                  return (
                    <TableRow key={s.id} hover sx={{ opacity: isBlocked ? 0.6 : 1, "& .MuiTableCell-root": { borderBottom: "1px solid #f5e9e3", verticalAlign: "middle" } }}>
                      <TableCell><Avatar src={s.img} alt={s.name} sx={{ width: 36, height: 36 }} /></TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#f6765e", fontSize: 13 }}>{s.krsaId || "—"}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>{s.name}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.phone || "—"}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.email || "—"}</TableCell>
                      <TableCell>
                        <Chip label={formatGender(s.gender)} size="small" sx={{ backgroundColor: "#f4ede9", color: "#7a5c52", fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      {/* <TableCell sx={{ fontSize: 13, color: "#5a4f4c" }}>{s.districtName || "—"}</TableCell> */}
                      <TableCell>
                        <Chip
                          label={isBlocked ? "Blocked" : "Active"}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: 11,
                            backgroundColor: isBlocked ? "#fdecea" : "#eef8f0",
                            color: isBlocked ? "#c62828" : "#2e7d32",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => handleViewSkater(s)} sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4", color: "#5a4f4c" }}>
                              <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit skater">
                            <IconButton size="small" onClick={() => handleEditSkater(s)} sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4", color: "#5a4f4c" }}>
                              <EditOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isBlocked ? "Unblock skater" : "Block skater"}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={blockingId === s.id}
                                onClick={() => handleBlockToggle(s)}
                                sx={{ border: "1px solid #efe2dc", backgroundColor: isBlocked ? "#fdecea" : "#fff8f4", color: isBlocked ? "#c62828" : "#9e9e9e" }}
                              >
                                {isBlocked
                                  ? <CheckCircleOutlinedIcon sx={{ fontSize: 17 }} />
                                  : <BlockIcon sx={{ fontSize: 17 }} />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>No skaters found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile cards */}
        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {isLoading ? (
            [0,1,2].map((i) => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: "22px" }} />)
          ) : skaters.length > 0 ? (
            skaters.map((s) => {
              const isBlocked = s.clubStatus === "block";
              return (
                <Paper key={s.id} elevation={0} sx={{ p: 2, borderRadius: "22px", border: "1px solid #f2e5de", backgroundColor: "#fffaf8", opacity: isBlocked ? 0.65 : 1 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={s.img} alt={s.name} sx={{ width: 44, height: 44 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>{s.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#f6765e", fontWeight: 600 }}>{s.krsaId || "—"}</Typography>
                      </Box>
                      <Chip label={isBlocked ? "Blocked" : "Active"} size="small" sx={{ fontWeight: 700, fontSize: 11, backgroundColor: isBlocked ? "#fdecea" : "#eef8f0", color: isBlocked ? "#c62828" : "#2e7d32" }} />
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => handleViewSkater(s)} sx={{ fontSize: 12 }}>View</Button>
                      <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => handleEditSkater(s)} sx={{ fontSize: 12 }}>Edit</Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color={isBlocked ? "success" : "error"}
                        startIcon={isBlocked ? <CheckCircleOutlinedIcon /> : <BlockIcon />}
                        disabled={blockingId === s.id}
                        onClick={() => handleBlockToggle(s)}
                        sx={{ fontSize: 12 }}
                      >
                        {isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Paper elevation={0} sx={{ p: 4, borderRadius: "22px", textAlign: "center", color: "#978a86" }}>No skaters found.</Paper>
          )}
        </Stack>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ "& .MuiTablePagination-spacer": { display: "none" }, overflowX: "hidden" }}
          labelRowsPerPage="Rows:"
        />
      </Paper>

      {/* View Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 440 }, borderRadius: { sm: "24px 0 0 24px" }, p: 0, overflow: "hidden", display: "flex", flexDirection: "column" } } }}
      >
        {/* Hero header */}
        <Box sx={{ position: "relative", background: "linear-gradient(145deg, #1e1618 0%, #3a2a26 60%, #4e3530 100%)", pb: 3, flexShrink: 0 }}>
          <IconButton onClick={() => setDrawerOpen(false)} size="small"
            sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.08)", "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }}>
            <X size={16} />
          </IconButton>
          {drawerLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ pt: 4, pb: 1 }}>
              <Skeleton variant="circular" width={90} height={90} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
              <Skeleton variant="text" width={150} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
              <Skeleton variant="rounded" width={100} height={24} sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: "20px" }} />
            </Stack>
          ) : drawerSkater ? (
            <>
              <Stack alignItems="center" spacing={1.5} sx={{ pt: 4, px: 3 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={drawerSkater.img || drawerSkater.photo}
                    alt={drawerSkater.name || drawerSkater.fullName}
                    sx={{ width: 90, height: 90, border: "3px solid rgba(246,118,94,0.5)", fontSize: "2.2rem", backgroundColor: "#4a3530" }}
                  />
                  {drawerSkater.verify && (
                    <Box sx={{ position: "absolute", bottom: 2, right: 2, backgroundColor: "#1e1618", borderRadius: "50%", lineHeight: 0 }}>
                      <VerifiedIcon sx={{ fontSize: 20, color: "#4fc3f7" }} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 800, color: "white", fontSize: "1.2rem", lineHeight: 1.2 }}>
                    {drawerSkater.name || drawerSkater.fullName}
                  </Typography>
                  <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                    <Chip label={drawerSkater.krsaId || "—"} size="small"
                      sx={{ fontWeight: 700, fontSize: "0.72rem", backgroundColor: "rgba(246,118,94,0.18)", color: "#ff9d87", border: "1px solid rgba(246,118,94,0.3)" }} />
                    {drawerSkater.gender && (
                      <Chip label={formatGender(drawerSkater.gender)} size="small"
                        sx={{ fontWeight: 600, fontSize: "0.72rem", backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }} />
                    )}
                    <Chip
                      label={drawerSkater.clubStatus === "block" ? "Blocked" : "Active"}
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: "0.72rem",
                        backgroundColor: drawerSkater.clubStatus === "block" ? "rgba(198,40,40,0.2)" : "rgba(46,125,50,0.2)",
                        color: drawerSkater.clubStatus === "block" ? "#ef9a9a" : "#a5d6a7",
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2.5, mx: 3 }}>
                <StatCard label="Gold 🥇" value={drawerSkater.goldMedals ?? drawerSkater.gold ?? 0} color="#f59e0b" />
                <StatCard label="Silver 🥈" value={drawerSkater.silverMedals ?? drawerSkater.silver ?? 0} color="#94a3b8" />
                {drawerSkater.category && (
                  <StatCard label="Category" value={drawerSkater.category?.typeName || drawerSkater.category?.name || "—"} color="#f6765e" />
                )}
              </Stack>
            </>
          ) : null}
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, backgroundColor: "#fdf8f6" }}>
          {drawerLoading ? (
            <Stack spacing={1.5}>{[1,2,3,4,5,6].map((i) => <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: "10px" }} />)}</Stack>
          ) : drawerSkater ? (
            <Stack spacing={1.5}>
              <Box sx={{ p: 2, borderRadius: "16px", backgroundColor: "white", border: "1px solid #f0e6e1" }}>
                <SectionLabel>Contact</SectionLabel>
                <InfoRow icon={<Phone size={14} />} label="Phone" value={drawerSkater.phone} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={drawerSkater.email} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={drawerSkater.address} />
              </Box>
              <Box sx={{ p: 2, borderRadius: "16px", backgroundColor: "white", border: "1px solid #f0e6e1" }}>
                <SectionLabel>Personal</SectionLabel>
                <InfoRow icon={<Calendar size={14} />} label="Date of Birth" value={formatDate(drawerSkater.dob)} />
                <InfoRow icon={<Droplets size={14} />} label="Blood Group" value={drawerSkater.bloodGroup} />
                <InfoRow icon={<User size={14} />} label="Parent / Guardian" value={drawerSkater.parent} />
                <InfoRow icon={<Award size={14} />} label="District" value={drawerSkater.district?.name || drawerSkater.districtName} />
              </Box>
              {(drawerSkater.school || drawerSkater.grade || drawerSkater.aadharNumber || drawerSkater.discipline || drawerSkater.eventCategory) && (
                <Box sx={{ p: 2, borderRadius: "16px", backgroundColor: "white", border: "1px solid #f0e6e1" }}>
                  <SectionLabel>Academic & Discipline</SectionLabel>
                  {drawerSkater.aadharNumber && <InfoRow icon={<Award size={14} />} label="Aadhaar Number" value={drawerSkater.aadharNumber} />}
                  {drawerSkater.school && <InfoRow icon={<GraduationCap size={14} />} label="School" value={drawerSkater.school} />}
                  {drawerSkater.grade && <InfoRow icon={<BookOpen size={14} />} label="Grade" value={drawerSkater.grade} />}
                  {drawerSkater.discipline && (
                    <InfoRow
                      icon={<Award size={14} />}
                      label="Discipline"
                      value={drawerSkater.discipline?.name || drawerSkater.discipline}
                    />
                  )}
                  {drawerSkater.eventCategory && (
                    <InfoRow
                      icon={<Award size={14} />}
                      label="Event Category"
                      value={drawerSkater.eventCategory?.name || "—"}
                    />
                  )}
                  {drawerSkater.signature && <InfoRow icon={<Award size={14} />} label="Signature" value={drawerSkater.signature} />}
                </Box>
              )}
              <Box sx={{ p: 2, borderRadius: "16px", backgroundColor: "white", border: "1px solid #f0e6e1" }}>
                <SectionLabel>IDs & Club</SectionLabel>
                <InfoRow icon={<Award size={14} />} label="KRSA ID" value={drawerSkater.krsaId} />
                {drawerSkater.rsfiId && <InfoRow icon={<Award size={14} />} label="RSFI ID" value={drawerSkater.rsfiId} />}
                <InfoRow icon={<Award size={14} />} label="Club" value={drawerSkater.club?.name} />
                <InfoRow icon={<Calendar size={14} />} label="Joined" value={formatDate(drawerSkater.createdAt)} />
              </Box>
            </Stack>
          ) : null}
        </Box>

        {!drawerLoading && drawerSkater && (
          <Box sx={{ p: 2, borderTop: "1px solid #f0e5e1", backgroundColor: "white", flexShrink: 0 }}>
            <Button
              fullWidth variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => { setDrawerOpen(false); handleEditSkater({ id: drawerSkater.id || drawerSkater._id, name: drawerSkater.name || drawerSkater.fullName }); }}
              sx={{ borderRadius: "12px", fontWeight: 700, backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#e5604a" } }}
            >
              Edit Skater 
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Edit Drawer */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 }, borderRadius: { sm: "24px 0 0 24px" }, p: 0, overflow: "hidden", display: "flex", flexDirection: "column" } } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #2f2829 0%, #4a3c38 100%)", p: 3, position: "relative", flexShrink: 0 }}>
          <IconButton onClick={() => setEditDrawerOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.7)" }}>
            <X size={18} />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 0.5 }}>
            <Box sx={{ p: 1.25, borderRadius: "12px", backgroundColor: "rgba(246,118,94,0.2)" }}>
              <EditOutlinedIcon sx={{ color: "#ff9d87", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: "white", fontSize: "1.1rem" }}>Edit Skater</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>{editSkater?.name || ""}</Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
          {editLoading ? (
            <Stack spacing={2}>{[1,2,3,4,5,6,7,8].map((i) => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: "12px" }} />)}</Stack>
          ) : (
            <Stack spacing={2}>
              {/* Basic */}
              <TextField label="Full Name" value={editForm.fullName || ""} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Phone" value={editForm.phone || ""} disabled fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField select label="Gender" value={editForm.gender || ""} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
                {GENDER_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
              <TextField label="Date of Birth" type="date" value={editForm.dob || ""} onChange={(e) => setEditForm((f) => ({ ...f, dob: e.target.value }))} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField select label="Blood Group" value={editForm.bloodGroup || ""} onChange={(e) => setEditForm((f) => ({ ...f, bloodGroup: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
                <MenuItem value=""><em>Select</em></MenuItem>
                {BLOOD_GROUP_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>

              {/* Contact */}
              <TextField label="Address" value={editForm.address || ""} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} fullWidth multiline rows={2} size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField select label="District" value={editForm.district || ""} onChange={(e) => setEditForm((f) => ({ ...f, district: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
                <MenuItem value=""><em>Select district</em></MenuItem>
                {districts.map((d) => <MenuItem key={String(d._id)} value={String(d._id)}>{d.name}</MenuItem>)}
              </TextField>

              {/* Personal */}
              <TextField label="Parent / Guardian" value={editForm.parent || ""} onChange={(e) => setEditForm((f) => ({ ...f, parent: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Aadhaar Number" value={editForm.aadharNumber || ""} onChange={(e) => setEditForm((f) => ({ ...f, aadharNumber: e.target.value }))} fullWidth size="small" inputProps={{ maxLength: 12 }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />

              {/* Academic */}
              <TextField label="School" value={editForm.school || ""} onChange={(e) => setEditForm((f) => ({ ...f, school: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Grade" value={editForm.grade || ""} onChange={(e) => setEditForm((f) => ({ ...f, grade: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />

              {/* IDs */}
              <TextField label="RSFI ID" value={editForm.rsfiId || ""} onChange={(e) => setEditForm((f) => ({ ...f, rsfiId: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Signature (URL)" value={editForm.signature || ""} onChange={(e) => setEditForm((f) => ({ ...f, signature: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />

              {/* Event Category & Discipline */}
              <TextField
                select
                label="Event Category"
                value={editForm.eventCategory || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, eventCategory: e.target.value, discipline: "" }))}
                fullWidth size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              >
                <MenuItem value=""><em>Select category</em></MenuItem>
                {eventCategories.map((cat) => (
                  <MenuItem key={String(cat._id)} value={String(cat._id)}>
                    {cat.name || cat.typeName || "—"}
                  </MenuItem>
                ))}
              </TextField>
              {editForm.eventCategory && (() => {
                const cat = eventCategories.find((c) => String(c._id) === editForm.eventCategory);
                const discs = cat?.disciplines ?? [];
                if (!discs.length) return null;
                return (
                  <TextField
                    select
                    label="Discipline"
                    value={editForm.discipline || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, discipline: e.target.value }))}
                    fullWidth size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  >
                    <MenuItem value=""><em>Select discipline</em></MenuItem>
                    {discs.map((d) => (
                      <MenuItem key={String(d._id)} value={String(d._id)}>{d.name || "—"}</MenuItem>
                    ))}
                  </TextField>
                );
              })()}
            </Stack>
          )}
        </Box>

        <Box sx={{ p: 3, borderTop: "1px solid #f0e5e1", flexShrink: 0 }}>
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={() => setEditDrawerOpen(false)} sx={{ borderRadius: "12px", fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={saving || editLoading}
              onClick={handleEditSave}
              sx={{ borderRadius: "12px", fontWeight: 700, backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#e5604a" } }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};
