/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles push when app is in background.
 */

importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkmNB0vTEIEoFj5-aO_6zA2q0txkQ_QS8",
  authDomain: "skatekarnataka.firebaseapp.com",
  projectId: "skatekarnataka",
  storageBucket: "skatekarnataka.firebasestorage.app",
  messagingSenderId: "629917269269",
  appId: "1:629917269269:web:d0f94ec3ca849c65e5fd1c",
  measurementId: "G-D5J4CG2F0G"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || payload;
  const notification = payload?.notification || {};
  const title = notification?.title || data?.title || "Notification";
  const body = notification?.body || data?.body || "";
  return self.registration.showNotification(title, {
    body
  });
});
