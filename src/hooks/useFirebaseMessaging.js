import { useEffect } from "react";
import { getFCMToken } from "@/firebase/fcm";
import { listenToNotifications } from "@/firebase/notificationListener";
import { authApi } from "@/api/auth-api";

/**
 * useFirebaseMessaging
 *
 * Sets up Firebase Cloud Messaging for the authenticated session:
 *   1. If a cached FCM token exists in localStorage → skip generation,
 *      go straight to registering the foreground message listener.
 *   2. If no cached token exists (e.g. first login on a new device, or
 *      localStorage was cleared) → generate a new token, sync it to the
 *      backend, cache it, then register the listener.
 *
 * This hook must be called inside a protected/authenticated layout so that:
 *   - The foreground onMessage listener is active for every authenticated page.
 *   - No listener is registered before the user is logged in.
 *
 * Background notifications (app minimized / tab closed) are handled
 * automatically by firebase-messaging-sw.js — no extra code needed here.
 */
export const useFirebaseMessaging = () => {
  useEffect(() => {
    let unsubscribe = null;

    const setup = async () => {
      try {
        // ── 1. Ensure we have an FCM token ───────────────────────────────
        const cachedToken = localStorage.getItem("fcm_token");

        if (!cachedToken) {
          // No token — generate one (will prompt for Notification permission
          // if not already granted).
          const token = await getFCMToken();

          if (token) {
            localStorage.setItem("fcm_token", token);

            // Sync to backend so the server can target this device.
            // NOTE: During normal login flow, LoginPage already passes the
            // token to verifyLoginOtp(). This branch only runs when the token
            // is absent (e.g. localStorage cleared, first ever load after
            // granting permission late, etc.).
            try {
              await authApi.updateFCMToken(token);
              console.log("[FCM] Token synced to backend.");
            } catch (apiErr) {
              console.error("[FCM] Failed to sync token with backend:", apiErr);
            }
          } else {
            console.warn("[FCM] No token available — notification permission may be denied.");
            // No token → no point registering a listener
            return;
          }
        }

        // ── 2. Register the foreground message listener ───────────────────
        // listenToNotifications() returns an unsubscribe function.
        unsubscribe = await listenToNotifications();
        console.log("[FCM] Foreground notification listener registered.");
      } catch (err) {
        console.error("[FCM] Error setting up Firebase Messaging:", err);
      }
    };

    setup();

    // Cleanup: unregister the onMessage listener when the component unmounts
    // (e.g. user logs out and MainLayout unmounts).
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
        console.log("[FCM] Foreground notification listener removed.");
      }
    };
  }, []); // Run once per authenticated session mount
};
