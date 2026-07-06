import ExcelJS from "exceljs";

const COL_COUNT = 10;
const LAST_COL = "J";

const COLORS = {
  brand: "FFF6765E",
  brandDark: "FFD85A42",
  ink: "FF1F1412",
  inkMuted: "FF6B5B56",
  white: "FFFFFFFF",
  ageGroupBg: "FF2A2224",
  categoryBg: "FFFFF3EF",
  categoryBorder: "FFF6D4CA",
  roundBg: "FFFFF8F6",
  roundAccent: "FFFDECE7",
  tableHead: "FFF6765E",
  rowAlt: "FFFAFAFA",
  rowEven: "FFFFFFFF",
  border: "FFE8D5CE",
  borderLight: "FFF0E6E1",
  emptyText: "FF9A8A85"
};

const COMPETITION_ROUND_KEYS = [
  { key: "1stRound", label: "1st Round" },
  { key: "2ndRound", label: "2nd Round" },
  { key: "semiFinal", label: "Semi Final" },
  { key: "final", label: "Final" }
];

const MEDAL_ROUND_KEYS = [
  { key: "1st", label: "Gold — 1st Place" },
  { key: "2nd", label: "Silver — 2nd Place" },
  { key: "3rd", label: "Bronze — 3rd Place" }
];

const PLAYER_HEADERS = [
  "#",
  "Chest No",
  "Full Name",
  "KRSA ID",
  "RSFI ID",
  "Gender",
  "Attendance",
  "Payment",
  "Time",
  "Position"
];

const COLUMN_WIDTHS = [14, 12, 18, 22, 22, 22, 12, 12, 12, 10];

const SUMMARY_TABLE_HEADERS = [
  "Age Group",
  "Skaters Joined",
  "Category",
  "1st Place",
  "2nd Place",
  "3rd Place"
];

const cell = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const thinBorder = (color = COLORS.borderLight) => ({
  top: { style: "thin", color: { argb: color } },
  left: { style: "thin", color: { argb: color } },
  bottom: { style: "thin", color: { argb: color } },
  right: { style: "thin", color: { argb: color } }
});

const isAttended = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "attend" || normalized === "attended" || normalized === "present";
};

const buildCategoryStats = (skatingCategories = []) => {
  const stats = new Map();

  for (const skatingCategory of skatingCategories) {
    const discipline = cell(skatingCategory?.typeName);
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      const ageGroup = cell(ageGroupEntry?.label);
      for (const category of ageGroupEntry?.categories || []) {
        const lap = cell(category?.name);
        if (!lap) continue;

        const key = `${ageGroup}::${lap}`;
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
    const discipline = cell(skatingCategory?.typeName);
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      const ageGroup = cell(ageGroupEntry?.label);
      for (const category of ageGroupEntry?.categories || []) {
        const lap = cell(category?.name);
        if (!lap) continue;
        lookup.set(`${ageGroup}::${lap}`, discipline);
      }
    }
  }
  return lookup;
};

const buildRegisteredSkaterLookup = (skatingCategories = []) => {
  const lookup = new Map();

  for (const skatingCategory of skatingCategories) {
    const discipline = cell(skatingCategory?.typeName);
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      const ageGroup = cell(ageGroupEntry?.label);
      for (const category of ageGroupEntry?.categories || []) {
        const lap = cell(category?.name);
        for (const skater of category?.skaters || []) {
          const keys = [
            `${ageGroup}::${lap}::${cell(skater.krsaId)}`,
            `${ageGroup}::${lap}::${cell(skater.fullName).toLowerCase()}`,
            `${cell(skater.krsaId)}`,
            cell(skater.fullName).toLowerCase()
          ].filter(Boolean);

          const payload = {
            discipline,
            ageGroup,
            lap,
            chestNo: cell(skater.chestNo),
            fullName: cell(skater.fullName),
            krsaId: cell(skater.krsaId),
            rsfiId: cell(skater.rsfiId),
            gender: cell(skater.gender),
            paymentStatus: cell(skater.paymentStatus),
            attendanceStatus: cell(skater.attendanceStatus) || "pending"
          };

          for (const key of keys) {
            lookup.set(key, payload);
          }
        }
      }
    }
  }

  return lookup;
};

