import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../../../components/ui/TopBar";
import EventForm from "../components/EventForm";
import type { EventFormValues } from "../components/EventForm";

function EditEvent() {
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<EventFormValues>({
    header: "",
    image: null as any, // if using file
    date: "",
    text: "",
    address: "",
    eventType: "",
    eventFor: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch event by ID
  useEffect(() => {
    if (!id) return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setInitialValues({
          header: data.header || "",
          image: data.image || null, // URL or file
          date: data.date ? data.date.split("T")[0] : "",
          text: data.text || "",
          address: data.address || "",
          eventType: data.eventType || "",
          eventFor: data.eventFor || "",
          status: data.status || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // ✅ Update API
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

    fetch(`/api/events/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Updated:", data);
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <TopBar title="Edit Event" subtitle="Update event details" />

      <EventForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isEdit
      />
    </>
  );
}

export default EditEvent;