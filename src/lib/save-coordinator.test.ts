import { describe, expect, it, vi } from "vitest";
import { createSaveCoordinator } from "@/lib/save-coordinator";

describe("SaveCoordinator", () => {
  it("validates all dirty scopes before the first remote write", async () => {
    const events: string[] = [];
    const coordinator = createSaveCoordinator([
      {
        scope: "theme",
        dirty: true,
        validate: () => events.push("validate-theme"),
        save: () => events.push("save-theme"),
      },
      {
        scope: "rates",
        dirty: true,
        validate: () => events.push("validate-rates"),
        save: () => events.push("save-rates"),
      },
    ]);

    const result = await coordinator.save();

    expect(result).toEqual({ savedScopes: ["theme", "rates"] });
    expect(events).toEqual(["validate-theme", "validate-rates", "save-theme", "save-rates"]);
  });

  it("does not call validate or save when every scope is clean", async () => {
    const validate = vi.fn();
    const save = vi.fn();
    const coordinator = createSaveCoordinator([{ scope: "layout", dirty: false, validate, save }]);

    expect(coordinator.hasDirtyParticipants()).toBe(false);
    await expect(coordinator.save()).resolves.toEqual({ savedScopes: [] });
    expect(validate).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("reports already saved scopes and the failed scope for retry", async () => {
    const coordinator = createSaveCoordinator([
      { scope: "theme", dirty: true, save: vi.fn() },
      {
        scope: "spreadsheet",
        dirty: true,
        save: async () => {
          throw new Error("Supabase unavailable");
        },
      },
      { scope: "layout", dirty: true, save: vi.fn() },
    ]);

    const result = await coordinator.save();

    expect(result.savedScopes).toEqual(["theme"]);
    expect(result.failedScope).toBe("spreadsheet");
    expect(result.error).toEqual(new Error("Supabase unavailable"));
  });

  it("stops before writes when validation fails", async () => {
    const save = vi.fn();
    const coordinator = createSaveCoordinator([
      {
        scope: "branch-profile",
        dirty: true,
        validate: () => {
          throw new Error("กรุณากรอกชื่อสาขา");
        },
        save,
      },
      { scope: "layout", dirty: true, save },
    ]);

    const result = await coordinator.save();

    expect(result.savedScopes).toEqual([]);
    expect(result.failedScope).toBe("branch-profile");
    expect(save).not.toHaveBeenCalled();
  });
});
