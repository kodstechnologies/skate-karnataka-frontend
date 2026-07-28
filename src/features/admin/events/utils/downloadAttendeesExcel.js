import ExcelJS from "exceljs";

const ASSOCIATION_NAME = "Karnataka Roller Skating Association ®";
const DATA_START_ROW = 8;
const MASTER_ENTRY_RED = "FFFF0000";
const KRSA_HEADERS = [
  "SN",
  "Race No",
  "Name",
  "Club",
  "Age Group",
  "Gender",
  "DOB",
  "RSFI NO",
  "Discipline"
];
const KRSA_WIDTHS = [5, 9, 20, 28, 11, 9, 11, 12, 18];
const THIN_BLACK = {
  top: { style: "thin", color: { argb: "FF000000" } },
  left: { style: "thin", color: { argb: "FF000000" } },
  bottom: { style: "thin", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: "FF000000" } }
};

/** Master Entry sample uses Male / Female (not Boys / Girls). */
const formatMasterEntryGender = (gender) => {
  const v = String(gender || "")
    .trim()
    .toLowerCase();
  if (!v) return "";
  if (["m", "male", "man", "boy", "boys"].includes(v)) return "Male";
  if (["f", "female", "woman", "girl", "girls"].includes(v)) return "Female";
  return String(gender).trim();
};

const cell = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
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

const ordinal = (day) => {
  const n = Number(day);
  if (!Number.isFinite(n)) return String(day || "");
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

const formatDayMonthYear = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return `${ordinal(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDatedLine = ({ eventStartDate, eventEndDate, eventAddress }) => {
  const start = eventStartDate ? formatDayMonthYear(eventStartDate) : "";
  const end = eventEndDate ? formatDayMonthYear(eventEndDate) : "";
  let datePart = "";
  if (start && end && start !== end) {
    const startDate = new Date(eventStartDate);
    const endDate = new Date(eventEndDate);
    const sameMonthYear =
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear();
    if (sameMonthYear) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      datePart = `${ordinal(startDate.getDate())} & ${ordinal(endDate.getDate())} ${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
    } else {
      datePart = `${start} & ${end}`;
    }
  } else {
    datePart = start || end;
  }

  const address = cell(eventAddress);
  if (datePart && address) return `Dated : ${datePart}, ${address}`;
  if (datePart) return `Dated : ${datePart}`;
  if (address) return `Dated : ${address}`;
  return "Dated :";
};

const parseDob = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const lapColumnKey = (discipline, lap) => `${cell(discipline)}::${cell(lap)}`.toLowerCase();

/**
 * Build one group per event Discipline, with unique lap/round columns under each.
 * Falls back to attendee discipline+lap pairs when category meta is empty.
 */
export const buildDisciplineColumns = (skatingCategories = [], attendees = []) => {
  const groups = [];
  const seenDiscipline = new Set();

  for (const skatingCategory of skatingCategories) {
    const discipline = cell(skatingCategory?.typeName);
    if (!discipline || seenDiscipline.has(discipline.toLowerCase())) continue;
    seenDiscipline.add(discipline.toLowerCase());

    const laps = [];
    const seenLap = new Set();
    for (const ageGroupEntry of skatingCategory?.ageGroups || []) {
      for (const category of ageGroupEntry?.categories || []) {
        const lap = cell(category?.name);
        if (!lap || seenLap.has(lap.toLowerCase())) continue;
        seenLap.add(lap.toLowerCase());
        laps.push(lap);
      }
    }

    if (laps.length > 0) {
      groups.push({ discipline, laps });
    }
  }

  // Any disciplines only present on attendees (not in skatingCategories meta)
  const fallback = new Map();
  for (const row of attendees) {
    const discipline = cell(row.discipline);
    const lap = cell(row.lap);
    if (!discipline || !lap) continue;
    if (seenDiscipline.has(discipline.toLowerCase())) {
      const existing = groups.find(
        (g) => g.discipline.toLowerCase() === discipline.toLowerCase()
      );
      if (
        existing &&
        !existing.laps.some((name) => name.toLowerCase() === lap.toLowerCase())
      ) {
        existing.laps.push(lap);
      }
      continue;
    }
    if (!fallback.has(discipline.toLowerCase())) {
      fallback.set(discipline.toLowerCase(), { discipline, laps: [], seen: new Set() });
    }
    const entry = fallback.get(discipline.toLowerCase());
    if (!entry.seen.has(lap.toLowerCase())) {
      entry.seen.add(lap.toLowerCase());
      entry.laps.push(lap);
    }
  }

  for (const entry of fallback.values()) {
    if (entry.laps.length > 0) {
      groups.push({ discipline: entry.discipline, laps: entry.laps });
    }
  }

  return groups;
};

