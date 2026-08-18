import { describe, expect, it } from "vitest";
import {
  allConnectionTestsPassed,
  CONNECTION_TEST_KEYS,
  countPassedConnectionTests,
  type ConnectionTestResult,
} from "./sheets-diagnostics";

const passingResult: ConnectionTestResult = {
  googleAccount: true,
  serviceAccount: true,
  spreadsheetId: true,
  spreadsheetAccess: true,
  readTest: true,
  writeTest: true,
  updateTest: true,
  deleteTest: true,
  errorDetails: "",
};

describe("Google Sheets connection diagnostics", () => {
  it("defines the eight requested checks", () => {
    expect(CONNECTION_TEST_KEYS).toHaveLength(8);
  });

  it("recognizes a complete successful diagnostic", () => {
    expect(countPassedConnectionTests(passingResult)).toBe(8);
    expect(allConnectionTestsPassed(passingResult)).toBe(true);
  });

  it("reports partial failures without treating them as success", () => {
    const partial = { ...passingResult, updateTest: false };
    expect(countPassedConnectionTests(partial)).toBe(7);
    expect(allConnectionTestsPassed(partial)).toBe(false);
  });
});
