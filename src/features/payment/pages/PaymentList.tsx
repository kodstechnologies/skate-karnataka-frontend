import EnhancedTable from "../../../components/ui/Table";
import {
  Box,
  Typography,
  Paper,
  Chip,
} from "@mui/material";

function PaymentList() {

  const rows = [
    {
      id: "1",
      name: "Sangram Bal",
      amount: 500,
      status: "Paid",
      date: "2026-06-10",
    },
    {
      id: "2",
      name: "Rahul Kumar",
      amount: 500,
      status: "Pending",
      date: "2026-06-11",
    },
  ];

  const columns = [
    { id: "name", label: "Skater Name" },
    { id: "amount", label: "Amount (₹)" },
    { id: "date", label: "Date" },
    {
      id: "status",
      label: "Status",
      renderCell: (row: any) => (
        <Chip
          label={row.status}
          color={row.status === "Paid" ? "success" : "warning"}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Payment List
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <EnhancedTable
          columns={columns}
          rows={rows}
          title="Payment Records"
          getRowId={(row) => row.id}
          enableSelection={false}
          rowsPerPageOptions={[5, 10]}
        />
      </Paper>
    </Box>
  );
}

export default PaymentList;