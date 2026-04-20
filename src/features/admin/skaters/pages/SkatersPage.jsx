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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ChevronRight, Search, ShieldCheck, Trophy } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import skatersHero from "@/assets/Skating_header.jpg";
import { useSkatersStore } from "@/features/admin/skaters/store/skaters-store";

const calculateAge = (dob) => {
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return "-";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
};

const formatGender = (gender) => {
  if (!gender) {
    return "-";
  }

  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const DetailItem = ({ label, value }) => (
  <div>
    <Typography sx={{ fontSize: 11, color: "#a28f89", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 14, color: "#2f2829" }}>{value || "-"}</Typography>
  </div>
);

export const SkatersPage = () => {
  const navigate = useNavigate();
  const skaters = useSkatersStore((state) => state.skaters);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredSkaters = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return skaters;
    }

    return skaters.filter((skater) =>
      [
        skater.krsaId,
        skater.fullName,
        skater.phone,
        skater.rsfiId,
        skater.gender,
        skater.category,
        skater.discipline,
        skater.district,
        skater.club
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [searchTerm, skaters]);

  const paginatedSkaters = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSkaters.slice(start, start + rowsPerPage);
  }, [filteredSkaters, page, rowsPerPage]);

  const handleChangePage = (_, nextPage) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
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
          background: `linear-gradient(90deg, rgba(20, 17, 20, 0.82) 0%, rgba(20, 17, 20, 0.56) 44%, rgba(20, 17, 20, 0.18) 100%), url("${skatersHero}")`,
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
              <Typography sx={{ color: "white", fontWeight: 700 }}>Skaters</Typography>
            </Breadcrumbs>

            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.05em", mb: 1.5 }}>
              Skater Resource Hub
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", maxWidth: 620, lineHeight: 1.7 }}>
              Manage KRSA skater registrations, update athlete details, and keep club and district
              records together in one clean workspace.
            </Typography>

            <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<Trophy size={16} />}
                label="Competition-ready roster"
                sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.14)" }}
              />
              <Chip
                icon={<ShieldCheck size={16} />}
                label="Live KRSA tracking"
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
              Skaters Registry
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#8d7f7b" }}>
              Search and review registered skaters from one organized registry.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by KRSA ID, name, discipline, district..."
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
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
          {paginatedSkaters.length > 0 ? (
            paginatedSkaters.map((skater) => (
              <Paper
                key={skater.id}
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
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#f6765e" }}>
                        {skater.krsaId}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 700, color: "#2f2829" }}>
                        {skater.fullName}
                      </Typography>
                    </div>
                    <Chip
                      label={skater.category || "-"}
                      size="small"
                      sx={{
                        backgroundColor: skater.category === "Junior" ? "#edf8ef" : "#fff1eb",
                        color: skater.category === "Junior" ? "#4da667" : "#f6765e",
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="Phone" value={skater.phone} />
                    <DetailItem label="Age" value={String(calculateAge(skater.dob))} />
                    <DetailItem label="Gender" value={formatGender(skater.gender)} />
                    <DetailItem label="Discipline" value={skater.discipline} />
                    <DetailItem label="District" value={skater.district} />
                    <DetailItem label="Club" value={skater.club} />
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/skaters/${skater.id}`)}
                      fullWidth
                    >
                      View details
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
              No skaters found for the current search.
            </Paper>
          )}
        </Stack>

        <TableContainer className="custom-scrollbar" sx={{ display: { xs: "none", md: "block" } }}>
          <Table sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fdf7f3" }}>
                {[
                  "KRSA ID",
                  "Full Name",
                  "Phone",
                  "DOB",
                  "Category",
                  "Discipline",
                  "District",
                  "Club",
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
              {paginatedSkaters.length > 0 ? (
                paginatedSkaters.map((skater) => (
                  <TableRow
                    key={skater.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f5e9e3",
                        verticalAlign: "top"
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "#f6765e", whiteSpace: "nowrap" }}>
                      {skater.krsaId}
                    </TableCell>
                    <TableCell>{skater.fullName}</TableCell>
                    <TableCell>{skater.phone}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(skater.dob)}</TableCell>
                    <TableCell>
                      <Chip
                        label={skater.category || "-"}
                        size="small"
                        sx={{
                          backgroundColor: skater.category === "Junior" ? "#edf8ef" : "#fff1eb",
                          color: skater.category === "Junior" ? "#4da667" : "#f6765e",
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>{skater.discipline}</TableCell>
                    <TableCell>{skater.district}</TableCell>
                    <TableCell>{skater.club}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => navigate(`/skaters/${skater.id}`)}
                          sx={{
                            border: "1px solid #efe2dc",
                            backgroundColor: "#fff8f4"
                          }}
                          aria-label={`View ${skater.fullName}`}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", color: "#978a86" }}>
                    No skaters found for the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredSkaters.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};
