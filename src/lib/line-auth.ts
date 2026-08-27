import liff from "@line/liff";
import { supabase } from "@/integrations/supabase/client";

const LINE_PROVIDER = "custom:line" as const;
const LIFF_ID = String(import.meta.env["VITE_LINE_LIFF_ID"] ?? "").trim();
const LINE_RETURN_PARAM = "line_login";
const LINE_RETURN_VALUE = "1";

let liffInitialization: Promise<void> | null = null;

type LineAuthResult = {
  redirected: boolean;
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
  return Boolean(LIFF_ID);
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
  if (!LIFF_ID) {
    throw new Error("ยังไม่ได้ตั้งค่า VITE_LINE_LIFF_ID สำหรับ LINE LIFF");
  }

  if (!liffInitialization) {
    liffInitialization = liff.init({ liffId: LIFF_ID }).catch((error: unknown) => {
      // Permit a retry after a transient SDK/network/configuration failure.
      liffInitialization = null;
      throw error;
    });
  }

  await liffInitialization;
}

async function signInWithLineIdToken() {
  const idToken = liff.getIDToken();
  if (!idToken) {
    throw new Error("ไม่พบ LINE ID token กรุณาอนุญาตการเข้าสู่ระบบใหม่อีกครั้ง");
  }

  // Supabase Auth verifies this raw token against the configured custom OIDC
  // provider before creating the normal Supabase session. Never send decoded
  // profile fields from the browser as authentication evidence.
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: LINE_PROVIDER,
    token: idToken,
  });
  if (error) throw error;
  if (!data.session?.user) {
    throw new Error("Supabase ไม่ได้สร้าง session หลังยืนยัน LINE สำเร็จ");
  }
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
  if (!LIFF_ID || !isLineLiffPrimaryRedirect()) return;
  await initializeLiff();
}

export async function startLineLogin(): Promise<LineAuthResult> {
  if (!LIFF_ID) {
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

  await initializeLiff();
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: getLiffReturnUrl() });
    return { redirected: true };
  }

  await signInWithLineIdToken();
  return { redirected: false };
}

export async function completeLineLiffLoginIfNeeded(): Promise<LineAuthResult> {
  if (!LIFF_ID || !isLineLiffCallback()) return { redirected: false };

  await initializeLiff();
  if (!liff.isLoggedIn()) {
    throw new Error("การเข้าสู่ระบบ LINE ไม่เสร็จสมบูรณ์ กรุณาลองใหม่อีกครั้ง");
  }

  await signInWithLineIdToken();
  removeLineCallbackParams();
  return { redirected: false };
}

export function getLineProviderId() {
  return LINE_PROVIDER;
}
