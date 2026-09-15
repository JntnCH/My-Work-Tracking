import appletConfig from "../../firebase-applet-config.json";
import { GOOGLE_WORKSPACE_SCOPES, setGoogleAccessToken } from "@/lib/firebase";
import { getSheetsAuthPayload, type SheetsAuthPayload } from "@/lib/sheets-credentials";

type TokenClient = {
  requestAccessToken: (override?: { prompt?: string }) => void;
};

type GoogleOauth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (resp: {
      access_token?: string;
      error?: string;
      error_description?: string;
    }) => void;
    error_callback?: (err: { message?: string; type?: string }) => void;
  }) => TokenClient;
};

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOauth2 } };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function getOAuthClientId(): string {
  const fromConfig = (appletConfig as { oAuthClientId?: string }).oAuthClientId?.trim();
  const fromEnv = String(import.meta.env["VITE_GOOGLE_OAUTH_CLIENT_ID"] ?? "").trim();
  return fromConfig || fromEnv;
}

function loadGisClient(): Promise<GoogleOauth2> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ต้องเปิดในเบราว์เซอร์เพื่ออนุญาต Google Sheets"));
  }
  const existing = window.google?.accounts?.oauth2;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const already = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
    const script = already ?? document.createElement("script");
    const onReady = () => {
      const client = window.google?.accounts?.oauth2;
      if (client) resolve(client);
      else reject(new Error("โหลด Google Identity ไม่สำเร็จ"));
    };
    script.addEventListener("load", onReady);
    script.addEventListener("error", () =>
      reject(new Error("โหลด Google Identity ไม่สำเร็จ กรุณาลองใหม่")),
    );
    if (!already) {
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google?.accounts?.oauth2) {
      onReady();
    }
  });
}

/**
 * Ask Google for Sheets scopes only. Does not change LINE / Firebase / Supabase login.
 */
export async function requestGoogleSheetsAccessToken(options?: {
  promptConsent?: boolean;
}): Promise<string> {
  const clientId = getOAuthClientId();
  if (!clientId) {
    throw new Error("ยังไม่ได้ตั้งค่า Google OAuth Client ID สำหรับสิทธิ์ชีต");
  }

  const oauth2 = await loadGisClient();

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_WORKSPACE_SCOPES.join(" "),
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(
            new Error(
              resp.error_description ||
                resp.error ||
                "ไม่ได้รับสิทธิ์ Google Sheets กรุณาอนุญาตแล้วลองใหม่",
            ),
          );
          return;
        }
        setGoogleAccessToken(resp.access_token);
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        const cancelled = err?.type === "popup_closed" || err?.type === "popup_failed_to_open";
        reject(
          new Error(
            cancelled
              ? "ยกเลิกการอนุญาต Google Sheets แล้ว"
              : err?.message || "ขอสิทธิ์ Google Sheets ไม่สำเร็จ",
          ),
        );
      },
    });
    client.requestAccessToken({ prompt: options?.promptConsent ? "consent" : "" });
  });
}

export function isSheetsAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("authentication ไม่ผ่าน") ||
    message.includes("invalid_grant") ||
    message.includes("[401]") ||
    /\b401\b/.test(message)
  );
}

export function lineSheetsHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (isSheetsAuthError(error)) {
    return "บัญชี LINE ยังไม่มีสิทธิ์ Google Sheets — กดรีเฟรชจากชีต แล้วอนุญาต Google (ไม่เปลี่ยนบัญชีที่ล็อกอิน)";
  }
  return message;
}

export async function ensureSheetsClientAuth(options?: {
  interactive?: boolean;
}): Promise<SheetsAuthPayload> {
  const interactive = options?.interactive ?? true;
  let payload = getSheetsAuthPayload();
  if (!payload.accessToken && !payload.serviceAccountJson && interactive) {
    await requestGoogleSheetsAccessToken();
    payload = getSheetsAuthPayload();
  }
  return payload;
}

export async function refreshSheetsAccessToken(): Promise<void> {
  setGoogleAccessToken(null);
  await requestGoogleSheetsAccessToken({ promptConsent: true });
}

export async function withSheetsAuthRetry<T>(
  run: (payload: SheetsAuthPayload) => Promise<T>,
  options?: { interactive?: boolean },
): Promise<T> {
  const interactive = options?.interactive ?? true;
  const payload = await ensureSheetsClientAuth({ interactive });
  try {
    return await run(payload);
  } catch (error) {
    if (!interactive || !isSheetsAuthError(error)) throw error;
    await refreshSheetsAccessToken();
    return run(getSheetsAuthPayload());
  }
}

if (typeof window !== "undefined" && !import.meta.env.VITEST) {
  void loadGisClient().catch(() => {});
}
