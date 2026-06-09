export const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "inprogress", label: "In progress" },
  { value: "solved", label: "Solved" },
  { value: "notSolved", label: "Not solved" },
];

/** State review form — pending is not selectable. */
export const STATE_REVIEW_STATUS_OPTIONS = [
  { value: "inprogress", label: "In progress" },
  { value: "solved", label: "Solved" },
  { value: "notSolved", label: "Not solved" },
];

export const normalizeStateReviewStatus = (status) => {
  const value = String(status || "").trim();
  if (value === "inprogress" || value === "solved" || value === "notSolved") {
    return value;
  }
  return "inprogress";
};

export const formatComplainDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getStatusChipSx = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "solved") {
    return { bgcolor: "#e8f8ef", color: "#1f7a45", borderColor: "#b8e6cc" };
  }
  if (normalized === "inprogress") {
    return { bgcolor: "#eef5ff", color: "#2f5fae", borderColor: "#c8daf7" };
  }
  if (normalized === "notsolved") {
    return { bgcolor: "#fdeeed", color: "#b42318", borderColor: "#f5c4c0" };
  }
  return { bgcolor: "#fff6ed", color: "#b45309", borderColor: "#fcd9b6" };
};

export const formatStatusLabel = (status) => {
  const match = STATUS_OPTIONS.find((item) => item.value === status);
  if (match) return match.label;
  const raw = String(status || "pending");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export const normalizeReportType = (reportType) =>
  String(reportType || "")
    .trim()
    .toLowerCase();

/** Which identity fields apply per report type (club / skater / district). */
export const getComplainFieldVisibility = (reportType) => {
  const type = normalizeReportType(reportType);

  const visibility = {
    skaterName: true,
    krsaId: true,
    clubName: true,
    districtName: true,
    complainedBy: true,
  };

  if (type === "club") {
    return { ...visibility, skaterName: false, districtName: false, krsaId: false };
  }

  if (type === "skater") {
    return { ...visibility, clubName: false, districtName: false };
  }

  if (type === "district") {
    return { ...visibility, skaterName: false, clubName: false, krsaId: false };
  }

  return visibility;
};

export const formatReportTypeLabel = (reportType) => {
  const type = normalizeReportType(reportType);
  if (!type) return "—";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/** Primary row label in list (who/what the complaint is about). */
export const getComplainSubjectLabel = (row) => {
  const type = normalizeReportType(row?.reportType);
  if (type === "club") return row?.clubName || "—";
  if (type === "district") return row?.districtName || "—";
  return row?.skaterName || row?.complainedBy || "—";
};

export const COMPLAIN_REVIEW_LEVELS = [
  { key: "club", statusKey: "clubStatus", messageKey: "clubMessage", label: "Club" },
  { key: "district", statusKey: "districtStatus", messageKey: "districtMessage", label: "District" },
  { key: "state", statusKey: "stateStatus", messageKey: "stateMessage", label: "State" },
];

export const getComplainDetailFields = (item) => {
  if (!item) return [];

  const visibility = getComplainFieldVisibility(item.reportType);
  const candidates = [
    { key: "skaterName", label: "Skater name", value: item.skaterName },
    { key: "krsaId", label: "KRSA ID", value: item.krsaId },
    { key: "complainedBy", label: "Complained by", value: item.complainedBy },
    { key: "clubName", label: "Club", value: item.clubName },
    { key: "districtName", label: "District", value: item.districtName },
    { key: "reportType", label: "Report type", value: formatReportTypeLabel(item.reportType), always: true },
    { key: "submitted", label: "Submitted", value: formatComplainDate(item.createdAt), always: true },
    { key: "skaterStatus", label: "Skater status", value: formatStatusLabel(item.status), always: true },
  ];

  return candidates.filter((field) => field.always || visibility[field.key]);
};

export const getComplainReviewLevels = (item) => {
  if (!item) return [];

  return COMPLAIN_REVIEW_LEVELS.map((level) => ({
    ...level,
    status: item[level.statusKey] || "pending",
    message: String(item[level.messageKey] || "").trim(),
  }));
};
