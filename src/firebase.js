import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Ensure auth persists across reloads (local storage)
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Failed to set auth persistence, falling back to default:', e?.message || e)
});

// Enable offline persistence
import { enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
enableIndexedDbPersistence(db, {cacheSizeBytes: CACHE_SIZE_UNLIMITED}).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
    }
});

export const googleProvider = new GoogleAuthProvider();

// Handle common Firebase errors
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.email);
  } else {
    console.log("No user signed in");
  }
}, (error) => {
  console.error("Auth state change error:", error);
});

let analytics;
isSupported()
  .then((ok) => {
    if (ok) analytics = getAnalytics(app);
  })
  .catch(() => {});

export { app, analytics };
