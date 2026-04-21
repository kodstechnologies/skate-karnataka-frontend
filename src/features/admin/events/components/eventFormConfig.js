export const eventTypeOptions = [
  { value: "state", label: "State" },
  { value: "district", label: "District" },
  { value: "club", label: "Club" }
];

export const eventStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "public", label: "Public" }
];

export const stateOptions = ["Karnataka"];

export const districtOptions = [
  "Bengaluru Urban",
  "Mysuru",
  "Udupi",
  "Shivamogga",
  "Belagavi",
  "Dakshina Kannada",
  "Ballari"
];

export const initialEventFormValues = {
  title: "",
  description: "",
  address: "",
  registrationStartDateTime: "",
  registrationEndDateTime: "",
  eventStartDateTime: "",
  eventEndDateTime: "",
  eventType: "",
  eventFor: "",
  status: "draft",
  price: "",
  coverImage: null
};

export const createEventFormValues = (event = {}) => ({
  title: event.title ?? "",
  description: event.description ?? "",
  address: event.address ?? "",
  registrationStartDateTime: event.registrationStartDateTime ?? "",
  registrationEndDateTime: event.registrationEndDateTime ?? "",
  eventStartDateTime: event.eventStartDateTime ?? "",
  eventEndDateTime: event.eventEndDateTime ?? "",
  eventType: event.eventType ?? "",
  eventFor: event.eventFor ?? "",
  status: event.status ?? "draft",
  price: event.price ?? "",
  coverImage: event.coverImage ?? null
});
