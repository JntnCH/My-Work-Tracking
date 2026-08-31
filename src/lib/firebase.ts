import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
  type UserCredential,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, type Firestore } from "firebase/firestore";
import appletConfig from "../../firebase-applet-config.json";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
};

const FIREBASE_CONFIG_STORAGE_KEY = "work_tracker_firebase_custom_config";

/**
 * Get active Firebase configuration from local overrides, applet config, or environment variables.
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

  // 1. Built-in Provisioned Firebase Config from firebase-applet-config.json
  if (appletConfig && appletConfig.apiKey && appletConfig.projectId) {
    return {
      apiKey: appletConfig.apiKey,
      authDomain: appletConfig.authDomain || `${appletConfig.projectId}.firebaseapp.com`,
      projectId: appletConfig.projectId,
      storageBucket: appletConfig.storageBucket || `${appletConfig.projectId}.appspot.com`,
      messagingSenderId: appletConfig.messagingSenderId || "",
      appId: appletConfig.appId || "",
      measurementId: appletConfig.measurementId || "",
      firestoreDatabaseId: appletConfig.firestoreDatabaseId || "",
    };
  }

  // 2. Environment Variables fallback
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
  cachedApp = null;
  cachedAuth = null;
  cachedFirestore = null;
}

export function clearCustomFirebaseConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  cachedApp = null;
  cachedAuth = null;
  cachedFirestore = null;
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
 * Sync user profile to Firestore
 */
export async function syncUserProfileToFirestore(
  fbUser: FirebaseUser,
  customData?: Record<string, unknown>,
) {
  try {
    const db = getFirebaseFirestoreInstance();
    if (!db) return;
    const userRef = doc(db, "users", fbUser.uid);
    const existing = await getDoc(userRef);

    const baseData = {
      id: fbUser.uid,
      email: fbUser.email || "",
      displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "ผู้ใช้งาน",
      photoURL: fbUser.photoURL || "",
      phoneNumber: fbUser.phoneNumber || "",
      isAnonymous: fbUser.isAnonymous,
      role: existing.exists() ? existing.data()?.role || "user" : "user",
      updatedAt: new Date().toISOString(),
      ...(customData || {}),
    };

    if (!existing.exists()) {
      await setDoc(userRef, {
        ...baseData,
        createdAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userRef, baseData, { merge: true });
    }
  } catch (err) {
    console.warn("[Firebase] Failed to sync user profile to Firestore:", err);
  }
}

/**
 * 1. Perform Google Sign-In via Firebase Auth.
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
    if (result.user) {
      void syncUserProfileToFirestore(result.user);
    }
    return result;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (
      err?.code === "auth/popup-blocked" ||
      err?.code === "auth/popup-closed-by-user" ||
      err?.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      throw new Error("REDIRECTING");
    }
    throw formatFirebaseError(error);
  }
}

/**
 * 2. Email & Password Sign Up via Firebase Auth
 */
export async function signUpWithEmailFirebase(
  email: string,
  password: string,
  displayName?: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    if (cred.user) {
      void syncUserProfileToFirestore(cred.user, {
        displayName: displayName || email.split("@")[0],
      });
    }
    return cred;
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 3. Email & Password Sign In via Firebase Auth
 */
export async function signInWithEmailFirebase(
  email: string,
  password: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (cred.user) {
      void syncUserProfileToFirestore(cred.user);
    }
    return cred;
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 4. Password Reset via Firebase Auth
 */
export async function sendPasswordResetFirebase(email: string): Promise<void> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 5. Anonymous / Guest Sign In via Firebase Auth
 */
export async function signInAnonymouslyFirebase(): Promise<UserCredential> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      void syncUserProfileToFirestore(cred.user, {
        displayName: "ผู้ใช้งานทั่วไป (Guest)",
        role: "guest",
      });
    }
    return cred;
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 6. Phone Authentication (SMS OTP)
 */
export function createRecaptchaVerifier(
  containerId: string | HTMLElement,
  options?: { size?: "invisible" | "normal" | "compact" },
): RecaptchaVerifier {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  return new RecaptchaVerifier(auth, containerId, {
    size: options?.size || "invisible",
  });
}

export async function sendPhoneOtpFirebase(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error("ระบบ Firebase Auth ยังไม่พร้อมใช้งาน");
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return confirmationResult;
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 7. Update User Profile in Firebase Auth
 */
export async function updateFirebaseUserProfile(
  displayName?: string,
  photoURL?: string,
): Promise<void> {
  const auth = getFirebaseAuthInstance();
  if (!auth?.currentUser) {
    throw new Error("ไม่พบผู้ใช้ที่กำลังเข้าสู่ระบบ");
  }

  try {
    await updateProfile(auth.currentUser, {
      ...(displayName ? { displayName } : {}),
      ...(photoURL ? { photoURL } : {}),
    });
    void syncUserProfileToFirestore(auth.currentUser, {
      ...(displayName ? { displayName } : {}),
      ...(photoURL ? { photoURL } : {}),
    });
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

/**
 * 8. Update Password in Firebase Auth
 */
export async function updateFirebasePassword(newPassword: string): Promise<void> {
  const auth = getFirebaseAuthInstance();
  if (!auth?.currentUser) {
    throw new Error("ไม่พบผู้ใช้ที่กำลังเข้าสู่ระบบ");
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    throw formatFirebaseError(error);
  }
}

export async function checkFirebaseRedirectResult(): Promise<UserCredential | null> {
  const auth = getFirebaseAuthInstance();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      void syncUserProfileToFirestore(result.user);
    }
    return result;
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
 * Friendly Error Formatter for Firebase Auth Exceptions
 */
export function formatFirebaseError(error: unknown): Error {
  if (error instanceof Error && !("code" in error)) {
    return error;
  }

  const err = error as { code?: string; message?: string };
  const code = err?.code || "";

  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    case "auth/email-already-in-use":
      return new Error("อีเมลนี้ถูกลงทะเบียนใช้งานแล้ว กรุณาเข้าสู่ระบบ");
    case "auth/weak-password":
      return new Error("รหัสผ่านสั้นเกินไป ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
    case "auth/invalid-email":
      return new Error("รูปแบบอีเมลไม่ถูกต้อง");
    case "auth/too-many-requests":
      return new Error("มีการพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
    case "auth/invalid-verification-code":
      return new Error("รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
    case "auth/code-expired":
      return new Error("รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่");
    case "auth/quota-exceeded":
      return new Error("เกินขีดจำกัดการส่ง SMS กรุณาลองใหม่อีกครั้งในภายหลัง");
    case "auth/captcha-check-failed":
      return new Error("การยืนยัน reCAPTCHA ไม่สำเร็จ กรุณาลองใหม่");
    case "auth/popup-closed-by-user":
      return new Error("หน้าต่างเข้าสู่ระบบถูกปิดก่อนทำรายการเสร็จ");
    case "auth/requires-recent-login":
      return new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้งก่อนเปลี่ยนรหัสผ่านเพื่อความปลอดภัย");
    default:
      return new Error(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase");
  }
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
      message: "เชื่อมต่อ Firebase Authentication และ Firestore สำเร็จพร้อมใช้งาน",
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
