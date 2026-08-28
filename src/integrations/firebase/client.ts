import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined,
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined,
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined,
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string | undefined,
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string | undefined,
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined,
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] as string | undefined,
};

const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

export type FirebaseConfigKey = (typeof REQUIRED_CONFIG_KEYS)[number];

export function getMissingFirebaseConfig(): FirebaseConfigKey[] {
  return REQUIRED_CONFIG_KEYS.filter((key) => !firebaseConfig[key]);
}

export function isFirebaseConfigured() {
  return getMissingFirebaseConfig().length === 0;
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (cachedApp) return cachedApp;

  const completeConfig = {
    apiKey: firebaseConfig.apiKey as string,
    authDomain: firebaseConfig.authDomain as string,
    projectId: firebaseConfig.projectId as string,
    storageBucket: firebaseConfig.storageBucket as string,
    messagingSenderId: firebaseConfig.messagingSenderId as string,
    appId: firebaseConfig.appId as string,
    ...(firebaseConfig.measurementId ? { measurementId: firebaseConfig.measurementId } : {}),
  };

  cachedApp = getApps().length > 0 ? getApp() : initializeApp(completeConfig);
  return cachedApp;
}

/** Firebase Auth is only initialized in the browser. */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (cachedAuth) return cachedAuth;

  const app = getFirebaseApp();
  if (!app) return null;

  cachedAuth = getAuth(app);
  return cachedAuth;
}

export function getFirebaseProjectId() {
  return firebaseConfig.projectId ?? "";
}
