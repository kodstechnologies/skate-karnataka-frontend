import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { guestRequestConfig } from "@/features/admin/requests/pages/request-configs";

export const GuestRequestsPage = () => {
  return <RequestListPage config={guestRequestConfig} />;
};
