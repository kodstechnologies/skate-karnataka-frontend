import { getToken } from "firebase/messaging";
import { messagingPromise } from "./firebase";

export const getFCMToken = async () => {
  try {
    const messaging = await messagingPromise;
    if (!messaging) return null;
    const permission = await Notification.requestPermission();
    console.log("Requesting notification permission...", permission);
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    console.log("FCM Token synced successfully", token);
    return token;
  } catch (err) {
    console.error("Token error:", err);
    return null;
  }
};
