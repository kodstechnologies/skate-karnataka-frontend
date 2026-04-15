import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import TopBar from "../../../components/ui/TopBar";

interface Event {
  header: string;
  image: string | File | null;
  date: string;
  text: string;
  address: string;
  eventType: string;
  eventFor: string;
  status: string;
}

function EventList() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch event by ID
  useEffect(() => {
    if (!id) return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;

  if (!event) return <div>No Event Found</div>;

  // ✅ Image handling
  let imageSrc = "";

  if (event.image instanceof File) {
    imageSrc = URL.createObjectURL(event.image);
  } else if (typeof event.image === "string" && event.image) {
    imageSrc = `http://localhost:5000/${event.image}`;
  } else {
    imageSrc = "https://via.placeholder.com/600x300";
  }

  return (
    <Box p={3}>
      <TopBar title="Event Details" subtitle="View full event info" />

      <Card sx={{ maxWidth: 800, mx: "auto", mt: 3, borderRadius: 3 }}>
        
        {/* Image */}
        <CardMedia
          component="img"
          height="300"
          image={imageSrc}
          alt="event"
        />

        {/* Content */}
        <CardContent>
          <Typography variant="h5" fontWeight="bold">
            {event.header}
          </Typography>

          <Typography variant="body2" mt={1}>
            📅 {event.date}
          </Typography>

          <Typography variant="body2" mt={1}>
            📍 {event.address}
          </Typography>

          <Typography variant="body1" mt={2}>
            {event.text}
          </Typography>

          {/* Chips */}
          <Box mt={2} display="flex" gap={1}>
            <Chip label={event.eventType} color="primary" />
            <Chip label={event.eventFor} color="info" />
            <Chip
              label={event.status}
              color={
                event.status === "active"
                  ? "success"
                  : event.status === "coming_soon"
                  ? "warning"
                  : event.status === "cancelled"
                  ? "error"
                  : "default"
              }
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EventList;