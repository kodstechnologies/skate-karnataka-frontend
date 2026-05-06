export const eventStatusOptions = [
  { value: "coming_soon", label: "Coming Soon" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" }
];

export const initialEventFormValues = {
  header: "",
  about: "",
  address: "",
  registerStartDate: "",
  registerEndDate: "",
  eventStartDate: "",
  eventEndDate: "",
  eventStartTime: "",
  eventEndTime: "",
  status: "coming_soon",
  entryFee: "",
  colorOne: "#f117d5",
  colorTwo: "#1838e3",
  textColor: "#000000"
};

export const createEventFormValues = (event = {}) => ({
  header: event.header ?? "",
  about: event.about ?? "",
  address: event.address ?? "",
  registerStartDate: event.registerStartDate ?? "",
  registerEndDate: event.registerEndDate ?? "",
  eventStartDate: event.eventStartDate ?? "",
  eventEndDate: event.eventEndDate ?? "",
  eventStartTime: event.eventStartTime ?? "",
  eventEndTime: event.eventEndTime ?? "",
  status: event.status ?? "coming_soon",
  entryFee: event.entryFee ?? "",
  colorOne: event.colorOne ?? "#ffffff",
  colorTwo: event.colorTwo ?? "#ffffff",
  textColor: event.textColor ?? "#000000"
});
