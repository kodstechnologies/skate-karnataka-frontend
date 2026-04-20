export const stateStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export const initialStateFormValues = {
  stateName: "",
  stateCode: "",
  headquartersAddress: "",
  associationName: "",
  presidentName: "",
  presidentPhone: "",
  secretaryName: "",
  secretaryPhone: "",
  email: "",
  website: "",
  totalDistricts: "",
  totalClubs: "",
  status: "active",
  notes: ""
};

export const createStateFormValues = (state = {}) => ({
  stateName: state.stateName ?? "",
  stateCode: state.stateCode ?? "",
  headquartersAddress: state.headquartersAddress ?? "",
  associationName: state.associationName ?? "",
  presidentName: state.presidentName ?? "",
  presidentPhone: state.presidentPhone ?? "",
  secretaryName: state.secretaryName ?? "",
  secretaryPhone: state.secretaryPhone ?? "",
  email: state.email ?? "",
  website: state.website ?? "",
  totalDistricts: state.totalDistricts ?? "",
  totalClubs: state.totalClubs ?? "",
  status: state.status ?? "active",
  notes: state.notes ?? ""
});
