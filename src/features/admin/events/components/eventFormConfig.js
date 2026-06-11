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
  categoryFormat: "standard",
  colorOne: "#f117d5",
  colorTwo: "#1838e3",
  textColor: "#000000"
};

/** Format a date string/object to YYYY-MM-DD for HTML date inputs (calendar date, no TZ shift). */
const formatDateForInput = (v) => {
  if (v == null || v === "") return "";

  if (typeof v === "string") {
    const trimmed = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const isoPrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoPrefix) return isoPrefix[1];
  }

  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Parse HH:mm, H:mm, or h:mm AM/PM to minutes since midnight (matches backend validation). */
const parseClockToMinutes = (rawValue) => {
  const raw = String(rawValue ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  const meridian = (match[3] || "").toUpperCase();
  if (meridian) {
    if (hours < 1 || hours > 12) return null;
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

const minutesToHHmm = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/** Format a time string/object to HH:mm for HTML time inputs */
const formatTimeForInput = (v) => {
  if (v == null || v === "") return "";

  const fromClock = parseClockToMinutes(v);
  if (fromClock != null) return minutesToHHmm(fromClock);

  const d = v instanceof Date ? v : new Date(v);
  if (!Number.isNaN(d.getTime())) {
    return minutesToHHmm(d.getHours() * 60 + d.getMinutes());
  }

  return "";
};

/** Compare calendar dates only (YYYY-MM-DD), ignoring time/timezone drift. */
const startOfDayMs = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d.getTime();
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

  const regStartMs = startOfDayMs(formData.registerStartDate);
  const regEndMs = startOfDayMs(formData.registerEndDate);
  const eventStartMs = startOfDayMs(formData.eventStartDate);
  const eventEndMs = startOfDayMs(formData.eventEndDate);

  if (regStartMs != null && regEndMs != null && regStartMs > regEndMs) {
    errors.registerEndDate = "Registration end date cannot be before start date";
  }

  if (eventStartMs != null && eventEndMs != null && eventStartMs > eventEndMs) {
    errors.eventEndDate = "Event end date cannot be before start date";
  }

  if (regEndMs != null && eventStartMs != null && regEndMs > eventStartMs) {
    errors.eventStartDate = "Event start date must be on or after registration end date";
  }

  const startMinutes = parseClockToMinutes(formData.eventStartTime);
  const endMinutes = parseClockToMinutes(formData.eventEndTime);

  if (
    eventStartMs != null &&
    eventEndMs != null &&
    eventStartMs === eventEndMs &&
    startMinutes != null &&
    endMinutes != null &&
    startMinutes > endMinutes
  ) {
    errors.eventEndTime = "End time must be on or after start time for same-day events";
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
  categoryFormat: event.categoryFormat ?? event.categorySource ?? "standard",
  colorOne: event.colorOne ?? "#ffffff",
  colorTwo: event.colorTwo ?? "#ffffff",
  textColor: event.textColor ?? "#000000"
});
