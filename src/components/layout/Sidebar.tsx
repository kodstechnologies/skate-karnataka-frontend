import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ArticleIcon from "@mui/icons-material/Article";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BusinessIcon from "@mui/icons-material/Business";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Skaters", icon: <GroupsIcon />, path: "/skaters" },
  { text: "Events", icon: <EventIcon />, path: "/events" },
  { text: "Results", icon: <EmojiEventsIcon />, path: "/results" },
  { text: "Certifications", icon: <WorkspacePremiumIcon />, path: "/certifications" },
  { text: "Media Gallery", icon: <PhotoLibraryIcon />, path: "/media" },
  { text: "Circulars", icon: <ArticleIcon />, path: "/circulars" },
  { text: "Payment", icon: <PaymentsIcon />, path: "/payments" },
  { text: "District", icon: <LocationCityIcon />, path: "/district" },
  { text: "Clubs", icon: <BusinessIcon />, path: "/clubs" },
];

const Sidebar = ({ open }: { open: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 70,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : 70,
          boxSizing: "border-box",
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-text)",
          overflowX: "hidden",
          transition: "width 0.3s ease",
          borderRight: "none", // ✅ important
        },
      }}
    >
      <Toolbar />

      <Box sx={{ mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.text} disablePadding>
                <Tooltip title={!open ? item.text : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      px: 2,
                      mx: 1,
                      my: 0.5,
                      borderRadius: "10px",
                      justifyContent: open ? "initial" : "center",
                      transition: "all 0.2s ease",

                      // ✅ ACTIVE STYLE
                      backgroundColor: isActive
                        ? "var(--sidebar-active-bg)"
                        : "transparent",
                      color: isActive
                        ? "var(--sidebar-active-text)"
                        : "var(--sidebar-text)",

                      // ✅ LEFT BORDER (like ChartMogul)
                      borderLeft: isActive
                        ? "3px solid var(--primary)"
                        : "3px solid transparent",

                      "&:hover": {
                        backgroundColor: isActive
                          ? "var(--sidebar-active-bg)"
                          : "var(--sidebar-hover-bg)",
                        color: "var(--sidebar-hover-text)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.2s",
                        "& .MuiTypography-root": {
                          fontSize: "14px",
                          fontWeight: isActive ? 600 : 500,
                        },
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;