import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { officialRequestConfig } from "@/features/admin/requests/pages/request-configs";

export const OfficialRequestsPage = () => <RequestListPage config={officialRequestConfig} />;
