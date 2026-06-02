export const getEventApprovalChipProps = (event) => {
  if (event?.deleteApprovalStatus === "pending") {
    return { label: "Delete pending", sx: { bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 } };
  }
  const status = event?.adminApprovalStatus || "approved";
  if (status === "pending") {
    return { label: "Pending approval", sx: { bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700 } };
  }
  if (status === "rejected") {
    return { label: "Rejected", sx: { bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 } };
  }
  return { label: "Approved", sx: { bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 } };
};

export const canApproveEvents = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "state" || normalized === "admin" || normalized === "superadmin";
};

export const isEventPubliclyVisible = (event) => {
  if (event?.deleteApprovalStatus === "pending") return false;
  const status = event?.adminApprovalStatus || "approved";
  return status === "approved";
};
