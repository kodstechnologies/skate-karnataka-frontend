export const initialDistrictFormValues = {
  districtName: "",
  about: "",
  officeAddress: "",
  imgFile: null, // File object for upload
  imgPreview: "" // preview URL (existing or blob)
};

export const createDistrictFormValues = (district = {}) => ({
  districtName: district.districtName ?? "",
  about: district.about ?? "",
  officeAddress: district.officeAddress ?? "",
  imgFile: null,
  imgPreview: district.img ?? ""
});
