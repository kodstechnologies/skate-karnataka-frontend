import * as XLSX from "xlsx";

const ROUND_KEYS = ["1stRound", "2ndRound", "semiFinal", "final"];

const formatWinner = (entries = []) => {
  const winner = entries[0];
  if (!winner) return "-";
  const name = String(winner.fullName || "").trim() || "Unknown";
  const chest = String(winner.chestNo || "").trim();
  return chest ? `${name} (#${chest})` : name;
};

const isAttended = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "attend" || normalized === "attended" || normalized === "present";
};

const buildCategoryStats = (skatingCategories = []) => {
  const stats = new Map();

  for (const skatingCategory of skatingCategories) {
    const discipline = String(skatingCategory?.typeName || "").trim();
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      const ageGroup = String(ageGroupEntry?.label || "").trim();
      for (const category of ageGroupEntry?.categories || []) {
        const lap = String(category?.name || "").trim();
        if (!lap) continue;

        const key = `${discipline}::${ageGroup}::${lap}`;
        const skaters = Array.isArray(category?.skaters) ? category.skaters : [];
        stats.set(key, {
          discipline,
          ageGroup,
          lap,
          registered: category?.registeredCount ?? skaters.length,
          attended: skaters.filter((row) => isAttended(row?.attendanceStatus)).length
        });
      }
    }
  }

  return stats;
};

const buildDisciplineLookup = (skatingCategories = []) => {
  const lookup = new Map();
  for (const skatingCategory of skatingCategories) {
    const discipline = String(skatingCategory?.typeName || "").trim();
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      const ageGroup = String(ageGroupEntry?.label || "").trim();
      for (const category of ageGroupEntry?.categories || []) {
        const lap = String(category?.name || "").trim();
        if (!lap) continue;
        lookup.set(`${ageGroup}::${lap}`, discipline);
      }
    }
  }
  return lookup;
};

export const downloadEventReportExcel = ({ summary, competitions, eventName }) => {
  const skatingCategories = summary?.skatingCategories || [];
  const categoryStats = buildCategoryStats(skatingCategories);
  const disciplineLookup = buildDisciplineLookup(skatingCategories);

  const rows = [];
  rows.push(["Event Report"]);
  rows.push(["Event", eventName || summary?.eventName || "Event"]);
  rows.push(["Total registered", summary?.totalRegistered ?? 0]);
  rows.push([
    "Total attended",
    Array.from(categoryStats.values()).reduce((sum, row) => sum + row.attended, 0)
  ]);
  rows.push(["Total with chest no.", summary?.totalWithChestNo ?? 0]);
  rows.push([]);

  rows.push([
    "Discipline",
    "Age Group",
    "Category / Lap",
    "Registered",
    "Attended",
    "1st Round",
    "2nd Round",
    "Semi Final",
    "Final",
    "Gold (1st)",
    "Silver (2nd)",
    "Bronze (3rd)"
  ]);

  const competitionList = Array.isArray(competitions) ? competitions : [];

  for (const competition of competitionList) {
    const ageGroup = String(competition?.ageGroup || "").trim();
    for (const category of competition?.categories || []) {
      const lap = String(category?.name || "").trim();
      if (!lap) continue;

      const key = `${disciplineLookup.get(`${ageGroup}::${lap}`) || ""}::${ageGroup}::${lap}`;
      const stats = categoryStats.get(key) || {
        discipline: disciplineLookup.get(`${ageGroup}::${lap}`) || "-",
        ageGroup,
        lap,
        registered: (category?.["1stRound"] || []).length,
        attended: 0
      };

      const roundCounts = Object.fromEntries(
        ROUND_KEYS.map((roundKey) => [roundKey, (category?.[roundKey] || []).length])
      );

      rows.push([
        stats.discipline,
        ageGroup,
        lap,
        stats.registered,
        stats.attended,
        roundCounts["1stRound"],
        roundCounts["2ndRound"],
        roundCounts.semiFinal,
        roundCounts.final,
        formatWinner(category?.["1st"]),
        formatWinner(category?.["2nd"]),
        formatWinner(category?.["3rd"])
      ]);
    }
  }

  if (competitionList.length === 0 && categoryStats.size > 0) {
    for (const stats of categoryStats.values()) {
      rows.push([
        stats.discipline,
        stats.ageGroup,
        stats.lap,
        stats.registered,
        stats.attended,
        0,
        0,
        0,
        0,
        "-",
        "-",
        "-"
      ]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Event Report");

  const safeName = String(eventName || summary?.eventName || "event")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  XLSX.writeFile(workbook, `${safeName || "event"}-report.xlsx`);
};
