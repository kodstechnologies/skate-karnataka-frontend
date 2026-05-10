import React from "react";
import { Box, Stack, CircularProgress, Typography, LinearProgress } from "@mui/material";

export const UploadProgressBanner = ({ isSubmitting, isEditing }) => {
  if (!isSubmitting) return null;

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: "18px",
        border: "1px solid rgba(246,118,94,0.3)",
        backgroundColor: "rgba(246,118,94,0.06)"
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.25 }}>
        <CircularProgress size={18} thickness={5} sx={{ color: "#f6765e", flexShrink: 0 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#c56b53" }}>
          {isEditing ? "Saving changes & uploading files…" : "Creating record & uploading files…"}
        </Typography>
      </Stack>
      <LinearProgress
        sx={{
          borderRadius: "8px",
          backgroundColor: "rgba(246,118,94,0.18)",
          "& .MuiLinearProgress-bar": { backgroundColor: "#f6765e", borderRadius: "8px" }
        }}
      />
      <Typography sx={{ mt: 1, fontSize: 11, color: "#a28f89" }}>
        Please wait — files are being uploaded to the server. Do not close this page.
      </Typography>
    </Box>
  );
};