const skaterGroupKey = (row) => {
  const chestNo = cell(row.chestNo);
  const krsaId = cell(row.krsaId);
  const name = cell(row.fullName).toLowerCase();
  const ageGroup = cell(row.ageGroup);
  if (chestNo) return `c:${chestNo}::${ageGroup}`;
  if (krsaId) return `k:${krsaId}::${ageGroup}`;
  return `n:${name}::${ageGroup}`;
};

const resolveCategoryLabel = (marks = {}, disciplineGroups = []) => {
  const disciplinesWithYes = [];
  for (const group of disciplineGroups) {
    const hasYes = group.laps.some(
      (lap) => marks[lapColumnKey(group.discipline, lap)]
    );
    if (hasYes) disciplinesWithYes.push(group.discipline);
  }
  if (disciplinesWithYes.length === 0) return "";
  if (disciplinesWithYes.length === 1) return disciplinesWithYes[0];
  return disciplinesWithYes.join(" / ");
};

/** Pivot flat attendee rows (one per discipline+lap) into Master Entry skater rows. */
export const buildMasterEntryRows = (attendees = [], disciplineGroups = []) => {
  const lapKeys = disciplineGroups.flatMap((group) =>
    group.laps.map((lap) => lapColumnKey(group.discipline, lap))
  );
  const groups = new Map();

  for (const row of attendees) {
    const key = skaterGroupKey(row);
    if (!groups.has(key)) {
      const marks = {};
      for (const lapKey of lapKeys) marks[lapKey] = false;
      groups.set(key, {
        chestNo: cell(row.chestNo),
        fullName: cell(row.fullName),
        clubName: cell(row.clubName),
        ageGroup: cell(row.ageGroup),
        gender: row.gender,
        dob: row.dob,
        rsfiId: cell(row.rsfiId),
        marks
      });
    }

    const group = groups.get(key);
    if (!group.clubName && row.clubName) group.clubName = cell(row.clubName);
    if (!group.dob && row.dob) group.dob = row.dob;
    if (!group.rsfiId && row.rsfiId) group.rsfiId = cell(row.rsfiId);
    if (!group.chestNo && row.chestNo) group.chestNo = cell(row.chestNo);

    const discipline = cell(row.discipline);
    const lap = cell(row.lap);
    if (!discipline || !lap) continue;

    const markKey = lapColumnKey(discipline, lap);
    if (Object.prototype.hasOwnProperty.call(group.marks, markKey)) {
      group.marks[markKey] = true;
    } else {
      // Attendee has a lap not in column meta — still record it for accuracy
      group.marks[markKey] = true;
    }
  }

  const rows = [...groups.values()].map((group) => ({
    ...group,
    category: resolveCategoryLabel(group.marks, disciplineGroups)
  }));

  rows.sort((a, b) => {
    const chestA = parseInt(String(a.chestNo || "").replace(/\D/g, ""), 10);
    const chestB = parseInt(String(b.chestNo || "").replace(/\D/g, ""), 10);
    if (Number.isFinite(chestA) && Number.isFinite(chestB) && chestA !== chestB) {
      return chestA - chestB;
    }
    return cell(a.fullName).localeCompare(cell(b.fullName), undefined, { sensitivity: "base" });
  });

  return rows;
};

const styleTitleRow = (row, lastCol, { color = "FF000000", bold = false, size = 11 } = {}) => {
  row.height = size >= 14 ? 22 : 16;
  for (let col = 1; col <= lastCol; col += 1) {
    const excelCell = row.getCell(col);
    excelCell.font = { name: "Calibri", size, bold, color: { argb: color } };
    excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }
};

const applyBorderRange = (sheet, startRow, endRow, lastCol) => {
  for (let r = startRow; r <= endRow; r += 1) {
    for (let c = 1; c <= lastCol; c += 1) {
      sheet.getRow(r).getCell(c).border = THIN_BLACK;
    }
  }
};

const lapColumnWidth = (lapName) => Math.max(8, Math.min(18, cell(lapName).length + 2));

