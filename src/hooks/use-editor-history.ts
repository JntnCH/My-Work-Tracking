import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  createEmptyHistory,
  editorHistoryReducer,
  type DraftTransaction,
  type EditorHistoryEntry,
  type EditorHistoryState,
} from "@/lib/editor-history";

export type UseEditorHistoryOptions = {
  maxEntries?: number;
};

export type UseEditorHistoryResult = {
  past: readonly EditorHistoryEntry[];
  future: readonly EditorHistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  push: (transaction: DraftTransaction) => void;
  undo: () => EditorHistoryEntry | null;
  redo: () => EditorHistoryEntry | null;
  clear: () => void;
};

export function useEditorHistory({
  maxEntries = 50,
}: UseEditorHistoryOptions = {}): UseEditorHistoryResult {
  const [state, dispatch] = useReducer(
    (current: EditorHistoryState, action: Parameters<typeof editorHistoryReducer>[1]) =>
      editorHistoryReducer(current, action, maxEntries),
    undefined,
    createEmptyHistory,
  );
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const push = useCallback((transaction: DraftTransaction) => {
    dispatch({ type: "push", entry: transaction });
  }, []);

  const undo = useCallback(() => {
    const entry = stateRef.current.past[stateRef.current.past.length - 1] ?? null;
    if (entry) dispatch({ type: "undo" });
    return entry;
  }, []);

  const redo = useCallback(() => {
    const entry = stateRef.current.future[stateRef.current.future.length - 1] ?? null;
    if (entry) dispatch({ type: "redo" });
    return entry;
  }, []);

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  return {
    past: state.past,
    future: state.future,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    push,
    undo,
    redo,
    clear,
  };
}
