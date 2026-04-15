
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

function DistrictForm() {
  const formik = useFormik({
    initialValues: {
      districtName: "",
      districtHeadName: "",
      email: "",
      contactNo: "",
      officials: "",
    },
    validationSchema: Yup.object({
      districtName: Yup.string().required("District Name is required"),
      districtHeadName: Yup.string().required("District Head Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      contactNo: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Contact Number is required"),
      officials: Yup.string().required("Officials is required"),
    }),
    onSubmit: (values) => {
      console.log("Form Data:", values);
    },
  });

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 600,
        margin: "auto",
      }}
    >
      <Typography variant="h5" mb={3}>
        District Form
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="District Name"
            name="districtName"
            value={formik.values.districtName}
            onChange={formik.handleChange}
            error={
              formik.touched.districtName &&
              Boolean(formik.errors.districtName)
            }
            helperText={
              formik.touched.districtName &&
              formik.errors.districtName
            }
          />

          <TextField
            fullWidth
            label="District Head Name"
            name="districtHeadName"
            value={formik.values.districtHeadName}
            onChange={formik.handleChange}
            error={
              formik.touched.districtHeadName &&
              Boolean(formik.errors.districtHeadName)
            }
            helperText={
              formik.touched.districtHeadName &&
              formik.errors.districtHeadName
            }
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            label="Contact Number"
            name="contactNo"
            value={formik.values.contactNo}
            onChange={formik.handleChange}
            error={
              formik.touched.contactNo &&
              Boolean(formik.errors.contactNo)
            }
            helperText={
              formik.touched.contactNo &&
              formik.errors.contactNo
            }
          />

          <TextField
            fullWidth
            label="Officials"
            name="officials"
            value={formik.values.officials}
            onChange={formik.handleChange}
            error={
              formik.touched.officials &&
              Boolean(formik.errors.officials)
            }
            helperText={
              formik.touched.officials &&
              formik.errors.officials
            }
          />

          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default DistrictForm;