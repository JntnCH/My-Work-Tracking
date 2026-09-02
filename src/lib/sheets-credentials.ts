import { getGoogleAccessToken } from "@/lib/firebase";
import { storage } from "@/lib/work-log";

export type SheetsAuthPayload = {
  accessToken?: string;
  serviceAccountJson?: string;
};

/**
 * Retrieves the available Google Sheets authentication credentials (OAuth token or Service Account JSON)
 */
export function getSheetsAuthPayload(): SheetsAuthPayload {
  const accessToken = getGoogleAccessToken() || undefined;
  const serviceAccountJson = storage.getServiceAccount()?.trim() || undefined;

  return {
    ...(accessToken ? { accessToken } : {}),
    ...(serviceAccountJson ? { serviceAccountJson } : {}),
  };
}

/**
 * Helper to parse service account JSON and get client_email and project_id safely
 */
export function parseServiceAccountInfo(jsonString: string): {
  clientEmail?: string;
  projectId?: string;
  isValid: boolean;
  error?: string;
} {
  const trimmed = jsonString.trim();
  if (!trimmed) {
    return { isValid: false };
  }
  try {
    const parsed = JSON.parse(trimmed) as {
      client_email?: string;
      project_id?: string;
      private_key?: string;
      type?: string;
    };

    if (!parsed.client_email) {
      return { isValid: false, error: "ไม่พบฟิลด์ client_email ในไฟล์ JSON" };
    }
    if (!parsed.private_key) {
      return { isValid: false, error: "ไม่พบฟิลด์ private_key ในไฟล์ JSON" };
    }

    return {
      clientEmail: parsed.client_email,
      projectId: parsed.project_id,
      isValid: true,
    };
  } catch {
    return { isValid: false, error: "รูปแบบ JSON ไม่ถูกต้อง กรุณาวางเนื้อหาทั้งหมดของไฟล์ .json" };
  }
}
