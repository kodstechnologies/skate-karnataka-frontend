import {
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Stack,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from "@mui/material";
import { ChevronRight, History, User, Calendar, Activity } from "lucide-react";
import { useMemo } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import officialHero from "@/assets/State_official_header.jpg";
import { useOfficialsStore } from "../store/officials-store";

export const SubAdminLogsPage = () => {
  const navigate = useNavigate();
  const { officialId } = useParams();
  const officials = useOfficialsStore((state) => state.officials);

  const official = useMemo(
    () => officials.find((o) => o.id === officialId),
    [officials, officialId]
  );

  const sortedLogs = useMemo(() => {
    return [...(official?.logs || [])].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [official?.logs]);

  if (!official) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Official not found</Typography>
        <Button onClick={() => navigate("/officials")} sx={{ mt: 2 }}>
          Back to Registry
        </Button>
      </Box>
    );
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Box className="space-y-5">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          minHeight: 200,
          borderRadius: "32px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.7)",
          background: `linear-gradient(110deg, rgba(18,14,16,0.92) 0%, rgba(35,23,23,0.78) 38%, rgba(246,118,94,0.3) 100%), url("${officialHero}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white"
        }}
      >
        <Stack
          sx={{ position: "relative", zIndex: 1, height: "100%", justifyContent: "space-between" }}
        >
          <Box>
            <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2, color: "white/80" }}>
              <Typography
                component={RouterLink}
                to="/dashboard"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Dashboard
              </Typography>
              <Typography
                component={RouterLink}
                to="/officials"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                Officials
              </Typography>
              <Typography sx={{ color: "white", fontWeight: 700 }}>Activity Logs</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.05em", mb: 1 }}>
              {official.fullName}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Monitoring system actions and operations history
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "32px", p: 4, border: "1px solid #f2dfd7" }}>
        <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "#f6765e", width: 56, height: 56 }}>
            <User size={32} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Profile Overview
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {official.designation} • {official.email}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}
          >
            <Activity size={20} className="text-[#f6765e]" />
            Recent Activity History
          </Typography>

          {sortedLogs.length > 0 ? (
            <List sx={{ p: 0 }}>
              {sortedLogs.map((log, index) => (
                <ListItem
                  key={log.id}
                  sx={{
                    px: 0,
                    py: 2.5,
                    borderBottom: index === sortedLogs.length - 1 ? "none" : "1px solid #f0eee9"
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "12px",
                        backgroundColor: "#fff5f2",
                        color: "#f6765e"
                      }}
                    >
                      <Calendar size={18} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 700, color: "#2f2829", fontSize: 16 }}>
                        {log.action} <span style={{ fontWeight: 400, color: "#8d7f7b" }}>on</span>{" "}
                        {log.target}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 0.5, color: "#b19f99" }}>
                        {formatDate(log.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{ py: 6, textAlign: "center", backgroundColor: "#faf8f7", borderRadius: "20px" }}
            >
              <History size={40} className="text-[#d5ccc8]" style={{ marginBottom: 12 }} />
              <Typography color="textSecondary">
                No activity logs found for this official.
              </Typography>
            </Box>
          )}
        </Box>

        <Stack direction="row" sx={{ mt: 5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/officials")}
            sx={{ borderRadius: "14px", px: 4 }}
          >
            Back to Registry
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