export const downloadAttendeesExcel = async ({
  attendees = [],
  eventName = "Event",
  eventAddress = "",
  eventStartDate = null,
  eventEndDate = null,
  hostedBy = "",
  skatingCategories = []
}) => {
  const disciplineGroups = buildDisciplineColumns(skatingCategories, attendees);
  const lapColumns = disciplineGroups.flatMap((group) =>
    group.laps.map((lap) => ({
      discipline: group.discipline,
      lap,
      key: lapColumnKey(group.discipline, lap)
    }))
  );

  const lastCol = KRSA_HEADERS.length + Math.max(lapColumns.length, 1);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Master Entry", {
    views: [{ showGridLines: true }]
  });

  const widths = [
    ...KRSA_WIDTHS,
    ...(lapColumns.length > 0
      ? lapColumns.map((col) => lapColumnWidth(col.lap))
      : [10])
  ];
  sheet.columns = widths.map((width) => ({ width }));

  const titleLines = [
    ASSOCIATION_NAME,
    cell(eventName) || "Event",
    `Hosted by : ${cell(hostedBy) || ASSOCIATION_NAME}`,
    formatDatedLine({ eventStartDate, eventEndDate, eventAddress }),
    "Master Entry"
  ];

  titleLines.forEach((text, index) => {
    const rowNumber = index + 1;
    sheet.mergeCells(rowNumber, 1, rowNumber, lastCol);
    const row = sheet.getRow(rowNumber);
    row.getCell(1).value = text;
    if (index === 0) {
      styleTitleRow(row, lastCol, { size: 12 });
    } else if (index === 4) {
      styleTitleRow(row, lastCol, { color: MASTER_ENTRY_RED, size: 16 });
    } else {
      styleTitleRow(row, lastCol, { size: 11 });
    }
  });

  // Row 6: KRSA | each Discipline (one by one)
  const groupRow = sheet.getRow(6);
  groupRow.height = 18;
  sheet.mergeCells(6, 1, 6, KRSA_HEADERS.length);
  groupRow.getCell(1).value = "KRSA";

  let cursor = KRSA_HEADERS.length + 1;
  if (disciplineGroups.length === 0) {
    groupRow.getCell(cursor).value = "Discipline";
  } else {
    for (const group of disciplineGroups) {
      const start = cursor;
      const end = cursor + group.laps.length - 1;
      if (end > start) {
        sheet.mergeCells(6, start, 6, end);
      }
      groupRow.getCell(start).value = group.discipline;
      cursor = end + 1;
    }
  }

  for (let col = 1; col <= lastCol; col += 1) {
    const excelCell = groupRow.getCell(col);
    const isKrsa = col <= KRSA_HEADERS.length;
    excelCell.font = { name: "Calibri", size: isKrsa ? 11 : 8, bold: true };
    excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }

  // Row 7: KRSA field headers + lap/round names under each discipline
  const headerRow = sheet.getRow(7);
  headerRow.height = 18;
  KRSA_HEADERS.forEach((label, index) => {
    const excelCell = headerRow.getCell(index + 1);
    excelCell.value = label;
    excelCell.font = { name: "Calibri", size: index <= 4 ? 11 : 8, bold: false };
    excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });

  if (lapColumns.length === 0) {
    const excelCell = headerRow.getCell(KRSA_HEADERS.length + 1);
    excelCell.value = "Lap / round";
    excelCell.font = { name: "Calibri", size: 8 };
    excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  } else {
    lapColumns.forEach((col, index) => {
      const excelCell = headerRow.getCell(KRSA_HEADERS.length + 1 + index);
      excelCell.value = col.lap;
      excelCell.font = { name: "Calibri", size: 8 };
      excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
  }

  const masterRows = buildMasterEntryRows(attendees, disciplineGroups);

  masterRows.forEach((row, index) => {
    const excelRow = sheet.getRow(DATA_START_ROW + index);
    excelRow.height = 14;

    const dob = parseDob(row.dob);
    const values = [
      index + 1,
      row.chestNo || "",
      row.fullName || "",
      row.clubName || "",
      row.ageGroup || "",
      formatMasterEntryGender(row.gender),
      dob,
      row.rsfiId || "",
      row.category || "",
      ...lapColumns.map((col) => (row.marks?.[col.key] ? "Yes" : ""))
    ];

    if (lapColumns.length === 0) {
      values.push("");
    }

    values.forEach((value, colIndex) => {
      const excelCell = excelRow.getCell(colIndex + 1);
      excelCell.value = value;
      const larger = colIndex <= 4;
      excelCell.font = { name: "Calibri", size: larger ? 11 : 8 };
      excelCell.alignment = { vertical: "middle", horizontal: "left" };
      if (colIndex === 6 && dob) {
        excelCell.numFmt = "mm-dd-yy";
      }
    });
  });

  const lastDataRow = Math.max(DATA_START_ROW, DATA_START_ROW + masterRows.length - 1);
  applyBorderRange(sheet, 6, lastDataRow, lastCol);

  if (masterRows.length === 0) {
    applyBorderRange(sheet, 6, DATA_START_ROW, lastCol);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const safeName = String(eventName)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  triggerDownload(buffer, `${safeName || "event"}-master-entry.xlsx`);
};
