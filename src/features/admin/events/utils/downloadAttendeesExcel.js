import ExcelJS from "exceljs";

const HEADERS = [
  "Skater name",
  "Chest no",
  "Age group",
  "Lap / round",
  "KRSA ID",
  "RSFI ID",
  "Gender",
  "Email",
  "Phone no",
  "Discipline"
];

const COLUMN_WIDTHS = [22, 12, 12, 14, 22, 14, 10, 28, 14, 24];

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

export const downloadAttendeesExcel = async ({ attendees = [], eventName = "Event" }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendees", {
    views: [{ state: "frozen", ySplit: 1 }]
  });

  sheet.columns = HEADERS.map((header, index) => ({
    header,
    key: `col${index}`,
    width: COLUMN_WIDTHS[index]
  }));

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((excelCell) => {
    excelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF6765E" }
    };
    excelCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    excelCell.alignment = { vertical: "middle", horizontal: "left" };
  });

  for (const row of attendees) {
    const excelRow = sheet.addRow([
      cell(row.fullName),
      cell(row.chestNo),
      cell(row.ageGroup),
      cell(row.lap),
      cell(row.krsaId),
      cell(row.rsfiId),
      cell(row.gender),
      cell(row.email),
      cell(row.phone),
      cell(row.discipline)
    ]);
    excelRow.eachCell((excelCell) => {
      excelCell.font = { size: 10, name: "Calibri" };
      excelCell.alignment = { vertical: "middle" };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const safeName = String(eventName)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  triggerDownload(buffer, `${safeName || "event"}-attendees.xlsx`);
};