const enrichCompetitor = (competitor, { discipline, ageGroup, lap }, lookup) => {
  const krsaId = cell(competitor?.krsaId);
  const fullName = cell(competitor?.fullName);
  const registered =
    lookup.get(`${ageGroup}::${lap}::${krsaId}`) ||
    lookup.get(`${ageGroup}::${lap}::${fullName.toLowerCase()}`) ||
    lookup.get(krsaId) ||
    lookup.get(fullName.toLowerCase()) ||
    {};

  return {
    discipline: discipline || registered.discipline || "",
    ageGroup,
    lap,
    chestNo: cell(competitor?.chestNo) || registered.chestNo || "",
    fullName: fullName || registered.fullName || "",
    krsaId: krsaId || registered.krsaId || "",
    rsfiId: cell(competitor?.rsfiId) || registered.rsfiId || "",
    gender: registered.gender || "",
    paymentStatus: registered.paymentStatus || "",
    attendanceStatus: registered.attendanceStatus || "",
    time: cell(competitor?.time) || "-",
    position: cell(competitor?.position) || "0"
  };
};

const sortPlayers = (players, enrich) =>
  [...players].sort((left, right) => {
    const a = enrich(left);
    const b = enrich(right);
    const chestA = parseInt(a.chestNo, 10);
    const chestB = parseInt(b.chestNo, 10);
    if (Number.isFinite(chestA) && Number.isFinite(chestB) && chestA !== chestB) {
      return chestA - chestB;
    }
    return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" });
  });

const compareAgeGroup = (left, right) => {
  const parseStart = (value) => {
    const match = String(value).match(/(\d+)/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };
  const diff = parseStart(left) - parseStart(right);
  if (diff !== 0) return diff;
  return String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
};

const collectCompetitionTree = (competitions = []) => {
  const tree = new Map();

  for (const competition of competitions) {
    const ageGroup = cell(competition?.ageGroup) || "Unknown";
    if (!tree.has(ageGroup)) {
      tree.set(ageGroup, []);
    }
    for (const category of competition?.categories || []) {
      tree.get(ageGroup).push(category);
    }
  }

  return tree;
};

const styleMergedRow = (row, { fill, font, height = 24, alignment = "left" }) => {
  row.height = height;
  const cellRef = row.getCell(1);
  cellRef.value = cellRef.value ?? "";
  sheetMergeRow(row);
  row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
    if (colNumber > COL_COUNT) return;
    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    excelCell.font = font;
    excelCell.alignment = { vertical: "middle", horizontal: alignment, wrapText: true };
    excelCell.border = thinBorder(COLORS.border);
  });
};

const sheetMergeRow = (row) => {
  const rowNumber = row.number;
  row.worksheet.mergeCells(`A${rowNumber}:${LAST_COL}${rowNumber}`);
};

const styleTableHeaderRow = (row) => {
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
    if (colNumber > COL_COUNT) return;
    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.tableHead } };
    excelCell.font = { bold: true, color: { argb: COLORS.white }, size: 10, name: "Calibri" };
    excelCell.alignment = { vertical: "middle", horizontal: colNumber === 1 ? "center" : "left" };
    excelCell.border = thinBorder(COLORS.brandDark);
  });
};

const stylePlayerRow = (row, isAlt) => {
  row.height = 20;
  const fill = isAlt ? COLORS.rowAlt : COLORS.rowEven;
  row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
    if (colNumber > COL_COUNT) return;
    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    excelCell.font = { size: 10, color: { argb: COLORS.ink }, name: "Calibri" };
    excelCell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 1 ? "center" : "left",
      wrapText: colNumber === 3
    };
    excelCell.border = thinBorder(COLORS.borderLight);
  });
};

