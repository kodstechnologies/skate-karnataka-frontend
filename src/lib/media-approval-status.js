export const MEDIA_APPROVAL = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const getMediaApprovalLabel = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === MEDIA_APPROVAL.PENDING) return "Pending approval";
  if (value === MEDIA_APPROVAL.REJECTED) return "Rejected";
  if (value === MEDIA_APPROVAL.APPROVED) return "Approved";
  return "Approved";
};

export const getMediaApprovalChipSx = (status, deletePending = false) => {
  if (deletePending) {
    return { bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700 };
  }
  const value = String(status || "").toLowerCase();
  if (value === MEDIA_APPROVAL.PENDING) {
    return { bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700 };
  }
  if (value === MEDIA_APPROVAL.REJECTED) {
    return { bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 };
  }
  return { bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 };
};
