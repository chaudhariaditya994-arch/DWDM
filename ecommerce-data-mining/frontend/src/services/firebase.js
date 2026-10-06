// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDmKUi2B632h36fmBFdv7h5MMZ5zyAwYG4",
  authDomain: "dwdw-61f36.firebaseapp.com",
  projectId: "dwdw-61f36",
  storageBucket: "dwdw-61f36.firebasestorage.app",
  messagingSenderId: "184467873317",
  appId: "1:184467873317:web:0a03c7084447a4202f69cc",
  measurementId: "G-6M2X9SP6G4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely for browser environments
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase] Analytics initialized successfully.");
    }
  }).catch((err) => {
    console.warn("[Firebase] Analytics not supported in current environment:", err);
  });
}

export default app;
