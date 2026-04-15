import { Box, Button, TextField, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

// ✅ Type
export interface SkaterFormValues {
  name: string;
  rsfiId: string;
  dob: string;
  gender: string;
  category: string;
  discipline: string;
  district: string;
  club: string;
}

// ✅ Props
interface SkaterFormProps {
  initialValues: SkaterFormValues;
  onSubmit: (values: SkaterFormValues) => void;
  isEdit?: boolean;
}

function SkaterForm({ initialValues, onSubmit, isEdit = false }: SkaterFormProps) {

  const formik = useFormik<SkaterFormValues>({
    initialValues,
    enableReinitialize: true,

    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      rsfiId: Yup.string().required("RSFI ID is required"),
      dob: Yup.string().required("DOB is required"),
      gender: Yup.string().required("Gender is required"),
      category: Yup.string().required("Category is required"),
      discipline: Yup.string().required("Discipline is required"),
      district: Yup.string().required("District is required"),
      club: Yup.string().required("Club is required"),
    }),

    onSubmit,
  });

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>

          {/* Name */}
          <TextField
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          {/* RSFI ID */}
          <TextField
            label="RSFI ID"
            name="rsfiId"
            value={formik.values.rsfiId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.rsfiId && Boolean(formik.errors.rsfiId)}
            helperText={formik.touched.rsfiId && formik.errors.rsfiId}
          />

          {/* DOB */}
          <TextField
            type="date"
            label="Date of Birth"
            name="dob"
            InputLabelProps={{ shrink: true }}
            value={formik.values.dob}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.dob && Boolean(formik.errors.dob)}
            helperText={formik.touched.dob && formik.errors.dob}
          />

          {/* Gender */}
          <TextField
            select
            label="Gender"
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            helperText={formik.touched.gender && formik.errors.gender}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </TextField>

          {/* Category */}
          <TextField
            select
            label="Category"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          >
            <MenuItem value="Junior">Junior</MenuItem>
            <MenuItem value="Senior">Senior</MenuItem>
          </TextField>

          {/* Discipline */}
          <TextField
            label="Discipline"
            name="discipline"
            value={formik.values.discipline}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.discipline && Boolean(formik.errors.discipline)}
            helperText={formik.touched.discipline && formik.errors.discipline}
          />

          {/* District */}
          <TextField
            label="District"
            name="district"
            value={formik.values.district}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.district && Boolean(formik.errors.district)}
            helperText={formik.touched.district && formik.errors.district}
          />

          {/* Club */}
          <TextField
            label="Club"
            name="club"
            value={formik.values.club}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.club && Boolean(formik.errors.club)}
            helperText={formik.touched.club && formik.errors.club}
          />

          {/* Submit */}
          <Button type="submit" variant="contained">
            {isEdit ? "Update Skater" : "Create Skater"}
          </Button>

        </Box>
      </form>
    </Box>
  );
}

export default SkaterForm;