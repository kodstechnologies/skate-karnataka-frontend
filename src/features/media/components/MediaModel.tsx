import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  open: boolean;
  onClose: () => void;
}

function MediaModel({ open, onClose }: Props) {
  const formik = useFormik({
    initialValues: {
      image: null as File | null,
      type: "",
      date: "",
      name: "",
      stateName: "",
      districtName: "",
      clubName: "",
    },

    validationSchema: Yup.object({
      type: Yup.string().required("Type is required"),
      date: Yup.string().required("Date is required"),
      name: Yup.string().required("Name is required"),
    }),

    onSubmit: (values) => {
      console.log("Media Data:", values);
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Media</DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>

            {/* Image Upload */}
            <Button variant="outlined" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0] || null;
                  formik.setFieldValue("image", file);
                }}
              />
            </Button>

            {/* Type */}
            <TextField
              select
              label="Type"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
            >
              <MenuItem value="State">State</MenuItem>
              <MenuItem value="District">District</MenuItem>
              <MenuItem value="Club">Club</MenuItem>
            </TextField>

            {/* Date */}
            <TextField
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.date}
              onChange={formik.handleChange}
            />

            {/* Name */}
            <TextField
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />

            {/* Conditional Fields */}
            {formik.values.type === "State" && (
              <TextField
                label="State Name"
                name="stateName"
                value={formik.values.stateName}
                onChange={formik.handleChange}
              />
            )}

            {formik.values.type === "District" && (
              <TextField
                label="District Name"
                name="districtName"
                value={formik.values.districtName}
                onChange={formik.handleChange}
              />
            )}

            {formik.values.type === "Club" && (
              <TextField
                label="Club Name"
                name="clubName"
                value={formik.values.clubName}
                onChange={formik.handleChange}
              />
            )}

          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MediaModel;