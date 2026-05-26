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
