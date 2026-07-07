import * as XLSX from "xlsx";
import {
  validateEmail,
  validatePhone,
  normalizeGender,
  isValidGender
} from "@/utils/validationHelper";

const HEADER_ALIASES = {
  fullName: ["fullname", "full name", "name", "skater name", "skatername"],
  email: ["email", "e-mail", "mail"],
  phone: ["phone", "mobile", "contact", "contact no", "contact number", "phonenumber"],
  address: ["address", "location", "addr"],
  gender: ["gender", "sex"],
  district: ["district", "district name", "districtname"]
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

const normalizePhoneDigits = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

const buildDistrictLookup = (districts = []) => {
  const lookup = new Map();
  for (const district of districts) {
    const id = district._id || district.id;
    const name = String(district.name || district.districtName || "").trim();
    if (!id || !name) continue;
    lookup.set(name.toLowerCase(), { id, name });
  }
  return lookup;
};

export const resolveDistrictFromInput = (value, districtLookup) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return { districtId: "", districtName: "", error: null };

  const byName = districtLookup.get(trimmed.toLowerCase());
  if (byName) {
    return { districtId: byName.id, districtName: byName.name, error: null };
  }

  if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    for (const entry of districtLookup.values()) {
      if (String(entry.id) === trimmed) {
        return { districtId: entry.id, districtName: entry.name, error: null };
      }
    }
    return { districtId: trimmed, districtName: "", error: null };
  }

  return { districtId: "", districtName: trimmed, error: `District "${trimmed}" not found` };
};

export const validateSkaterImportRow = (row, districtLookup) => {
  const errors = [];
  if (!row.fullName?.trim()) {
    errors.push("Full name is required");
  } else if (row.fullName.trim().length < 3) {
    errors.push("Full name must be at least 3 characters");
  }

  const phoneError = validatePhone(row.phone);
  if (phoneError) errors.push(phoneError);

  const emailError = validateEmail(row.email, true);
  if (emailError) errors.push(emailError);

  if (!row.address?.trim()) {
    errors.push("Address is required");
  } else if (row.address.trim().length < 5) {
    errors.push("Address must be at least 5 characters");
  }

  const gender = normalizeGender(row.gender);
  if (!isValidGender(row.gender)) {
    errors.push("Gender must be male/Male/MALE, female/Female/FEMALE, or other/Other/OTHER");
  }

  const districtResult = resolveDistrictFromInput(row.districtInput, districtLookup);
  if (districtResult.error) {
    errors.push(districtResult.error);
  }

  return {
    errors,
    gender,
    districtId: districtResult.districtId,
    districtName: districtResult.districtName
  };
};

export const mapSpreadsheetRowToSkater = (row, districtLookup) => {
  const fullName = pickField(row, "fullName");
  const email = pickField(row, "email");
  const phone = normalizePhoneDigits(pickField(row, "phone"));
  const address = pickField(row, "address");
  const districtInput = pickField(row, "district");
  const genderInput = pickField(row, "gender");

  const skater = {
    fullName,
    email,
    phone,
    address,
    districtInput,
    gender: normalizeGender(genderInput)
  };

  const validation = validateSkaterImportRow(skater, districtLookup);

  return {
    ...skater,
    gender: validation.gender,
    districtId: validation.districtId,
    districtName: validation.districtName,
    errors: validation.errors
  };
};

export const parseSkaterSpreadsheet = (file, districts = []) =>
  new Promise((resolve, reject) => {
    const districtLookup = buildDistrictLookup(districts);
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
          .map((row) => mapSpreadsheetRowToSkater(row, districtLookup))
          .filter((row) => row.fullName || row.phone || row.email || row.districtInput);
        resolve(mapped);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });

export const downloadSkaterImportTemplate = (filename = "skater-import-template.xlsx") => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Full Name", "Email", "Contact No", "Address", "Gender", "District"],
    ["Ravi Kumar", "ravi@example.com", "9876543210", "Bengaluru, Karnataka", "Male", ""]
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Skaters");
  XLSX.writeFile(workbook, filename);
};

export const buildSkaterCreatePayload = (row) => {
  const payload = {
    fullName: row.fullName.trim(),
    phone: row.phone.trim(),
    email: row.email.trim(),
    address: row.address.trim(),
    gender: normalizeGender(row.gender)
  };

  const district = String(row.districtId || row.districtInput || "").trim();
  if (district) {
    payload.district = district;
  }

  return payload;
};
