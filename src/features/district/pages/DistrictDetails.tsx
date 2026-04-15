import EnhancedTable from "../../../components/ui/Table";
import {
  Box,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function DistrictDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Ensure id fallback (avoid undefined issue)
  const rows = [
    {
      id: id || "1",
      districtName: "Bangalore",
      districtHead: "KRSA001",
      districtHeadName: "Sangram Bal",
      email: "sangram@gmail.com",
      clubsCount: 12,
    },
  ];

  // ✅ View
  const handleView = (row: any) => {
    navigate(`/district/view/${row.id}`);
  };

  // ✅ Edit
  const handleEdit = (row: any) => {
    navigate(`/district/edit/${row.id}`);
  };

  // ✅ Delete
  const handleDelete = (ids: (string | number)[]) => {
    console.log("Delete:", ids);
  };

  // ✅ Create
  const handleCreate = () => {
    navigate("/district/add");
  };

  const columns = [
    { id: "districtName", label: "District Name" },
    { id: "districtHead", label: "Head ID" },
    { id: "districtHeadName", label: "Head Name" },
    { id: "email", label: "Email" },
    { id: "clubsCount", label: "No. of Clubs" },
    {
      id: "actions",
      label: "Actions",
      align: "center" as const,
    },
  ];

  return (
    <Box p={3}>

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold">
          District Details
        </Typography>

        <Button
          variant="contained"
          onClick={handleCreate}
        >
          Create District
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <EnhancedTable
          columns={columns}
          rows={rows}
          title="District Information"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getRowId={(row) => row.id}
          enableSelection={false}
          rowsPerPageOptions={[5, 10]}
        />
      </Paper>

    </Box>
  );
}

export default DistrictDetails;