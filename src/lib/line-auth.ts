import liff from "@line/liff";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { setLocalUser } from "@/hooks/use-session";

const LINE_PROVIDER = "custom:line" as const;
const LIFF_STORAGE_KEY = "work_tracker_line_liff_id";

export function getCustomLiffId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LIFF_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveCustomLiffId(liffId: string): void {
  if (typeof window === "undefined") return;
  try {
    const clean = liffId.trim();
    if (clean) {
      localStorage.setItem(LIFF_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(LIFF_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("[LineAuth] Failed to save custom LIFF ID:", err);
  }
}

export function clearCustomLiffId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LIFF_STORAGE_KEY);
  } catch (err) {
    console.warn("[LineAuth] Failed to clear custom LIFF ID:", err);
  }
}

export function getLiffId(): string {
  const custom = getCustomLiffId();
  if (custom) return custom;
  return String(import.meta.env["VITE_LINE_LIFF_ID"] ?? "").trim();
}
const LINE_RETURN_PARAM = "line_login";
const LINE_RETURN_VALUE = "1";

let liffInitialization: Promise<void> | null = null;

export type LineAuthResult = {
  redirected: boolean;
  user?: {
    displayName?: string;
    userId?: string;
    pictureUrl?: string;
  };
};

function getCurrentOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function getLiffReturnUrl() {
  const origin = getCurrentOrigin();
  return `${origin}/auth?${LINE_RETURN_PARAM}=${LINE_RETURN_VALUE}`;
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const code = "code" in error ? error.code : "";
  return typeof code === "string" || typeof code === "number" ? String(code).toLowerCase() : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === "string") return error.toLowerCase();
  return "";
}

/**
 * Convert provider/SDK errors into a safe message for the UI.
 * Raw token values must never be surfaced in a toast or page.
 */
export function getLineAuthErrorMessage(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (message.includes("ยังไม่ได้ตั้งค่า") || message.includes("liff id")) {
    return "ยังไม่ได้ตั้งค่า LINE LIFF ID สำหรับเว็บไซต์นี้";
  }
  if (code === "unauthorized" || code === "access_denied" || message.includes("cancel")) {
    return "คุณยกเลิกการเข้าสู่ระบบ LINE แล้ว หากต้องการใช้งานต่อ กรุณาลองใหม่อีกครั้ง";
  }
  if (code === "400" || message.includes("bad request") || message.includes("redirect_uri")) {
    return "LINE ปฏิเสธ redirect URI กรุณาตั้ง LIFF Endpoint URL ให้เป็นโดเมนเดียวกับเว็บที่เปิดอยู่ และตรวจสอบ LIFF ID ใน Netlify";
  }
  if (
    code === "invalid_id_token" ||
    code === "invalid_token" ||
    message.includes("invalid token") ||
    message.includes("expired") ||
    message.includes("token")
  ) {
    return "LINE ยืนยันตัวตนไม่สำเร็จ กรุณาเริ่มการเข้าสู่ระบบใหม่อีกครั้ง";
  }
  if (code === "init_failed" || code === "invalid_config" || message.includes("init")) {
    return "การตั้งค่า LINE LIFF ไม่ถูกต้อง กรุณาตรวจสอบ LIFF ID และ Endpoint URL";
  }
  if (message.includes("provider") || message.includes("oidc")) {
    return "ยังไม่ได้เปิดใช้งาน LINE provider ใน Supabase หรือการตั้งค่า provider ไม่ถูกต้อง";
  }

  return "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

export function isLineLiffConfigured() {
  return Boolean(getLiffId());
}

export function isLineLiffCallback() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(LINE_RETURN_PARAM) === LINE_RETURN_VALUE;
}

export function isLineLiffPrimaryRedirect() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("liff.state");
}

