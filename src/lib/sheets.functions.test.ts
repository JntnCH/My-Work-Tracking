import { describe, expect, it } from "vitest";
import { normalizeSpreadsheetId } from "./sheets.functions";

describe("Google Sheets direct API input", () => {
  it("extracts the spreadsheet ID from a full Google Sheets URL", () => {
    expect(
      normalizeSpreadsheetId("https://docs.google.com/spreadsheets/d/1AbC_def-123/edit#gid=0"),
    ).toBe("1AbC_def-123");
  });

  it("accepts a raw spreadsheet ID and trims whitespace", () => {
    expect(normalizeSpreadsheetId("  1AbC_def-123  ")).toBe("1AbC_def-123");
  });
});
