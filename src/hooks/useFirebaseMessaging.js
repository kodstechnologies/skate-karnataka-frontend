import { useEffect } from "react";
import { getFCMToken } from "@/firebase/fcm";
import { listenToNotifications } from "@/firebase/notificationListener";
import { authApi } from "@/api/auth-api";

/**
 * Token version stamp — bump this whenever the token-generation strategy
 * changes. A mismatch forces the old token to be evicted and regenerated
 * with the current strategy (e.g. now passing serviceWorkerRegistration).
 */
const FCM_TOKEN_VERSION = "v2-sw-pinned";

/**
 * useFirebaseMessaging
 *
 * Sets up Firebase Cloud Messaging for the authenticated session.
 * Must be called inside a protected layout (e.g. MainLayout) so the
 * foreground listener is active for every authenticated page.
 *
 * StrictMode safety: a `cancelled` flag prevents an async setup that was
 * already torn down by the cleanup function from registering a zombie listener.
 */
export const useFirebaseMessaging = () => {
  useEffect(() => {
    // ── StrictMode zombie-listener guard ─────────────────────────────────
    // React StrictMode mounts → cleans up → mounts again in dev.
    // Because setup() is async, the cleanup can run while setup is still
    // awaiting. Without this flag, the first mount's async tail can register
    // a listener AFTER the cleanup already ran — leaving a listener that is
    // never unsubscribed.
    let cancelled = false;
    let unsubscribe = null;

    const setup = async () => {
      try {
        console.log("[FCM] 🚀 useFirebaseMessaging setup starting...");

        // ── 0. Browser support guard ────────────────────────────────────
        if (!("Notification" in window)) {
          console.warn("[FCM] Browser does not support notifications.");
          return;
        }

        // ── 1. Token & permission check ─────────────────────────────────
        const cachedToken = localStorage.getItem("fcm_token");
        const cachedVersion = localStorage.getItem("fcm_token_version");
        const isTokenValid = cachedToken && cachedVersion === FCM_TOKEN_VERSION;

        console.log("[FCM] Token cache state →", {
          hasToken: !!cachedToken,
          version: cachedVersion ?? "none",
          expectedVersion: FCM_TOKEN_VERSION,
          isValid: isTokenValid,
          notifPermission: Notification.permission
        });

        const syncTokenToBackend = async (token) => {
          if (!token || cancelled) return;
          try {
            await authApi.updateFCMToken(token);
            console.log("[FCM] Token synced to backend.");
          } catch (apiErr) {
            console.error("[FCM] Failed to sync token to backend:", apiErr);
          }
        };

        if (isTokenValid) {
          const perm = Notification.permission;

          if (perm === "denied") {
            console.warn(
              "[FCM] ❌ Notification permission BLOCKED. " +
                "Reset via browser Settings → Site Settings → Notifications."
            );
            return;
          }

          if (perm === "default") {
            console.log("[FCM] Cached token found but permission is 'default'. Re-requesting…");
            const granted = await Notification.requestPermission();
            if (granted !== "granted") {
              console.warn("[FCM] Permission not granted — skipping listener.");
              return;
            }
          }

          console.log("[FCM] ✅ Valid cached token, permission granted. Proceeding.", perm);
          await syncTokenToBackend(cachedToken);
        } else {
          // Token missing or generated with old strategy — regenerate.
          if (cachedToken && cachedVersion !== FCM_TOKEN_VERSION) {
            console.log(`[FCM] Stale token (version: ${cachedVersion ?? "none"}) — regenerating…`);
            localStorage.removeItem("fcm_token");
            localStorage.removeItem("fcm_token_version");
          }

          console.log("[FCM] No valid cached token — calling getFCMToken()...");
          const token = await getFCMToken();

          // If cleanup ran while we were awaiting, do not proceed.
          if (cancelled) return;

          if (token) {
            localStorage.setItem("fcm_token", token);
            localStorage.setItem("fcm_token_version", FCM_TOKEN_VERSION);
            await syncTokenToBackend(token);
          } else {
            console.warn("[FCM] No token returned — permission may be denied or Firebase failed.");
            return;
          }
        }

        // ── 2. Register SW relay listener (synchronous, no await needed) ─
        if (cancelled) return;

        console.log("[FCM] Registering SW push relay listener...");
        unsubscribe = listenToNotifications();

        if (cancelled) {
          if (typeof unsubscribe === "function") unsubscribe();
          return;
        }

        console.log("[FCM] ✅ Setup complete. Push relay listener is ACTIVE.");
      } catch (err) {
        console.error("[FCM] Setup error:", err);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") {
        unsubscribe();
        console.log("[FCM] Foreground notification listener removed.");
      }
    };
  }, []);
};
