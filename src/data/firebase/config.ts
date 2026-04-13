import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyBI7TWN4ylr_nGCFu9OdEb8vGb2OPRZ-vs",
  authDomain: "pdt-acdc4.firebaseapp.com",
  projectId: "pdt-acdc4",
  storageBucket: "pdt-acdc4.firebasestorage.app",
  messagingSenderId: "459916288788",
  appId: "1:459916288788:web:ef92f56539b74ced2d9801",
  measurementId: "G-80DKXGZQYR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics (only available in browser environments)
let analytics = null;
// @ts-ignore
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics not supported in this environment");
  }
}
export { analytics };
