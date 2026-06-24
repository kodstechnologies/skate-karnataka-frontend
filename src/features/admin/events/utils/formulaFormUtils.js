export const FORMULA_ROUND_NAMES = [
  "1stRound",
  "2ndRound",
  "quarterFinal",
  "semiFinal",
  "final"
];

export const FORMULA_QUALIFICATION_TYPES = ["TIME", "POSITION"];

export const FORMULA_QUALIFY_PER_GROUP_VALUES = [0, 1, 2, 3];

/** Only 1stRound uses below/above threshold; other rounds use fixed qualifyCount. */
export const isFirstFormulaRound = (roundName) =>
  String(roundName || "").trim() === "1stRound";

const FORMULA_SOURCE_LABELS = {
  admin: "State",
  club: "Club",
  district: "District"
};

/** Label shown in lists and Events-Category dropdowns */
export const getFormulaDisplayName = (doc) => {
  const base =
    String(doc?.formulaName || doc?.categoryName || "").trim() || "Unnamed formula";
  const source = doc?.source ? FORMULA_SOURCE_LABELS[doc.source] || doc.source : "";
  return source ? `${base} (${source})` : base;
};

export const emptyRound = () => ({
  roundName: "1stRound",
  qualificationType: "TIME",
  minParticipants: "",
  maxParticipants: "",
  qualifyCount: "",
  qualifyCountLessThan65: "",
  qualifyCountMoreThan65: "",
  groupSize: "",
  qualifyPerGroup: ""
});

export const initialFormulaForm = () => ({
  formulaName: "",
  finalSelectionCount: "3",
  rounds: [emptyRound()]
});

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const roundToPayload = (round) => {
  const base = {
    roundName: round.roundName,
    qualificationType: round.qualificationType
  };

  if (round.qualificationType === "TIME") {
    if (isFirstFormulaRound(round.roundName)) {
      for (const key of [
        "maxParticipants",
        "qualifyCountLessThan65",
        "qualifyCountMoreThan65"
      ]) {
        const n = toNumberOrUndefined(round[key]);
        if (n !== undefined) base[key] = n;
      }
    } else {
      const n = toNumberOrUndefined(round.qualifyCount);
      if (n !== undefined) base.qualifyCount = n;
    }
  } else {
    for (const key of ["groupSize", "qualifyPerGroup", "qualifyCount"]) {
      const n = toNumberOrUndefined(round[key]);
      if (n !== undefined) base[key] = n;
    }
  }

  return base;
};

export const buildFormulaFormState = (doc) => {
  if (!doc) return initialFormulaForm();

  const rounds = Array.isArray(doc.rounds) && doc.rounds.length ? doc.rounds : [emptyRound()];

  return {
    formulaName: String(doc.formulaName || doc.categoryName || "").trim(),
    finalSelectionCount: String(doc.finalSelectionCount ?? 3),
    rounds: rounds.map((r) => {
      const roundName = r.roundName ?? "1stRound";
      const qualificationType = r.qualificationType ?? "TIME";
      const row = {
        roundName,
        qualificationType,
        minParticipants: r.minParticipants ?? "",
        maxParticipants: r.maxParticipants ?? "",
        qualifyCount: r.qualifyCount ?? "",
        qualifyCountLessThan65: r.qualifyCountLessThan65 ?? "",
        qualifyCountMoreThan65: r.qualifyCountMoreThan65 ?? "",
        groupSize: r.groupSize ?? "",
        qualifyPerGroup: (() => {
          const n = toNumberOrUndefined(r.qualifyPerGroup);
          if (n === undefined) return "";
          return FORMULA_QUALIFY_PER_GROUP_VALUES.includes(n) ? String(n) : "";
        })()
      };

      if (
        qualificationType === "TIME" &&
        !isFirstFormulaRound(roundName) &&
        !row.qualifyCount &&
        (row.qualifyCountLessThan65 || row.qualifyCountMoreThan65)
      ) {
        row.qualifyCount =
          row.qualifyCountMoreThan65 || row.qualifyCountLessThan65 || "";
      }

      return row;
    })
  };
};

export const buildFormulaPayload = (form) => ({
  formulaName: form.formulaName.trim(),
  rounds: form.rounds.map(roundToPayload),
  finalSelectionCount: toNumberOrUndefined(form.finalSelectionCount) ?? 3
});

export const validateFormulaForm = (form) => {
  const errors = {};
  if (!form.formulaName.trim()) {
    errors.formulaName = "Formula name is required.";
  }
  const finalCount = toNumberOrUndefined(form.finalSelectionCount);
  if (finalCount === undefined || finalCount < 1) {
    errors.finalSelectionCount = "Final selection count must be at least 1.";
  }

  form.rounds.forEach((round, index) => {
    if (round.qualificationType === "TIME") {
      if (isFirstFormulaRound(round.roundName)) {
        const threshold = toNumberOrUndefined(round.maxParticipants);
        const passBelow = toNumberOrUndefined(round.qualifyCountLessThan65);
        const passAtOrAbove = toNumberOrUndefined(round.qualifyCountMoreThan65);
        if (threshold === undefined || threshold < 1) {
          errors[`rounds.${index}.maxParticipants`] =
            "Skater count threshold is required for 1st round (TIME).";
        }
        if (passBelow === undefined || passBelow < 0) {
          errors[`rounds.${index}.qualifyCountLessThan65`] =
            "How many pass (below threshold) is required for 1st round.";
        }
        if (passAtOrAbove === undefined || passAtOrAbove < 0) {
          errors[`rounds.${index}.qualifyCountMoreThan65`] =
            "How many pass (at or above threshold) is required for 1st round.";
        }
      } else {
        const count = toNumberOrUndefined(round.qualifyCount);
        if (count === undefined || count < 1) {
          errors[`rounds.${index}.qualifyCount`] =
            "How many advance is required for this round (fixed number).";
        }
      }
      return;
    }

    const count = toNumberOrUndefined(round.qualifyCount);
    const perGroup = toNumberOrUndefined(round.qualifyPerGroup);
    if (count === undefined || count < 1) {
      errors[`rounds.${index}.qualifyCount`] =
        "Qualify count is required for POSITION rounds.";
    }
    if (perGroup === undefined) {
      errors[`rounds.${index}.qualifyPerGroup`] =
        "Qualify per group is required for POSITION rounds.";
    } else if (!FORMULA_QUALIFY_PER_GROUP_VALUES.includes(perGroup)) {
      errors[`rounds.${index}.qualifyPerGroup`] =
        "Qualify per group must be 0, 1, 2, or 3.";
    }
  });

  return errors;
};

export const unwrapFormulaListResponse = (res) => {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) {
    return { formulas: payload, pagination: null };
  }
  const inner = payload?.data;
  if (Array.isArray(inner)) {
    return { formulas: inner, pagination: payload?.pagination ?? null };
  }
  if (inner && Array.isArray(inner.data)) {
    return { formulas: inner.data, pagination: inner.pagination ?? payload?.pagination ?? null };
  }
  return { formulas: [], pagination: null };
};

export const unwrapFormulaDoc = (res) => res?.data ?? res;

export const getFormulaId = (item) => String(item?._id ?? item?.id ?? "");
