import { useCallback } from "react";

/** Mirrors backend AGE_GROUPS */
export const AGE_GROUP_LABELS = ["Below 6", "6-8", "8-10", "10-12", "12-15", "15-18", "18+", "35+"];

export const EMPTY_CATEGORY_ROW = { name: "", formula: "" };

const resolveFormulaId = (formula) => {
  if (!formula) return "";
  if (typeof formula === "string") return formula;
  return String(formula._id ?? formula.id ?? "");
};

export const normalizeCategoryRow = (row) => {
  if (typeof row === "string") {
    return { name: row, formula: "" };
  }
  return {
    name: row?.name ?? "",
    formula: resolveFormulaId(row?.formula)
  };
};

export const categoryRowName = (row) => normalizeCategoryRow(row).name;

export const buildFormState = (doc) => ({
  typeName: doc?.typeName ?? "",
  ageGroups: AGE_GROUP_LABELS.map((label) => {
    const existing = doc?.ageGroups?.find((ag) => ag.label === label);
    return {
      label,
      categories: existing?.categories?.length
        ? existing.categories.map(normalizeCategoryRow)
        : [{ ...EMPTY_CATEGORY_ROW }]
    };
  })
});

const rowToPayload = (row, { requireFormula = false } = {}) => {
  const { name, formula } = normalizeCategoryRow(row);
  const trimmed = name.trim();
  if (!trimmed) return null;
  const formulaId = String(formula || "").trim();
  if (requireFormula && !formulaId) return null;
  const out = { name: trimmed };
  if (formulaId) out.formula = formulaId;
  return out;
};

/** @returns errors object; empty categoryRows means no row errors */
export const validateCategoryForm = (
  form,
  { requireFormula = false, requireTypeName = false } = {}
) => {
  const errors = {};

  if (requireTypeName && !form.typeName?.trim()) {
    errors.typeName = "Type name is required.";
  }

  if (requireFormula) {
    const categoryRows = {};
    form.ageGroups.forEach((ag, ageIdx) => {
      ag.categories.forEach((cat, catIdx) => {
        const { name, formula } = normalizeCategoryRow(cat);
        if (!name.trim()) return;
        if (!String(formula || "").trim()) {
          categoryRows[`${ageIdx}-${catIdx}`] = { formula: "Formula is required." };
        }
      });
    });
    if (Object.keys(categoryRows).length) {
      errors.categoryRows = categoryRows;
    }
  }

  return errors;
};

export const hasCategoryFormErrors = (errors = {}) =>
  Boolean(errors.typeName) || Object.keys(errors.categoryRows || {}).length > 0;

export const buildPayload = (form, { namesOnly = false, requireFormula = false } = {}) => {
  const mustHaveFormula = requireFormula && !namesOnly;
  const ageGroups = form.ageGroups
    .map((ag) => ({
      label: ag.label,
      categories: ag.categories
        .map((c) => rowToPayload(c, { requireFormula: mustHaveFormula }))
        .filter(Boolean)
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

export function useCategoryFormActions(setForm, setErrors) {
  const setTypeName = useCallback(
    (value) => {
      setForm((f) => ({ ...f, typeName: value }));
      if (setErrors) {
        setErrors((e) => ({ ...e, typeName: "" }));
      }
    },
    [setForm, setErrors]
  );

  const setCategoryName = useCallback(
    (ageIdx, catIdx, value) => {
      setForm((f) => ({
        ...f,
        ageGroups: f.ageGroups.map((ag, ai) => {
          if (ai !== ageIdx) return ag;
          return {
            ...ag,
            categories: ag.categories.map((c, ci) =>
              ci === catIdx ? { ...normalizeCategoryRow(c), name: value } : c
            )
          };
        })
      }));
      if (setErrors && !String(value || "").trim()) {
        setErrors((e) => {
          const key = `${ageIdx}-${catIdx}`;
          if (!e?.categoryRows?.[key]) return e;
          const categoryRows = { ...e.categoryRows };
          delete categoryRows[key];
          return { ...e, categoryRows };
        });
      }
    },
    [setForm, setErrors]
  );

  const setCategoryFormula = useCallback(
    (ageIdx, catIdx, value) => {
      setForm((f) => ({
        ...f,
        ageGroups: f.ageGroups.map((ag, ai) => {
          if (ai !== ageIdx) return ag;
          return {
            ...ag,
            categories: ag.categories.map((c, ci) =>
              ci === catIdx ? { ...normalizeCategoryRow(c), formula: value } : c
            )
          };
        })
      }));
      if (setErrors) {
        setErrors((e) => {
          const key = `${ageIdx}-${catIdx}`;
          if (!e?.categoryRows?.[key]) return e;
          const categoryRows = { ...e.categoryRows };
          delete categoryRows[key];
          return { ...e, categoryRows };
        });
      }
    },
    [setForm, setErrors]
  );

  const addCategoryRow = useCallback(
    (ageIdx) => {
      setForm((f) => ({
        ...f,
        ageGroups: f.ageGroups.map((ag, ai) =>
          ai === ageIdx ? { ...ag, categories: [...ag.categories, { ...EMPTY_CATEGORY_ROW }] } : ag
        )
      }));
    },
    [setForm]
  );

  const removeCategoryRow = useCallback(
    (ageIdx, catIdx) => {
      setForm((f) => ({
        ...f,
        ageGroups: f.ageGroups.map((ag, ai) => {
          if (ai !== ageIdx) return ag;
          const filtered = ag.categories.filter((_, ci) => ci !== catIdx);
          return {
            ...ag,
            categories: filtered.length ? filtered : [{ ...EMPTY_CATEGORY_ROW }]
          };
        })
      }));
    },
    [setForm]
  );

  return {
    setTypeName,
    setCategoryName,
    setCategoryFormula,
    addCategoryRow,
    removeCategoryRow
  };
}
