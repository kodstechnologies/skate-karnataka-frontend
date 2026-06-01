export const getMemberApprovalChipProps = (member) => {
  if (member?.isBlocked) {
    return { label: "Blocked", sx: { bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 } };
  }
  if (member?.verify) {
    return { label: "Approved", sx: { bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 } };
  }
  return { label: "Pending", sx: { bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700 } };
};

export const canApproveMembers = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "state" || normalized === "admin";
};
