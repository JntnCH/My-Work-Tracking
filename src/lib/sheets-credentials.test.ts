import { beforeEach, describe, expect, it, vi } from "vitest";

const { getGoogleAccessToken, getServiceAccount } = vi.hoisted(() => ({
  getGoogleAccessToken: vi.fn(),
  getServiceAccount: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  getGoogleAccessToken,
}));

vi.mock("@/lib/work-log", () => ({
  storage: {
    getServiceAccount,
  },
}));

import { getSheetsAuthPayload } from "@/lib/sheets-credentials";

describe("getSheetsAuthPayload", () => {
  beforeEach(() => {
    getGoogleAccessToken.mockReturnValue(null);
    getServiceAccount.mockReturnValue("");
  });

  it("does not send the bundled default service account", () => {
    expect(getSheetsAuthPayload()).toEqual({});
  });

  it("sends a Google OAuth token from login or LINE Sheets consent", () => {
    getGoogleAccessToken.mockReturnValue("ya29.token");
    expect(getSheetsAuthPayload()).toEqual({ accessToken: "ya29.token" });
  });

  it("sends only a service account the user saved", () => {
    getServiceAccount.mockReturnValue('{"client_email":"bot@x.iam.gserviceaccount.com"}');
    expect(getSheetsAuthPayload()).toEqual({
      serviceAccountJson: '{"client_email":"bot@x.iam.gserviceaccount.com"}',
    });
  });
});
