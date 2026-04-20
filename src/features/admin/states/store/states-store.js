import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `state-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const defaultStateFields = {
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

const withDefaultFields = (state) => ({ ...defaultStateFields, ...state });

const seedStates = [
  {
    id: createId(),
    stateName: "Karnataka",
    stateCode: "KA",
    headquartersAddress: "Bengaluru",
    associationName: "Karnataka Roller Skating Association",
    presidentName: "Raghav Rao",
    presidentPhone: "9876543210",
    secretaryName: "Lavanya Iyer",
    secretaryPhone: "9845012345",
    email: "info@krsa.org",
    website: "https://krsa.org",
    totalDistricts: "31",
    totalClubs: "48",
    status: "active",
    notes: "Lead state association."
  },
  {
    id: createId(),
    stateName: "Tamil Nadu",
    stateCode: "TN",
    headquartersAddress: "Chennai",
    associationName: "Tamil Nadu Skating Federation",
    presidentName: "Arun Prakash",
    presidentPhone: "9123456789",
    secretaryName: "Meena Devi",
    secretaryPhone: "9001122334",
    email: "office@tnsf.in",
    website: "",
    totalDistricts: "38",
    totalClubs: "33",
    status: "active",
    notes: ""
  }
].map(withDefaultFields);

const normalizePayload = (payload) => ({
  stateName: payload.stateName.trim(),
  stateCode: payload.stateCode.trim().toUpperCase(),
  headquartersAddress: payload.headquartersAddress.trim(),
  associationName: payload.associationName.trim(),
  presidentName: payload.presidentName.trim(),
  presidentPhone: payload.presidentPhone.trim(),
  secretaryName: payload.secretaryName.trim(),
  secretaryPhone: payload.secretaryPhone.trim(),
  email: payload.email.trim(),
  website: payload.website.trim(),
  totalDistricts: payload.totalDistricts.trim(),
  totalClubs: payload.totalClubs.trim(),
  status: payload.status,
  notes: payload.notes.trim()
});

export const useStatesStore = create(
  persist(
    (set) => ({
      states: seedStates,
      addState: (payload) =>
        set((state) => ({
          states: [{ id: createId(), ...normalizePayload(payload) }, ...state.states]
        })),
      updateState: (id, payload) =>
        set((state) => ({
          states: state.states.map((item) =>
            item.id === id ? { ...item, ...normalizePayload(payload) } : item
          )
        })),
      deleteState: (id) =>
        set((state) => ({
          states: state.states.filter((item) => item.id !== id)
        }))
    }),
    {
      name: "krsa-states-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };
        return {
          ...nextState,
          states: (nextState.states ?? currentState.states).map(withDefaultFields)
        };
      }
    }
  )
);
