import { useEffect } from "react";
import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { academyRequestConfig } from "@/features/admin/requests/pages/request-configs";
import { useRequestsStore } from "@/features/admin/requests/store/requests-store";

export const AcademyRequestsPage = () => {
  return <RequestListPage config={academyRequestConfig} />;
};
