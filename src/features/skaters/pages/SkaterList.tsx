import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import TopBar from "../../../components/ui/TopBar";

function SkaterList() {

  // ✅ Dummy Data
  const skater = {
    name: "Sangram",
    rsfiId: "RSFI123",
    dob: "2000-01-01",
    gender: "Male",
    category: "Senior",
    discipline: "Speed",
    district: "Bangalore",
    club: "ABC Club",
  };

  // 👉 Reusable Row
  const Row = ({ label, value }: any) => (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      borderBottom="1px solid #eee"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      {typeof value === "string" ? (
        <Typography fontWeight="bold">{value}</Typography>
      ) : (
        value
      )}
    </Box>
  );

  return (
    <Box p={3}>
      <TopBar title="Skater Details" subtitle="View full skater info" />

      <Card sx={{ maxWidth: 600, mx: "auto", mt: 3, borderRadius: 3 }}>
        <CardContent>

          {/* Name */}
          <Typography variant="h5" fontWeight="bold" mb={2}>
            {skater.name}
          </Typography>

          {/* Flex Rows */}
          <Box display="flex" flexDirection="column">

            <Row label="RSFI ID" value={skater.rsfiId} />

            <Row label="Date of Birth" value={skater.dob} />

            <Row
              label="Gender"
              value={<Chip label={skater.gender} color="primary" size="small" />}
            />

            <Row
              label="Category"
              value={<Chip label={skater.category} color="secondary" size="small" />}
            />

            <Row label="Discipline" value={skater.discipline} />

            <Row label="District" value={skater.district} />

            <Row label="Club" value={skater.club} />

          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}

export default SkaterList;