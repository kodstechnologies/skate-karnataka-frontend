import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `club-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const defaultClubFields = {
  clubLogin: "",
  clubName: "",
  district: "",
  krsaClubId: "",
  rosNumber: "",
  registrationAddress: "",
  rosCertificate: null,
  clubPresidentName: "",
  clubPresidentPhone: "",
  clubSecretaryName: "",
  clubSecretaryPhone: "",
  tenacitySkatersCount: "",
  recreationalSkatersCount: "",
  quadSkatersCount: "",
  proInlineSkatersCount: "",
  trackAddress: "",
  trackMeasurements: "",
  trainersCount: "",
  coachesAvailable: "",
  documents: null
};

const normalizeStoredFile = (fileValue) => {
  if (!fileValue) {
    return null;
  }

  if (typeof fileValue === "string") {
    return {
      name: fileValue,
      dataUrl: ""
    };
  }

  return {
    name: fileValue.name ?? "",
    dataUrl: fileValue.dataUrl ?? ""
  };
};

const withDefaultFields = (club) => ({
  ...defaultClubFields,
  ...club,
  rosCertificate: normalizeStoredFile(club.rosCertificate),
  documents: normalizeStoredFile(club.documents)
});

const seedClubs = [
  {
    id: createId(),
    krsaClubId: "KRSA-CLUB-001",
    clubLogin: "wheels.bengaluru",
    clubName: "Wheels of Karnataka",
    district: "Bengaluru Urban",
    rosNumber: "ROS-2022-481",
    registrationAddress: "12 Residency Road, Bengaluru",
    rosCertificate: {
      name: "ROS_2022_481.pdf",
      dataUrl: ""
    },
    clubPresidentName: "Raghav Rao",
    clubPresidentPhone: "9876543210",
    clubSecretaryName: "Lavanya Iyer",
    clubSecretaryPhone: "9845012345",
    tenacitySkatersCount: "18",
    recreationalSkatersCount: "42",
    quadSkatersCount: "12",
    proInlineSkatersCount: "14",
    trackAddress: "KRSA Practice Arena, Residency Layout",
    trackMeasurements: "200m outdoor oval",
    trainersCount: "6",
    coachesAvailable: "yes",
    documents: {
      name: "Club_affiliation_bundle.pdf",
      dataUrl: ""
    }
  },
  {
    id: createId(),
    krsaClubId: "KRSA-CLUB-002",
    clubLogin: "coastal.speed",
    clubName: "Coastal Speed Club",
    district: "Udupi",
    rosNumber: "ROS-2021-219",
    registrationAddress: "45 Coastal Road, Udupi",
    rosCertificate: {
      name: "ROS_2021_219.pdf",
      dataUrl: ""
    },
    clubPresidentName: "Meera Shetty",
    clubPresidentPhone: "9123456780",
    clubSecretaryName: "Ganesh Acharya",
    clubSecretaryPhone: "9988001122",
    tenacitySkatersCount: "10",
    recreationalSkatersCount: "28",
    quadSkatersCount: "6",
    proInlineSkatersCount: "17",
    trackAddress: "Malpe Sports Complex, Track 2",
    trackMeasurements: "300m asphalt loop",
    trainersCount: "4",
    coachesAvailable: "yes",
    documents: {
      name: "Udupi_club_documents.pdf",
      dataUrl: ""
    }
  },
  {
    id: createId(),
    krsaClubId: "KRSA-CLUB-003",
    clubLogin: "mysuru.rollers",
    clubName: "Mysuru Rollers",
    district: "Mysuru",
    rosNumber: "",
    registrationAddress: "8 Ring Road, Mysuru",
    rosCertificate: null,
    clubPresidentName: "Kavya Gowda",
    clubPresidentPhone: "9988776655",
    clubSecretaryName: "",
    clubSecretaryPhone: "",
    tenacitySkatersCount: "9",
    recreationalSkatersCount: "35",
    quadSkatersCount: "5",
    proInlineSkatersCount: "11",
    trackAddress: "",
    trackMeasurements: "",
    trainersCount: "3",
    coachesAvailable: "no",
    documents: null
  }
].map(withDefaultFields);

const buildKrsaClubId = (sequence) => `KRSA-CLUB-${String(sequence).padStart(3, "0")}`;

const normalizePayload = (payload) => ({
  clubLogin: payload.clubLogin.trim(),
  clubName: payload.clubName.trim(),
  district: payload.district.trim(),
  rosNumber: payload.rosNumber.trim(),
  registrationAddress: payload.registrationAddress.trim(),
  rosCertificate: payload.rosCertificate ? normalizeStoredFile(payload.rosCertificate) : null,
  clubPresidentName: payload.clubPresidentName.trim(),
  clubPresidentPhone: payload.clubPresidentPhone.trim(),
  clubSecretaryName: payload.clubSecretaryName.trim(),
  clubSecretaryPhone: payload.clubSecretaryPhone.trim(),
  tenacitySkatersCount: payload.tenacitySkatersCount.trim(),
  recreationalSkatersCount: payload.recreationalSkatersCount.trim(),
  quadSkatersCount: payload.quadSkatersCount.trim(),
  proInlineSkatersCount: payload.proInlineSkatersCount.trim(),
  trackAddress: payload.trackAddress.trim(),
  trackMeasurements: payload.trackMeasurements.trim(),
  trainersCount: payload.trainersCount.trim(),
  coachesAvailable: payload.coachesAvailable,
  documents: payload.documents ? normalizeStoredFile(payload.documents) : null
});

export const useClubsStore = create(
  persist(
    (set) => ({
      clubs: seedClubs,
      nextKrsaClubNumber: seedClubs.length + 1,
      addClub: (payload) =>
        set((state) => ({
          clubs: [
            {
              id: createId(),
              krsaClubId: buildKrsaClubId(state.nextKrsaClubNumber),
              ...normalizePayload(payload)
            },
            ...state.clubs
          ],
          nextKrsaClubNumber: state.nextKrsaClubNumber + 1
        })),
      updateClub: (id, payload) =>
        set((state) => ({
          clubs: state.clubs.map((club) =>
            club.id === id ? { ...club, ...normalizePayload(payload) } : club
          )
        })),
      deleteClub: (id) =>
        set((state) => ({
          clubs: state.clubs.filter((club) => club.id !== id)
        }))
    }),
    {
      name: "krsa-clubs-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };

        return {
          ...nextState,
          clubs: (nextState.clubs ?? currentState.clubs).map(withDefaultFields),
          nextKrsaClubNumber:
            nextState.nextKrsaClubNumber ?? (nextState.clubs ?? currentState.clubs).length + 1
        };
      }
    }
  )
);
