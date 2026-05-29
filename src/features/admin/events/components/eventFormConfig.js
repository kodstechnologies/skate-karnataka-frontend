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
  skatingEventCategories: [],
  colorOne: "#f117d5",
  colorTwo: "#1838e3",
  textColor: "#000000"
};

/** Format a date string/object to YYYY-MM-DD for HTML date inputs */
const formatDateForInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Format a time string/object to HH:mm for HTML time inputs */
const formatTimeForInput = (v) => {
  if (!v) return "";
  // If it's already HH:mm or HH:mm:ss, just ensure it's HH:mm
  if (typeof v === "string" && v.includes(":") && !v.includes("T")) {
    return v.split(":").slice(0, 2).join(":");
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const createEventFormValues = (event = {}) => ({
  header: event.header ?? "",
  about: event.about ?? "",
  address: event.address ?? "",
  registerStartDate: formatDateForInput(event.registerStartDate),
  registerEndDate: formatDateForInput(event.registerEndDate),
  eventStartDate: formatDateForInput(event.eventStartDate),
  eventEndDate: formatDateForInput(event.eventEndDate),
  eventStartTime: formatTimeForInput(event.eventStartTime),
  eventEndTime: formatTimeForInput(event.eventEndTime),
  status: event.status ?? "coming_soon",
  entryFee: event.entryFee ?? "",
  skatingEventCategories: (event.skatingEventCategories ?? [])
    .map((item) => (typeof item === "string" ? item : item?._id))
    .filter(Boolean),
  colorOne: event.colorOne ?? "#ffffff",
  colorTwo: event.colorTwo ?? "#ffffff",
  textColor: event.textColor ?? "#000000"
});
