/** Lap/round labels from a skating category document (standard or custom). */
export const collectCategoryNameLabels = (doc) => {
  if (!doc || typeof doc !== "object") return [];

  const custom = Array.isArray(doc.customCategoryNames) ? doc.customCategoryNames : [];
  if (custom.length) {
    return custom
      .map((entry) => (typeof entry === "string" ? entry : entry?.name))
      .map((name) => String(name || "").trim())
      .filter(Boolean);
  }

  const fromAgeGroups = (doc.ageGroups || []).flatMap((group) =>
    (group.categories || []).map((cat) => String(cat?.name || "").trim()).filter(Boolean)
  );

  return [...new Set(fromAgeGroups)];
};

export const unwrapOrgCategoryContext = (response) => {
  const body = response?.data ?? response;
  const inner = body?.data && typeof body.data === "object" ? body.data : body;

  const categories = Array.isArray(inner?.categories)
    ? inner.categories
    : Array.isArray(inner?.standardCategories)
      ? inner.standardCategories
      : [];

  return {
    categories,
    standardCategories: categories,
    customCategory: inner?.customCategory ?? null,
    customHasSavedNames: Boolean(inner?.customHasSavedNames),
    usesStandardFallbackForCustom: Boolean(inner?.usesStandardFallbackForCustom)
  };
};
