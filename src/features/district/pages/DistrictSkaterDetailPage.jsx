import { useEffect, useState } from "react";
import {
  Avatar, Box, Breadcrumbs, Button, Chip, CircularProgress,
  Paper, Stack, Typography
} from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { ChevronRight } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { districtPortalApi } from "@/api/district-portal-api";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import toast from "react-hot-toast";

const fmt = (g) => g ? g.charAt(0).toUpperCase() + g.slice(1) : "—";

const DetailItem = ({ label, value }) => (
  <Box sx={{ p: 2, borderRadius: "20px", border: "1px solid #f4e5de", backgroundColor: "#fffaf8" }}>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.75, fontSize: 15, fontWeight: 600, color: "#2f2829", wordBreak: "break-word" }}>
      {value || "—"}
    </Typography>
  </Box>
);

const SummaryCard = ({ icon, label, value, accent }) => (
  <Paper elevation={0} sx={{ p: 2.25, borderRadius: "24px", border: "1px solid #f3ded7", background: "linear-gradient(180deg,#fff 0%,#fff7f3 100%)" }}>
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: "16px", display: "grid", placeItems: "center", color: accent, backgroundColor: `${accent}1A` }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9f8e89" }}>{label}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 700, color: "#2f2829", wordBreak: "break-word" }}>{value || "—"}</Typography>
      </Box>
    </Stack>
  </Paper>
);

export const DistrictSkaterDetailPage = () => {
  const navigate = useNavigate();
  const { skaterId } = useParams();
  const [skater, setSkater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockDialog, setBlockDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!skaterId) return;
    setLoading(true);
    districtPortalApi.getSkater(skaterId)
      .then((res) => setSkater(res?.data ?? res))
      .catch(() => toast.error("Failed to load skater"))
      .finally(() => setLoading(false));
  }, [skaterId]);

  const handleBlock = async () => {
    setActioning(true);
    try {
      const newBlocked = !skater.isBlocked;
      await districtPortalApi.blockSkater(skaterId, newBlocked);
      setSkater((s) => ({ ...s, isBlocked: newBlocked }));
      toast.success(newBlocked ? "Skater blocked" : "Skater unblocked");
      setBlockDialog(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async () => {
    setActioning(true);
    try {
      await districtPortalApi.deleteSkater(skaterId);
      toast.success("Skater deleted");
      navigate("/district/skaters");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setActioning(false);
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#f6765e" }} /></Box>;
  }

  if (!skater) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Skater not found</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/district/skaters")}>Back to skaters</Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      {/* Hero */}
      <Paper elevation={0} sx={{
        p: { xs: 3, md: 4.5 }, minHeight: { xs: 260, md: 300 }, borderRadius: "32px",
        overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.65)",
        background: `linear-gradient(120deg,rgba(18,14,16,0.92) 0%,rgba(38,25,26,0.76) 34%,rgba(246,118,94,0.28) 100%),url("${skatersHero}")`,
        backgroundPosition: "center", backgroundSize: "cover", color: "white"
      }}>
        <Stack sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}>
          <Box sx={{ maxWidth: 760 }}>
            <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" }, "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.86)", fontSize: 14 } }}>
              <Typography component={RouterLink} to="/district/dashboard" sx={{ color: "inherit", textDecoration: "none" }}>Dashboard</Typography>
              <Typography component={RouterLink} to="/district/skaters" sx={{ color: "inherit", textDecoration: "none" }}>Skaters</Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Details</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1 }}>{skater.name}</Typography>
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
              {skater.krsaId && <Chip label={skater.krsaId} sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }} />}
              <Chip label={fmt(skater.gender)} sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }} />
              <Chip label={skater.isBlocked ? "Blocked" : "Active"} sx={{ color: "white", backgroundColor: skater.isBlocked ? "rgba(198,40,40,0.85)" : "rgba(46,125,50,0.85)" }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Summary cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", xl: "repeat(4,1fr)" }, gap: 2 }}>
        <SummaryCard icon={<BadgeOutlinedIcon sx={{ fontSize: 24 }} />} label="KRSA ID" value={skater.krsaId} accent="#f6765e" />
        <SummaryCard icon={<PhoneOutlinedIcon sx={{ fontSize: 24 }} />} label="Phone" value={skater.phone} accent="#2aa876" />
        <SummaryCard icon={<LocationOnOutlinedIcon sx={{ fontSize: 24 }} />} label="District" value={skater.districtName} accent="#9c5cff" />
        <SummaryCard icon={<EmailOutlinedIcon sx={{ fontSize: 24 }} />} label="Email" value={skater.email} accent="#c86f3d" />
      </Box>

      {/* Detail card */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: "32px", border: "1px solid #f6e4dd", background: "linear-gradient(180deg,#fff 0%,#fff9f6 100%)" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { md: "center" } }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>Skater details</Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>Full registered profile information.</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate("/district/skaters")}>Back</Button>
            <Button variant="contained" startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate(`/district/skaters/${skaterId}/edit`)}
              sx={{ bgcolor: "#f6765e", "&:hover": { bgcolor: "#e85d3f" } }}>
              Edit
            </Button>
            <Button variant={skater.isBlocked ? "contained" : "outlined"} color={skater.isBlocked ? "success" : "error"}
              startIcon={skater.isBlocked ? <LockOpenOutlinedIcon sx={{ fontSize: 18 }} /> : <BlockOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setBlockDialog(true)}>
              {skater.isBlocked ? "Unblock" : "Block"}
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => setDeleteDialog(true)}>
              Delete
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, alignItems: { sm: "center" } }}>
          <Avatar src={skater.img} alt={skater.name} sx={{ width: 88, height: 88, border: "2px solid #f4e5de", fontSize: "2rem" }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#2f2829" }}>{skater.name}</Typography>
            <Typography sx={{ color: "#8d7f7b", mt: 0.5 }}>{skater.clubName ? `Club: ${skater.clubName}` : "No club assigned"}</Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2 }}>
          <DetailItem label="KRSA ID" value={skater.krsaId} />
          <DetailItem label="Phone" value={skater.phone} />
          <DetailItem label="Email" value={skater.email} />
          <DetailItem label="Gender" value={fmt(skater.gender)} />
          <DetailItem label="Club" value={skater.clubName} />
          <DetailItem label="District" value={skater.districtName} />
          <DetailItem label="Address" value={skater.address} />
          <DetailItem label="Status" value={skater.isBlocked ? "Blocked" : "Active"} />
        </Box>
      </Paper>

      <ConfirmDeleteModal open={blockDialog} title={skater.isBlocked ? "Unblock skater" : "Block skater"}
        description={skater.isBlocked ? "This skater will be able to log in again." : "This skater will be blocked from logging in."}
        itemLabel={skater.name} confirmLabel={skater.isBlocked ? "Unblock" : "Block"}
        onClose={() => setBlockDialog(false)} onConfirm={handleBlock} loading={actioning} />

      <ConfirmDeleteModal open={deleteDialog} title="Delete skater"
        description="This will permanently remove the skater account."
        itemLabel={skater.name} confirmLabel="Delete"
        onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} loading={actioning} />
    </Box>
  );
};
