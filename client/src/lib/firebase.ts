import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "mov-o-matic.firebaseapp.com",
  projectId: "mov-o-matic",
  storageBucket: "mov-o-matic.firebasestorage.app",
  messagingSenderId: "166612558041",
  appId: "1:166612558041:web:cc43a3aba9a2fc8e9f9ec8",
  measurementId: "G-DQPHB0R31B"
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