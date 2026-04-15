import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: any) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* Navbar */}
      <Navbar
        open={open}
        handleDrawerOpen={() => setOpen(!open)}
      />

      {/* Sidebar */}
      <Sidebar open={open} />

      {/* RIGHT SIDE (Content + Footer) */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column", // 🔥 IMPORTANT
          minHeight: "100vh",
          background: "var(--background)",
        }}
      >
        <Toolbar />

        {/* Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;