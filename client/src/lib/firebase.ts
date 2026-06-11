import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration — prefer Vite env vars in deployed environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "REDACTED",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mov-o-matic.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mov-o-matic",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mov-o-matic.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "166612558041",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:166612558041:web:cc43a3aba9a2fc8e9f9ec8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DQPHB0R31B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set authentication persistence to local storage (persists across browser sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;