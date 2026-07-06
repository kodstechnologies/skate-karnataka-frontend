import * as XLSX from "xlsx";

const HEADER_ALIASES = {
  name: ["name", "club name", "clubname", "name of club"],
  officeAddress: ["address", "office address", "officeaddress", "location", "addr", "club address"],
  about: ["about", "description", "details", "about club"]
};

const normalizeHeader = (key) =>
  String(key || "")
    .trim()
    .toLowerCase();

const pickField = (row, field) => {
  const aliases = HEADER_ALIASES[field] || [];
  for (const [rawKey, value] of Object.entries(row)) {
    const key = normalizeHeader(rawKey);
    if (aliases.includes(key)) {
      return String(value ?? "").trim();
    }
  }
  return "";
};

export const validateClubImportRow = (row) => {
  const errors = [];
  if (!row.name?.trim()) {
    errors.push("Club name is required");
  } else if (row.name.trim().length < 2) {
    errors.push("Club name must be at least 2 characters");
  }
  return errors;
};

export const mapSpreadsheetRowToClub = (row) => {
  const name = pickField(row, "name");
  const officeAddress = pickField(row, "officeAddress");
  const about = pickField(row, "about");

  const club = { name, officeAddress, about };

  return {
    ...club,
    errors: validateClubImportRow(club)
  };
};

export const parseClubSpreadsheet = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve([]);
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const mapped = rawRows
          .map(mapSpreadsheetRowToClub)
          .filter((row) => row.name || row.officeAddress || row.about);
        resolve(mapped);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });

export const downloadClubImportTemplate = (filename = "club-import-template.xlsx") => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Name", "Address", "About"],
    [
      "Skate Club Bengaluru",
      "123 MG Road, Bengaluru, Karnataka",
      "Community skating club promoting inline skating."
    ]
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clubs");
  XLSX.writeFile(workbook, filename);
};

export const buildClubFormData = (row, districtId) => {
  const fd = new FormData();
  fd.append("name", row.name.trim());
  fd.append("district", districtId);
  if (row.officeAddress?.trim()) fd.append("officeAddress", row.officeAddress.trim());
  if (row.about?.trim()) fd.append("about", row.about.trim());
  return fd;
};
