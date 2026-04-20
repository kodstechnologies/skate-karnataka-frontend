import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `district-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const defaultDistrictFields = {
  districtName: "",
  districtCode: "",
  stateName: "",
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

const withDefaultFields = (district) => ({ ...defaultDistrictFields, ...district });

const seedDistricts = [
  {
    id: createId(),
    districtName: "Bengaluru Urban",
    districtCode: "BLR-U",
    stateName: "Karnataka",
    officeAddress: "Kanteerava Sports Complex",
    coordinatorName: "Shreya Nair",
    coordinatorPhone: "9345612780",
    assistantCoordinatorName: "Vikas Rao",
    assistantCoordinatorPhone: "9871200456",
    totalClubs: "12",
    totalSkaters: "420",
    status: "active",
    notes: ""
  },
  {
    id: createId(),
    districtName: "Mysuru",
    districtCode: "MYS",
    stateName: "Karnataka",
    officeAddress: "Mysuru Sports Authority Office",
    coordinatorName: "Kiran Gowda",
    coordinatorPhone: "9988776655",
    assistantCoordinatorName: "",
    assistantCoordinatorPhone: "",
    totalClubs: "6",
    totalSkaters: "210",
    status: "active",
    notes: "Upcoming district trials."
  }
].map(withDefaultFields);

const normalizePayload = (payload) => ({
  districtName: payload.districtName.trim(),
  districtCode: payload.districtCode.trim().toUpperCase(),
  stateName: payload.stateName.trim(),
  officeAddress: payload.officeAddress.trim(),
  coordinatorName: payload.coordinatorName.trim(),
  coordinatorPhone: payload.coordinatorPhone.trim(),
  assistantCoordinatorName: payload.assistantCoordinatorName.trim(),
  assistantCoordinatorPhone: payload.assistantCoordinatorPhone.trim(),
  totalClubs: payload.totalClubs.trim(),
  totalSkaters: payload.totalSkaters.trim(),
  status: payload.status,
  notes: payload.notes.trim()
});

export const useDistrictsStore = create(
  persist(
    (set) => ({
      districts: seedDistricts,
      addDistrict: (payload) =>
        set((state) => ({
          districts: [{ id: createId(), ...normalizePayload(payload) }, ...state.districts]
        })),
      updateDistrict: (id, payload) =>
        set((state) => ({
          districts: state.districts.map((item) =>
            item.id === id ? { ...item, ...normalizePayload(payload) } : item
          )
        })),
      deleteDistrict: (id) =>
        set((state) => ({
          districts: state.districts.filter((item) => item.id !== id)
        }))
    }),
    {
      name: "krsa-districts-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };
        return {
          ...nextState,
          districts: (nextState.districts ?? currentState.districts).map(withDefaultFields)
        };
      }
    }
  )
);
