import TopBar from "../../../components/ui/TopBar";
import EventForm from "../components/EventForm";
import type { EventFormValues } from "../components/EventForm";

function CreateEvent() {

  const initialValues: EventFormValues = {
    header: "",
    image: null, // ✅ file upload fix
    date: "",
    text: "",
    address: "",
    eventType: "",
    eventFor: "",
    status: "",
  };

  const handleSubmit = (values: EventFormValues) => {
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

    // 👉 POST API
    fetch("/api/events", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Created:", data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <TopBar
        title="Add Event"
        subtitle="Create event details"
      />

      <EventForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default CreateEvent;