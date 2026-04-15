import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import img from "../../../assets/img.jpg";
import MediaCard from "../components/MediaCard";

function MediaDetails() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const mediaList = [
    {
      id: 1,
      image: img, // ✅ local image
      name: "State Championship",
      type: "State",
      date: "2026-06-15",
      location: "Karnataka",
    },
    {
      id: 2,
      image: img,
      name: "District Event",
      type: "District",
      date: "2026-05-10",
      location: "Bangalore",
    },
    {
      id: 3,
      image: img,
      name: "Club Tournament",
      type: "Club",
      date: "2026-04-20",
      location: "ABC Club",
    },
  ];

  const filteredData =
    filter === "All"
      ? mediaList
      : mediaList.filter((item) => item.type === filter);

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
          Media Gallery
        </Typography>

        <Box display="flex" gap={2}>
          <TextField
            select
            size="small"
            label="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="State">State</MenuItem>
            <MenuItem value="District">District</MenuItem>
            <MenuItem value="Club">Club</MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={() => navigate("/media/add")}
          >
            Add Media
          </Button>
        </Box>
      </Box>

      {/* Cards */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {filteredData.map((item) => (
          <Box
            key={item.id}
            sx={{
              width: {
                xs: "100%",
                sm: "48%",
                md: "31%",
              },
            }}
          >
            {/* ✅ Passing image properly */}
            <MediaCard
              id={item.id}
              image={item.image}
              name={item.name}
              type={item.type}
              date={item.date}
              location={item.location}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default MediaDetails;