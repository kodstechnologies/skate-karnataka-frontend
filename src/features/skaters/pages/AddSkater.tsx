import TopBar from "../../../components/ui/TopBar";
import SkaterForm from "../components/SkaterForm";
import type { SkaterFormValues } from "../components/SkaterForm";

function AddSkater() {

  const initialValues: SkaterFormValues = {
    name: "",
    rsfiId: "",
    dob: "",
    gender: "",
    category: "",
    discipline: "",
    district: "",
    club: ""
  };

  const handleSubmit = (values: SkaterFormValues) => {
    console.log("Create:", values);
    // 👉 POST API
  };

  return (
    <>
      <TopBar
        title="Add Skater"
        subtitle="Create skater details"
      />
      <SkaterForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default AddSkater;