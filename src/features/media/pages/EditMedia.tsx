import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function EditMedia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    image: null as File | null,
    imageUrl: "",
    type: "",
    date: "",
    name: "",
    stateName: "",
    districtName: "",
    clubName: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  // ✅ Fetch existing data
  useEffect(() => {
    if (!id) return;

    // 👉 Replace with API
    const data = {
      image: "https://source.unsplash.com/400x300/?sports",
      type: "State",
      date: "2026-06-15",
      name: "State Championship",
      stateName: "Karnataka",
      districtName: "",
      clubName: "",
    };

    setForm({
      image: null,
      imageUrl: data.image,
      type: data.type,
      date: data.date,
      name: data.name,
      stateName: data.stateName,
      districtName: data.districtName,
      clubName: data.clubName,
    });

    setPreview(data.image);
  }, [id]);

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

  // ✅ Submit update
  const handleSubmit = () => {
    const formData = new FormData();

    formData.append("type", form.type);
    formData.append("date", form.date);
    formData.append("name", form.name);

    if (form.image) {
      formData.append("image", form.image);
    }

    if (form.type === "State") {
      formData.append("stateName", form.stateName);
    }
    if (form.type === "District") {
      formData.append("districtName", form.districtName);
    }
    if (form.type === "Club") {
      formData.append("clubName", form.clubName);
    }

    console.log("Update Media:", id, form);

    // 👉 API call
    // fetch(`/api/media/${id}`, { method: "PUT", body: formData });

    navigate("/media");
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Edit Media
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3 }}>

        <Box display="flex" flexDirection="column" gap={2}>

          {/* Image Upload */}
          <Button variant="outlined" component="label">
            Change Image
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

          {/* Buttons */}
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/media")}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
            >
              Update
            </Button>
          </Box>

        </Box>

      </Card>
    </Box>
  );
}

export default EditMedia;