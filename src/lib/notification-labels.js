const ROLE_LABELS = {
  admin: "Admin",
  state: "Sub Admin",
  official: "Sub Admin",
  club: "Club",
  district: "District",
  skater: "Skater",
  parent: "Parent",
  school: "School",
  academy: "Academy",
  guest: "Guest"
};

/** Human-readable role labels for notification UI (admin dashboard). */
export const formatNotificationRole = (role) => {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  return ROLE_LABELS[normalized] || String(role).trim();
};

export const isDashboardRoleLabel = (role) => {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();
  return normalized === "admin" || normalized === "state" || normalized === "official";
};
