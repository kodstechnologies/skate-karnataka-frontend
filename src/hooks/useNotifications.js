import { useCallback, useEffect, useState } from "react";
import { notificationApi } from "@/api/notification-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

const FCM_RECEIVED_EVENT = "fcm-notification-received";
const DEFAULT_PAGE_SIZE = 30;

export const useNotifications = ({ pageSize = DEFAULT_PAGE_SIZE, enabled = true } = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const applyResponse = useCallback((response, { append = false } = {}) => {
    if (!response?.success) {
      throw new Error(response?.message || "Failed to load notifications");
    }

    const payload = response.data ?? {};
    const rows = payload.notifications ?? [];
    const nextPagination = payload.pagination ?? null;

    setNotifications((prev) => (append ? [...prev, ...rows] : rows));
    setPagination(nextPagination);
    setUnreadCount(
      typeof payload.unreadCount === "number"
        ? payload.unreadCount
        : rows.filter((item) => !item.isRead).length
    );
  }, []);

  const fetchNotifications = useCallback(
    async ({ page = 1, append = false, markRead = false } = {}) => {
      if (!enabled || !isAuthenticated) return;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        if (markRead) {
          try {
            await notificationApi.markAllRead();
          } catch (markErr) {
            console.warn("[Notifications] mark-all-read failed:", markErr?.message);
          }
        }

        const response = await notificationApi.getAll({
          page,
          limit: pageSize
        });

        applyResponse(response, { append });

        if (markRead) {
          setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
          setUnreadCount(0);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || "Failed to load notifications";

        setError(message);
        console.error("[Notifications]", message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [applyResponse, enabled, isAuthenticated, pageSize]
  );

  const refresh = useCallback(() => fetchNotifications({ page: 1, append: false }), [fetchNotifications]);

  const openPanel = useCallback(
    () => fetchNotifications({ page: 1, append: false, markRead: true }),
    [fetchNotifications]
  );

  const loadMore = useCallback(() => {
    const currentPage = pagination?.page ?? 1;
    const totalPages = pagination?.totalPages ?? 1;
    if (currentPage >= totalPages || isLoadingMore) return;

    fetchNotifications({ page: currentPage + 1, append: true });
  }, [fetchNotifications, isLoadingMore, pagination]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;
    refresh();
  }, [enabled, isAuthenticated, refresh]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const onPush = () => {
      refresh();
    };

    window.addEventListener(FCM_RECEIVED_EVENT, onPush);
    return () => window.removeEventListener(FCM_RECEIVED_EVENT, onPush);
  }, [enabled, isAuthenticated, refresh]);

  const hasMore =
    pagination != null && (pagination.page ?? 1) < (pagination.totalPages ?? 1);

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    openPanel,
    loadMore,
    hasMore,
    hasUnread: unreadCount > 0
  };
};
