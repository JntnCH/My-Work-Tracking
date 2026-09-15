import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({
  GOOGLE_WORKSPACE_SCOPES: ["https://www.googleapis.com/auth/spreadsheets"],
  setGoogleAccessToken: vi.fn(),
}));

vi.mock("@/lib/sheets-credentials", () => ({
  getSheetsAuthPayload: vi.fn(() => ({})),
}));

import { isSheetsAuthError, lineSheetsHint } from "@/lib/google-sheets-oauth";

describe("sheets auth error helpers", () => {
  it("detects the 401 message shown to LINE users", () => {
    const error = new Error(
      "Google authentication ไม่ผ่าน: ตรวจสอบ Service Account email และ private key หรือล็อกอินใหม่อีกครั้ง",
    );
    expect(isSheetsAuthError(error)).toBe(true);
    expect(lineSheetsHint(error)).toContain("บัญชี LINE");
  });

  it("keeps unrelated errors", () => {
    const error = new Error("ไม่พบ Spreadsheet");
    expect(isSheetsAuthError(error)).toBe(false);
    expect(lineSheetsHint(error)).toBe("ไม่พบ Spreadsheet");
  });
});
