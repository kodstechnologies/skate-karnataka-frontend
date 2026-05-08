/**
 * FCM Notification Listener — SW postMessage relay
 *
 * The SW intercepts every raw push and relays it here via FCM_PUSH_RECEIVED.
 *
 * DISPLAY STRATEGY:
 *  - OS-level system notifications are handled EXCLUSIVELY by firebase-messaging-sw.js.
 *  - This listener handles in-app background logic (logging, data refresh, etc.).
 *  - No UI popups (toasts) are shown here to keep the experience clean.
 */
export const listenToNotifications = () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("[FCM] ServiceWorker not supported — cannot listen for push relay.");
    return undefined;
  }

  const handleSWMessage = async (event) => {
    // Ignore non-FCM messages (Vite HMR, workbox, etc.)
    if (!event.data || event.data.type !== "FCM_PUSH_RECEIVED") return;

    const { payload, title, body } = event.data;

    // ── Console log ──────────────────────────────────────────────────────
    console.log("🔔 [FCM] *** PUSH MESSAGE RECEIVED (Relay) ***");
    console.log("[FCM] Title  :", title);
    console.log("[FCM] Body   :", body);
    console.log("[FCM] Payload:", payload);
    console.log("─────────────────────────────────────────────────────");

    // Note: Toasts were removed per user request to rely solely on System Notifications.
  };

  navigator.serviceWorker.addEventListener("message", handleSWMessage);
  console.log("[FCM] ✅ Push relay listener ACTIVE — logging incoming events.");

  return () => {
    navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    console.log("[FCM] Push relay listener removed.");
  };
};
