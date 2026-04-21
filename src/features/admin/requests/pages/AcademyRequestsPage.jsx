import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { academyRequestConfig } from "@/features/admin/requests/pages/request-configs";

export const AcademyRequestsPage = () => <RequestListPage config={academyRequestConfig} />;
