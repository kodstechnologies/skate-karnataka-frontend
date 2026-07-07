import { useState } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { ChevronDown, FileSpreadsheet, Plus, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MemberAddMenuButton = ({
  singleTo,
  bulkTo,
  label = "Add member",
  singleLabel = "Add member",
  singleDescription = "Single registration form",
  bulkLabel = "Mass add (Excel)",
  bulkDescription = "Upload .xlsx / .xls / .csv",
  variant = "contained",
  size = "medium",
  startIcon = <Plus size={16} />,
  sx = {}
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={startIcon}
        endIcon={<ChevronDown size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={sx}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { borderRadius: "14px", minWidth: 220, mt: 0.5 }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate(singleTo);
          }}
        >
          <ListItemIcon>
            <UserPlus size={18} />
          </ListItemIcon>
          <ListItemText
            primary={singleLabel}
            secondary={singleDescription}
            secondaryTypographyProps={{ fontSize: 12 }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate(bulkTo);
          }}
        >
          <ListItemIcon>
            <FileSpreadsheet size={18} />
          </ListItemIcon>
          <ListItemText
            primary={bulkLabel}
            secondary={bulkDescription}
            secondaryTypographyProps={{ fontSize: 12 }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};
