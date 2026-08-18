import type { DashboardLayout, DashboardViewport } from "@/lib/dashboard-layout";

export type EditorHistoryScope = "dashboard-layout";

export type DraftTransaction = {
  id: string;
  scope: EditorHistoryScope;
  viewport: DashboardViewport;
  label: string;
  before: DashboardLayout;
  after: DashboardLayout;
  createdAt: number;
  /** ใช้รวมการเปลี่ยนต่อเนื่องของการ์ดเดียวกัน เช่น resize */
  mergeKey?: string;
};

export type EditorHistoryEntry = DraftTransaction;

export type EditorHistoryState = {
  past: EditorHistoryEntry[];
  future: EditorHistoryEntry[];
};

export type EditorHistoryAction =
  | { type: "push"; entry: EditorHistoryEntry }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" };

export const DEFAULT_EDITOR_HISTORY_LIMIT = 50;

let transactionSequence = 0;

export function createEmptyHistory(): EditorHistoryState {
  return { past: [], future: [] };
}

export function cloneDashboardLayout(layout: DashboardLayout): DashboardLayout {
  return {
    version: layout.version,
    cards: layout.cards.map((card) => ({ ...card })),
  };
}

export function dashboardLayoutsEqual(a: DashboardLayout, b: DashboardLayout): boolean {
  if (a.version !== b.version || a.cards.length !== b.cards.length) return false;

  return a.cards.every((card, index) => {
    const other = b.cards[index];
    return (
      card.id === other?.id &&
      card.group === other.group &&
      card.order === other.order &&
      card.width === other.width &&
      card.height === other.height
    );
  });
}

export function createDashboardLayoutTransaction(
  before: DashboardLayout,
  after: DashboardLayout,
  viewport: DashboardViewport,
  label: string,
  mergeKey?: string,
): DraftTransaction | null {
  if (dashboardLayoutsEqual(before, after)) return null;

  transactionSequence += 1;
  const transaction: DraftTransaction = {
    id: `dashboard-layout-${Date.now()}-${transactionSequence}`,
    scope: "dashboard-layout",
    viewport,
    label,
    before: cloneDashboardLayout(before),
    after: cloneDashboardLayout(after),
    createdAt: Date.now(),
  };
  if (mergeKey !== undefined) transaction.mergeKey = mergeKey;
  return transaction;
}

export function isMeaningfulTransaction(transaction: DraftTransaction): boolean {
  return !dashboardLayoutsEqual(transaction.before, transaction.after);
}

export function editorHistoryReducer(
  state: EditorHistoryState,
  action: EditorHistoryAction,
  maxEntries = DEFAULT_EDITOR_HISTORY_LIMIT,
): EditorHistoryState {
  const limit = Math.max(1, Math.floor(maxEntries));

  switch (action.type) {
    case "push": {
      if (!isMeaningfulTransaction(action.entry)) return state;

      const last = state.past[state.past.length - 1];
      if (last?.mergeKey && last.mergeKey === action.entry.mergeKey) {
        const merged: EditorHistoryEntry = {
          ...last,
          after: cloneDashboardLayout(action.entry.after),
          createdAt: action.entry.createdAt,
          label: action.entry.label,
        };
        const nextPast = dashboardLayoutsEqual(merged.before, merged.after)
          ? state.past.slice(0, -1)
          : state.past.slice(0, -1).concat(merged);
        return {
          past: nextPast,
          future: [],
        };
      }

      return {
        past: state.past.concat(action.entry).slice(-limit),
        future: [],
      };
    }
    case "undo": {
      const entry = state.past[state.past.length - 1];
      if (!entry) return state;
      return {
        past: state.past.slice(0, -1),
        future: state.future.concat(entry),
      };
    }
    case "redo": {
      const entry = state.future[state.future.length - 1];
      if (!entry) return state;
      return {
        past: state.past.concat(entry).slice(-limit),
        future: state.future.slice(0, -1),
      };
    }
    case "clear":
      return createEmptyHistory();
    default:
      return state;
  }
}
