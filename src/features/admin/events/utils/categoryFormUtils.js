/** Mirrors backend AGE_GROUPS */
export const AGE_GROUP_LABELS = ["6-8", "8-10", "10-12", "12-15", "15-18", "18+", "35+"];

export const buildFormState = (doc) => ({
  typeName: doc?.typeName ?? "",
  ageGroups: AGE_GROUP_LABELS.map((label) => {
    const existing = doc?.ageGroups?.find((ag) => ag.label === label);
    return {
      label,
      categories: existing?.categories?.length ? existing.categories.map((c) => c.name) : [""]
    };
  })
});

export const buildPayload = (form, { namesOnly = false } = {}) => {
  const ageGroups = form.ageGroups
    .map((ag) => ({
      label: ag.label,
      categories: ag.categories
        .map((c) => c.trim())
        .filter(Boolean)
        .map((name) => ({ name }))
    }))
    .filter((ag) => ag.categories.length > 0);

  if (namesOnly) {
    return { ageGroups };
  }

  return {
    typeName: form.typeName.trim(),
    ageGroups
  };
};
