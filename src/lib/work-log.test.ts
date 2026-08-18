import { describe, expect, it } from "vitest";
import { DEFAULT_RATES, OT_OPTIONS, calculatePayroll, dateInBangkok, rowToLog } from "./work-log";

describe("Work Tracker payroll", () => {
  it("uses ไม่มี OT as the default OT option", () => {
    expect(DEFAULT_RATES.otType).toBe(0);
    expect(OT_OPTIONS[0]).toEqual({ value: 0, label: "ไม่มี OT" });
  });

  it("does not add OT income when the OT multiplier is zero", () => {
    const result = calculatePayroll("2026-08-14T01:00:00.000Z", "2026-08-14T10:00:00.000Z", {
      ...DEFAULT_RATES,
      dailyRate: 800,
      otType: 0,
    });

    expect(result.grossHours).toBe(9);
    expect(result.workingHours).toBe(8);
    expect(result.otHours).toBe(0);
    expect(result.baseWage).toBe(800);
    expect(result.otIncome).toBe(0);
    expect(result.netIncome).toBe(800);
  });

  it("calculates OT income from the selected multiplier", () => {
    const result = calculatePayroll("2026-08-14T01:00:00.000Z", "2026-08-14T12:00:00.000Z", {
      ...DEFAULT_RATES,
      dailyRate: 800,
      otType: 1.5,
    });

    expect(result.grossHours).toBe(11);
    expect(result.workingHours).toBe(8);
    expect(result.otHours).toBe(2);
    expect(result.baseWage).toBe(800);
    expect(result.otIncome).toBe(300);
    expect(result.netIncome).toBe(1100);
  });

  it("uses the Bangkok calendar date for timestamps near UTC midnight", () => {
    expect(dateInBangkok("2026-08-13T17:30:00.000Z")).toBe("2026-08-14");
  });

  it("reads an empty OT cell as ไม่มี OT when importing a Sheet row", () => {
    const log = rowToLog([
      "LOG-1",
      "2026-08-14",
      "08:00:00",
      "17:00:00",
      "งานติดตั้ง",
      "ไซต์งาน",
      "13.1, 100.1",
      "13.2, 100.2",
      "9",
      "8",
      "0",
      "",
      "500",
      "0",
      "0",
      "0",
      "0",
      "500",
      "0",
      "",
      "ติดตั้งระบบ",
    ]);

    expect(log?.otType).toBe(0);
  });
});