const formatPodiumName = (entries = [], enrich) => {
  const winner = entries?.[0];
  if (!winner) return "-";
  const player = enrich(winner);
  const name = player.fullName || "-";
  const chest = player.chestNo ? ` (#${player.chestNo})` : "";
  return `${name}${chest}`;
};

const buildAgeGroupSummaryData = (
  competitions,
  categoryStats,
  disciplineLookup,
  registeredLookup
) => {
  const tree = collectCompetitionTree(competitions);
  const ageGroups = [...tree.keys()].sort(compareAgeGroup);
  const groups = [];

  for (const ageGroup of ageGroups) {
    const categories = [...(tree.get(ageGroup) || [])].sort((a, b) =>
      cell(a?.name).localeCompare(cell(b?.name), undefined, { sensitivity: "base" })
    );

    const uniqueSkaters = new Set();
    const categoryRows = [];

    for (const category of categories) {
      const lap = cell(category?.name);
      if (!lap) continue;

      const discipline =
        cell(category?.skatingEventCategoryName) ||
        disciplineLookup.get(`${ageGroup}::${lap}`) ||
        "";
      const context = { discipline, ageGroup, lap };
      const enrich = (player) => enrichCompetitor(player, context, registeredLookup);

      for (const player of category?.["1stRound"] || []) {
        const enriched = enrich(player);
        uniqueSkaters.add(enriched.krsaId || enriched.fullName);
      }

      const stats = categoryStats.get(`${ageGroup}::${lap}`);
      const joined = stats?.registered ?? (category?.["1stRound"] || []).length;

      categoryRows.push({
        category: lap,
        joined,
        first: formatPodiumName(category?.["1st"], enrich),
        second: formatPodiumName(category?.["2nd"], enrich),
        third: formatPodiumName(category?.["3rd"], enrich)
      });
    }

    const totalJoined =
      uniqueSkaters.size ||
      categoryRows.reduce((sum, row) => sum + row.joined, 0);

    groups.push({ ageGroup, totalJoined, categoryRows });
  }

  return groups;
};

const styleSummaryTableHeader = (row) => {
  row.height = 24;
  row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
    if (colNumber > SUMMARY_TABLE_HEADERS.length) return;
    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.ageGroupBg } };
    excelCell.font = { bold: true, color: { argb: COLORS.white }, size: 10, name: "Calibri" };
    excelCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    excelCell.border = thinBorder(COLORS.border);
  });
};

const styleSummaryTableRow = (row, isAlt) => {
  row.height = 22;
  const fill = isAlt ? COLORS.categoryBg : COLORS.white;
  row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
    if (colNumber > SUMMARY_TABLE_HEADERS.length) return;
    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    excelCell.font = {
      size: 10,
      color: { argb: colNumber === 1 ? COLORS.ink : COLORS.ink },
      bold: colNumber === 1,
      name: "Calibri"
    };
    excelCell.alignment = {
      vertical: "middle",
      horizontal: colNumber <= 2 ? "center" : "left",
      wrapText: colNumber >= 4
    };
    excelCell.border = thinBorder(COLORS.borderLight);
  });
};

