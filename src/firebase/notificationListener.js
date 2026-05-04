import { onMessage } from "firebase/messaging";
import { messagingPromise } from "./firebase";

/**
 * Registers a foreground message listener for Firebase Cloud Messaging.
 *
 * When the app is open (foreground), FCM does NOT show a system notification
 * automatically — the app must handle it via onMessage(). We use
 * serviceWorker.ready → reg.showNotification() instead of new Notification()
 * so the notification appears as a real OS-level system tray popup, consistent
 * with background notifications from the service worker.
 *
 * @returns {Function | undefined} Unsubscribe function to stop listening, or
 *   undefined if messaging is not supported in this browser.
 */
export const listenToNotifications = async () => {
  const messaging = await messagingPromise;
  if (!messaging) return undefined;

  // onMessage returns an unsubscribe function
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground notification received:", payload);

    const { title = "Notification", body = "", image } = payload?.notification ?? {};

    // Use ServiceWorkerRegistration.showNotification() for a proper system
    // tray popup (works on all OSes, consistent with background notifications).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, {
            body,
            icon: image || "/logo192.png", // falls back gracefully if icon 404s
            badge: "/logo192.png",
            tag: "fcm-foreground", // deduplicates rapid notifications
            data: payload?.data ?? {}
          });
        })
        .catch((err) => {
          console.error("[FCM] Failed to show system notification:", err);
          // Fallback: raw Notification API
          if (Notification.permission === "granted") {
            new Notification(title, { body, icon: image });
          }
        });
    } else if (Notification.permission === "granted") {
      // No service worker support — use raw Notification as last resort
      new Notification(title, { body, icon: image });
    }
  });

  return unsubscribe;
};
