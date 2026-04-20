import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <Stack spacing={2} className="min-h-screen items-center justify-center">
      <Typography variant="h4">404</Typography>
      <Typography color="text.secondary">Page not found.</Typography>
      <Button component={Link} to="/dashboard" variant="contained">
        Go to dashboard
      </Button>
    </Stack>
  );
};
