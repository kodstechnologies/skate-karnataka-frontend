export const initialSkaterFormValues = {
  fullName: "",
  phone: "",
  rsfiId: "",
  dob: "",
  aadharNumber: "",
  gender: "",
  category: "",
  discipline: "",
  address: "",
  district: "",
  club: "",
  parent: "",
  bloodGroup: "",
  school: "",
  grade: "",
  signature: ""
};

export const genderOptions = ["male", "female", "other"];
export const categoryOptions = ["Junior", "Senior"];
export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const skaterFieldLabels = {
  fullName: "Full name",
  phone: "Phone",
  rsfiId: "RSFI ID",
  dob: "DOB",
  aadharNumber: "Aadhaar number",
  gender: "Gender",
  category: "Category",
  discipline: "Discipline",
  address: "Address",
  district: "District",
  club: "Club",
  parent: "Parent / guardian",
  bloodGroup: "Blood group",
  school: "School",
  grade: "Grade",
  signature: "Signature"
};

export const createSkaterFormValues = (skater = {}) => ({
  fullName: skater.fullName ?? "",
  phone: skater.phone ?? "",
  rsfiId: skater.rsfiId ?? "",
  dob: skater.dob ?? "",
  aadharNumber: skater.aadharNumber ?? "",
  gender: skater.gender ?? "",
  category: skater.category ?? "",
  discipline: skater.discipline ?? "",
  address: skater.address ?? "",
  district: skater.district ?? "",
  club: skater.club ?? "",
  parent: skater.parent ?? "",
  bloodGroup: skater.bloodGroup ?? "",
  school: skater.school ?? "",
  grade: skater.grade ?? "",
  signature: skater.signature ?? ""
});
