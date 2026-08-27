import { describe, expect, it } from "vitest";
import { chooseInitialCategories, normalizeCategoryNames } from "./settings-sync";

describe("settings synchronization policy", () => {
  it("normalizes whitespace and duplicate names without changing first-seen order", () => {
    expect(normalizeCategoryNames([" ติดตั้ง ", "ซ่อม", "ติดตั้ง", "", null, "ซ่อม"])).toEqual([
      "ติดตั้ง",
      "ซ่อม",
    ]);
  });

  it("prioritizes Supabase over stale local and sheet values", () => {
    expect(
      chooseInitialCategories({
        remote: ["งานจากบัญชี"],
        sheet: ["งานจากชีท"],
        local: ["งานเก่าบน Safari"],
        fallback: ["งานเริ่มต้น"],
      }),
    ).toEqual(["งานจากบัญชี"]);
  });

  it("imports from the sheet when the remote account has no categories", () => {
    expect(
      chooseInitialCategories({
        remote: [],
        sheet: [" งานจากชีท ", "งานจากชีท"],
        local: ["งานเก่าบนเบราว์เซอร์"],
        fallback: ["งานเริ่มต้น"],
      }),
    ).toEqual(["งานจากชีท"]);
  });

  it("uses local then defaults only when remote and sheet are empty", () => {
    expect(
      chooseInitialCategories({
        remote: [],
        sheet: [],
        local: ["งานที่เคยตั้งบนเครื่อง"],
        fallback: ["งานเริ่มต้น"],
      }),
    ).toEqual(["งานที่เคยตั้งบนเครื่อง"]);
    expect(
      chooseInitialCategories({ remote: [], sheet: [], local: [], fallback: ["งานเริ่มต้น"] }),
    ).toEqual(["งานเริ่มต้น"]);
  });
});
