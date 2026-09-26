import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCLjGUeDlvYAz_zNVKetEATvcN1J4WCkt4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'gaonpurecom.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gaonpurecom',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gaonpurecom.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '741899365355',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:741899365355:web:86521c2c47248f5dfd87ae',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-45MCHSLBEV',
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');

// Global guard to prevent multiple emulator connections during HMR
if (
  typeof window !== 'undefined' && 
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  const g = globalThis as any;
  if (!g._firebaseEmulatorsConnected) {
    g._firebaseEmulatorsConnected = true;
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      console.log('Connected to Firebase Emulators (127.0.0.1)');
    } catch (error) {
      console.error('Error connecting to Firebase Emulators:', error);
    }
  }
}

export { app, auth, db, storage, functions };
