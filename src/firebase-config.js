import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions"; 

const firebaseConfig = {
  apiKey: "AIzaSyBsJjrjMBVku2vbH_heDXM2hVXYMggikmA",
  authDomain: "study-smart-1e97e.firebaseapp.com",
  projectId: "study-smart-1e97e",
  storageBucket: "study-smart-1e97e.firebasestorage.app",
  messagingSenderId: "27266145653",
  appId: "1:27266145653:web:ebf509827e5ff2d8c0873c",
  measurementId: "G-1TFB0Q05VX"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
