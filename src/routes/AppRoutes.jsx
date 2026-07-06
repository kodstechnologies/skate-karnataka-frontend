import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ClubDetailsPage } from "@/features/admin/clubs/pages/ClubDetailsPage";
import { ClubEventsPage } from "@/features/admin/clubs/pages/ClubEventsPage";
import { ClubFormPage } from "@/features/admin/clubs/pages/ClubFormPage";
import { ClubsPage } from "@/features/admin/clubs/pages/ClubsPage";
import { ClubMembersPage } from "@/features/admin/clubs/pages/ClubMembersPage";
import { ClubMemberFormPage } from "@/features/admin/clubs/pages/ClubMemberFormPage";
import { MemberBulkImportPage } from "@/components/members/MemberBulkImportPage";
import { GalleryFormPage } from "@/features/admin/gallery/pages/GalleryFormPage";
import { GalleryPage } from "@/features/admin/gallery/pages/GalleryPage";
import { GalleryDetailPage } from "@/features/admin/gallery/pages/GalleryDetailPage";
import { GalleryApprovalsPage } from "@/features/admin/gallery/pages/GalleryApprovalsPage";
import { DistrictFormPage } from "@/features/admin/districts/pages/DistrictFormPage";
import { DistrictMemberFormPage } from "@/features/admin/districts/pages/DistrictMemberFormPage";
import { DistrictEventsPage } from "@/features/admin/districts/pages/DistrictEventsPage";
import { DistrictClubBulkImportPage } from "@/features/admin/districts/pages/DistrictClubBulkImportPage";
import { DistrictMembersPage } from "@/features/admin/districts/pages/DistrictMembersPage";
import { DistrictsPage } from "@/features/admin/districts/pages/DistrictsPage";
import { EventFormPage } from "@/features/admin/events/pages/EventFormPage";
import { EventsPage } from "@/features/admin/events/pages/EventsPage";
import { EventAttendeesPage } from "@/features/admin/events/pages/EventAttendeesPage";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { OfficialsPage } from "@/features/admin/officials/pages/OfficialsPage";
import { OfficialEventsPage } from "@/features/admin/officials/pages/OfficialEventsPage";
import { OfficialFormPage } from "@/features/admin/officials/pages/OfficialFormPage";
import { AcademyRequestDetailsPage } from "@/features/admin/requests/pages/AcademyRequestDetailsPage";
import { AcademyRequestsPage } from "@/features/admin/requests/pages/AcademyRequestsPage";
import { OfficialRequestDetailsPage } from "@/features/admin/requests/pages/OfficialRequestDetailsPage";
import { OfficialRequestsPage } from "@/features/admin/requests/pages/OfficialRequestsPage";
import { ParentRequestDetailsPage } from "@/features/admin/requests/pages/ParentRequestDetailsPage";
import { ParentRequestsPage } from "@/features/admin/requests/pages/ParentRequestsPage";
import { GuestRequestDetailsPage } from "@/features/admin/requests/pages/GuestRequestDetailsPage";
import { GuestRequestsPage } from "@/features/admin/requests/pages/GuestRequestsPage";
import { SchoolRequestDetailsPage } from "@/features/admin/requests/pages/SchoolRequestDetailsPage";
import { SchoolRequestsPage } from "@/features/admin/requests/pages/SchoolRequestsPage";
import { SkaterDetailsPage } from "@/features/admin/skaters/pages/SkaterDetailsPage";
import { SkaterFormPage } from "@/features/admin/skaters/pages/SkaterFormPage";
import { SkatersPage } from "@/features/admin/skaters/pages/SkatersPage";
import { ClubMediaPage } from "@/features/admin/media/pages/ClubMediaPage";
import { ClubPortalMediaPage } from "@/features/admin/media/pages/ClubPortalMediaPage";
import { DistrictMediaPage } from "@/features/admin/media/pages/DistrictMediaPage";
import { DistrictPortalMediaPage } from "@/features/admin/media/pages/DistrictPortalMediaPage";
import { StateMediaPage } from "@/features/admin/media/pages/StateMediaPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/admin/pages/ProfilePage";
import { ContactUsPage } from "@/features/admin/contact-us/pages/ContactUsPage";
import { FeedbackPage } from "@/features/admin/feedback/pages/FeedbackPage";
import { FeedbackDetailPage } from "@/features/admin/feedback/pages/FeedbackDetailPage";
import { ComplainsPage } from "@/features/admin/complains/pages/ComplainsPage";
import { ComplainDetailsPage } from "@/features/admin/complains/pages/ComplainDetailsPage";
import { DisciplineRegistryPage } from "@/features/admin/discipline-registry/pages/DisciplineRegistryPage";
import { DisciplinesPage } from "@/features/admin/disciplines/pages/DisciplinesPage";
import { DisciplineFormPage } from "@/features/admin/disciplines/pages/DisciplineFormPage";
import { DisciplineDetailPage } from "@/features/admin/disciplines/pages/DisciplineDetailPage";
import { AboutPage } from "@/features/admin/about/pages/AboutPage";
import { AboutFormPage } from "@/features/admin/about/pages/AboutFormPage";
import { AboutUsCardPage } from "@/features/admin/about/pages/AboutUsCardPage";
import { AboutUsCardFormPage } from "@/features/admin/about/pages/AboutUsCardFormPage";
import { AboutUsCardDetailPage } from "@/features/admin/about/pages/AboutUsCardDetailPage";
import { AboutUsCardMemberFormPage } from "@/features/admin/about/pages/AboutUsCardMemberFormPage";
import { CircularsPage } from "@/features/admin/circulars/pages/CircularsPage";
import { CircularFormPage } from "@/features/admin/circulars/pages/CircularFormPage";
import { CircularDetailPage } from "@/features/admin/circulars/pages/CircularDetailPage";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import CertificateManagement from "../features/admin/certification/pages/CertificateManagement";
import CertificateTemplateFormPage from "../features/admin/certification/pages/CertificateTemplateFormPage";
import NewsPage from "../features/admin/news/newsPage/NewsPage";
import { NewsDetailPage } from "../features/admin/news/newsPage/NewsDetailPage";
import { NewsFormPage } from "../features/admin/news/newsPage/NewsFormPage";
import SponsorshipPage from "../features/admin/support-hub/SponsorshipPage/SponsorshipPage";
import SponsorshipFormPage from "../features/admin/support-hub/SponsorshipPage/SponsorshipFormPage";
import DonationPage from "../features/admin/support-hub/DonationPage/DonationPage";
import DonationFormPage from "../features/admin/support-hub/DonationPage/DonationFormPage";
import { OnboardingPage } from "../features/admin/onboarding/pages/OnboardingPage";
import { OnboardingFormPage } from "../features/admin/onboarding/pages/OnboardingFormPage";
import EventCategoryPage from "../features/admin/events/pages/EventCategoryPage";
import EventCategoryFormPage from "../features/admin/events/pages/EventCategoryFormPage";
import FormulasPage from "../features/admin/events/pages/FormulasPage";
import FormulaFormPage from "../features/admin/events/pages/FormulaFormPage";
import ClubEventCategoriesPage from "../features/admin/events/pages/ClubEventCategoriesPage";
import DistrictEventCategoriesPage from "../features/admin/events/pages/DistrictEventCategoriesPage";
import OrgStandardCategoriesPage from "../features/admin/events/pages/OrgStandardCategoriesPage";
import OrgCustomCategoryPage from "../features/admin/events/pages/OrgCustomCategoryPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { ClubDashboard } from "@/features/club/pages/ClubDashboard";
import { ClubEventFormPage } from "@/features/club/pages/ClubEventFormPage";
import { ClubPortalEventsPage } from "@/features/club/pages/ClubPortalEventsPage";
import { DistrictDashboard } from "@/features/district/pages/DistrictDashboard";
import { DistrictEventFormPage } from "@/features/district/pages/DistrictEventFormPage";
import { DistrictPortalEventsPage } from "@/features/district/pages/DistrictPortalEventsPage";
import { getHomePathForRole } from "@/lib/role-navigation";

