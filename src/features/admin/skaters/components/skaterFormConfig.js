import {
  getSkaterDocuments,
  getSkaterProfileImage
} from "@/features/admin/skaters/utils/skater-display";

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
  districtId: "",
  districtName: "",
  clubId: "",
  clubName: "",
  clubCode: "",
  clubDistrictName: "",
  clubStatus: "",
  categoryId: "",
  categoryName: "",
  photoPreview: "",
  photoFile: null,
  existingDocuments: [],
  newDocumentFiles: [],
  removedDocumentUrls: []
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
  signature: "Signature",
  districtId: "District",
  clubId: "Club",
  categoryId: "Category"
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
  districtId: String(skater.district?._id ?? skater.district ?? ""),
  districtName:
    skater.districtDetails?.name ?? skater.districtName ?? skater.district?.name ?? "",
  clubId: String(skater.club?._id ?? skater.club ?? ""),
  clubName: skater.club?.name ?? "",
  clubCode: skater.club?.clubId ?? "",
  clubDistrictName:
    skater.club?.districtName ?? skater.club?.district?.name ?? "",
  clubStatus: skater.clubStatus ?? "",
  categoryId: String(skater.category?._id ?? skater.category ?? ""),
  categoryName: skater.category?.typeName ?? skater.categoryName ?? "",
  photoPreview: getSkaterProfileImage(skater),
  photoFile: null,
  existingDocuments: getSkaterDocuments(skater),
  newDocumentFiles: [],
  removedDocumentUrls: []
});

const appendIfPresent = (formData, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

/** Multipart payload for PATCH /admin/v1/skater/:id */
export const buildSkaterUpdateFormData = (formData) => {
  const fd = new FormData();

  appendIfPresent(fd, "fullName", formData.fullName.trim());
  appendIfPresent(fd, "phone", formData.phone.trim());
  appendIfPresent(fd, "email", formData.email.trim());
  appendIfPresent(fd, "rsfiId", formData.rsfiId.trim());
  appendIfPresent(fd, "gender", formData.gender.trim());
  appendIfPresent(fd, "address", formData.address.trim());
  appendIfPresent(fd, "parent", formData.parent.trim());
  appendIfPresent(fd, "bloodGroup", formData.bloodGroup.trim());
  appendIfPresent(fd, "school", formData.school.trim());
  appendIfPresent(fd, "grade", formData.grade.trim());
  appendIfPresent(fd, "signature", formData.signature.trim());

  if (formData.dob) {
    fd.append("dob", formData.dob);
  }

  if (formData.aadharNumber.trim()) {
    fd.append("aadharNumber", formData.aadharNumber.trim());
  }

  if (formData.districtId) {
    fd.append("district", formData.districtId);
  }

  if (formData.clubId) {
    fd.append("club", formData.clubId);
  }

  if (formData.categoryId) {
    fd.append("category", formData.categoryId);
  }

  if (formData.photoFile instanceof File) {
    fd.append("img", formData.photoFile);
  }

  (formData.newDocumentFiles || []).forEach((file) => {
    if (file instanceof File) {
      fd.append("document", file);
    }
  });

  if (formData.removedDocumentUrls?.length) {
    fd.append("removeDocumentUrls", JSON.stringify(formData.removedDocumentUrls));
  }

  return fd;
};
