import TopBar from "../../../components/ui/TopBar";
import SkaterForm from "../components/SkaterForm";
import type { SkaterFormValues } from "../components/SkaterForm";
import { useParams } from "react-router-dom";

function EditSkater() {
  const { id } = useParams();

  // 👉 Normally fetched from API
  const initialValues: SkaterFormValues = {
    name: "Sangram",
    rsfiId: "RSFI123",
    dob: "2000-01-01",
    gender: "Male",
    category: "Senior",
    discipline: "Speed",
    district: "Bangalore",
    club: "ABC Club",
  };

  const handleSubmit = (values: SkaterFormValues) => {
    console.log("Update:", id, values);
    // 👉 PUT API
  };

  return (
    <>
        <TopBar
        title="Edit Skater"
        subtitle="Update skater details"
      />
    <SkaterForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      isEdit
    />
    </>
  );
}

export default EditSkater;