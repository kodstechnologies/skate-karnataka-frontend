import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
  Skeleton
} from "@mui/material";
import { ChevronRight, PencilLine, Plus, RefreshCw, Search, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { donationApi } from "@/api/donation-api";
import donationHero from "@/assets/donation_banner.png";
import toast from "react-hot-toast";
import { useDebounce } from "../../../../hooks/useDebounce";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
};

/* ─────────────────────────────────────────────
   DonationPage
───────────────────────────────────────────── */
export default function DonationPage() {
  const navigate = useNavigate();

  /* ── Data state ── */
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  /* ── Server-side pagination state ── */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  /* ── Search state ── */
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Delete state ── */
  const [pendingDeleteDonation, setPendingDeleteDonation] = useState(null);
  const [deleting, setDeleting] = useState(false);

  let search = useDebounce(searchTerm, 400);

  useEffect(() => {
    let isMounted = true;

    const fetchDonations = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await donationApi.getAll(search, page + 1, rowsPerPage);

        const payloadData = res?.data?.data || res?.data || res || [];
        const paginationData = res?.pagination || res?.data?.pagination || null;

        if (!isMounted) return;

        setDonations(Array.isArray(payloadData) ? payloadData : []);
        setTotalCount(paginationData?.total ?? 0);
      } catch (error) {
        if (!isMounted) return;
        setFetchError(extractErrorMessage(error));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDonations();

    return () => {
      isMounted = false; // prevents state update after unmount
    };
  }, [search, page, rowsPerPage]);

  const handleDelete = async () => {
    if (!pendingDeleteDonation) return;
    setDeleting(true);
    try {
      const id = pendingDeleteDonation._id ?? pendingDeleteDonation.id;
      await donationApi.delete(id);
      toast.success("Donation deleted successfully");

      setDonations((prev) => prev.filter((item) => (item._id ?? item.id) !== id));
      setPendingDeleteDonation(null);
      // Adjust total count simply, or re-fetch if you prefer perfect sync
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setPendingDeleteDonation(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="space-y-5">
      {/* ── Hero Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: { xs: 220, md: 260 },
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
          background: `linear-gradient(120deg, rgba(12,20,38,0.82) 0%, rgba(20,38,70,0.62) 34%, rgba(56,100,220,0.20) 100%), url("${donationHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          boxShadow: "0 28px 90px rgba(12, 20, 52, 0.22)"
        }}
      >
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Donations</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Donation Management
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Track, manage, and create new donation records from supporters of Skate Karnataka.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
              <Chip
                label={`${totalCount} Total`}
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Management Panel ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "32px",
          border: "1px solid rgba(221, 228, 246, 0.95)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,255,0.98) 100%)",
          boxShadow: "0 26px 80px rgba(24, 30, 58, 0.07)"
        }}
      >
        {/* Header row */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              Donations
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#7f8dab" }}>
              Manage donation records — search, create, edit, and delete.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or donor name..."
              sx={{ minWidth: { xs: "100%", sm: 300 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={16} style={{ color: "#a0aec0", marginRight: 8 }} />
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/support-hub/donation/create")}
            >
              Add Donation
            </Button>
          </Stack>
        </Stack>

        {/* Content area */}
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Loading state */}
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {[1, 2, 3].map((index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #dde3f5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",
                    boxShadow: "0 20px 50px rgba(24, 36, 80, 0.08)"
                  }}
                >
                  <Skeleton variant="rectangular" height={180} animation="wave" />
                  <Stack spacing={1.25} sx={{ p: 2.25 }}>
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={28}
                      animation="wave"
                      sx={{ mb: 0.5 }}
                    />
                    <Box sx={{ minHeight: 52 }}>
                      <Skeleton variant="text" width="100%" animation="wave" />
                      <Skeleton variant="text" width="70%" animation="wave" />
                    </Box>
                    <Skeleton variant="text" width="40%" height={20} animation="wave" />
                    <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                      <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
                      <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : fetchError ? (
            /* Fetch error state */
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: "22px",
                textAlign: "center",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7"
              }}
            >
              <Typography sx={{ color: "#c53030", fontWeight: 700, mb: 1 }}>
                Failed to load donations
              </Typography>
              <Typography sx={{ color: "#9b2c2c", mb: 3, fontSize: 14 }}>{fetchError}</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={15} />}
                onClick={
                  () => setPage(0) // Reset to first page on retry
                }
                sx={{ borderColor: "#c53030", color: "#c53030" }}
              >
                Retry
              </Button>
            </Paper>
          ) : donations.length > 0 ? (
            /* Card grid */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))"
                },
                gap: 2
              }}
            >
              {donations.map((item) => {
                const itemId = item._id ?? item.id;
                return (
                  <Paper
                    key={itemId}
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: "1px solid #dde3f5",
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",
                      boxShadow: "0 20px 50px rgba(24, 36, 80, 0.08)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 28px 65px rgba(24, 36, 80, 0.12)"
                      }
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        height: 180,
                        position: "relative",
                        background: item.img
                          ? `linear-gradient(180deg, rgba(12,18,40,0.12) 0%, rgba(12,18,40,0.52) 100%), url("${item.img}")`
                          : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {!item.img && (
                        <VolunteerActivismOutlinedIcon
                          sx={{ fontSize: 48, color: "#6366f1", opacity: 0.5 }}
                        />
                      )}

                      {/* Price / Amount Tag Overlay */}
                      {item.amount && (
                        <Chip
                          label={`₹${item.amount}`}
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            color: "#1e2a5a",
                            fontWeight: 800
                          }}
                        />
                      )}
                    </Box>

                    <Stack spacing={1.25} sx={{ p: 2.25 }}>
                      <Typography
                        sx={{ fontSize: 17, fontWeight: 800, color: "#1e2a5a", lineHeight: 1.3 }}
                      >
                        {item.title || "Untitled"}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#64748b",
                          lineHeight: 1.7,
                          minHeight: 52,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {item.about || "No description provided."}
                      </Typography>

                      <Typography sx={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                        Donor: {item.donorName || "Anonymous"}
                        {item.brandName && ` • ${item.brandName}`}
                      </Typography>

                      {/* Created at */}
                      <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                        Created: {formatDate(item.createdAt)}
                      </Typography>

                      {/* Action buttons */}
                      <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                        <Button
                          variant="outlined"
                          startIcon={<PencilLine size={15} />}
                          onClick={() =>
                            navigate(`/support-hub/donation/${itemId}/edit`, {
                              state: { donation: item }
                            })
                          }
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Trash2 size={15} />}
                          onClick={() => setPendingDeleteDonation(item)}
                          fullWidth
                          sx={{
                            backgroundColor: "#f6765e",
                            "&:hover": { backgroundColor: "#ea6b54" }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            /* Empty state */
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: "22px", textAlign: "center", color: "#8d9ab5" }}
            >
              {searchTerm
                ? "No donations found matching your search."
                : "No donation records yet. Click 'Add Donation' to create the first one."}
            </Paper>
          )}
        </Box>

        {/* Pagination */}
        {!loading && !fetchError && totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 9, 12, 15]}
            labelRowsPerPage="Rows:"
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
          />
        )}
      </Paper>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteDonation)}
        title="Delete Donation"
        itemLabel={pendingDeleteDonation?.title}
        description="This donation record will be permanently removed. This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onClose={() => setPendingDeleteDonation(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
