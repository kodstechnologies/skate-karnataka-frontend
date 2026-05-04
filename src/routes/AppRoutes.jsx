import { Navigate, Route, Routes } from "react-router-dom";
import { ClubDetailsPage } from "@/features/admin/clubs/pages/ClubDetailsPage";
import { ClubFormPage } from "@/features/admin/clubs/pages/ClubFormPage";
import { ClubsPage } from "@/features/admin/clubs/pages/ClubsPage";
import { ClubMembersPage } from "@/features/admin/clubs/pages/ClubMembersPage";
import { ClubMemberFormPage } from "@/features/admin/clubs/pages/ClubMemberFormPage";
import { GalleryFormPage } from "@/features/admin/gallery/pages/GalleryFormPage";
import { GalleryPage } from "@/features/admin/gallery/pages/GalleryPage";
import { DistrictFormPage } from "@/features/admin/districts/pages/DistrictFormPage";
import { DistrictMemberFormPage } from "@/features/admin/districts/pages/DistrictMemberFormPage";
import { DistrictMembersPage } from "@/features/admin/districts/pages/DistrictMembersPage";
import { DistrictsPage } from "@/features/admin/districts/pages/DistrictsPage";
import { EventFormPage } from "@/features/admin/events/pages/EventFormPage";
import { EventsPage } from "@/features/admin/events/pages/EventsPage";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { OfficialsPage } from "@/features/admin/officials/pages/OfficialsPage";
import { OfficialFormPage } from "@/features/admin/officials/pages/OfficialFormPage";
import { AcademyRequestDetailsPage } from "@/features/admin/requests/pages/AcademyRequestDetailsPage";
import { AcademyRequestsPage } from "@/features/admin/requests/pages/AcademyRequestsPage";
import { OfficialRequestDetailsPage } from "@/features/admin/requests/pages/OfficialRequestDetailsPage";
import { OfficialRequestsPage } from "@/features/admin/requests/pages/OfficialRequestsPage";
import { ParentRequestDetailsPage } from "@/features/admin/requests/pages/ParentRequestDetailsPage";
import { ParentRequestsPage } from "@/features/admin/requests/pages/ParentRequestsPage";
import { SchoolRequestDetailsPage } from "@/features/admin/requests/pages/SchoolRequestDetailsPage";
import { SchoolRequestsPage } from "@/features/admin/requests/pages/SchoolRequestsPage";
import { SkaterDetailsPage } from "@/features/admin/skaters/pages/SkaterDetailsPage";
import { SkatersPage } from "@/features/admin/skaters/pages/SkatersPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/admin/pages/ProfilePage";
import { ContactUsPage } from "@/features/admin/contact-us/pages/ContactUsPage";
import { FeedbackPage } from "@/features/admin/feedback/pages/FeedbackPage";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/officials" element={<OfficialsPage />} />
        <Route path="/officials/create" element={<OfficialFormPage />} />
        <Route path="/officials/:officialId/edit" element={<OfficialFormPage />} />
        <Route path="/skaters" element={<SkatersPage />} />
        <Route path="/skaters/:skaterId" element={<SkaterDetailsPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/create" element={<ClubFormPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
        <Route path="/clubs/:clubId/edit" element={<ClubFormPage />} />
        <Route path="/clubs/:clubId/members" element={<ClubMembersPage />} />
        <Route path="/clubs/:clubId/members/create" element={<ClubMemberFormPage />} />
        <Route path="/clubs/:clubId/members/:memberId/edit" element={<ClubMemberFormPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<EventFormPage />} />
        <Route path="/events/:eventId/edit" element={<EventFormPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/create" element={<GalleryFormPage />} />
        <Route path="/gallery/:itemId/edit" element={<GalleryFormPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/districts/create" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/edit" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/members" element={<DistrictMembersPage />} />
        <Route path="/districts/:districtId/members/create" element={<DistrictMemberFormPage />} />
        <Route
          path="/districts/:districtId/members/:memberId/edit"
          element={<DistrictMemberFormPage />}
        />
        <Route path="/reports/school" element={<SchoolRequestsPage />} />
        <Route path="/reports/school/:requestId" element={<SchoolRequestDetailsPage />} />
        <Route path="/reports/official" element={<OfficialRequestsPage />} />
        <Route path="/reports/official/:requestId" element={<OfficialRequestDetailsPage />} />
        <Route path="/reports/parent" element={<ParentRequestsPage />} />
        <Route path="/reports/parent/:requestId" element={<ParentRequestDetailsPage />} />
        <Route path="/reports/academy" element={<AcademyRequestsPage />} />
        <Route path="/reports/academy/:requestId" element={<AcademyRequestDetailsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
