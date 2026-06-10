const toValidDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Match backend `resolveEventStatusByDates` for list cards. */
export const resolveEventDisplayStatus = (event) => {
  const storedStatus = event?.status ?? "coming_soon";
  if (storedStatus === "cancelled") {
    return "cancelled";
  }

  const now = new Date();
  const eventStartDate = toValidDate(event?.eventStartDate);
  const eventEndDate = toValidDate(event?.eventEndDate);

  if (eventEndDate && eventEndDate < now) {
    return "completed";
  }
  if (eventStartDate && eventStartDate < now) {
    return "active";
  }

  return "coming_soon";
};