const HomeRedirect = () => {
  const role = useAuthStore((state) => state.role);
  return <Navigate to={getHomePathForRole(role)} replace />;
};

export const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        element={
          <ProtectedRoutes allowedRoles={["admin", "state", "club", "district"]}>
            <MainLayout />
          </ProtectedRoutes>
        }
      >
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/club/dashboard" element={<ClubDashboard />} />
        <Route path="/club/events" element={<ClubPortalEventsPage />} />
        <Route path="/club/events/create" element={<ClubEventFormPage />} />
        <Route path="/club/events/:eventId/attendees" element={<EventAttendeesPage />} />
        <Route path="/club/events/:eventId/edit" element={<ClubEventFormPage />} />
        <Route path="/club/media" element={<ClubPortalMediaPage />} />
        <Route path="/club/event-categories" element={<ClubEventCategoriesPage />} />
        <Route path="/club/formula" element={<FormulasPage portalMode="club" />} />
        <Route path="/club/formula/create" element={<FormulaFormPage portalMode="club" />} />
        <Route
          path="/club/formula/:formulaId/edit"
          element={<FormulaFormPage portalMode="club" />}
        />
        <Route
          path="/club/event-categories/standard"
          element={<OrgStandardCategoriesPage orgType="club" />}
        />
        <Route
          path="/club/event-categories/custom"
          element={<OrgCustomCategoryPage orgType="club" />}
        />
        <Route
          path="/club/event-categories/:categoryId/edit"
          element={<EventCategoryFormPage portalMode orgType="club" orgOverrideMode />}
        />
        <Route path="/club/members" element={<ClubMembersPage />} />
        <Route path="/club/members/create" element={<ClubMemberFormPage />} />
        <Route path="/club/members/bulk" element={<MemberBulkImportPage orgType="club" />} />
        <Route path="/club/members/:memberId/edit" element={<ClubMemberFormPage />} />
        <Route path="/district/media" element={<DistrictPortalMediaPage />} />
        <Route path="/district/event-categories" element={<DistrictEventCategoriesPage />} />
        <Route path="/district/formula" element={<FormulasPage portalMode="district" />} />
        <Route
          path="/district/formula/create"
          element={<FormulaFormPage portalMode="district" />}
        />
        <Route
          path="/district/formula/:formulaId/edit"
          element={<FormulaFormPage portalMode="district" />}
        />
        <Route
          path="/district/event-categories/standard"
          element={<OrgStandardCategoriesPage orgType="district" />}
        />
        <Route
          path="/district/event-categories/custom"
          element={<OrgCustomCategoryPage orgType="district" />}
        />
        <Route
          path="/district/event-categories/:categoryId/edit"
          element={<EventCategoryFormPage portalMode orgType="district" orgOverrideMode />}
        />
        <Route path="/district/members" element={<DistrictMembersPage />} />
        <Route path="/district/dashboard" element={<DistrictDashboard />} />
        <Route path="/district/events" element={<DistrictPortalEventsPage />} />
        <Route path="/district/events/:eventId/attendees" element={<EventAttendeesPage />} />
        <Route path="/district/events/create" element={<DistrictEventFormPage />} />
        <Route path="/district/events/:eventId/edit" element={<DistrictEventFormPage />} />
        <Route path="/district/members/create" element={<DistrictMemberFormPage />} />
        <Route
          path="/district/members/bulk"
          element={<MemberBulkImportPage orgType="district" />}
        />
        <Route path="/district/members/:memberId/edit" element={<DistrictMemberFormPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/:feedbackId" element={<FeedbackDetailPage />} />
        <Route path="/complains" element={<ComplainsPage />} />
        <Route path="/complains/:complainId" element={<ComplainDetailsPage />} />
        <Route path="/discipline" element={<DisciplineRegistryPage />} />
        <Route path="/disciplines" element={<DisciplinesPage />} />
        <Route path="/disciplines/create" element={<DisciplineFormPage />} />
        <Route path="/disciplines/:disciplineId" element={<DisciplineDetailPage />} />
        <Route path="/disciplines/:disciplineId/edit" element={<DisciplineFormPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/create" element={<AboutFormPage />} />
        <Route path="/about/edit" element={<AboutFormPage />} />
        <Route path="/about-us-card" element={<AboutUsCardPage />} />
        <Route path="/about-us-card/create" element={<AboutUsCardFormPage />} />
        <Route
          path="/about-us-card/:cardId/members/create"
          element={<AboutUsCardMemberFormPage />}
        />
        <Route
          path="/about-us-card/:cardId/members/:memberId/edit"
          element={<AboutUsCardMemberFormPage />}
        />
        <Route path="/about-us-card/:cardId/edit" element={<AboutUsCardFormPage />} />
        <Route path="/about-us-card/:cardId" element={<AboutUsCardDetailPage />} />
        <Route path="/circulars" element={<CircularsPage />} />
        <Route path="/circulars/create" element={<CircularFormPage />} />
        <Route path="/circulars/:circularId" element={<CircularDetailPage />} />
        <Route path="/circulars/:circularId/edit" element={<CircularFormPage />} />
        <Route path="/officials" element={<OfficialsPage />} />
        <Route path="/officials/create" element={<OfficialFormPage />} />
        <Route path="/officials/:officialId/events" element={<OfficialEventsPage />} />
        <Route
          path="/officials/:officialId/events/:eventId/attendees"
          element={<EventAttendeesPage />}
        />
        <Route path="/officials/:officialId/edit" element={<OfficialFormPage />} />
        <Route path="/skaters" element={<SkatersPage />} />
        <Route path="/skaters/:skaterId/edit" element={<SkaterFormPage />} />
        <Route path="/skaters/:skaterId" element={<SkaterDetailsPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/create" element={<ClubFormPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
        <Route path="/clubs/:clubId/edit" element={<ClubFormPage />} />
        <Route path="/clubs/:clubId/events" element={<ClubEventsPage />} />
        <Route path="/clubs/:clubId/events/:eventId/attendees" element={<EventAttendeesPage />} />
        <Route path="/clubs/:clubId/media" element={<ClubMediaPage />} />
        <Route path="/clubs/:clubId/members" element={<ClubMembersPage />} />
        <Route path="/clubs/:clubId/members/create" element={<ClubMemberFormPage />} />
        <Route
          path="/clubs/:clubId/members/bulk"
          element={<MemberBulkImportPage orgType="club" />}
        />
        <Route path="/clubs/:clubId/members/:memberId/edit" element={<ClubMemberFormPage />} />
        <Route path="/events/detail" element={<EventsPage />} />
        <Route path="/events/category" element={<EventCategoryPage />} />
        <Route path="/events/category/create" element={<EventCategoryFormPage />} />
        <Route path="/events/category/:categoryId/edit" element={<EventCategoryFormPage />} />
        <Route path="/events/formula" element={<FormulasPage />} />
        <Route path="/events/formula/create" element={<FormulaFormPage />} />
        <Route path="/events/formula/:formulaId/edit" element={<FormulaFormPage />} />
        <Route path="/events/create" element={<EventFormPage />} />
        <Route path="/events/:eventId/edit" element={<EventFormPage />} />
        <Route path="/events/:eventId/attendees" element={<EventAttendeesPage />} />
        <Route path="/state/media" element={<StateMediaPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/approvals" element={<GalleryApprovalsPage />} />
        <Route path="/gallery/create" element={<GalleryFormPage />} />
        <Route path="/gallery/:itemId" element={<GalleryDetailPage />} />
        <Route path="/gallery/:itemId/edit" element={<GalleryFormPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/districts/create" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/edit" element={<DistrictFormPage />} />
        <Route path="/districts/:districtId/events" element={<DistrictEventsPage />} />
        <Route
          path="/districts/:districtId/events/:eventId/attendees"
          element={<EventAttendeesPage />}
        />
        <Route path="/districts/:districtId/media" element={<DistrictMediaPage />} />
        <Route path="/districts/:districtId/members" element={<DistrictMembersPage />} />
        <Route path="/districts/:districtId/clubs/bulk" element={<DistrictClubBulkImportPage />} />
        <Route path="/districts/:districtId/members/create" element={<DistrictMemberFormPage />} />
        <Route
          path="/districts/:districtId/members/bulk"
          element={<MemberBulkImportPage orgType="district" />}
        />
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
        <Route path="/reports/guest" element={<GuestRequestsPage />} />
        <Route path="/reports/guest/:requestId" element={<GuestRequestDetailsPage />} />
        <Route path="/certification" element={<CertificateManagement />} />
        <Route path="/certification/create" element={<CertificateTemplateFormPage />} />
        <Route path="/certification/:templateId/edit" element={<CertificateTemplateFormPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/create" element={<NewsFormPage />} />
        <Route path="/news/:newsId/edit" element={<NewsFormPage />} />
        <Route path="/news/:newsId" element={<NewsDetailPage />} />
        <Route path="/support-hub/sponsorship" element={<SponsorshipPage />} />
        <Route path="/support-hub/sponsorship/create" element={<SponsorshipFormPage />} />
        <Route path="/support-hub/sponsorship/:id/edit" element={<SponsorshipFormPage />} />
        <Route path="/support-hub/donation" element={<DonationPage />} />
        <Route path="/support-hub/donation/create" element={<DonationFormPage />} />
        <Route path="/support-hub/donation/:id/edit" element={<DonationFormPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/edit" element={<OnboardingFormPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
