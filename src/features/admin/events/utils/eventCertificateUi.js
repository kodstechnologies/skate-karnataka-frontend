/** Normalize role from auth store (stored lowercase) or API. */
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

/** Local midnight for a date value (calendar day only). */
const toLocalCalendarDay = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Event ended by date only — ignores eventEndTime.
 * True when today is the end date or later (local calendar).
 */
export const isEventEnded = (event, referenceDate = new Date()) => {
  const endDay = toLocalCalendarDay(event?.eventEndDate);
  if (!endDay) return false;
  const today = toLocalCalendarDay(referenceDate);
  return today.getTime() >= endDay.getTime();
};

/** Backend certificate generation is Admin-only (auth store uses lowercase role). */
export const canShowGenerateCertificates = (role) =>
  normalizeRole(role) === "admin";
