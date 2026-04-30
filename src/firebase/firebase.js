import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkmNB0vTEIEoFj5-aO_6zA2q0txkQ_QS8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skatekarnataka.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skatekarnataka",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skatekarnataka.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "629917269269",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:629917269269:web:d0f94ec3ca849c65e5fd1c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D5J4CG2F0G"
};

const app = initializeApp(firebaseConfig);

export const messagingPromise = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);
