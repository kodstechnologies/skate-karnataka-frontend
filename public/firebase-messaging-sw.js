/**
 * FCM Service Worker — Standalone Push Handler
 *
 * WHY we removed Firebase compat SDK from here:
 *   Firebase compat SDK suppresses onMessage() in the page when the backend
 *   sends a notification-type payload (notification: { title, body } block).
 *   It silently routes it to its own internal handler instead.
 *   Since we cannot change the backend payload, we bypass Firebase's routing
 *   entirely by handling the raw `push` event ourselves.
 *
 * WHAT this SW does for every push (foreground OR background):
 *   1. Parses the raw payload
 *   2. Relays it to every open page tab via postMessage → page logs it
 *   3. Always shows an OS-level system notification
 *
 * getToken() on the page still works perfectly — it only needs the SW
 * registration for push subscription, not Firebase code inside the SW.
 */

// ── SW Lifecycle ──────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[FCM-SW] Installing — skipWaiting()");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("[FCM-SW] Activated — claiming all clients");
  event.waitUntil(self.clients.claim());
});

// ── Push Handler ──────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  console.log("[FCM-SW] 🔔 Push event received");

  // Parse the raw payload — FCM sends JSON
  let payload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { data: { body: event.data?.text() ?? "" } };
  }

  console.log("[FCM-SW] Raw payload:", JSON.stringify(payload));

  // Normalise fields — support both notification-type and data-only payloads
  const notif = payload.notification ?? {};
  const data = payload.data ?? {};

  const title = notif.title || data.title || "New Notification";
  const body = notif.body || data.body || "";
  // Use icon only if the payload provides a real URL.
  // Do NOT fall back to "/logo192.png" — that file does not exist in public/
  // and Chrome silently suppresses showNotification() when the URL returns 404.
  const icon = notif.image || data.image || null;

  event.waitUntil(
    (async () => {
      // Find all open tabs
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });
      let isAnyClientVisible = false;

      // 1. Relay to all open tabs for foreground UI (toasts) and background logic
      if (windowClients.length > 0) {
        console.log(`[FCM-SW] Relaying to ${windowClients.length} open tab(s).`);
        windowClients.forEach((client) => {
          if (client.visibilityState === "visible") {
            isAnyClientVisible = true;
          }
          client.postMessage({ type: "FCM_PUSH_RECEIVED", payload, title, body, icon });
        });
      }

      // 2. Only show OS-level system notification if NO client is actively visible
      // This prevents annoying double-notifications and OS-level suppression
      // from completely hiding the notification when the user is using the app.
      if (!isAnyClientVisible) {
        try {
          await self.registration.showNotification(title, {
            body,
            ...(icon && { icon }),
            tag: `fcm-${Date.now()}`, // Unique tag per message
            requireInteraction: true,
            data: { ...data, url: "/" }
          });
          console.log("[FCM-SW] ✅ System notification shown:", title);
        } catch (err) {
          console.error("[FCM-SW] ❌ showNotification() FAILED:", err);
        }
      } else {
        console.log(
          "[FCM-SW] 🚫 System notification skipped (App is actively visible in foreground)."
        );
      }
    })()
  );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
