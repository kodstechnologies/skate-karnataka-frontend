export const validateEmail = (email, isRequired = true) => {
  if (!email || !email.trim()) {
    return isRequired ? "Email is required" : "";
  }
  const trimmed = email.trim();
  if (!trimmed.includes("@") || !trimmed.includes(".com")) {
    return "Email must contain '@' and '.com'";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
