import EnhancedTable from "../../../components/ui/Table";
import {
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EventDetails() {
  const navigate = useNavigate();

  // ✅ Event Data (no image)
  const rows = [
    {
      id: "1",
      header: "Tech Innovation Summit",
      date: "2026-06-15",
      text: "Tech event",
      address: "Bangalore",
      eventType: "State",
      eventFor: "Developers",
      status: "coming_soon",
    },
    {
      id: "2",
      header: "React Meetup",
      date: "2026-05-10",
      text: "React dev meetup",
      address: "Koramangala",
      eventType: "Club",
      eventFor: "Frontend Devs",
      status: "active",
    },
  ];

  // ✅ Columns (image removed)
  const columns = [
    { id: "header", label: "Title" },
    { id: "date", label: "Date" },
    { id: "address", label: "Address" },
    { id: "eventType", label: "Type" },
    { id: "eventFor", label: "For" },
    {
      id: "status",
      label: "Status",
      render: (_value: any, row: any) => (
        <Chip
          label={row.status}
          color={
            row.status === "active"
              ? "success"
              : row.status === "coming_soon"
              ? "warning"
              : row.status === "cancelled"
              ? "error"
              : "default"
          }
          size="small"
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      align: "center" as const,
    },
  ];

  // ✅ Navigation
  const handleView = (row: any) => {
    navigate(`/events/view/${row.id}`);
  };

  const handleEdit = (row: any) => {
    navigate(`/events/edit/${row.id}`);
  };

  const handleCreate = () => {
    navigate("/events/add");
  };

  const handleDelete = (ids: (string | number)[]) => {
    console.log("Delete:", ids);
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  // ✅ Actions
  const renderActions = (row: any) => (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Tooltip title="View">
        <IconButton size="small" onClick={() => handleView(row)} color="info">
          <Eye size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
          <Pencil size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => handleDelete([row.id])}
          color="error"
        >
          <Trash2 size={18} />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box p={2}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Event Details</Typography>

        <Button variant="contained" onClick={handleCreate}>
          Create Event
        </Button>
      </Box>

      {/* Table */}
      <EnhancedTable
        columns={columns}
        rows={rows}
        title="Event Management"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilter={handleFilter}
        getRowId={(row) => row.id}
        enableSelection={true}
        rowsPerPageOptions={[5, 10, 25, 50]}
        customActions={renderActions}
      />
    </Box>
  );
}

export default EventDetails;