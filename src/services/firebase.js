// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Debug: Log environment variables (only in development)
if (import.meta.env.DEV) {
  console.log('[Firebase] Loading environment variables...');
  console.log('[Firebase] VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✓ SET' : '✗ NOT SET');
  console.log('[Firebase] VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ SET' : '✗ NOT SET');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  const errorMsg = '[Firebase] ❌ CRITICAL: Missing Firebase environment variables! Please configure them in Vercel dashboard.';
  console.error(errorMsg);
  console.error('[Firebase] Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.');

  // In production, throw error to prevent app from running
  if (!import.meta.env.DEV) {
    throw new Error('Firebase configuration missing. Please check Vercel environment variables.');
  }
}

console.log('[Firebase] ✓ Initializing Firebase with project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

console.log('[Firebase] ✓ Firebase initialized successfully');

export default app;
