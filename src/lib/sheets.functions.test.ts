import { describe, expect, it } from "vitest";
import { categoriesFromWorkLogRows, normalizeSpreadsheetId } from "./sheets.functions";

describe("Google Sheets direct API input", () => {
  it("extracts the spreadsheet ID from a full Google Sheets URL", () => {
    expect(
      normalizeSpreadsheetId("https://docs.google.com/spreadsheets/d/1AbC_def-123/edit#gid=0"),
    ).toBe("1AbC_def-123");
  });

  it("accepts a raw spreadsheet ID and trims whitespace", () => {
    expect(normalizeSpreadsheetId("  1AbC_def-123  ")).toBe("1AbC_def-123");
  });

  it("extracts unique work types from the WorkLogs work-type column", () => {
    expect(
      categoriesFromWorkLogRows([
        ["LOG-1", "2026-08-27", "08:00", "", " ติดตั้ง "],
        ["LOG-2", "2026-08-28", "08:00", "", "ซ่อม"],
        ["LOG-3", "2026-08-29", "08:00", "", "ติดตั้ง"],
        ["LOG-4", "2026-08-30", "08:00", "", ""],
      ]),
    ).toEqual(["ติดตั้ง", "ซ่อม"]);
  });
});
