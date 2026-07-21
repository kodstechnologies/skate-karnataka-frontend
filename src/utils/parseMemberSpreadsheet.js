import * as XLSX from "xlsx";
import { validateEmail, validatePhone } from "@/utils/validationHelper";

const HEADER_ALIASES = {
  fullName: ["fullname", "full name", "name", "member name", "membername"],
  email: ["email", "e-mail", "mail"],
  phone: ["phone", "mobile", "contact", "phone number", "mobilenumber"],
  address: ["address", "location", "addr"],
  designation: ["designation", "title", "role", "position"],
  gender: ["gender", "sex"]
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

const normalizeGender = (value) => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (!v) return "male";
  if (v === "m" || v === "male" || v === "man") return "male";
  if (v === "f" || v === "female" || v === "woman") return "female";
  if (v === "other" || v === "o") return "other";
  return v;
};

const normalizePhoneDigits = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

export const validateMemberImportRow = (row) => {
  const errors = [];
  if (!row.fullName?.trim()) {
    errors.push("Full name is required");
  } else if (row.fullName.trim().length < 3) {
    errors.push("Full name must be at least 3 characters");
  }

  const phoneError = validatePhone(row.phone);
  if (phoneError) errors.push(phoneError);

  const emailError = validateEmail(row.email, false);
  if (emailError) errors.push(emailError);

  const gender = normalizeGender(row.gender);
  if (!["male", "female", "other"].includes(gender)) {
    errors.push("Gender must be male, female, or other");
  }

  return errors;
};

export const mapSpreadsheetRowToMember = (row) => {
  const fullName = pickField(row, "fullName");
  const email = pickField(row, "email");
  const phone = normalizePhoneDigits(pickField(row, "phone"));
  const address = pickField(row, "address");
  const designation = pickField(row, "designation");
  const gender = normalizeGender(pickField(row, "gender"));

  const member = {
    fullName,
    email,
    phone,
    address,
    designation,
    gender
  };

  return {
    ...member,
    errors: validateMemberImportRow(member)
  };
};

export const parseMemberSpreadsheet = (file) =>
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
          .map(mapSpreadsheetRowToMember)
          .filter((row) => row.fullName || row.phone || row.email);
        resolve(mapped);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });

export const downloadMemberImportTemplate = (filename = "member-import-template.xlsx") => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Full Name", "Email", "Phone", "Address", "Designation", "Gender"],
    ["Ravi Kumar", "ravi@example.com", "9876543210", "Bengaluru, Karnataka", "Secretary", "male"]
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
  XLSX.writeFile(workbook, filename);
};

export const buildMemberFormData = (row) => {
  const fd = new FormData();
  fd.append("fullName", row.fullName.trim());
  fd.append("phone", row.phone.trim());
  if (row.email?.trim()) fd.append("email", row.email.trim());
  if (row.address?.trim()) fd.append("address", row.address.trim());
  fd.append("designation", String(row.designation || "").trim());
  fd.append("gender", normalizeGender(row.gender));
  return fd;
};
