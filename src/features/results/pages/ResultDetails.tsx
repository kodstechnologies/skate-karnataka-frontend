import EnhancedTable from "../../../components/ui/Table";
import {
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function ResultDetails() {
  const navigate = useNavigate();

  // ✅ Data (added name)
  const rows = [
    {
      id: "1",
      header: "Tech Innovation Summit",
      date: "2026-06-15",
      eventType: "State",
      name: "Sangram Bal",
    },
    {
      id: "2",
      header: "React Meetup",
      date: "2026-05-10",
      eventType: "Club",
      name: "Rahul Kumar",
    },
  ];

  // ✅ Columns (added name column)
  const columns = [
    { id: "header", label: "Event Name" },
    { id: "name", label: "Name" }, // ✅ NEW
    { id: "date", label: "Date" },
    { id: "eventType", label: "Type" },
    { id: "actions", label: "View", align: "center" as const },
  ];

  // ✅ View handler
  const handleView = (row: any) => {
    navigate(`/results/view/${row.id}`);
  };

  return (
    <Box p={3}>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Result Details
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <EnhancedTable
          columns={columns}
          rows={rows}
          title="Event Results"
          getRowId={(row) => row.id}
          enableSelection={false}
          rowsPerPageOptions={[5, 10, 25]}
          onView={handleView}
        />
      </Paper>
    </Box>
  );
}

export default ResultDetails;