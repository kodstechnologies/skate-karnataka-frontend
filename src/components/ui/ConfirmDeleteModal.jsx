import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";
import { TriangleAlert } from "lucide-react";

export const ConfirmDeleteModal = ({
  open,
  title = "Delete item",
  description = "This action cannot be undone.",
  itemLabel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#f6765e]">
            <TriangleAlert size={20} />
          </div>
          <div>
            <Typography component="div" sx={{ fontSize: 20, fontWeight: 700, color: "#2f2829" }}>
              {title}
            </Typography>
            {itemLabel ? (
              <Typography sx={{ mt: 0.5, color: "#8d7f7b", fontSize: 14 }}>{itemLabel}</Typography>
            ) : null}
          </div>
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography sx={{ color: "#8d7f7b", lineHeight: 1.7 }}>{description}</Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            backgroundColor: "#f6765e",
            "&:hover": {
              backgroundColor: "#ea6b54"
            }
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
