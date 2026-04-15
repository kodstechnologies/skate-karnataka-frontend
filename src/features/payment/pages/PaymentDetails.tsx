import EnhancedTable from "../../../components/ui/Table";
import {
  Box,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function PaymentDetails() {
  const navigate = useNavigate();

  // ✅ Data (added date)
  const rows = [
    {
      id: "1",
      eventName: "State Championship",
      type: "State",
      name: "Sangram",
      stateName: "Karnataka",
      date: "2026-06-15",
    },
    {
      id: "2",
      eventName: "District Tournament",
      type: "District",
      name: "Rahul",
      districtName: "Bangalore",
      date: "2026-05-10",
    },
    {
      id: "3",
      eventName: "Club Match",
      type: "Club",
      name: "Amit",
      clubName: "ABC Club",
      date: "2026-04-20",
    },
  ];

  // ✅ View
  const handleView = (row: any) => {
    navigate(`/payment/view/${row.id}`);
  };

  // ✅ Columns
  const columns = [
    { id: "eventName", label: "Event Name" },

    {
      id: "type",
      label: "Type",
      renderCell: (row: any) => (
        <Chip
          label={row.type}
          color={
            row.type === "State"
              ? "primary"
              : row.type === "District"
              ? "warning"
              : "success"
          }
          size="small"
        />
      ),
    },

    { id: "name", label: "Name" },

    // ✅ NEW: Date Column
    {
      id: "date",
      label: "Date",
      renderCell: (row: any) => {
        const d = new Date(row.date);
        return d.toLocaleDateString("en-IN"); // format: DD/MM/YYYY
      },
    },

    {
      id: "actions",
      label: "View",
      align: "center" as const,
    },
  ];

  return (
    <Box p={3}>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Payment Details
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <EnhancedTable
          columns={columns}
          rows={rows}
          title="Payment Records"
          getRowId={(row) => row.id}
          enableSelection={false}
          rowsPerPageOptions={[5, 10, 25]}
          onView={handleView}
        />
      </Paper>

    </Box>
  );
}

export default PaymentDetails;