
import { Box, Typography, Paper } from "@mui/material";

function DistrictDetails() {
  // ✅ Single District Data (can come from API or params)
  const district = {
    id: 1,
    name: "Bangalore",
    image: "https://via.placeholder.com/600x300",
    headName: "Ravi Kumar",
    email: "ravi@gmail.com",
    contactNo: "9876543210",
    officials: ["Suresh", "Anita", "Rahul"],
  };

  return (
    <Box
      sx={{
        padding: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 700,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Image */}
        <img
          src={district.image}
          alt={district.name}
          style={{
            width: "100%",
            height: 250,
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />

        {/* Title */}
        <Typography variant="h5">{district.name}</Typography>

        {/* Details */}
        <Typography>
          <strong>District Head:</strong> {district.headName}
        </Typography>

        <Typography>
          <strong>Email:</strong> {district.email}
        </Typography>

        <Typography>
          <strong>Contact:</strong> {district.contactNo}
        </Typography>

        {/* Officials */}
        <Typography variant="h6">Officials</Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {district.officials.map((off, index) => (
            <Box
              key={index}
              sx={{
                background: "#e3f2fd",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              {off}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default DistrictDetails;