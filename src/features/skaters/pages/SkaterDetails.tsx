import EnhancedTable from '../../../components/ui/Table';
import { rows } from '../../../../data';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function SkaterDetails() {

  const navigate = useNavigate();

  const columns = [
    { id: "name", label: "Name" },
    { id: "krsaid", label: "KRSA ID" },
    { id: "rsfiid", label: "RSFI ID" },
    { id: "dob", label: "DOB" },
    { id: "gender", label: "Gender" },
    { id: "category", label: "Category" },
    { id: "discipline", label: "Discipline" },
    { id: "district", label: "District" },
    { id: "club", label: "Club" },
    {
      id: "actions",
      label: "Actions",
      align: "center" as const
    },
  ];

  const handleView = (row: any) => {
    navigate(`/skaters/view/${row.id}`);
  };

  const handleEdit = (row: any) => {
    navigate(`/skaters/edit/${row.id}`);
  };

  const handelCreate = () => {
    navigate("/skaters/add");
  };

  const handleDelete = (selectedIds: (string | number)[]) => {
    console.log("Delete:", selectedIds);
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  // ✅ Correct Actions UI
  // const renderActions = (row: any) => (
  //   <Stack direction="row" spacing={1} justifyContent="center">

  //     {/* View */}
  //     <Tooltip title="View Details">
  //       <IconButton size="small" onClick={() => handleView(row)} color="info">
  //         <Eye size={18} />
  //       </IconButton>
  //     </Tooltip>

  //     {/* Edit */}
  //     <Tooltip title="Edit">
  //       <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
  //         <Pencil size={18} />
  //       </IconButton>
  //     </Tooltip>

  //     {/* Delete */}
  //     <Tooltip title="Delete">
  //       <IconButton
  //         size="small"
  //         onClick={() => handleDelete([row.id || row.krsaid])}
  //         color="error"
  //       >
  //         <Trash2 size={18} />
  //       </IconButton>
  //     </Tooltip>

  //   </Stack>
  // );

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" sx={{ color: "var(--text)" }}>
          Skater Details
        </Typography>

        <Button variant="contained" color="primary" onClick={handelCreate}>
          Create
        </Button>
      </Box>

      <EnhancedTable
        columns={columns}
        rows={rows}
        title="Skater Management"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilter={handleFilter}
        getRowId={(row) => row.krsaid || row.id}
        enableSelection={true}
        rowsPerPageOptions={[5, 10, 25, 50]}
        // renderActions={renderActions}   // ✅ IMPORTANT (if your table supports it)
      />
    </div>
  );
}

export default SkaterDetails;