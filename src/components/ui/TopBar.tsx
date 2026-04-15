import { Box, Typography } from "@mui/material";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <Box
      sx={{
        width: "100%",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        px: 3,
        py: 2,
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        {title}
      </Typography>

      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default TopBar;


{/* <TopBar 
  title="Edit Skater" 
  subtitle="Update skater details"
/> */}