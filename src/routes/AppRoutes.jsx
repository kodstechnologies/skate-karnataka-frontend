import { Navigate, Route, Routes } from "react-router-dom";
import { ClubDetailsPage } from "@/features/admin/clubs/pages/ClubDetailsPage";
import { ClubFormPage } from "@/features/admin/clubs/pages/ClubFormPage";
import { ClubsPage } from "@/features/admin/clubs/pages/ClubsPage";
import { CircularFormPage } from "@/features/admin/circulars/pages/CircularFormPage";
import { CircularsPage } from "@/features/admin/circulars/pages/CircularsPage";
import { DistrictFormPage } from "@/features/admin/districts/pages/DistrictFormPage";
import { DistrictsPage } from "@/features/admin/districts/pages/DistrictsPage";
import { EventFormPage } from "@/features/admin/events/pages/EventFormPage";
import { EventsPage } from "@/features/admin/events/pages/EventsPage";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { AcademyRequestDetailsPage } from "@/features/admin/requests/pages/AcademyRequestDetailsPage";
import { AcademyRequestsPage } from "@/features/admin/requests/pages/AcademyRequestsPage";
import { OfficialRequestDetailsPage } from "@/features/admin/requests/pages/OfficialRequestDetailsPage";
import { OfficialRequestsPage } from "@/features/admin/requests/pages/OfficialRequestsPage";
import { SchoolRequestDetailsPage } from "@/features/admin/requests/pages/SchoolRequestDetailsPage";
import { SchoolRequestsPage } from "@/features/admin/requests/pages/SchoolRequestsPage";
import { SkaterDetailsPage } from "@/features/admin/skaters/pages/SkaterDetailsPage";
import { SkatersPage } from "@/features/admin/skaters/pages/SkatersPage";
import { StateFormPage } from "@/features/admin/states/pages/StateFormPage";
import { StatesPage } from "@/features/admin/states/pages/StatesPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/skaters" element={<SkatersPage />} />
        <Route path="/skaters/:skaterId" element={<SkaterDetailsPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/create" element={<ClubFormPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
        <Route path="/clubs/:clubId/edit" element={<ClubFormPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<EventFormPage />} />
        <Route path="/events/:eventId/edit" element={<EventFormPage />} />
        <Route path="/circulars" element={<CircularsPage />} />
        <Route path="/circulars/create" element={<CircularFormPage />} />
        <Route path="/circulars/:circularId/edit" element={<CircularFormPage />} />
        <Route path="/states" element={<StatesPage />} />
        <Route path="/states/create" element={<StateFormPage />} />
        <Route path="/states/:stateId/edit" element={<StateFormPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/districts/create" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/edit" element={<DistrictFormPage />} />
        <Route path="/requests/school" element={<SchoolRequestsPage />} />
        <Route path="/requests/school/:requestId" element={<SchoolRequestDetailsPage />} />
        <Route path="/requests/official" element={<OfficialRequestsPage />} />
        <Route path="/requests/official/:requestId" element={<OfficialRequestDetailsPage />} />
        <Route path="/requests/academy" element={<AcademyRequestsPage />} />
        <Route path="/requests/academy/:requestId" element={<AcademyRequestDetailsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
