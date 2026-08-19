import liff from "@line/liff";
import { supabase } from "@/integrations/supabase/client";

const LINE_PROVIDER = "custom:line" as const;
const LIFF_ID = String(import.meta.env["VITE_LINE_LIFF_ID"] ?? "").trim();
const LINE_RETURN_PARAM = "line_login";

type LineAuthResult = {
  redirected: boolean;
  error?: Error;
};

function getCurrentOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function getLiffReturnUrl() {
  return `${getCurrentOrigin()}/auth?${LINE_RETURN_PARAM}=1`;
}

export function isLineLiffConfigured() {
  return Boolean(LIFF_ID);
}

export function isLineLiffCallback() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(LINE_RETURN_PARAM) === "1";
}

async function initializeLiff() {
  if (!LIFF_ID) {
    throw new Error("ยังไม่ได้ตั้งค่า VITE_LINE_LIFF_ID สำหรับ LINE LIFF");
  }
  await liff.init({ liffId: LIFF_ID });
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

  const idToken = liff.getIDToken();
  if (!idToken) {
    throw new Error("ไม่พบ LINE ID token กรุณาอนุญาตการเข้าสู่ระบบใหม่อีกครั้ง");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: LINE_PROVIDER,
    token: idToken,
  });
  if (error) throw error;
  return { redirected: false };
}

export async function completeLineLiffLoginIfNeeded(): Promise<LineAuthResult> {
  if (!LIFF_ID || !isLineLiffCallback()) return { redirected: false };

  await initializeLiff();
  if (!liff.isLoggedIn()) {
    throw new Error("การเข้าสู่ระบบ LINE ไม่เสร็จสมบูรณ์ กรุณาลองใหม่อีกครั้ง");
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    throw new Error("ไม่พบ LINE ID token หลังกลับจาก LIFF");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: LINE_PROVIDER,
    token: idToken,
  });
  if (error) throw error;

  if (typeof window !== "undefined") {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
  return { redirected: false };
}

export function getLineProviderId() {
  return LINE_PROVIDER;
}
