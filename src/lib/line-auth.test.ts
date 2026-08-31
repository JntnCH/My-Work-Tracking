import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  liff: {
    init: vi.fn(),
    isLoggedIn: vi.fn(),
    login: vi.fn(),
    getIDToken: vi.fn(),
  },
  auth: {
    signInWithIdToken: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
}));

vi.mock("@line/liff", () => ({ default: mocks.liff }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: mocks.auth } }));

import {
  getLineAuthErrorMessage,
  getLineProviderId,
  isLineLiffCallback,
  isLineLiffPrimaryRedirect,
  startLineLogin,
} from "./line-auth";

describe("LINE LIFF authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_LINE_LIFF_ID", "");
    vi.stubGlobal("window", {
      location: {
        origin: "https://tracker.example",
        search: "",
        assign: vi.fn(),
      },
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the Supabase custom provider identifier", () => {
    expect(getLineProviderId()).toBe("custom:line");
  });

  it("detects the LIFF secondary callback without accepting other values", () => {
    expect(isLineLiffCallback()).toBe(false);

    window.location.search = "?line_login=1";
    expect(isLineLiffCallback()).toBe(true);

    window.location.search = "?line_login=0";
    expect(isLineLiffCallback()).toBe(false);
  });

  it("detects the LIFF primary redirect state", () => {
    window.location.search = "?liff.state=opaque-state";
    expect(isLineLiffPrimaryRedirect()).toBe(true);

    window.location.search = "?state=opaque-state";
    expect(isLineLiffPrimaryRedirect()).toBe(false);
  });

  it("falls back to Supabase custom OIDC when no LIFF ID is configured", async () => {
    mocks.auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://supabase.example/auth/authorize" },
      error: null,
    });

    const result = await startLineLogin();

    expect(result).toEqual({ redirected: true });
    expect(mocks.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "custom:line",
      options: {
        redirectTo: "https://tracker.example/auth/callback",
      },
    });
    expect(window.location.assign).toHaveBeenCalledWith("https://supabase.example/auth/authorize");
  });

  it("maps sensitive or provider errors to safe user-facing messages", () => {
    expect(getLineAuthErrorMessage(new Error("invalid_id_token raw-token-value"))).toContain(
      "ยืนยันตัวตนไม่สำเร็จ",
    );
    expect(getLineAuthErrorMessage({ code: "UNAUTHORIZED" })).toContain("ยกเลิก");
    expect(getLineAuthErrorMessage({ code: 400 })).toContain("redirect URI");
    expect(getLineAuthErrorMessage(new Error("custom provider is not enabled"))).toContain(
      "provider ใน Supabase",
    );
  });
});
