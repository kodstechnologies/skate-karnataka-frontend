import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import circularHero from "@/assets/Circular_header.jpg";
import { useComplainsStore } from "@/features/admin/complains/store/complains-store";
import {
  formatReportTypeLabel,
  formatStatusLabel,
  getComplainDetailFields,
  getStatusChipSx,
  normalizeStateReviewStatus,
  STATE_REVIEW_STATUS_OPTIONS,
} from "@/features/admin/complains/utils/complain-display";

const StateReviewForm = ({ item, isSaving, onSubmit, onCancel }) => {
  const [stateStatus, setStateStatus] = useState(() =>
    normalizeStateReviewStatus(item.stateStatus)
  );
  const [message, setMessage] = useState(() => item.stateMessage || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ stateStatus, message: message.trim() });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="state-status-label">State status</InputLabel>
          <Select
            labelId="state-status-label"
            label="State status"
            value={stateStatus}
            onChange={(e) => setStateStatus(e.target.value)}
          >
            {STATE_REVIEW_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="State message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          minRows={4}
          placeholder="The issue has been reviewed and resolved successfully by the state authority."
          fullWidth
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            sx={{
              backgroundColor: "#f6765e",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#ea6b54", boxShadow: "none" },
            }}
          >
            {isSaving ? "Saving..." : "Update complaint"}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 2.2,
      borderRadius: "22px",
      border: "1px solid #f3e3dc",
      background: "linear-gradient(180deg, #fffefd 0%, #fff8f5 100%)",
    }}
  >
    <Typography
      sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 0.9, fontSize: 15, fontWeight: 600, color: "#2f2829", lineHeight: 1.7 }}>
      {value || "—"}
    </Typography>
  </Box>
);

export const ComplainDetailsPage = () => {
  const navigate = useNavigate();
  const { complainId } = useParams();
  const { complains, isLoading, isSaving, fetchComplains, updateComplain } = useComplainsStore();

  useEffect(() => {
    if (!complainId) return;
    const found = useComplainsStore
      .getState()
      .complains.some((row) => String(row.id) === String(complainId));
    if (!found) {
      fetchComplains({ page: 1, limit: 100 });
    }
  }, [complainId, fetchComplains]);

  const item = complains.find((row) => String(row.id) === String(complainId)) ?? null;

  const handleSubmit = async ({ stateStatus, message }) => {
    if (!item?.id) return;
    const ok = await updateComplain(item.id, {
      stateStatus,
      message,
    });
    if (ok) {
      navigate("/complains");
    }
  };

  if (isLoading && !item) {
    return (
      <Box className="space-y-5">
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: "28px" }} />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: "28px" }} />
      </Box>
    );
  }

  if (!isLoading && !item) {
    return (
      <Paper elevation={0} sx={{ p: 6, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Complaint not found
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: "#f6765e", boxShadow: "none" }}
          onClick={() => navigate("/complains")}
        >
          Back to Complains
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          minHeight: { xs: 220, md: 240 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.5) 100%), url("${circularHero}")`,
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, color: "white" }}>
            <Typography component={RouterLink} to="/dashboard" sx={{ color: "inherit", textDecoration: "none" }}>
              Dashboard
            </Typography>
            <Typography component={RouterLink} to="/complains" sx={{ color: "inherit", textDecoration: "none" }}>
              Complains
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Details</Typography>
          </Breadcrumbs>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
            Complaint details
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={`State: ${formatStatusLabel(item.stateStatus)}`}
              variant="outlined"
              sx={{ ...getStatusChipSx(item.stateStatus), bgcolor: "rgba(255,255,255,0.12)" }}
            />
            <Chip
              size="small"
              label={`Skater: ${formatStatusLabel(item.status)}`}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "28px", border: "1px solid #f3e3dc" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Report information
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {getComplainDetailFields(item).map((field) => (
            <DetailItem key={field.key} label={field.label} value={field.value} />
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <DetailItem label="Complaint message" value={item.message} />
        </Box>

        {(item.clubMessage || item.districtMessage) && (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {item.clubMessage ? <DetailItem label="Club message" value={item.clubMessage} /> : null}
            {item.districtMessage ? (
              <DetailItem label="District message" value={item.districtMessage} />
            ) : null}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          State review
        </Typography>

        <StateReviewForm
          key={item.id}
          item={item}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/complains")}
        />
      </Paper>
    </Box>
  );
};
