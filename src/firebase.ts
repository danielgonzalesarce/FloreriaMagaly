import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Handle optional JSON config for different environments
let firebaseConfigJson: any = {};
// We don't use top-level await here to avoid build issues in some environments
// Instead, we'll try to load it synchronously if possible, or just use env vars
try {
  // @ts-ignore - This file might be missing in production/Vercel
  // In Vite, we can't easily do a sync import of a JSON file that might be missing
  // So we'll rely on the fact that if it's there, Vite will bundle it if we use a standard import
  // But we want it to be OPTIONAL.
  // The best way is to use import.meta.env as the primary source.
} catch (e) {
  // Ignore
}

// Support environment variables for Vercel deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '';

// If env vars are missing, we try to use the JSON config if it was provided via a global or other means
// In AI Studio, we can assume the file is there and we can import it normally if we are NOT in production
if (!firebaseConfig.apiKey && typeof window !== 'undefined' && import.meta.env.DEV) {
  fetch('/firebase-applet-config.json')
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(config => {
      Object.assign(firebaseConfig, config);
      // Note: This might happen after initial export, but for dev it's usually fine
      // as long as the app handles the re-initialization or the delay.
    })
    .catch(() => console.warn('Could not fetch firebase-applet-config.json'));
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();
