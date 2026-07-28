export const validateEmail = (email, isRequired = true) => {
  if (!email || !email.trim()) {
    return isRequired ? "Email is required" : "";
  }
  const trimmed = email.trim();
  // Accept any standard email (gmail, yahoo, mailinator, .in, .org, etc.)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailRegex.test(trimmed)) {
    return "Provide a valid email";
  }
  return "";
};

export const validatePhone = (phone, isRequired = true) => {
  if (!phone || !phone.trim()) {
    return isRequired ? "Phone is required" : "";
  }
  const trimmed = phone.trim();
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(trimmed)) {
    return "Phone number must be exactly 10 digits";
  }
  return "";
};

export const normalizeGender = (value, defaultValue = "male") => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (!v) return defaultValue;
  if (v === "m" || v === "male" || v === "man" || v === "boy" || v === "boys") {
    return "male";
  }
  if (v === "f" || v === "female" || v === "woman" || v === "girl" || v === "girls") {
    return "female";
  }
  if (v === "o" || v === "other") return "other";
  return v;
};

export const isValidGender = (value) =>
  ["male", "female", "other"].includes(normalizeGender(value, ""));

/** Display label for skating contexts: male → Boys, female → Girls. */
export const formatGenderLabel = (gender) => {
  const normalized = normalizeGender(gender, "");
  if (!normalized) return "-";
  if (normalized === "male") return "Boys";
  if (normalized === "female") return "Girls";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
