import { lazy } from "react";

const  Login = lazy(() => import("../features/auth/pages/Login"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPAssword"));
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const SkaterDetails = lazy(() => import("../features/skaters/pages/SkaterDetails"));
const EventDetails = lazy(() => import("../features/events/pages/EventDetails"));
const ResultDetails = lazy(() => import("../features/results/pages/ResultDetails"));
const CertificationDetails = lazy(() => import("../features/certificates/pages/CertificationDetails"));
const MediaDEtails = lazy(() => import("../features/media/pages/MediaDetails"));
const CircularDetails = lazy(() => import("../features/circulars/pages/CircularDetails"));
const PaymentDetails = lazy(() => import("../features/payment/pages/PaymentDetails"));
const DistrictDetails = lazy(() => import("../features/district/pages/DistrictDetails"));
const ClubDetails = lazy(() => import("../features/clubs/pages/ClubDetails"));
const AddSkater = lazy(() => import("../features/skaters/pages/AddSkater"));
const SkaterList = lazy(() => import("../features/skaters/pages/SkaterList"));
const EditSkater = lazy(() => import("../features/skaters/pages/EditSkater"));
const AddEvent = lazy(() => import("../features/events/pages/CreateEvent"));
const EventList = lazy(() => import("../features/events/pages/EventList"));
const EditEvent = lazy(() => import("../features/events/pages/EditEvet"));
const ResultList = lazy(() => import("../features/results/pages/ResultList"));
const UploadMedia = lazy(() => import("../features/media/pages/UploadMedia"));
const EditMedia = lazy(() => import("../features/media/pages/EditMedia"));
const PaymentList = lazy(() => import("../features/payment/pages/PaymentList"));
const DistrictList = lazy(() => import("../features/district/pages/DistrictList"));
const AddDistrict = lazy(() => import("../features/district/pages/AddDistrict"));
const EditDistrict = lazy(() => import("../features/district/pages/EditDistrict"));
const AddClub = lazy(() => import("../features/clubs/pages/AddClub"));
const EditClub = lazy(() => import("../features/clubs/pages/EditClub"));
const ClubList = lazy(() => import("../features/clubs/pages/ClubList"));
const Profile = lazy(() => import("../features/profile/Profile"));

export const routes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/profile", element: <Profile /> },

  // =========================================================
  { path: "/skaters", element: <SkaterDetails /> },
  { path: "/skaters/add", element: <AddSkater /> },
  { path: "/skaters/view/:id", element: <SkaterList /> },
  { path: "/skaters/edit/:id", element: <EditSkater /> },

  // ===================================================

  { path: "/events", element: <EventDetails /> },
  { path: "/events/add", element: <AddEvent /> },
  { path: "/events/view/:id", element: <EventList /> },
  { path: "/events/edit/:id", element: <EditEvent /> },

  // ========================================================
  { path: "/results", element: <ResultDetails /> },
  { path: "/results/view/:id", element: <ResultList /> },

  // ========================================================
  { path: "/certifications", element: <CertificationDetails /> },

  // ==========================================================
  { path: "/media", element: <MediaDEtails /> },
  { path: "/media/add", element: <UploadMedia /> },
  { path: "/media/edit/:id", element: <EditMedia /> },

  // ===========================================================
  { path: "/circulars", element: <CircularDetails /> },

  // =========================================================
  { path: "/payments", element: <PaymentDetails /> },
  { path: "/payments/view/:id", element: <PaymentList /> },

  // ==========================================================
  { path: "/district", element: <DistrictDetails /> },
  { path: "/district/view/:id", element: <DistrictList /> },
  { path: "/district/add", element: <AddDistrict /> },
  { path: "/district/edit/:id", element: <EditDistrict /> },

  // =========================================================
  { path: "/clubs", element: <ClubDetails /> },
  { path: "/clubs/view/:id", element: <ClubList /> },
  { path: "/clubs/add", element: <AddClub /> },
  { path: "/clubs/edit/:id", element: <EditClub /> },

  // 404
  { path: "*", element: <div>404 Not Found</div> },
];