import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import EnhancedTable from "../../../components/ui/Table";

type ClubType = {
  id: number;
  clubName: string;
  districtName: string;
  skatersCount: number;
  officials: string[];
};

const ClubDetails: React.FC = () => {
  const navigate = useNavigate();

  const rows: ClubType[] = [
    {
      id: 1,
      clubName: "Speed Skaters Club",
      districtName: "Bangalore",
      skatersCount: 25,
      officials: ["Ravi", "Suresh"],
    },
    {
      id: 2,
      clubName: "Roller Stars",
      districtName: "Mysore",
      skatersCount: 18,
      officials: ["Anita", "Kiran", "Meena"],
    },
  ];

  const columns = [
    { id: "clubName", label: "Club Name" },
    { id: "districtName", label: "District" },
    { id: "skatersCount", label: "Skaters", numeric: true },
    {
      id: "officials",
      label: "Officials Count",
      numeric: true,
      render: (value: string[]) => value?.length || 0,
    },
    { id: "actions", label: "Actions" },
  ];

  const handleView = (row: ClubType) => {
    navigate(`/clubs/view/${row.id}`);
  };

  const handleEdit = (row: ClubType) => {
    navigate(`/clubs/edit/${row.id}`);
  };

  const handleDelete = (ids: (string | number)[]) => {
    console.log("Delete IDs:", ids);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔥 Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <h2>Club List</h2>

        <Button
          variant="contained"
          onClick={() => navigate("/clubs/add")}
        >
          + Create Club
        </Button>
      </Box>

      {/* 🔥 Table */}
      <EnhancedTable
        rows={rows}
        columns={columns}
        title="" // remove default title
        enableSelection={true}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

export default ClubDetails;