import { describe, expect, it } from "vitest";
import {
  DEFAULT_RATES,
  OT_OPTIONS,
  calculatePayroll,
  dateInBangkok,
  parseCSVToLogs,
  rowToLog,
} from "./work-log";

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

  it("parses CSV rows with quoted fields and numbers correctly", () => {
    const csv = `รหัส,วันที่,เวลาเข้า,เวลาออก,ประเภทงาน,สถานที่,พิกัดเข้า,พิกัดออก,ชั่วโมงรวม,ชั่วโมงปกติ,ชั่วโมง OT,ตัวคูณ OT,ค่าแรงพื้นฐาน,ค่า OT,ค่าเดินทาง,ค่าอาหาร,รายรับอื่น,รายการหัก,รายได้สุทธิ,จำนวนงานที่ทำเสร็จ,รายละเอียดงาน
LOG-1786264136771,2026-08-02,08:30:00,17:30:00,คลัง QT,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.648316, 100.787597","13.648316, 100.787597",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1786773363268,2026-08-13,20:30:00,07:30:00,ACOM,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.567874, 100.762624","13.567874, 100.762624",11,8,2,1.5,400,150,50,50,0,5,645,1,ACOM`;

    const logs = parseCSVToLogs(csv);
    expect(logs.length).toBe(2);
    expect(logs[0]?.id).toBe("LOG-1786264136771");
    expect(logs[0]?.workType).toBe("คลัง QT");
    expect(logs[0]?.locationName).toBe("บ้านคลองสกัด 25, ตำบลบางเสาธง");
    expect(logs[0]?.netIncome).toBe(500);

    expect(logs[1]?.id).toBe("LOG-1786773363268");
    expect(logs[1]?.otHours).toBe(2);
    expect(logs[1]?.otType).toBe(1.5);
    expect(logs[1]?.netIncome).toBe(645);
  });
});
