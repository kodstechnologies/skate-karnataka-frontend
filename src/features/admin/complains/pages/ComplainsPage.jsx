import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Chip,
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
  Typography,
} from "@mui/material";
import { AlertTriangle, ChevronRight, Eye, Search } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import circularHero from "@/assets/Circular_header.jpg";
import { useComplainsStore } from "@/features/admin/complains/store/complains-store";
import {
  formatComplainDate,
  formatReportTypeLabel,
  formatStatusLabel,
  getComplainSubjectLabel,
  getStatusChipSx,
} from "@/features/admin/complains/utils/complain-display";

const truncateMessage = (message, max = 80) => {
  const text = String(message || "").trim();
  if (!text) return "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
};

export const ComplainsPage = () => {
  const navigate = useNavigate();
  const { complains, pagination, isLoading, fetchComplains } = useComplainsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchComplains({ page: page + 1, limit: rowsPerPage });
  }, [fetchComplains, page, rowsPerPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return complains;
    return complains.filter((item) =>
      [
        item.skaterName,
        item.krsaId,
        item.clubName,
        item.districtName,
        item.reportType,
        item.message,
        item.complainedBy,
        item.stateStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [complains, searchTerm]);

  const totalCount = pagination?.total ?? filtered.length;

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
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${circularHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, color: "white" }}>
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>Complains</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            Complains
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)" }}>
            Review skater complaints escalated to state. Open a row to update status and reply.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ p: 3, alignItems: { lg: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AlertTriangle size={22} color="#f6765e" />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
              All complaints
            </Typography>
          </Stack>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, message, type..."
            size="small"
            sx={{ minWidth: { lg: 320 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ color: "#b19f99" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fff8f5" }}>
                {["Name", "Type", "Message", "State status", "Date", ""].map(
                  (head) => (
                    <TableCell
                      key={head}
                      sx={{ fontWeight: 700, color: "#7d6a64", borderBottom: "1px solid #f3e3dc" }}
                    >
                      {head}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`sk-${index}`}>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <TableCell key={cell}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}
              {!isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#a28f89" }}>
                    No complaints found.
                  </TableCell>
                </TableRow>
              ) : null}
              {!isLoading &&
                filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/complains/${row.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{getComplainSubjectLabel(row)}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {formatReportTypeLabel(row.reportType)}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 280,
                        color: "#5c4f4b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={row.message || ""}
                    >
                      {truncateMessage(row.message)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatusLabel(row.stateStatus)}
                        variant="outlined"
                        sx={getStatusChipSx(row.stateStatus)}
                      />
                    </TableCell>
                    <TableCell>{formatComplainDate(row.createdAt)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/complains/${row.id}`)}
                        sx={{ color: "#f6765e" }}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};
