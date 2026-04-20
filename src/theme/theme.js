import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#f6765e",
      dark: "#ea6b54"
    },
    secondary: {
      main: "#53c7c5"
    },
    background: {
      default: "#f7f1ee",
      paper: "#ffffff"
    },
    divider: "#efe2dc",
    text: {
      primary: "#2f2829",
      secondary: "#8b7f7b"
    }
  },
  typography: {
    fontFamily: '"Inter", "sans-serif"',
    h1: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 },
    h2: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 },
    h3: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 },
    h4: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 },
    h5: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 },
    h6: { fontFamily: '"Inter", "sans-serif"', fontWeight: 600 }
  },
  shape: {
    borderRadius: 18
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 16,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 18px 40px rgba(246, 118, 94, 0.18)"
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundColor: "#fcf8f6",
          "& fieldset": {
            borderColor: "#eee0d9"
          },
          "&:hover fieldset": {
            borderColor: "#e1c9bf"
          },
          "&.Mui-focused fieldset": {
            borderColor: "#f6765e"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 16px 48px rgba(139, 111, 101, 0.08)"
        }
      }
    }
  }
});
