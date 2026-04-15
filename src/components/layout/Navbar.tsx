import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

const Navbar = ({ handleDrawerOpen, open }: any) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "var(--navbar-bg)",   // white
        color: "var(--navbar-text)",

        borderBottom: "1px solid var(--sidebar-border)",

        width: "95%",   // ✅ FULL WIDTH
        margin :"auto",
        left: 0,
        zIndex: 1201,    // above sidebar
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px",
          pl: open ? `${drawerWidth}px` : "70px", // ✅ push content
          pr: 2,
          transition: "all 0.3s ease",
        }}
      >
        {/* Menu Button */}
        <IconButton
          onClick={handleDrawerOpen}
          sx={{ color: "var(--navbar-text)" }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            ml: 1,
            letterSpacing: "0.5px",
          }}
        >
          KRSA
        </Typography>



        {/* Right Side */}
        <Box sx={{ flexGrow: 1 }} />

        <IconButton sx={{ color: "var(--navbar-text)" }}>
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;