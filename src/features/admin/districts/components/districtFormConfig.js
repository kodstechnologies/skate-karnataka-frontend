export const districtStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export const initialDistrictFormValues = {
  districtName: "",
  districtCode: "",
  stateName: "Karnataka",
  officeAddress: "",
  coordinatorName: "",
  coordinatorPhone: "",
  assistantCoordinatorName: "",
  assistantCoordinatorPhone: "",
  totalClubs: "",
  totalSkaters: "",
  status: "active",
  notes: ""
};

export const createDistrictFormValues = (district = {}) => ({
  districtName: district.districtName ?? "",
  districtCode: district.districtCode ?? "",
  stateName: district.stateName ?? "",
  officeAddress: district.officeAddress ?? "",
  coordinatorName: district.coordinatorName ?? "",
  coordinatorPhone: district.coordinatorPhone ?? "",
  assistantCoordinatorName: district.assistantCoordinatorName ?? "",
  assistantCoordinatorPhone: district.assistantCoordinatorPhone ?? "",
  totalClubs: district.totalClubs ?? "",
  totalSkaters: district.totalSkaters ?? "",
  status: district.status ?? "active",
  notes: district.notes ?? ""
});