const addAgeGroupSummarySection = (
  sheet,
  competitions,
  categoryStats,
  disciplineLookup,
  registeredLookup
) => {
  const summaryGroups = buildAgeGroupSummaryData(
    competitions,
    categoryStats,
    disciplineLookup,
    registeredLookup
  );

  if (summaryGroups.length === 0) return;

  const sectionRow = sheet.addRow(["AGE GROUP SUMMARY"]);
  styleMergedRow(sectionRow, {
    fill: COLORS.brand,
    font: { bold: true, size: 12, color: { argb: COLORS.white }, name: "Calibri" },
    height: 26,
    alignment: "center"
  });

  const headerRow = sheet.addRow(SUMMARY_TABLE_HEADERS);
  styleSummaryTableHeader(headerRow);

  let rowIndex = 0;
  for (const group of summaryGroups) {
    const { ageGroup, totalJoined, categoryRows } = group;
    if (categoryRows.length === 0) {
      const row = sheet.addRow([ageGroup, totalJoined, "-", "-", "-", "-"]);
      styleSummaryTableRow(row, rowIndex % 2 === 1);
      rowIndex += 1;
      continue;
    }

    const startRow = sheet.lastRow.number + 1;

    categoryRows.forEach((catRow, catIndex) => {
      const dataRow = sheet.addRow([
        catIndex === 0 ? ageGroup : "",
        catIndex === 0 ? totalJoined : "",
        catRow.category,
        catRow.first,
        catRow.second,
        catRow.third
      ]);
      styleSummaryTableRow(dataRow, rowIndex % 2 === 1);
      rowIndex += 1;
    });

    const endRow = sheet.lastRow.number;
    if (categoryRows.length > 1) {
      sheet.mergeCells(`A${startRow}:A${endRow}`);
      sheet.mergeCells(`B${startRow}:B${endRow}`);
      const ageCell = sheet.getCell(`A${startRow}`);
      const joinedCell = sheet.getCell(`B${startRow}`);
      ageCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      joinedCell.alignment = { vertical: "middle", horizontal: "center" };
      ageCell.font = { bold: true, size: 11, color: { argb: COLORS.ink }, name: "Calibri" };
      joinedCell.font = { bold: true, size: 11, color: { argb: COLORS.brandDark }, name: "Calibri" };
    }
  }

  sheet.addRow([]);
  sheet.addRow([]);

  const detailRow = sheet.addRow(["DETAILED ROUND BREAKDOWN"]);
  styleMergedRow(detailRow, {
    fill: COLORS.roundAccent,
    font: { bold: true, size: 11, color: { argb: COLORS.brandDark }, name: "Calibri" },
    height: 24,
    alignment: "center"
  });
  sheet.addRow([]);
};

