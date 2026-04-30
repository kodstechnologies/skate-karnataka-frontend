import { useEffect } from "react";
import { getFCMToken } from "@/firebase/fcm";
import { listenToNotifications } from "@/firebase/notificationListener";
import { authApi } from "@/api/auth-api";

export const useFirebaseMessaging = (isAuthenticated) => {
  useEffect(() => {
    let unsubscribe = null;

    const setupFirebaseMessaging = async () => {
      try {
        if (!isAuthenticated) return;

        // Check if token already exists in localStorage
        const cachedToken = localStorage.getItem("fcm_token");
        console.log("FCM Token synced successfully", cachedToken);
        if (!cachedToken) {
          // No cached token, request a new one
          const token = await getFCMToken();
          if (token) {
            // Save it locally to avoid regenerating on every load
            localStorage.setItem("fcm_token", token);

            // Sync with backend
            try {
              await authApi.updateFCMToken(token);
              console.log("FCM Token synced successfully");
            } catch (apiError) {
              console.error("Failed to sync FCM token with backend:", apiError);
            }
          } else {
            console.log("No registration token available or permission denied.");
          }
        }

        // Set up foreground message listener
        unsubscribe = await listenToNotifications();
      } catch (error) {
        console.error("Error setting up Firebase Messaging:", error);
      }
    };

    setupFirebaseMessaging();

    // Cleanup the listener when the component unmounts or auth state changes
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);
};
