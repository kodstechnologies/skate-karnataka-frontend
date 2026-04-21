import { useRequestsStore } from "@/features/admin/requests/store/requests-store";
import academyHero from "@/assets/Academy_header.jpg";
import schoolHero from "@/assets/School_header.jpg";
import officialHero from "@/assets/Official_header.jpg";

export const schoolRequestConfig = {
  label: "School",
  basePath: "/requests/school",
  heroImage: schoolHero,
  useRequests: () => useRequestsStore((state) => state.schoolRequests),
  approve: (id) => useRequestsStore.getState().approveSchoolRequest(id),
  reject: (id) => useRequestsStore.getState().rejectSchoolRequest(id),
  listFields: [
    { key: "schoolName", label: "School Name" },
    { key: "board", label: "Board" },
    { key: "principalName", label: "Principal" },
    { key: "schoolContactNumber", label: "Contact" },
    { key: "schoolEmail", label: "Email" }
  ],
  detailFields: [
    { key: "schoolName", label: "School Name" },
    { key: "board", label: "Board" },
    { key: "principalName", label: "Principal Name" },
    { key: "schoolEmail", label: "School Email" },
    { key: "schoolContactNumber", label: "Contact Number" },
    { key: "servingFrom", label: "Serving From" },
    { key: "certificatesAvailable", label: "Certificates Available" },
    { key: "certifiedBy", label: "Certified By" },
    { key: "skatingInfraAvailable", label: "Skating Infra Available" },
    { key: "skatingInfraInfo", label: "Skating Infra Info" },
    { key: "lookingForSkatingService", label: "Looking For Skating Service" },
    { key: "lookingForSkatingCoach", label: "Looking For Skating Coach" },
    { key: "coachName", label: "Coach Name" },
    { key: "coachGender", label: "Coach Gender" },
    { key: "coachContact", label: "Coach Contact" },
    { key: "coachCertificates", label: "Coach Certificates" }
  ]
};

export const officialRequestConfig = {
  label: "Official",
  basePath: "/requests/official",
  heroImage: officialHero,
  useRequests: () => useRequestsStore((state) => state.officialRequests),
  approve: (id) => useRequestsStore.getState().approveOfficialRequest(id),
  reject: (id) => useRequestsStore.getState().rejectOfficialRequest(id),
  listFields: [
    { key: "officialEmail", label: "Official Email" },
    { key: "officialContactNumber", label: "Contact Number" },
    { key: "experience", label: "Experience" },
    { key: "isSkater", label: "Is Skater" },
    { key: "isOfficiating", label: "Is Officiating" }
  ],
  detailFields: [
    { key: "club", label: "Club" },
    { key: "experience", label: "Experience (Years)" },
    { key: "technicalTrainingCourse", label: "Technical Training Course" },
    { key: "coachingExperience", label: "Coaching Experience" },
    { key: "isSkater", label: "Is Skater" },
    { key: "skaterDetails", label: "Skater Details" },
    { key: "isOfficiating", label: "Is Officiating" },
    { key: "officiatingDetails", label: "Officiating Details" },
    { key: "conductingClasses", label: "Conducting Classes" },
    { key: "conductingClassesDetails", label: "Conducting Classes Details" },
    { key: "coaching", label: "Coaching" },
    { key: "officiating", label: "Officiating" },
    { key: "officialContactNumber", label: "Official Contact Number" },
    { key: "officialEmail", label: "Official Email" }
  ]
};

export const academyRequestConfig = {
  label: "Academy",
  basePath: "/requests/academy",
  heroImage: academyHero,
  useRequests: () => useRequestsStore((state) => state.academyRequests),
  approve: (id) => useRequestsStore.getState().approveAcademyRequest(id),
  reject: (id) => useRequestsStore.getState().rejectAcademyRequest(id),
  listFields: [
    { key: "clubName", label: "Club Name" },
    { key: "ROSNumber", label: "ROS Number" },
    { key: "presidentName", label: "President Name" },
    { key: "presidentNumber", label: "President Number" },
    { key: "secretaryName", label: "Secretary Name" }
  ],
  detailFields: [
    { key: "clubName", label: "Club Name" },
    { key: "ROSNumber", label: "ROS Number" },
    { key: "presidentName", label: "President Name" },
    { key: "presidentNumber", label: "President Number" },
    { key: "secretaryName", label: "Secretary Name" },
    { key: "secretaryNumber", label: "Secretary Number" },
    { key: "tenacitySkaters", label: "Tenacity Skaters" },
    { key: "recreationalSkaters", label: "Recreational Skaters" },
    { key: "QuadSkaters", label: "Quad Skaters" },
    { key: "ProInlineSkaters", label: "Pro Inline Skaters" },
    { key: "trackAddress", label: "Track Address" },
    { key: "trackMeasurements", label: "Track Measurements" },
    { key: "noOfTrainers", label: "No Of Trainers" },
    { key: "trainerCertification", label: "Trainer Certification" }
  ]
};
