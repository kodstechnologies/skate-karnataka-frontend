export const eventStatusOptions = [
  { value: "coming_soon", label: "Coming Soon" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" }
];

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const getSkatingCategoryOptionId = (option) =>
  String(option?._id || option?.id || "").trim();

export const getSkatingCategoryOptionLabel = (option) =>
  option?.typeName || option?.name || option?.label || "";

/** Normalize API list items to { id, label } for Autocomplete. */
export const mapSkatingCategoryOptions = (list = []) =>
  (Array.isArray(list) ? list : [])
    .map((item) => ({
      id: getSkatingCategoryOptionId(item),
      label: getSkatingCategoryOptionLabel(item)
    }))
    .filter((item) => OBJECT_ID_REGEX.test(item.id));

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

export const validateEventForm = (formData) => {
  const errors = {};
  const requiredFields = [
    "header",
    "about",
    "address",
    "registerStartDate",
    "registerEndDate",
    "eventStartDate",
    "eventEndDate",
    "status",
    "entryFee",
    "skatingEventCategories"
  ];

  requiredFields.forEach((field) => {
    if (field === "skatingEventCategories") return;
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }
  });

  if (formData.entryFee && Number(formData.entryFee) < 0) {
    errors.entryFee = "Entry fee cannot be negative";
  }
  if (!Array.isArray(formData.skatingEventCategories) || formData.skatingEventCategories.length < 1) {
    errors.skatingEventCategories = "Select at least one category";
  }

  const regStart = formData.registerStartDate ? new Date(formData.registerStartDate) : null;
  const regEnd = formData.registerEndDate ? new Date(formData.registerEndDate) : null;
  const eventStart = formData.eventStartDate ? new Date(formData.eventStartDate) : null;
  const eventEnd = formData.eventEndDate ? new Date(formData.eventEndDate) : null;

  if (regStart && regEnd && regStart > regEnd) {
    errors.registerEndDate = "Registration end date cannot be before start date";
  }

  if (eventStart && eventEnd && eventStart > eventEnd) {
    errors.eventEndDate = "Event end date cannot be before start date";
  }

  if (regEnd && eventStart && regEnd > eventStart) {
    errors.registerEndDate = "Registration must end before or on the event start date";
  }

  if (
    formData.eventStartDate &&
    formData.eventEndDate &&
    new Date(formData.eventStartDate).toDateString() ===
      new Date(formData.eventEndDate).toDateString()
  ) {
    if (formData.eventStartTime && formData.eventEndTime) {
      if (formData.eventStartTime >= formData.eventEndTime) {
        errors.eventEndTime = "End time must be strictly after start time for same-day events";
      }
    }
  }

  return errors;
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
