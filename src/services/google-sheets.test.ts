import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GoogleSheetsService,
  createJWTClient,
  getGoogleCredentialsFromEnv,
  normalizeSpreadsheetId,
  parseServiceAccountCredentials,
} from "./google-sheets";

describe("Google Sheets Service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("normalizeSpreadsheetId", () => {
    it("extracts ID from standard Google Sheets URL", () => {
      expect(
        normalizeSpreadsheetId(
          "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0",
        ),
      ).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
    });

    it("extracts ID from share URL", () => {
      expect(
        normalizeSpreadsheetId(
          "https://docs.google.com/spreadsheets/d/19_XYZ-abc123_DEF456/edit?usp=sharing",
        ),
      ).toBe("19_XYZ-abc123_DEF456");
    });

    it("trims raw spreadsheet ID string", () => {
      expect(normalizeSpreadsheetId("   19_XYZ-abc123_DEF456   ")).toBe("19_XYZ-abc123_DEF456");
    });

    it("returns empty string for empty input", () => {
      expect(normalizeSpreadsheetId("")).toBe("");
    });
  });

  describe("getGoogleCredentialsFromEnv", () => {
    it("extracts credentials from separate EMAIL and PRIVATE_KEY environment variables", () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "bot@example.iam.gserviceaccount.com";
      process.env.GOOGLE_PRIVATE_KEY =
        "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgk\\n-----END PRIVATE KEY-----\\n";

      const creds = getGoogleCredentialsFromEnv();
      expect(creds.clientEmail).toBe("bot@example.iam.gserviceaccount.com");
      expect(creds.privateKey).toContain("\n");
      expect(creds.privateKey).not.toContain("\\n");
    });

    it("extracts credentials from GOOGLE_SERVICE_ACCOUNT_JSON", () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        client_email: "json-bot@example.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----",
      });

      const creds = getGoogleCredentialsFromEnv();
      expect(creds.clientEmail).toBe("json-bot@example.iam.gserviceaccount.com");
      expect(creds.privateKey).toBe(
        "-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----",
      );
    });

    it("throws clear error when credentials are missing", () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      delete process.env.GOOGLE_CLIENT_EMAIL;
      delete process.env.GOOGLE_PRIVATE_KEY;

      expect(() => getGoogleCredentialsFromEnv()).toThrowError(
        /Missing Google credentials in environment variables/,
      );
    });
  });

  describe("parseServiceAccountCredentials", () => {
    it("parses explicit GoogleSheetsCredentials object", () => {
      const creds = parseServiceAccountCredentials({
        clientEmail: "test@project.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nKEY\n-----END PRIVATE KEY-----",
      });

      expect(creds.clientEmail).toBe("test@project.iam.gserviceaccount.com");
      expect(creds.privateKey).toContain("KEY");
    });

    it("parses JSON string representation of service account key", () => {
      const jsonKey = JSON.stringify({
        client_email: "test-json@project.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\\nKEY\\n-----END PRIVATE KEY-----",
      });

      const creds = parseServiceAccountCredentials(jsonKey);
      expect(creds.clientEmail).toBe("test-json@project.iam.gserviceaccount.com");
      expect(creds.privateKey).toContain("\n");
    });
  });

  describe("createJWTClient", () => {
    it("creates a JWT client from service account credentials using google-auth-library", () => {
      const jwtClient = createJWTClient({
        clientEmail: "service-acc@example.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----",
      });

      expect(jwtClient).toBeDefined();
      expect(jwtClient.email).toBe("service-acc@example.iam.gserviceaccount.com");
    });
  });

  describe("GoogleSheetsService class", () => {
    it("instantiates successfully with credentials and default scopes", () => {
      const service = new GoogleSheetsService({
        credentials: {
          clientEmail: "service-acc@example.iam.gserviceaccount.com",
          privateKey: "-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----",
        },
      });

      expect(service).toBeInstanceOf(GoogleSheetsService);
    });
  });
});
