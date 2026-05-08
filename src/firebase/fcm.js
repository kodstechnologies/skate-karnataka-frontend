import { getToken } from "firebase/messaging";
import { messagingPromise } from "./firebase";

/**
 * Registers firebase-messaging-sw.js and returns the ServiceWorkerRegistration.
 * Kept local to fcm.js so it runs only when a token is actually needed.
 */
const getSWRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
    console.log("[FCM] SW registered:", reg.scope);
    // Wait for it to become the active controller (needed on first install)
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        // Guard: already became controller between the check and listener setup
        if (navigator.serviceWorker.controller) return resolve();
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
      });
    }
    return reg;
  } catch (err) {
    console.error("[FCM] SW registration failed:", err);
    return null;
  }
};

/**
 * Generates and returns an FCM registration token for this device/browser.
 * Pins the push subscription to our service worker so FCM pushes are always
 * delivered to firebase-messaging-sw.js, which then relays them to the page.
 *
 * @returns {string | null} FCM token, or null on failure / permission denied.
 */
export const getFCMToken = async () => {
  try {
    const messaging = await messagingPromise;
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    console.log("[FCM] Notification permission:", permission);
    if (permission !== "granted") return null;

    const swRegistration = await getSWRegistration();

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      ...(swRegistration && { serviceWorkerRegistration: swRegistration })
    });

    console.log("[FCM] Token generated:", token);
    return token;
  } catch (err) {
    console.error("[FCM] Token error:", err);
    return null;
  }
};
