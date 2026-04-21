import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { schoolRequestConfig } from "@/features/admin/requests/pages/request-configs";

export const SchoolRequestsPage = () => <RequestListPage config={schoolRequestConfig} />;
