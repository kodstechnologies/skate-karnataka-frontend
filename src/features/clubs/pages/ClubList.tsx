import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";

type ClubType = {
  clubName: string;
  districtName: string;
  clubHeadName: string;
  email: string;
  phoneNo: string;
  skatersCount: number;
  officials: string[];
};

const ClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [club, setClub] = useState<ClubType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        // 🔥 Replace with API
        const response: ClubType = {
          clubName: "Speed Skaters Club",
          districtName: "Bangalore",
          clubHeadName: "Ravi Kumar",
          email: "ravi@gmail.com",
          phoneNo: "9876543210",
          skatersCount: 25,
          officials: ["Suresh", "Anita", "Rahul"],
        };

        setClub(response);
      } catch (error) {
        console.error("Error fetching club:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!club) return <div style={{ padding: 20 }}>No Data Found</div>;

  return (
    <Box sx={{ padding: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ width: "100%", maxWidth: 800, padding: 2 }}>
        <Typography variant="h5" mb={2}>
          Club Details
        </Typography>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={cellStyle}>Club Name</td>
              <td style={cellStyle}>{club.clubName}</td>
            </tr>

            <tr>
              <td style={cellStyle}>District</td>
              <td style={cellStyle}>{club.districtName}</td>
            </tr>

            <tr>
              <td style={cellStyle}>Club Head</td>
              <td style={cellStyle}>{club.clubHeadName}</td>
            </tr>

            <tr>
              <td style={cellStyle}>Email</td>
              <td style={cellStyle}>{club.email}</td>
            </tr>

            <tr>
              <td style={cellStyle}>Phone</td>
              <td style={cellStyle}>{club.phoneNo}</td>
            </tr>

            <tr>
              <td style={cellStyle}>No. of Skaters</td>
              <td style={cellStyle}>{club.skatersCount}</td>
            </tr>

            <tr>
              <td style={cellStyle}>Officials</td>
              <td style={cellStyle}>
                {club.officials.join(", ")}
              </td>
            </tr>
          </tbody>
        </table>
      </Paper>
    </Box>
  );
};

// ✅ Style
const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
};

export default ClubDetails;