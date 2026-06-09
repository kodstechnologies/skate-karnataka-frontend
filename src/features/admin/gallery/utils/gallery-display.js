export const formatOwnerTypeLabel = (ownerType) => {
  const value = String(ownerType || "").trim().toLowerCase();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getGalleryUploadedBy = (item) => {
  if (!item) return "—";

  const name = String(
    item.uploadedBy ||
      item.ownerName ||
      item.orgName ||
      item.ownerId?.fullName ||
      item.ownerId?.name ||
      ""
  ).trim();

  if (!name) return "—";
  return name;
};

export const getGalleryUploadedByDetail = (item) => {
  const name = getGalleryUploadedBy(item);
  if (name === "—") return name;

  const ownerType = formatOwnerTypeLabel(item?.ownerType);
  return ownerType ? `${name} (${ownerType})` : name;
};
