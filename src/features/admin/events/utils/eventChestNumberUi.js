/** Normalize role from auth store (stored lowercase) or API. */
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const GENERATE_ROLES = new Set(["club", "district", "state", "admin"]);

/** Matches backend isRegistrationClosedForChestGeneration — end of registerEndDate calendar day. */
export const isRegistrationClosedForChestGeneration = (
  event,
  referenceDate = new Date()
) => {
  const raw = event?.registerEndDate;
  if (!raw) return false;

  const end = new Date(raw);
  if (Number.isNaN(end.getTime())) return false;

  end.setHours(23, 59, 59, 999);
  return end < referenceDate;
};

export const canShowGenerateChestNumbers = (role) =>
  GENERATE_ROLES.has(normalizeRole(role));
