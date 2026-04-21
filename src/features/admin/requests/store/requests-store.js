import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `request-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const ensureString = (value) => (value === undefined || value === null ? "" : String(value));

const normalizeDocuments = (documents) => {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents.map((item) => ({
    url: ensureString(item?.url),
    name: ensureString(item?.name),
    uploadedAt: item?.uploadedAt ?? new Date().toISOString()
  }));
};

const withRequestMeta = (request) => ({
  id: request.id ?? createId(),
  status: request.status ?? "pending",
  createdAt: request.createdAt ?? new Date().toISOString(),
  ...request,
  documents: normalizeDocuments(request.documents)
});

const seedSchoolRequests = [
  {
    id: createId(),
    schoolName: "St. Mary's High School",
    board: "CBSE",
    principalName: "Asha Nair",
    schoolEmail: "stmaryschool@example.com",
    schoolContactNumber: "9876543210",
    servingFrom: "2013-06-15",
    certificatesAvailable: "yes",
    certifiedBy: "CBSE Sports Wing",
    skatingInfraAvailable: "yes",
    skatingInfraInfo: "200m asphalt ring",
    lookingForSkatingService: "yes",
    lookingForSkatingCoach: "yes",
    coachName: "Rohit Kumar",
    coachGender: "male",
    coachContact: "9988776655",
    coachCertificates: "NIS Level 1",
    documents: [{ url: "", name: "school-request.pdf" }]
  },
  {
    id: createId(),
    schoolName: "Modern Public School",
    board: "State Board",
    principalName: "Divya Rao",
    schoolEmail: "modernpublic@example.com",
    schoolContactNumber: "9765432101",
    servingFrom: "2018-01-10",
    certificatesAvailable: "no",
    certifiedBy: "",
    skatingInfraAvailable: "no",
    skatingInfraInfo: "Need setup support",
    lookingForSkatingService: "yes",
    lookingForSkatingCoach: "no",
    coachName: "",
    coachGender: "",
    coachContact: "",
    coachCertificates: "",
    documents: []
  }
].map(withRequestMeta);

const seedOfficialRequests = [
  {
    id: createId(),
    club: "",
    experience: 6,
    technicalTrainingCourse: "Level-1 Official Training",
    coachingExperience: "District meets for 4 years",
    isSkater: "yes",
    skaterDetails: "Former state-level skater",
    isOfficiating: "yes",
    officiatingDetails: "Officiated 8 district events",
    conductingClasses: "no",
    conductingClassesDetails: "",
    coaching: "yes",
    officiating: "yes",
    officialContactNumber: "9876501234",
    officialEmail: "official.one@example.com",
    documents: [{ url: "", name: "official-profile.pdf" }]
  },
  {
    id: createId(),
    club: "",
    experience: 2,
    technicalTrainingCourse: "Rules workshop",
    coachingExperience: "Beginner batches",
    isSkater: "no",
    skaterDetails: "",
    isOfficiating: "no",
    officiatingDetails: "",
    conductingClasses: "yes",
    conductingClassesDetails: "Weekend sessions",
    coaching: "yes",
    officiating: "no",
    officialContactNumber: "9123405678",
    officialEmail: "official.two@example.com",
    documents: []
  }
].map(withRequestMeta);

const seedAcademyRequests = [
  {
    id: createId(),
    clubName: "Velocity Academy",
    ROSNumber: "ROS-ACA-102",
    presidentName: "Sandeep",
    presidentNumber: "9001234567",
    secretaryName: "Kiran",
    secretaryNumber: "9007654321",
    tenacitySkaters: "12",
    recreationalSkaters: "30",
    QuadSkaters: "8",
    ProInlineSkaters: "9",
    trackAddress: "RR Nagar, Bengaluru",
    trackMeasurements: "180m",
    noOfTrainers: "5",
    trainerCertification: "NSDC Certified",
    documents: [{ url: "", name: "academy-registration.pdf" }]
  },
  {
    id: createId(),
    clubName: "Roller Edge Academy",
    ROSNumber: "",
    presidentName: "Naveen",
    presidentNumber: "9012345678",
    secretaryName: "Sowmya",
    secretaryNumber: "9098765432",
    tenacitySkaters: "9",
    recreationalSkaters: "20",
    QuadSkaters: "6",
    ProInlineSkaters: "4",
    trackAddress: "Mysuru",
    trackMeasurements: "150m",
    noOfTrainers: "3",
    trainerCertification: "",
    documents: []
  }
].map(withRequestMeta);

const updateRequestStatus = (requests, id, status) =>
  requests.map((item) => (item.id === id ? { ...item, status } : item));

const removeRequest = (requests, id) => requests.filter((item) => item.id !== id);

export const useRequestsStore = create(
  persist(
    (set) => ({
      schoolRequests: seedSchoolRequests,
      officialRequests: seedOfficialRequests,
      academyRequests: seedAcademyRequests,
      approveSchoolRequest: (id) =>
        set((state) => ({
          schoolRequests: updateRequestStatus(state.schoolRequests, id, "approved")
        })),
      rejectSchoolRequest: (id) =>
        set((state) => ({
          schoolRequests: removeRequest(state.schoolRequests, id)
        })),
      approveOfficialRequest: (id) =>
        set((state) => ({
          officialRequests: updateRequestStatus(state.officialRequests, id, "approved")
        })),
      rejectOfficialRequest: (id) =>
        set((state) => ({
          officialRequests: removeRequest(state.officialRequests, id)
        })),
      approveAcademyRequest: (id) =>
        set((state) => ({
          academyRequests: updateRequestStatus(state.academyRequests, id, "approved")
        })),
      rejectAcademyRequest: (id) =>
        set((state) => ({
          academyRequests: removeRequest(state.academyRequests, id)
        }))
    }),
    {
      name: "krsa-requests-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };
        return {
          ...nextState,
          schoolRequests: (nextState.schoolRequests ?? currentState.schoolRequests).map(
            withRequestMeta
          ),
          officialRequests: (nextState.officialRequests ?? currentState.officialRequests).map(
            withRequestMeta
          ),
          academyRequests: (nextState.academyRequests ?? currentState.academyRequests).map(
            withRequestMeta
          )
        };
      }
    }
  )
);
