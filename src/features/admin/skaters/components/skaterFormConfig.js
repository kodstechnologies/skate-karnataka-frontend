const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const initialSkaterFormValues = {
  fullName: "",
  phone: "",
  email: "",
  rsfiId: "",
  dob: "",
  aadharNumber: "",
  gender: "",
  address: "",
  parent: "",
  bloodGroup: "",
  school: "",
  grade: "",
  signature: "",
  krsaId: "",
  districtName: "",
  clubName: ""
};

export const genderOptions = ["male", "female", "other"];
export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const skaterFieldLabels = {
  fullName: "Full name",
  phone: "Phone",
  email: "Email",
  rsfiId: "RSFI ID",
  dob: "Date of birth",
  aadharNumber: "Aadhaar number",
  gender: "Gender",
  address: "Address",
  parent: "Parent / guardian",
  bloodGroup: "Blood group",
  school: "School",
  grade: "Grade",
  signature: "Signature"
};

export const createSkaterFormValues = (skater = {}) => ({
  fullName: skater.fullName ?? "",
  phone: skater.phone ?? "",
  email: skater.email ?? "",
  rsfiId: skater.rsfiId ?? "",
  dob: formatDateInput(skater.dob),
  aadharNumber: skater.aadharNumber ?? "",
  gender: skater.gender ?? "",
  address: skater.address ?? "",
  parent: skater.parent ?? "",
  bloodGroup: skater.bloodGroup ?? "",
  school: skater.school ?? "",
  grade: skater.grade ?? "",
  signature: skater.signature ?? "",
  krsaId: skater.krsaId ?? "",
  districtName:
    skater.districtDetails?.name ?? skater.districtName ?? skater.district?.name ?? "",
  clubName: skater.club?.name ?? ""
});

/** Payload for PATCH /admin/v1/skater/:id */
export const buildSkaterUpdatePayload = (formData) => {
  const payload = {
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    rsfiId: formData.rsfiId.trim(),
    gender: formData.gender.trim(),
    address: formData.address.trim(),
    parent: formData.parent.trim(),
    bloodGroup: formData.bloodGroup.trim(),
    school: formData.school.trim(),
    grade: formData.grade.trim(),
    signature: formData.signature.trim()
  };

  if (formData.dob) {
    payload.dob = formData.dob;
  }

  if (formData.aadharNumber.trim()) {
    payload.aadharNumber = formData.aadharNumber.trim();
  }

  return payload;
};
