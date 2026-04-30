import { onMessage } from "firebase/messaging";
import { messagingPromise } from "./firebase";

export const listenToNotifications = async () => {
  const messaging = await messagingPromise;
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body
    });
  });
};
