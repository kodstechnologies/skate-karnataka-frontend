export const eventStatusOptions = [
  { value: "coming_soon", label: "Coming Soon" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" }
];

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/** Keep category ids as a string array — never spread a string (that splits into chars). */
export const normalizeSkatingEventCategoryIds = (value) => {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item == null || item === "") return "";
        if (typeof item === "string") return item.trim();
        return String(item._id || item.id || "").trim();
      })
      .filter((id) => OBJECT_ID_REGEX.test(id));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (OBJECT_ID_REGEX.test(trimmed)) return [trimmed];
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter((id) => OBJECT_ID_REGEX.test(id));
  }

  return [];
};

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
  skatingEventCategories: normalizeSkatingEventCategoryIds(event.skatingEventCategories),
  colorOne: event.colorOne ?? "#ffffff",
  colorTwo: event.colorTwo ?? "#ffffff",
  textColor: event.textColor ?? "#000000"
});
