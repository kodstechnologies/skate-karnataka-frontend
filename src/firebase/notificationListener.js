import toast from "react-hot-toast";

/**
 * FCM Notification Listener — SW postMessage relay
 *
 * The SW intercepts every raw push and relays it here via FCM_PUSH_RECEIVED.
 *
 * DISPLAY STRATEGY:
 *  - OS-level system notifications are handled EXCLUSIVELY by firebase-messaging-sw.js.
 *  - This listener handles in-app background logic (logging, data refresh, etc.).
 *  - If the app is actively in focus, the SW skips the OS notification,
 *    and this listener shows an in-app toast instead to ensure visibility.
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

    // Display in-app toast if the app is currently in the foreground
    if (document.visibilityState === "visible") {
      toast(`${title}\n${body}`, {
        duration: 5000,
        position: "top-right",
        icon: "🔔"
      });
    }
  };

  navigator.serviceWorker.addEventListener("message", handleSWMessage);
  console.log("[FCM] ✅ Push relay listener ACTIVE — logging incoming events.");

  return () => {
    navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    console.log("[FCM] Push relay listener removed.");
  };
};
