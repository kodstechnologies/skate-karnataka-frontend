import EnhancedTable from "../../../components/ui/Table";
import {
  Typography,
  Box,
  Paper,
  Chip,
} from "@mui/material";

function ResultList() {

  // ✅ Dummy Data (replace with API later)
  const rows = [
    {
      id: "1",
      name: "Sangram Bal",
      krsaId: "KRSA001",
      rank: 1,
    },
    {
      id: "2",
      name: "Rahul Kumar",
      krsaId: "KRSA002",
      rank: 2,
    },
    {
      id: "3",
      name: "Amit Sharma",
      krsaId: "KRSA003",
      rank: 3,
    },
  ];

  // ✅ Columns
  const columns = [
    { id: "name", label: "Skater Name" },
    { id: "krsaId", label: "KRSA ID" },
    {
      id: "rank",
      label: "Rank",
      renderCell: (row: any) => (
        <Chip
          label={`#${row.rank}`}
          color={
            row.rank === 1
              ? "success"
              : row.rank === 2
              ? "primary"
              : row.rank === 3
              ? "warning"
              : "default"
          }
          size="small"
        />
      ),
    },
  ];

  return (
    <Box p={3}>

      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Result List
      </Typography>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <EnhancedTable
          columns={columns}
          rows={rows}
          title="Skater Results"
          getRowId={(row) => row.id}
          enableSelection={false}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

    </Box>
  );
}

export default ResultList;