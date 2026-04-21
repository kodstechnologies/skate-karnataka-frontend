import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
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
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import circularHero from "@/assets/Circular_header.jpg";

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return String(value);
};

const getStatusChip = (status) => (
  <Chip
    size="small"
    label={status === "approved" ? "Approved" : "Pending"}
    sx={{
      backgroundColor: status === "approved" ? "#edf8ef" : "#fff1eb",
      color: status === "approved" ? "#2f8f4e" : "#f6765e",
      fontWeight: 700
    }}
  />
);

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 2.2,
      borderRadius: "22px",
      border: "1px solid #f3e3dc",
      background: "linear-gradient(180deg, #fffefd 0%, #fff8f5 100%)",
      boxShadow: "0 10px 28px rgba(60, 35, 28, 0.05)"
    }}
  >
    <Typography
      sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase", letterSpacing: "0.08em" }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 0.9, fontSize: 15, fontWeight: 600, color: "#2f2829", lineHeight: 1.7 }}>
      {formatValue(value)}
    </Typography>
  </Box>
);

const findSearchText = (item, listFields) =>
  listFields
    .map((field) => formatValue(item[field.key]))
    .join(" ")
    .toLowerCase();

export const RequestListPage = ({ config }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const requests = config.useRequests();

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return requests;
    }
    return requests.filter((item) =>
      findSearchText(item, config.listFields).includes(normalizedSearch)
    );
  }, [requests, searchTerm, config.listFields]);

  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, page, rowsPerPage]);

  const heroImage = config.heroImage ?? circularHero;

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
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${heroImage}")`,
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
        <Stack sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, color: "white" }}>
            <Typography
              component={RouterLink}
              to="/dashboard"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ color: "inherit" }}>Requests</Typography>
            <Typography sx={{ color: "white", fontWeight: 700 }}>{config.label}</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
            {config.label} Requests
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.86)" }}>
            Review pending requests and open complete details.
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
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.04em" }}>
            {config.label} Requests List
          </Typography>
          <TextField
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(0);
            }}
            placeholder={`Search ${config.label.toLowerCase()} requests...`}
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
        </Stack>
        <Divider />
        <TableContainer className="custom-scrollbar">
          <Table sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {config.listFields.map((field) => (
                  <TableCell
                    key={field.key}
                    sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}
                  >
                    {field.label}
                  </TableCell>
                ))}
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#7e716d", fontWeight: 700, fontSize: 13 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((item) => (
                  <TableRow key={item.id} hover>
                    {config.listFields.map((field) => (
                      <TableCell key={`${item.id}-${field.key}`}>
                        {formatValue(item[field.key])}
                      </TableCell>
                    ))}
                    <TableCell>{getStatusChip(item.status)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => navigate(`${config.basePath}/${item.id}`)}
                          sx={{ border: "1px solid #efe2dc", backgroundColor: "#fff8f4" }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={config.listFields.length + 2}
                    sx={{ py: 6, textAlign: "center", color: "#978a86" }}
                  >
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRequests.length}
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
    </Box>
  );
};

export const RequestDetailsPage = ({ config }) => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const requests = config.useRequests();
  const request = useMemo(
    () => requests.find((item) => item.id === requestId) ?? null,
    [requests, requestId]
  );

  const heroImage = config.heroImage ?? circularHero;

  if (!request) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2f2829" }}>
          Request not found
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate(config.basePath)}>
          Back to {config.label} requests
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
          minHeight: { xs: 220, md: 260 },
          borderRadius: "30px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.9) 0%, rgba(35,23,23,0.72) 38%, rgba(246,118,94,0.3) 100%), url("${heroImage}")`,
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
              "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%)",
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
                mb: 1.75,
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.6)" },
                "& .MuiBreadcrumbs-li": { color: "rgba(255,255,255,0.88)" }
              }}
            >
              <Typography
                component={RouterLink}
                to="/dashboard"
                sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to={config.basePath}
                sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: "white" } }}
              >
                {config.label} Requests
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "white" }}>Details</Typography>
            </Breadcrumbs>
            <Typography
              sx={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              Request Overview
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: "-0.05em" }}>
              {config.label} Request Details
            </Typography>
            <Typography
              sx={{ mt: 1.25, maxWidth: 620, color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}
            >
              Review all submitted information for this request.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.2} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
            {getStatusChip(request.status)}
            <Chip
              label={`${config.detailFields.length} fields`}
              sx={{ backgroundColor: "rgba(255,255,255,0.14)", color: "white", fontWeight: 700 }}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "30px",
          border: "1px solid #f2dfd7",
          background: "linear-gradient(180deg, #fffdfc 0%, #fff8f5 100%)",
          boxShadow: "0 26px 70px rgba(48, 30, 24, 0.08)"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ mb: 2.5, justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: "-0.04em", color: "#2f2829" }}
            >
              Submitted Information
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#8d7f7b" }}>
              Complete details submitted for this request.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" onClick={() => navigate(config.basePath)}>
              Back to list
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))" },
            gap: 2
          }}
        >
          {config.detailFields.map((field) => (
            <DetailItem key={field.key} label={field.label} value={request[field.key]} />
          ))}
          <DetailItem
            label="Documents"
            value={request.documents
              ?.map((item) => item.name || item.url)
              .filter(Boolean)
              .join(", ")}
          />
        </Box>
      </Paper>
    </Box>
  );
};
