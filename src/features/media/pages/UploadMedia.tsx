import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
} from "@mui/material";

function UploadMedia() {
  const [form, setForm] = useState({
    image: null as File | null,
    type: "",
    date: "",
    name: "",
    stateName: "",
    districtName: "",
    clubName: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  // ✅ Handle change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle image upload
  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit
  const handleSubmit = () => {
    console.log("Media Data:", form);

    const formData = new FormData();
    formData.append("image", form.image as File);
    formData.append("type", form.type);
    formData.append("date", form.date);
    formData.append("name", form.name);

    if (form.type === "State") {
      formData.append("stateName", form.stateName);
    }
    if (form.type === "District") {
      formData.append("districtName", form.districtName);
    }
    if (form.type === "Club") {
      formData.append("clubName", form.clubName);
    }

    // 👉 API call
    // fetch("/api/media", { method: "POST", body: formData });
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">

      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Upload Media
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3 }}>

        <Box display="flex" flexDirection="column" gap={2}>

          {/* Image Upload */}
          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleImage} />
          </Button>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", height: 200, objectFit: "cover" }}
            />
          )}

          {/* Type */}
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
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
            value={form.date}
            onChange={handleChange}
          />

          {/* Name */}
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          {/* Conditional Fields */}
          {form.type === "State" && (
            <TextField
              label="State Name"
              name="stateName"
              value={form.stateName}
              onChange={handleChange}
            />
          )}

          {form.type === "District" && (
            <TextField
              label="District Name"
              name="districtName"
              value={form.districtName}
              onChange={handleChange}
            />
          )}

          {form.type === "Club" && (
            <TextField
              label="Club Name"
              name="clubName"
              value={form.clubName}
              onChange={handleChange}
            />
          )}

          {/* Submit */}
          <Button variant="contained" onClick={handleSubmit}>
            Upload
          </Button>

        </Box>

      </Card>
    </Box>
  );
}

export default UploadMedia;