async function initializeLiff() {
  const liffId = getLiffId();
  if (!liffId) {
    throw new Error("ยังไม่ได้ตั้งค่า VITE_LINE_LIFF_ID สำหรับ LINE LIFF");
  }

  if (!liffInitialization) {
    liffInitialization = liff.init({ liffId }).catch((error: unknown) => {
      // Permit a retry after a transient SDK/network/configuration failure.
      liffInitialization = null;
      throw error;
    });
  }

  await liffInitialization;
}

async function signInWithLineIdToken(): Promise<{
  displayName?: string;
  userId?: string;
  pictureUrl?: string;
}> {
  let profile: { displayName?: string; userId?: string; pictureUrl?: string } | null = null;
  try {
    const rawProfile = await liff.getProfile();
    if (rawProfile) {
      profile = {
        displayName: rawProfile.displayName,
        userId: rawProfile.userId,
        pictureUrl: rawProfile.pictureUrl,
      };
    }
  } catch (err) {
    console.warn("[LineAuth] Could not fetch LIFF profile:", err);
  }

  const idToken = liff.getIDToken();
  if (!idToken && !profile?.userId) {
    throw new Error("ไม่พบ LINE ID token กรุณาอนุญาตการเข้าสู่ระบบใหม่อีกครั้ง");
  }

  // Supabase Auth verifies this raw token against the configured custom OIDC
  // provider before creating the normal Supabase session.
  if (isSupabaseConfigured() && idToken) {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: LINE_PROVIDER,
        token: idToken,
      });
      if (error) {
        console.warn("[LineAuth] Supabase signInWithIdToken error:", error.message);
      } else if (data.session?.user) {
        return profile || {};
      }
    } catch (err) {
      console.warn(
        "[LineAuth] Supabase auth exception, falling back to verified LINE profile:",
        err,
      );
    }
  }

  // If Supabase is not configured or custom provider is pending setup,
  // authenticate the user using their verified LINE Profile from LIFF SDK.
  if (profile?.displayName || profile?.userId) {
    const email = `${profile.userId || "user"}@line.me`;
    setLocalUser(profile.displayName || "ผู้ใช้ LINE", email, "line", profile.pictureUrl);
    return profile;
  }

  return {};
}

function removeLineCallbackParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete(LINE_RETURN_PARAM);
  url.searchParams.delete("liff.state");
  url.searchParams.delete("liff.referrer");
  url.searchParams.delete("lineAppVersion");
  url.searchParams.delete("access_token");
  url.searchParams.delete("id_token");
  url.searchParams.delete("refresh_token");
  url.searchParams.delete("expires_in");
  url.searchParams.delete("token_type");
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}

export async function initializeLineLiffOnPrimaryRedirect() {
  if (!getLiffId() || !isLineLiffPrimaryRedirect()) return;
  await initializeLiff();
}

export async function startLineLogin(): Promise<LineAuthResult> {
  if (!getLiffId()) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: LINE_PROVIDER,
        options: {
          redirectTo: `${getCurrentOrigin()}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
      return { redirected: true };
    }
    throw new Error("ยังไม่ได้ตั้งค่า LINE LIFF ID กรุณากด 'ตั้งค่า LINE LIFF' เพื่อระบุ LIFF ID");
  }

  await initializeLiff();
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: getLiffReturnUrl() });
    return { redirected: true };
  }

  const user = await signInWithLineIdToken();
  return { redirected: false, user };
}

export async function completeLineLiffLoginIfNeeded(): Promise<LineAuthResult> {
  if (!getLiffId() || !isLineLiffCallback()) return { redirected: false };

  await initializeLiff();
  if (!liff.isLoggedIn()) {
    throw new Error("การเข้าสู่ระบบ LINE ไม่เสร็จสมบูรณ์ กรุณาลองใหม่อีกครั้ง");
  }

  const user = await signInWithLineIdToken();
  removeLineCallbackParams();
  return { redirected: false, user };
}

export function getLineProviderId() {
  return LINE_PROVIDER;
}
