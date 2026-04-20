import { Button, Stack } from "@mui/material";

export const AdminQuickActions = () => {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained">Create Admin Page</Button>
      <Button variant="outlined">Manage Users</Button>
    </Stack>
  );
};
