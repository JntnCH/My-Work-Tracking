import { describe, expect, it } from "vitest";
import {
  createDashboardLayoutTransaction,
  editorHistoryReducer,
  type EditorHistoryState,
} from "@/lib/editor-history";
import { createDefaultDashboardLayout, updateDashboardCard } from "@/lib/dashboard-layout";

describe("Dashboard editor history", () => {
  it("pushes a transaction, then moves it between past and future", () => {
    const before = createDefaultDashboardLayout("mobile");
    const after = updateDashboardCard(before, "net-income", { height: 2 });
    const entry = createDashboardLayoutTransaction(before, after, "mobile", "ปรับความสูง");
    expect(entry).not.toBeNull();

    const pushed = editorHistoryReducer({ past: [], future: [] }, { type: "push", entry: entry! });
    expect(pushed.past).toHaveLength(1);
    expect(pushed.future).toHaveLength(0);

    const undone = editorHistoryReducer(pushed, { type: "undo" });
    expect(undone.past).toHaveLength(0);
    expect(undone.future).toHaveLength(1);

    const redone = editorHistoryReducer(undone, { type: "redo" });
    expect(redone.past).toHaveLength(1);
    expect(redone.future).toHaveLength(0);
  });

  it("clears redo branches after a new draft transaction", () => {
    const initial = createDefaultDashboardLayout("desktop");
    const first = updateDashboardCard(initial, "net-income", { width: 2 });
    const second = updateDashboardCard(first, "net-income", { height: 2 });
    const firstEntry = createDashboardLayoutTransaction(initial, first, "desktop", "กว้าง");
    const secondEntry = createDashboardLayoutTransaction(first, second, "desktop", "สูง");

    let state: EditorHistoryState = { past: [], future: [] };
    state = editorHistoryReducer(state, { type: "push", entry: firstEntry! });
    state = editorHistoryReducer(state, { type: "push", entry: secondEntry! });
    state = editorHistoryReducer(state, { type: "undo" });
    expect(state.future).toHaveLength(1);

    const replacement = updateDashboardCard(first, "net-income", { width: 3 });
    const replacementEntry = createDashboardLayoutTransaction(
      first,
      replacement,
      "desktop",
      "เปลี่ยนความกว้างใหม่",
    );
    state = editorHistoryReducer(state, { type: "push", entry: replacementEntry! });
    expect(state.future).toHaveLength(0);
    expect(state.past).toHaveLength(2);
  });

  it("limits past history and merges consecutive changes with the same mergeKey", () => {
    const initial = createDefaultDashboardLayout("desktop");
    const first = updateDashboardCard(initial, "net-income", { width: 2 });
    const second = updateDashboardCard(first, "net-income", { width: 1 });
    const firstEntry = createDashboardLayoutTransaction(
      initial,
      first,
      "desktop",
      "กว้าง 2",
      "resize-width:desktop:net-income",
    );
    const secondEntry = createDashboardLayoutTransaction(
      first,
      second,
      "desktop",
      "กว้าง 1",
      "resize-width:desktop:net-income",
    );

    let state: EditorHistoryState = { past: [], future: [] };
    state = editorHistoryReducer(state, { type: "push", entry: firstEntry! }, 1);
    state = editorHistoryReducer(state, { type: "push", entry: secondEntry! }, 1);

    expect(state.past).toHaveLength(1);
    expect(state.past[0]?.before.cards.find((card) => card.id === "net-income")?.width).toBe(3);
    expect(state.past[0]?.after.cards.find((card) => card.id === "net-income")?.width).toBe(1);
  });

  it("ignores a transaction when before and after are equal", () => {
    const layout = createDefaultDashboardLayout("mobile");
    expect(createDashboardLayoutTransaction(layout, layout, "mobile", "ไม่มีการเปลี่ยนแปลง")).toBe(
      null,
    );
  });
});
