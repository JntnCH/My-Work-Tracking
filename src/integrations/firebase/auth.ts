import {
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./client";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let phoneConfirmation: ConfirmationResult | null = null;

export function ensureFirebaseAuthConfigured() {
  if (isFirebaseConfigured()) return true;
  throw new Error(
    "Firebase ยังไม่ได้ตั้งค่า: กรุณาตั้ง VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID และ VITE_FIREBASE_APP_ID ใน Netlify แล้ว deploy ใหม่",
  );
}

function getAuthOrThrow() {
  ensureFirebaseAuthConfigured();
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth ใช้งานได้เฉพาะใน browser");
  return auth;
}

function isMobileDevice() {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function signInWithGoogle(loginHint?: string): Promise<UserCredential | null> {
  const auth = getAuthOrThrow();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
    ...(loginHint ? { login_hint: loginHint } : {}),
  });

  if (isMobileDevice()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  return signInWithPopup(auth, provider);
}

export async function completeGoogleRedirect() {
  const auth = getFirebaseAuth();
  if (!auth || !isFirebaseConfigured()) return null;
  return getRedirectResult(auth);
}

export async function signInWithGithub() {
  const auth = getAuthOrThrow();
  return signInWithPopup(auth, new GithubAuthProvider());
}

/**
 * LINE must be configured as a generic OIDC provider in Firebase Auth
 * with provider ID `oidc.line`. The provider validates the LINE identity;
 * the LIFF SDK is not used to mint a client-side identity.
 */
export async function signInWithFirebaseLine() {
  const auth = getAuthOrThrow();
  const provider = new OAuthProvider("oidc.line");
  provider.addScope("openid");
  provider.addScope("profile");

  if (isMobileDevice()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  return signInWithPopup(auth, provider);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getAuthOrThrow(), email, password);
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const credential = await createUserWithEmailAndPassword(getAuthOrThrow(), email, password);
  if (name?.trim()) {
    await updateProfile(credential.user, { displayName: name.trim() });
  }
  return credential;
}

export async function resetFirebasePassword(email: string) {
  return sendPasswordResetEmail(getAuthOrThrow(), email);
}

function getRecaptchaVerifier() {
  const auth = getAuthOrThrow();
  if (recaptchaVerifier) return recaptchaVerifier;

  const container = document.getElementById("recaptcha-container");
  if (!container) throw new Error("ไม่พบพื้นที่ reCAPTCHA สำหรับยืนยันเบอร์โทรศัพท์");

  recaptchaVerifier = new RecaptchaVerifier(auth, container, {
    size: "invisible",
    callback: () => undefined,
    "expired-callback": () => {
      recaptchaVerifier = null;
    },
  });
  return recaptchaVerifier;
}

export async function sendFirebasePhoneOtp(phoneNumber: string) {
  phoneConfirmation = await signInWithPhoneNumber(
    getAuthOrThrow(),
    phoneNumber,
    getRecaptchaVerifier(),
  );
}

export async function verifyFirebasePhoneOtp(code: string) {
  if (!phoneConfirmation) throw new Error("กรุณาขอรหัส OTP ก่อน");
  const credential = await phoneConfirmation.confirm(code);
  phoneConfirmation = null;
  recaptchaVerifier = null;
  return credential;
}

export async function signOutFirebase() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function clearFirebasePhoneChallenge() {
  phoneConfirmation = null;
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
}
