import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  liff: {
    init: vi.fn(),
    isLoggedIn: vi.fn(),
    login: vi.fn(),
    getIDToken: vi.fn(),
    getProfile: vi.fn().mockResolvedValue({ displayName: "Test User", pictureUrl: "" }),
  },
  auth: {
    signInWithIdToken: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
}));

vi.mock("@line/liff", () => ({ default: mocks.liff }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: mocks.auth },
  isSupabaseConfigured: () => true,
}));

describe("configured LINE LIFF authentication", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_LINE_LIFF_ID", "1234567890-AbcdEfgh");
    vi.stubGlobal("window", {
      location: {
        origin: "https://tracker.example",
        href: "https://tracker.example/auth?line_login=1&access_token=secret#access_token=secret",
        pathname: "/auth",
        search: "?line_login=1&access_token=secret",
        hash: "#access_token=secret",
        assign: vi.fn(),
      },
      history: { replaceState: vi.fn() },
    });
    vi.stubGlobal("document", { title: "เข้าสู่ระบบ — Work Tracker" });
    mocks.liff.init.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("initializes LIFF and starts LINE login when the user is not logged in", async () => {
    mocks.liff.isLoggedIn.mockReturnValue(false);
    const { startLineLogin } = await import("./line-auth");

    const result = await startLineLogin();

    expect(result).toEqual({ redirected: true });
    expect(mocks.liff.init).toHaveBeenCalledWith({ liffId: "1234567890-AbcdEfgh" });
    expect(mocks.liff.login).toHaveBeenCalledWith({
      redirectUri: "https://tracker.example/auth?line_login=1",
    });
    expect(mocks.auth.signInWithIdToken).not.toHaveBeenCalled();
  });

  it("exchanges the raw LIFF ID token through Supabase and cleans callback parameters", async () => {
    mocks.liff.isLoggedIn.mockReturnValue(true);
    mocks.liff.getIDToken.mockReturnValue("raw-line-id-token");
    mocks.auth.signInWithIdToken.mockResolvedValue({
      data: { session: { user: { id: "supabase-user" } } },
      error: null,
    });
    const { completeLineLiffLoginIfNeeded } = await import("./line-auth");

    const result = await completeLineLiffLoginIfNeeded();

    expect(result).toEqual({ redirected: false });
    expect(mocks.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "custom:line",
      token: "raw-line-id-token",
    });
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      "เข้าสู่ระบบ — Work Tracker",
      "/auth",
    );
  });

  it("does not initialize LIFF more than once within the same page lifecycle", async () => {
    mocks.liff.isLoggedIn.mockReturnValue(false);
    const { startLineLogin, initializeLineLiffOnPrimaryRedirect } = await import("./line-auth");

    await startLineLogin();
    window.location.search = "?liff.state=opaque-state";
    await initializeLineLiffOnPrimaryRedirect();

    expect(mocks.liff.init).toHaveBeenCalledTimes(1);
  });
});
