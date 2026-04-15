import { Box, Button, TextField, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

export interface EventFormValues {
  header: string;
  image: File | null;
  date: string;
  text: string;
  address: string;
  eventType: string;
  eventFor: string;
  status: string;
}

function EventForm() {
  const [preview, setPreview] = useState<string | null>(null);

  const formik = useFormik<EventFormValues>({
    initialValues: {
      header: "",
      image: null,
      date: "",
      text: "",
      address: "",
      eventType: "",
      eventFor: "",
      status: "",
    },

    validationSchema: Yup.object({
      header: Yup.string().required("Header is required"),
      date: Yup.string().required("Date is required"),
      eventType: Yup.string().required("Event Type is required"),
      eventFor: Yup.string().required("Event For is required"),
    }),

    onSubmit: (values) => {
      const formData = new FormData();

      formData.append("header", values.header);
      formData.append("date", values.date);
      formData.append("text", values.text);
      formData.append("address", values.address);
      formData.append("eventType", values.eventType);
      formData.append("eventFor", values.eventFor);
      formData.append("status", values.status);

      if (values.image) {
        formData.append("image", values.image);
      }

      // 👉 API call
      fetch("/api/events", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    },
  });

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>

          {/* Header */}
          <TextField
            label="Event Title"
            name="header"
            value={formik.values.header}
            onChange={formik.handleChange}
            error={formik.touched.header && Boolean(formik.errors.header)}
            helperText={formik.touched.header && formik.errors.header}
          />

          {/* Image Upload */}
          <Button variant="outlined" component="label">
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] || null;
                formik.setFieldValue("image", file);

                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </Button>

          {/* Image Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", height: 200, objectFit: "cover" }}
            />
          )}

          {/* Date */}
          <TextField
            type="date"
            label="Event Date"
            name="date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.date}
            onChange={formik.handleChange}
            error={formik.touched.date && Boolean(formik.errors.date)}
            helperText={formik.touched.date && formik.errors.date}
          />

          {/* Description */}
          <TextField
            label="Description"
            name="text"
            multiline
            rows={3}
            value={formik.values.text}
            onChange={formik.handleChange}
          />

          {/* Address */}
          <TextField
            label="Address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
          />

          {/* Event Type */}
          <TextField
            select
            label="Event Type"
            name="eventType"
            value={formik.values.eventType}
            onChange={formik.handleChange}
            error={formik.touched.eventType && Boolean(formik.errors.eventType)}
            helperText={formik.touched.eventType && formik.errors.eventType}
          >
            <MenuItem value="State">State</MenuItem>
            <MenuItem value="District">District</MenuItem>
            <MenuItem value="Club">Club</MenuItem>
          </TextField>

          {/* Event For */}
          <TextField
            label="Event For (ID)"
            name="eventFor"
            value={formik.values.eventFor}
            onChange={formik.handleChange}
            error={formik.touched.eventFor && Boolean(formik.errors.eventFor)}
            helperText={formik.touched.eventFor && formik.errors.eventFor}
          />

          {/* Status */}
          <TextField
            select
            label="Status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
          >
            <MenuItem value="coming_soon">Coming Soon</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>

          {/* Submit */}
          <Button type="submit" variant="contained">
            Create Event
          </Button>

        </Box>
      </form>
    </Box>
  );
}

export default EventForm;