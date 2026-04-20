import { Navigate, Route, Routes } from "react-router-dom";
import { ClubDetailsPage } from "@/features/admin/clubs/pages/ClubDetailsPage";
import { ClubFormPage } from "@/features/admin/clubs/pages/ClubFormPage";
import { ClubsPage } from "@/features/admin/clubs/pages/ClubsPage";
import { DistrictFormPage } from "@/features/admin/districts/pages/DistrictFormPage";
import { DistrictsPage } from "@/features/admin/districts/pages/DistrictsPage";
import { EventFormPage } from "@/features/admin/events/pages/EventFormPage";
import { EventsPage } from "@/features/admin/events/pages/EventsPage";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { SkaterDetailsPage } from "@/features/admin/skaters/pages/SkaterDetailsPage";
import { SkatersPage } from "@/features/admin/skaters/pages/SkatersPage";
import { StateFormPage } from "@/features/admin/states/pages/StateFormPage";
import { StatesPage } from "@/features/admin/states/pages/StatesPage";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
        <Route path="/states" element={<StatesPage />} />
        <Route path="/states/create" element={<StateFormPage />} />
        <Route path="/states/:stateId/edit" element={<StateFormPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/districts/create" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/edit" element={<DistrictFormPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
