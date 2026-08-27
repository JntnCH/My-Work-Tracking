import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const FIREBASE_CONFIG_STORAGE_KEY = "work_tracker_firebase_custom_config";

/**
 * Get active Firebase configuration from environment or local overrides.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FirebaseConfig;
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[Firebase] Failed to read saved custom config:", e);
    }
  }

  const envApiKey = (import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined) || "";
  const envProjectId = (import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined) || "";
  const envAuthDomain =
    (import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined) ||
    (envProjectId ? `${envProjectId}.firebaseapp.com` : "");
  const envStorageBucket =
    (import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string | undefined) ||
    (envProjectId ? `${envProjectId}.appspot.com` : "");
  const envMessagingSenderId =
    (import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string | undefined) || "";
  const envAppId = (import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined) || "";
  const envMeasurementId =
    (import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] as string | undefined) || "";

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: envAuthDomain,
      projectId: envProjectId,
      storageBucket: envStorageBucket,
      messagingSenderId: envMessagingSenderId,
      appId: envAppId,
      measurementId: envMeasurementId,
    };
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  // Re-initialize or reset app instance if needed
}

export function clearCustomFirebaseConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;

export function getFirebaseAppInstance(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(config);
    }
    return cachedApp;
  } catch (error) {
    console.error("[Firebase] Error initializing Firebase App:", error);
    return null;
  }
}

export function getFirebaseAuthInstance(): Auth | null {
  const app = getFirebaseAppInstance();
  if (!app) return null;
  if (!cachedAuth) {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

export function getFirebaseFirestoreInstance(): Firestore | null {
  const app = getFirebaseAppInstance();
  if (!app) return null;
  if (!cachedFirestore) {
    cachedFirestore = getFirestore(app);
  }
  return cachedFirestore;
}

/**
 * Perform Google Sign-In via Firebase Auth.
 * Tries popup first; if popups are blocked or in mobile in-app browser, falls back to redirect.
 */
export async function signInWithGoogleFirebase(): Promise<UserCredential> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error(
      "ยังไม่ได้ตั้งค่าการเชื่อมต่อ Firebase กรุณาระบุ Firebase Config (API Key และ Project ID)",
    );
  }

  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (
      err?.code === "auth/popup-blocked" ||
      err?.code === "auth/popup-closed-by-user" ||
      err?.code === "auth/cancelled-popup-request"
    ) {
      // If popup fails or is blocked, fallback to redirect
      await signInWithRedirect(auth, provider);
      throw new Error("REDIRECTING");
    }
    throw error;
  }
}

export async function checkFirebaseRedirectResult(): Promise<UserCredential | null> {
  const auth = getFirebaseAuthInstance();
  if (!auth) return null;
  try {
    return await getRedirectResult(auth);
  } catch (err) {
    console.warn("[Firebase] Redirect result error:", err);
    return null;
  }
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuthInstance();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToFirebaseAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Diagnostics & Connection test for Firebase & Firestore
 */
export async function testFirebaseConnection(): Promise<{
  success: boolean;
  message: string;
  projectId?: string;
  authDomain?: string;
}> {
  const config = getFirebaseConfig();
  if (!config) {
    return {
      success: false,
      message: "ไม่พบการตั้งค่า Firebase กรุณาระบุ API Key และ Project ID",
    };
  }

  try {
    const auth = getFirebaseAuthInstance();
    if (!auth) {
      throw new Error("ไม่สามารถเริ่มต้น Firebase Auth ได้");
    }
    const firestore = getFirebaseFirestoreInstance();
    if (!firestore) {
      throw new Error("ไม่สามารถเริ่มต้น Firestore ได้");
    }

    return {
      success: true,
      message: "เชื่อมต่อ Firebase และ Firestore สำเร็จพร้อมใช้งาน",
      projectId: config.projectId,
      authDomain: config.authDomain,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message,
      projectId: config.projectId,
      authDomain: config.authDomain,
    };
  }
}
