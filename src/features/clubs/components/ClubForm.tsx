
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ClubFormValues {
  districtName: string;
  clubHeadName: string;
  email: string;
  phoneNo: string;
  officials: string;
}

interface ClubFormProps {
  initialData?: Partial<Omit<ClubFormValues, "officials">> & {
    officials?: string[] | string;
  };
  isEdit?: boolean;
  onSubmit?: (values: ClubFormValues) => void;
}

function ClubForm({ initialData, isEdit = false, onSubmit }: ClubFormProps) {
  const formik = useFormik({
    initialValues: {
      districtName: initialData?.districtName ?? "",
      clubHeadName: initialData?.clubHeadName ?? "",
      email: initialData?.email ?? "",
      phoneNo: initialData?.phoneNo ?? "",
      officials: Array.isArray(initialData?.officials)
        ? initialData.officials.join(", ")
        : (initialData?.officials ?? ""),
    },
    validationSchema: Yup.object({
      districtName: Yup.string().required("District Name is required"),
      clubHeadName: Yup.string().required("Club Head Name is required"),
      email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
      phoneNo: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Phone number is required"),
      officials: Yup.string().required("Officials is required"),
    }),
    onSubmit: (values) => {
      if (onSubmit) {
        onSubmit(values);
        return;
      }
      console.log("Club Data:", values);
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
        Club Form
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* District Name */}
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

          {/* Club Head Name */}
          <TextField
            fullWidth
            label="Club Head Name"
            name="clubHeadName"
            value={formik.values.clubHeadName}
            onChange={formik.handleChange}
            error={
              formik.touched.clubHeadName &&
              Boolean(formik.errors.clubHeadName)
            }
            helperText={
              formik.touched.clubHeadName &&
              formik.errors.clubHeadName
            }
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          {/* Phone */}
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNo"
            value={formik.values.phoneNo}
            onChange={formik.handleChange}
            error={
              formik.touched.phoneNo &&
              Boolean(formik.errors.phoneNo)
            }
            helperText={
              formik.touched.phoneNo &&
              formik.errors.phoneNo
            }
          />

          {/* Officials */}
          <TextField
            fullWidth
            label="Officials"
            name="officials"
            value={formik.values.officials}
            onChange={formik.handleChange}
            placeholder="Enter officials separated by comma"
            error={
              formik.touched.officials &&
              Boolean(formik.errors.officials)
            }
            helperText={
              formik.touched.officials &&
              formik.errors.officials
            }
          />

          {/* Submit */}
          <Button type="submit" variant="contained">
            {isEdit ? "Update Club" : "Create Club"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ClubForm;