import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `skater-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const defaultSkaterFields = {
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

const withDefaultFields = (skater) => ({
  ...defaultSkaterFields,
  ...skater,
  fullName: skater.fullName ?? skater.name ?? "",
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

const seedSkaters = [
  {
    id: createId(),
    krsaId: "KRSA-0001",
    fullName: "Ananya Rao",
    phone: "9876543210",
    rsfiId: "RSFI-24011",
    dob: "2010-08-14",
    aadharNumber: "123456789012",
    gender: "female",
    category: "Junior",
    discipline: "Artistic Freestyle",
    address: "12 Residency Road, Bengaluru",
    district: "Bengaluru Urban",
    club: "Wheels of Karnataka",
    parent: "Raghav Rao",
    bloodGroup: "O+",
    school: "St. Joseph's School",
    grade: "9",
    signature: ""
  },
  {
    id: createId(),
    krsaId: "KRSA-0002",
    fullName: "Vihaan Shetty",
    phone: "9123456780",
    rsfiId: "RSFI-24032",
    dob: "2007-03-05",
    aadharNumber: "234567890123",
    gender: "male",
    category: "Senior",
    discipline: "Speed Skating",
    address: "45 Coastal Road, Udupi",
    district: "Udupi",
    club: "Coastal Speed Club",
    parent: "Meera Shetty",
    bloodGroup: "B+",
    school: "MGM PU College",
    grade: "2nd PUC",
    signature: ""
  },
  {
    id: createId(),
    krsaId: "KRSA-0003",
    fullName: "Mithra Gowda",
    phone: "9988776655",
    rsfiId: "RSFI-24056",
    dob: "2011-11-22",
    aadharNumber: "345678901234",
    gender: "female",
    category: "Junior",
    discipline: "Inline Freestyle",
    address: "8 Ring Road, Mysuru",
    district: "Mysuru",
    club: "Mysuru Rollers",
    parent: "Kavya Gowda",
    bloodGroup: "A+",
    school: "Excel Public School",
    grade: "8",
    signature: ""
  },
  {
    id: createId(),
    krsaId: "KRSA-0004",
    fullName: "Advik Kulkarni",
    phone: "9001122334",
    rsfiId: "RSFI-24071",
    dob: "2005-01-18",
    aadharNumber: "456789012345",
    gender: "male",
    category: "Senior",
    discipline: "Roller Hockey",
    address: "77 Club Lane, Belagavi",
    district: "Belagavi",
    club: "Belagavi Blades",
    parent: "Prakash Kulkarni",
    bloodGroup: "AB+",
    school: "Gogte College",
    grade: "B.Com 1st Year",
    signature: ""
  },
  {
    id: createId(),
    krsaId: "KRSA-0005",
    fullName: "Saanvi Narayan",
    phone: "9345612780",
    rsfiId: "RSFI-24088",
    dob: "2009-06-09",
    aadharNumber: "567890123456",
    gender: "female",
    category: "Junior",
    discipline: "Speed Skating",
    address: "19 Lake View, Shivamogga",
    district: "Shivamogga",
    club: "Malnad Skating Academy",
    parent: "Nitin Narayan",
    bloodGroup: "O-",
    school: "National School",
    grade: "10",
    signature: ""
  },
  {
    id: createId(),
    krsaId: "KRSA-0006",
    fullName: "Ritvik Bhat",
    phone: "9871200456",
    rsfiId: "RSFI-24104",
    dob: "2003-09-27",
    aadharNumber: "678901234567",
    gender: "male",
    category: "Senior",
    discipline: "Artistic Freestyle",
    address: "22 Temple Street, Mangaluru",
    district: "Dakshina Kannada",
    club: "Mangalore Artistic Wheels",
    parent: "Shobha Bhat",
    bloodGroup: "A-",
    school: "St. Aloysius College",
    grade: "Final Year",
    signature: ""
  }
].map(withDefaultFields);

const buildKrsaId = (sequence) => `KRSA-${String(sequence).padStart(4, "0")}`;

const normalizePayload = (payload) => ({
  fullName: payload.fullName.trim(),
  phone: payload.phone.trim(),
  rsfiId: payload.rsfiId.trim(),
  dob: payload.dob,
  aadharNumber: payload.aadharNumber.trim(),
  gender: payload.gender,
  category: payload.category,
  discipline: payload.discipline.trim(),
  address: payload.address.trim(),
  district: payload.district.trim(),
  club: payload.club.trim(),
  parent: payload.parent.trim(),
  bloodGroup: payload.bloodGroup,
  school: payload.school.trim(),
  grade: payload.grade.trim(),
  signature: payload.signature.trim()
});

export const useSkatersStore = create(
  persist(
    (set) => ({
      skaters: seedSkaters,
      nextKrsaNumber: seedSkaters.length + 1,
      addSkater: (payload) =>
        set((state) => ({
          skaters: [
            {
              id: createId(),
              krsaId: buildKrsaId(state.nextKrsaNumber),
              ...normalizePayload(payload)
            },
            ...state.skaters
          ],
          nextKrsaNumber: state.nextKrsaNumber + 1
        })),
      updateSkater: (id, payload) =>
        set((state) => ({
          skaters: state.skaters.map((skater) =>
            skater.id === id ? { ...skater, ...normalizePayload(payload) } : skater
          )
        })),
      deleteSkater: (id) =>
        set((state) => ({
          skaters: state.skaters.filter((skater) => skater.id !== id)
        }))
    }),
    {
      name: "krsa-skaters-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };

        return {
          ...nextState,
          skaters: (nextState.skaters ?? currentState.skaters).map(withDefaultFields),
          nextKrsaNumber:
            nextState.nextKrsaNumber ?? (nextState.skaters ?? currentState.skaters).length + 1
        };
      }
    }
  )
);
