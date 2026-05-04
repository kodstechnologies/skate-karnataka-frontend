export const initialClubFormValues = {
  name: "",
  district: "",
  officeAddress: "",
  about: "",
  img: null
};

export const clubFieldLabels = {
  name: "Name of club",
  district: "District",
  officeAddress: "Office Address",
  about: "About",
  img: "Club Image"
};

export const createClubFormValues = (club = {}) => ({
  name: club.name ?? "",
  district: club.districtId ?? "",
  officeAddress: club.officeAddress ?? "",
  about: club.about ?? "",
  img: null // We typically don't pre-fill files
});
