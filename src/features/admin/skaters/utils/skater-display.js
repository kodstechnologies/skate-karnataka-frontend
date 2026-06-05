/** Profile image from skater API (`photo` or `profile`). */
export const getSkaterProfileImage = (skater) => {
  const url = skater?.photo || skater?.profile || "";
  return typeof url === "string" ? url.trim() : "";
};

const isImageUrl = (url) => /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url || "");

/** Normalize uploaded document entries from API. */
export const getSkaterDocuments = (skater) => {
  const docs = Array.isArray(skater?.documents) ? skater.documents : [];
  return docs
    .filter((doc) => doc && (doc.url || doc.name))
    .map((doc, index) => ({
      url: String(doc.url || "").trim(),
      name: String(doc.name || `Document ${index + 1}`).trim(),
      uploadedAt: doc.uploadedAt || null,
      isImage: isImageUrl(doc.url)
    }));
};

export const getSkaterCategoryName = (skater) => {
  if (!skater) return "-";
  if (skater.category && typeof skater.category === "object" && skater.category.typeName) {
    return skater.category.typeName;
  }
  if (skater.categoryName?.trim()) {
    return skater.categoryName.trim();
  }
  return "-";
};

export const formatSkaterDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

/** Resolve district label from API shapes (object, string, or districtName). */
export const getSkaterDistrictName = (skater) => {
  if (!skater) return "-";

  if (skater.district && typeof skater.district === "object" && skater.district.name) {
    return skater.district.name;
  }

  if (typeof skater.district === "string" && skater.district.trim()) {
    return skater.district.trim();
  }

  if (skater.districtName?.trim()) {
    return skater.districtName.trim();
  }

  if (skater.districtDetails?.name?.trim()) {
    return skater.districtDetails.name.trim();
  }

  if (skater.club?.districtName?.trim()) {
    return skater.club.districtName.trim();
  }

  if (skater.club?.district?.name?.trim()) {
    return skater.club.district.name.trim();
  }

  return "-";
};
