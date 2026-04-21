import { RequestDetailsPage } from "@/features/admin/requests/pages/RequestsShared";
import { officialRequestConfig } from "@/features/admin/requests/pages/request-configs";

export const OfficialRequestDetailsPage = () => (
  <RequestDetailsPage config={officialRequestConfig} />
);
