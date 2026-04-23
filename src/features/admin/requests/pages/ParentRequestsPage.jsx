import { useEffect } from "react";
import { RequestListPage } from "@/features/admin/requests/pages/RequestsShared";
import { parentRequestConfig } from "@/features/admin/requests/pages/request-configs";
import { useRequestsStore } from "@/features/admin/requests/store/requests-store";

export const ParentRequestsPage = () => {
  return <RequestListPage config={parentRequestConfig} />;
};
