import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { ChevronRight, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { clubApi } from "@/api/club-api";
import { useDistrictsStore } from "@/features/admin/districts/store/districts-store";
import {
  buildClubFormData,
  downloadClubImportTemplate,
  parseClubSpreadsheet
} from "@/utils/parseClubSpreadsheet";

const ACCEPT =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

export const DistrictClubBulkImportPage = () => {
  const navigate = useNavigate();
  const { districtId } = useParams();
  const districts = useDistrictsStore((s) => s.districts);
  const fetchDistricts = useDistrictsStore((s) => s.fetchDistricts);

  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    if (districts.length === 0) {
      fetchDistricts({ limit: 100 });
    }
  }, [districts.length, fetchDistricts]);

  const district = useMemo(
    () => districts.find((item) => String(item.id) === String(districtId)) ?? null,
    [districts, districtId]
  );

  const returnTo = "/districts";
  const validRows = useMemo(() => rows.filter((r) => r.errors.length === 0), [rows]);
  const invalidCount = rows.length - validRows.length;

  const handleSpreadsheetFile = async (file) => {
    if (!file) return;

    try {
      const parsed = await parseClubSpreadsheet(file);
      if (parsed.length === 0) {
        toast.error("No club rows found in the file");
        return;
      }
      setRows(parsed.map((row, index) => ({ ...row, _rowKey: index })));
      toast.success(`Loaded ${parsed.length} row(s) from file`);
    } catch {
      toast.error("Could not read Excel file. Use .xlsx, .xls, or .csv");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    await handleSpreadsheetFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);
    const file = event.dataTransfer?.files?.[0];
    await handleSpreadsheetFile(file);
  };

  const handleImport = async () => {
    if (!districtId) {
      toast.error("District not found");
      return;
    }
    if (validRows.length === 0) {
      toast.error("Fix validation errors before importing");
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: validRows.length });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i += 1) {
      const row = validRows[i];
      try {
        await clubApi.create(buildClubFormData(row, districtId));
        success += 1;
      } catch (err) {
        failed += 1;
        const message = err?.response?.data?.message || "Failed to create club";
        setRows((prev) =>
          prev.map((item) =>
            item._rowKey === row._rowKey ? { ...item, errors: [...item.errors, message] } : item
          )
        );
      }
      setImportProgress({ done: i + 1, total: validRows.length });
    }

    setImporting(false);

    if (success > 0) {
      toast.success(`Imported ${success} club(s) successfully`);
    }
    if (failed > 0) {
      toast.error(`${failed} row(s) failed — check the table for errors`);
    }
    if (success > 0 && failed === 0) {
      navigate(returnTo);
    }
  };

  if (!districtId) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "28px", textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          District not found
        </Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(returnTo)}>
          Go back
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
          borderRadius: "32px",
          border: "1px solid #f2dfd7",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,249,246,0.98) 100%)"
        }}
      >
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2 }}>
          <Typography
            component={RouterLink}
            to={returnTo}
            sx={{ color: "#8d7f7b", textDecoration: "none" }}
          >
            Districts
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>Bulk add clubs</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.04em", mb: 1 }}>
          Bulk add clubs
        </Typography>
        <Typography sx={{ color: "#8d7f7b", mb: 2.5, maxWidth: 720, lineHeight: 1.7 }}>
          Upload an Excel or CSV file to add clubs for{" "}
          <strong>{district?.districtName || "this district"}</strong>. Each row should include club
          name, address, and about. All clubs will be linked to this district automatically.
        </Typography>

        <Stack sx={{ flexWrap: "wrap" }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            component="label"
            variant="contained"
            startIcon={<Upload size={16} />}
            disabled={importing}
            sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
          >
            Upload Excel / CSV
            <input type="file" hidden accept={ACCEPT} onChange={handleFileChange} />
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={() => downloadClubImportTemplate("district-clubs-template.xlsx")}
          >
            Download template
          </Button>
          <Button variant="text" onClick={() => navigate("/clubs/create")}>
            Add single club instead
          </Button>
        </Stack>

        <Box
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            mt: 2,
            borderRadius: "20px",
            p: { xs: 2, md: 2.5 },
            border: isDraggingFile ? "2px dashed #f6765e" : "2px dashed rgba(246,118,94,0.35)",
            backgroundColor: isDraggingFile ? "rgba(246,118,94,0.12)" : "rgba(246,118,94,0.03)",
            textAlign: "center",
            transition: "all 0.2s ease"
          }}
        >
          <FileSpreadsheet size={24} style={{ margin: "0 auto 8px", opacity: 0.7 }} />
          <Typography sx={{ fontWeight: 700, color: "#2f2829" }}>
            {isDraggingFile ? "Drop Excel / CSV file here" : "Drag and drop Excel / CSV here"}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 13 }}>
            Supported: .xlsx, .xls, .csv
          </Typography>
        </Box>

        {rows.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            <Chip label={`${rows.length} rows`} size="small" />
            <Chip
              label={`${validRows.length} ready`}
              color="success"
              size="small"
              variant="outlined"
            />
            {invalidCount > 0 ? (
              <Chip
                label={`${invalidCount} with errors`}
                color="error"
                size="small"
                variant="outlined"
              />
            ) : null}
          </Stack>
        )}

        {importing && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, color: "#6f625e" }}>
              Importing {importProgress.done} / {importProgress.total}…
            </Typography>
            <LinearProgress
              variant="determinate"
              value={importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}
            />
          </Box>
        )}
      </Paper>

      {rows.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            border: "1px solid #f2dfd7",
            overflow: "hidden"
          }}
        >
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>About</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  const hasError = row.errors.length > 0;
                  return (
                    <TableRow
                      key={row._rowKey ?? index}
                      sx={{ bgcolor: hasError ? "rgba(239,68,68,0.06)" : "inherit" }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.name || "—"}</TableCell>
                      <TableCell>{row.officeAddress || "—"}</TableCell>
                      <TableCell>{row.about || "—"}</TableCell>
                      <TableCell>
                        {hasError ? (
                          <Typography variant="caption" color="error">
                            {row.errors.join("; ")}
                          </Typography>
                        ) : (
                          <Chip label="Ready" size="small" color="success" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ p: 2.5, borderTop: "1px solid #f2dfd7", justifyContent: "flex-end" }}
          >
            <Button variant="outlined" disabled={importing} onClick={() => setRows([])}>
              Clear
            </Button>
            <Button
              variant="contained"
              startIcon={<FileSpreadsheet size={16} />}
              disabled={importing || validRows.length === 0}
              onClick={handleImport}
              sx={{ backgroundColor: "#f6765e", "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Import {validRows.length} club(s)
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: "28px",
            border: "1px dashed #e8d5ce",
            color: "#8d7f7b"
          }}
        >
          <FileSpreadsheet size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <Typography>Upload a spreadsheet to preview clubs here.</Typography>
        </Paper>
      )}
    </Box>
  );
};
