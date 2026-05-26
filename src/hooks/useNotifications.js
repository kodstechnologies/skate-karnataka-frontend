import { useCallback, useEffect, useState } from "react";
import { notificationApi } from "@/api/notification-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

const FCM_RECEIVED_EVENT = "fcm-notification-received";

export const useNotifications = ({ limit = 20, enabled = true } = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await notificationApi.getAll({
        page: 1,
        limit
      });

      if (response?.success) {
        setNotifications(response?.data?.notifications ?? []);
      } else {
        throw new Error(response?.message || "Failed to load notifications");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load notifications";

      setError(message);

      console.error("[Notifications]", message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isAuthenticated, limit]);

  // Initial Fetch
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const loadNotifications = async () => {
      await fetchNotifications();
    };

    loadNotifications();
  }, [enabled, isAuthenticated, fetchNotifications]);

  // FCM Push Listener
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const onPush = async () => {
      await fetchNotifications();
    };

    window.addEventListener(FCM_RECEIVED_EVENT, onPush);

    return () => {
      window.removeEventListener(FCM_RECEIVED_EVENT, onPush);
    };
  }, [enabled, isAuthenticated, fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refresh: fetchNotifications,
    hasUnread: notifications.length > 0
  };
};
