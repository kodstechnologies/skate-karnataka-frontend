import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        px: 3,
        py: 1.5,

        backgroundColor: "var(--footer-bg)",     // ✅ light bg
        color: "var(--footer-text)",             // ✅ soft text
        borderTop: "1px solid var(--footer-border)",

        fontSize: "13px",
      }}
    >
      <Typography variant="body2">
        © 2026 KRSA Admin Panel
      </Typography>
    </Box>
  );
};

export default Footer;