const addCoverSection = (sheet, eventLabel) => {
  const titleRow = sheet.addRow([`SKATE KARNATAKA — EVENT REPORT`]);
  styleMergedRow(titleRow, {
    fill: COLORS.brand,
    font: { bold: true, size: 16, color: { argb: COLORS.white }, name: "Calibri" },
    height: 34,
    alignment: "center"
  });

  const subtitleRow = sheet.addRow([eventLabel]);
  styleMergedRow(subtitleRow, {
    fill: COLORS.brandDark,
    font: { bold: true, size: 13, color: { argb: COLORS.white }, name: "Calibri" },
    height: 26,
    alignment: "center"
  });

  const generatedRow = sheet.addRow([
    `Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
  ]);
  styleMergedRow(generatedRow, {
    fill: COLORS.white,
    font: { size: 10, color: { argb: COLORS.inkMuted }, name: "Calibri" },
    height: 20,
    alignment: "center"
  });

  sheet.addRow([]);
};

const buildStyledWorkbook = ({
  eventLabel,
  summary,
  competitions,
  categoryStats,
  disciplineLookup,
  registeredLookup
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Skate Karnataka";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Event Report", {
    properties: { defaultRowHeight: 18 },
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 }
  });

  COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  addCoverSection(sheet, eventLabel);

  const competitionTree = collectCompetitionTree(competitions);
  const ageGroups = [...competitionTree.keys()].sort(compareAgeGroup);

  if (ageGroups.length === 0) {
    const emptyRow = sheet.addRow(["No competition data available for this event."]);
    styleMergedRow(emptyRow, {
      fill: COLORS.categoryBg,
      font: { italic: true, size: 11, color: { argb: COLORS.inkMuted }, name: "Calibri" }
    });
    return workbook;
  }

  addAgeGroupSummarySection(
    sheet,
    competitions,
    categoryStats,
    disciplineLookup,
    registeredLookup
  );

  for (const ageGroup of ageGroups) {
    const ageRow = sheet.addRow([`AGE GROUP: ${ageGroup}`]);
    styleMergedRow(ageRow, {
      fill: COLORS.ageGroupBg,
      font: { bold: true, size: 12, color: { argb: COLORS.white }, name: "Calibri" },
      height: 28
    });

    const categories = [...(competitionTree.get(ageGroup) || [])].sort((a, b) =>
      cell(a?.name).localeCompare(cell(b?.name), undefined, { sensitivity: "base" })
    );

    for (const category of categories) {
      const lap = cell(category?.name);
      if (!lap) continue;

      const discipline =
        cell(category?.skatingEventCategoryName) ||
        disciplineLookup.get(`${ageGroup}::${lap}`) ||
        "";
      const statsKey = `${ageGroup}::${lap}`;
      const stats = categoryStats.get(statsKey);
      const registeredCount = stats?.registered ?? (category?.["1stRound"] || []).length;
      const attendedCount = stats?.attended ?? 0;

      const categoryRow = sheet.addRow([`Category: ${lap}`]);
      styleMergedRow(categoryRow, {
        fill: COLORS.categoryBg,
        font: { bold: true, size: 11, color: { argb: COLORS.ink }, name: "Calibri" },
        height: 24
      });

      const metaParts = [
        discipline ? `Discipline: ${discipline}` : null,
        `Registered: ${registeredCount}`,
        `Attended: ${attendedCount}`
      ].filter(Boolean);

      const metaRow = sheet.addRow([metaParts.join("   •   ")]);
      styleMergedRow(metaRow, {
        fill: COLORS.white,
        font: { size: 10, color: { argb: COLORS.inkMuted }, name: "Calibri" },
        height: 20
      });

      const context = { discipline, ageGroup, lap };
      const enrich = (player) => enrichCompetitor(player, context, registeredLookup);
      const allRounds = [...COMPETITION_ROUND_KEYS, ...MEDAL_ROUND_KEYS];

      for (const { key, label } of allRounds) {
        const players = sortPlayers(category?.[key] || [], enrich);
        const playerLabel = players.length === 1 ? "player" : "players";

        const roundRow = sheet.addRow([`${label}  (${players.length} ${playerLabel})`]);
        styleMergedRow(roundRow, {
          fill: COLORS.roundAccent,
          font: { bold: true, size: 10, color: { argb: COLORS.brandDark }, name: "Calibri" },
          height: 22
        });

        if (players.length === 0) {
          const emptyRow = sheet.addRow(["No players in this round"]);
          styleMergedRow(emptyRow, {
            fill: COLORS.roundBg,
            font: { italic: true, size: 10, color: { argb: COLORS.emptyText }, name: "Calibri" },
            height: 18
          });
          sheet.addRow([]);
          continue;
        }

        const headerRow = sheet.addRow(PLAYER_HEADERS);
        styleTableHeaderRow(headerRow);

        players.forEach((competitor, index) => {
          const player = enrich(competitor);
          const dataRow = sheet.addRow([
            index + 1,
            player.chestNo,
            player.fullName,
            player.krsaId,
            player.rsfiId,
            player.gender,
            player.attendanceStatus || "pending",
            player.paymentStatus,
            player.time,
            player.position
          ]);
          stylePlayerRow(dataRow, index % 2 === 1);
        });

        sheet.addRow([]);
      }

      sheet.addRow([]);
    }

    sheet.addRow([]);
  }

  sheet.views = [{ state: "frozen", ySplit: 0, activeCell: "A1" }];
  return workbook;
};

const triggerDownload = (buffer, filename) => {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const downloadEventReportExcel = async ({ summary, competitions, eventName }) => {
  const skatingCategories = summary?.skatingCategories || [];
  const categoryStats = buildCategoryStats(skatingCategories);
  const disciplineLookup = buildDisciplineLookup(skatingCategories);
  const registeredLookup = buildRegisteredSkaterLookup(skatingCategories);
  const competitionList = Array.isArray(competitions) ? competitions : [];
  const eventLabel = eventName || summary?.eventName || "Event";

  const workbook = buildStyledWorkbook({
    eventLabel,
    summary,
    competitions: competitionList,
    categoryStats,
    disciplineLookup,
    registeredLookup
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const safeName = String(eventLabel)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  triggerDownload(buffer, `${safeName || "event"}-report.xlsx`);
};
