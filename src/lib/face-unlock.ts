/**
 * "ปลดล็อกด้วย Face ID / Touch ID" — WebAuthn platform authenticator used as a
 * local app lock after the user has already signed in.
 * The credential id is stored per user id on this device only.
 */

const KEY = "work_tracker_face_unlock";

type Stored = Record<string, string>; // userId -> base64url credentialId

function readAll(): Stored {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

function writeAll(value: Stored) {
  window.localStorage.setItem(KEY, JSON.stringify(value));
}

export function isFaceUnlockSupported() {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export function isIframeEnvironment() {
  return typeof window !== "undefined" && window.self !== window.top;
}

export function getFaceCredentialId(userId: string): string | null {
  return readAll()[userId] ?? null;
}

export function clearFaceCredential(userId: string) {
  const all = readAll();
  delete all[userId];
  writeAll(all);
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function randomChallenge() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

function getRelyingPartyId() {
  if (typeof window === "undefined") return "localhost";
  const hostname = window.location.hostname;
  return hostname;
}

function formatError(err: unknown, action: "enroll" | "verify"): string {
  if (isIframeEnvironment()) {
    return "เนื่องจากกำลังเปิดแอปในกรอบตัวอย่าง (iframe) เบราว์เซอร์จะบล็อก Face ID ด้วยเหตุผลด้านความปลอดภัย กรุณากดปุ่มเปิดในแท็บใหม่ (Open in New Tab) เพื่อใช้งาน Face ID";
  }

  if (err instanceof Error) {
    if (err.name === "NotAllowedError") {
      return action === "enroll"
        ? "การตั้งค่า Face ID ถูกยกเลิก หรือไม่ได้เปิดสิทธิ์สแกนใบหน้าบนเบราว์เซอร์/อุปกรณ์นี้"
        : "การสแกน Face ID / Touch ID ถูกยกเลิก หรือไม่ตรงกับข้อมูลในเครื่อง";
    }
    if (err.name === "SecurityError") {
      return "เบราว์เซอร์ไม่อนุญาตให้ใช้ Face ID ในหน้านี้ กรุณาเปิดแอปในแท็บใหม่ผ่าน HTTPS";
    }
    if (err.name === "NotSupportedError") {
      return "อุปกรณ์หรือเบราว์เซอร์นี้ยังไม่รองรับระบบสแกนใบหน้า/ลายนิ้วมือ";
    }
    if (err.name === "InvalidStateError") {
      return "บัญชีนี้ได้ลงทะเบียน Face ID บนอุปกรณ์นี้เรียบร้อยแล้ว";
    }
    return err.message;
  }
  return String(err);
}

/** Registers a platform credential (Face ID / Touch ID) for this user + device. */
export async function enrollFaceUnlock(userId: string, displayName: string) {
  if (!isFaceUnlockSupported()) {
    throw new Error("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ Face ID / Touch ID");
  }

  if (isIframeEnvironment()) {
    throw new Error(
      "เนื่องจากเปิดแอปอยู่ในกรอบพรีวิว (iframe) เบราว์เซอร์จึงบล็อก Face ID กรุณากดเปิดแอปในแท็บใหม่ (New Tab) เพื่อเปิดใช้ Face ID",
    );
  }

  try {
    const rpId = getRelyingPartyId();
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: "Work Tracker", id: rpId },
        user: {
          id: Uint8Array.from(userId.slice(0, 32), (c) => c.charCodeAt(0)),
          name: displayName || "User",
          displayName: displayName || "User",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          userVerification: "preferred",
        },
        timeout: 60_000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("ไม่ได้รับข้อมูลการยืนยันตัวตนจากอุปกรณ์");
    }

    const all = readAll();
    all[userId] = toBase64Url(credential.rawId);
    writeAll(all);
  } catch (err) {
    throw new Error(formatError(err, "enroll"));
  }
}

/** Prompts Face ID / Touch ID. Resolves when the device verifies the user. */
export async function verifyFaceUnlock(userId: string) {
  const stored = getFaceCredentialId(userId);
  if (!stored) {
    throw new Error("ยังไม่ได้ตั้งค่า Face ID บนอุปกรณ์นี้");
  }

  if (isIframeEnvironment()) {
    throw new Error(
      "เนื่องจากเปิดแอปอยู่ในกรอบพรีวิว (iframe) เบราว์เซอร์จึงบล็อก Face ID กรุณากดเปิดแอปในแท็บใหม่ (New Tab) เพื่อปลดล็อกด้วย Face ID",
    );
  }

  try {
    const rpId = getRelyingPartyId();
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        rpId: rpId,
        allowCredentials: [{ type: "public-key", id: fromBase64Url(stored) }],
        userVerification: "preferred",
        timeout: 60_000,
      },
    });

    if (!assertion) {
      throw new Error("การยืนยันตัวตนด้วย Face ID ไม่สำเร็จ");
    }
  } catch (err) {
    throw new Error(formatError(err, "verify"));
  }
}
