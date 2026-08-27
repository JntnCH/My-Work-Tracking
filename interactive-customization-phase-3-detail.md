# Phase 3: State Management, Undo/Redo & Save Workflow

**โปรเจ็กต์:** My-Work-Tracking  
**ขอบเขตเอกสาร:** แผนและโครงสร้างโค้ดสำหรับ State Management, Undo/Redo และ Save/Cancel workflow ของ Interactive Customization Editor  
**สถานะ:** เอกสารวางแผนเท่านั้น ยังไม่แก้ source code, ยังไม่เพิ่ม migration, ยังไม่ Commit และยังไม่ Push

## 1. เป้าหมายของ Phase 3

Phase 3 มีเป้าหมายทำให้ Interactive Customization Editor มีระบบจัดการสถานะที่คาดเดาได้ โดยแยก **ค่าที่กำลังแก้ไข**, **ค่าที่บันทึกแล้ว**, **ประวัติการแก้ไข**, **สถานะ Save** และ **สถานะ Lock** ออกจากกันอย่างชัดเจน ผู้ใช้ควรสามารถทดลองปรับ Layout ใน Settings, ย้อนกลับหรือทำซ้ำการเปลี่ยนแปลง และกด Save เพียงครั้งเดียวเพื่อบันทึก draft ของ Theme, Rates, Spreadsheet ID, Branch settings และ Dashboard Layout ตามขอบเขตที่เปลี่ยนแปลงจริง

ระบบปัจจุบันมีส่วนสำคัญอยู่แล้ว ได้แก่ `SettingsPanel` ที่มี draft/saved state, `DashboardLayoutEditor` ที่แยก Mobile/Desktop และมี `saveDraft()`/`cancelDraft()`, `useDashboardLayout` ที่โหลดและบันทึก Layout ต่อ viewport และ `use-work-tracker` ที่เป็น persistence boundary ของ Theme, Rates และ Branch settings [1] [2] [3] ดังนั้น Phase 3 ควรเป็นการสร้าง **history layer และ save coordinator** ครอบระบบเดิม ไม่ใช่สร้าง persistence layer ใหม่หรือเปลี่ยนสูตรคำนวณของระบบบันทึกการทำงาน

> หลักการสำคัญ: Undo/Redo เปลี่ยนเฉพาะ Draft ในหน่วยความจำ ส่วน Supabase จะถูกเรียกจาก Save workflow เท่านั้น การกด Undo, Redo, Reset, เปลี่ยน tab หรือเลือกการ์ดจะไม่เขียน Supabase

## 2. สิ่งที่มีอยู่แล้วและข้อสังเกตจากโค้ดจริง

### 2.1 SettingsPanel เป็นเจ้าของ Draft และ Save/Cancel ระดับหน้า

`SettingsPanel.tsx` มี state แยกค่าร่างและค่าที่บันทึกล่าสุด เช่น `draftColors`/`savedColors`, `rateForm`/`savedRateForm`, `sheetIdInput`/`savedSheetId`, `branchRateForm`/`savedBranchRateForm` และใช้ `layoutDirty` จาก `DashboardLayoutEditor` มาประกอบเป็น `isDirty` [1]

ปัจจุบัน `handleSaveAll()` บันทึก Theme, Rates, Layout และ Branch ตามลำดับ แล้วอัปเดต saved state และล็อกหน้าเมื่อทุกขั้นตอนผ่าน ส่วน `handleCancel()` คืนค่าของ Theme, Rates, Spreadsheet ID, Branch และเรียก `layoutEditorRef.current?.cancelDraft()` [1] จุดสำคัญของ Phase 3 คือย้ายกติกา orchestration นี้ไปไว้ใน coordinator ที่ทดสอบได้ โดยยังคง `SettingsPanel` เป็นเจ้าของ UX และ Lock/Unlock

### 2.2 DashboardLayoutEditor มีสอง draft streams แยกกัน

`DashboardLayoutEditor.tsx` เรียก `useDashboardLayout` สองครั้ง คือ Mobile และ Desktop, เก็บ snapshot ใน `mobileSnapshotRef` และ `desktopSnapshotRef`, คำนวณ dirty แยกต่อ viewport และเปิด imperative handle `saveDraft()`/`cancelDraft()` ให้ `SettingsPanel` เรียก [2]

ดังนั้น Undo/Redo ต้องแยก history ของ Mobile และ Desktop ออกจากกันด้วย ไม่ควรใช้ stack เดียวที่ทำให้การ Undo ของ Mobile ไปย้อนค่าของ Desktop

### 2.3 useDashboardLayout เป็น persistence boundary ของ Layout

`useDashboardLayout.ts` มี `layout`, `loading`, `loaded`, `saving`, `updateLayout`, `saveLayout` และ `resetLayout` โดย `saveLayout()` จะไม่ทำอะไรเมื่อเป็น Guest หรือยังโหลดไม่เสร็จ และเรียก `saveDashboardLayout()` เฉพาะเมื่อมี `userId` และไม่ใช่ Guest [3]

จึงควรคง hook นี้เป็นชั้นโหลด/บันทึกข้อมูล และเพิ่ม history ในชั้น Editor หรือเพิ่ม adapter ที่ไม่ทำให้หน้า `DashboardPanel` ซึ่งเป็น View-only ต้องรับภาระ history โดยไม่จำเป็น

### 2.4 use-work-tracker มี Save boundary แยกตาม domain

`saveRates()` และ `saveThemeSettings()` อัปเดต React state และ local storage แล้วจึงเขียน Supabase เมื่อ `useSupabase && userId` ส่วน `saveBranchSettings()` ต้องมีผู้ใช้และสาขาที่เลือก และ `setSpreadsheetId()` ในโค้ดปัจจุบันเป็น callback แบบ synchronous ที่เรียก Supabase แบบ fire-and-forget [4]

ข้อสังเกตหลังคือสำคัญต่อ SaveCoordinator: ถ้าต้องการรายงานความสำเร็จหรือความล้มเหลวของ Spreadsheet ID อย่างถูกต้อง ควรเพิ่ม async persistence adapter สำหรับ Save workflow แทนการใช้ `setSpreadsheetId()` แบบ fire-and-forget ไม่ควรถือว่า Save สำเร็จเพียงเพราะ state ในหน้าเปลี่ยนแล้ว

## 3. หลักการของ State Model ใน Phase 3

State ทั้งหมดควรแบ่งเป็น 5 ชั้น ไม่ควรรวมเป็น object เดียวที่แก้ได้จากทุก component

| ชั้นของ state         | ความหมาย                                 | เจ้าของที่แนะนำ                             | เขียน Supabase ได้หรือไม่ |
| --------------------- | ---------------------------------------- | ------------------------------------------- | ------------------------- |
| Committed/Saved state | ค่าที่โหลดจาก persistence ล่าสุด         | `SettingsPanel` หรือ coordinator snapshot   | ไม่เขียนจากการอ่าน        |
| Draft state           | ค่าที่ผู้ใช้กำลังแก้ไข                   | `SettingsPanel` และ `DashboardLayoutEditor` | ไม่ได้                    |
| History state         | past/future ของ Layout transactions      | `useEditorHistory` แยก Mobile/Desktop       | ไม่ได้                    |
| UI state              | tab, selected card, viewport, focus      | component editor                            | ไม่ได้                    |
| Persistence state     | loading, saving, error, committed scopes | SaveCoordinator/adapter                     | เขียนเฉพาะตอน Save        |

โมเดลการไหลของข้อมูลที่ต้องการคือ:

```text
Supabase / Local defaults
          │
          ▼
Committed snapshot
          │  clone ตอนเริ่มแก้ไขหรือโหลดสำเร็จ
          ▼
Draft state ───────────────┐
          │                │
          ├─ layout update  │
          │       │         │
          │       ▼         │
          │  History past/future
          │       │         │
          │       ├─ Undo/Redo เปลี่ยน Draft
          │       └─ Preview อ่าน Draft
          │
          └─ Theme/Rates/Branch form state
                           │
                           ▼
                  SaveCoordinator
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      Persistence adapters          Commit snapshots
      (Guest = no-op/local)         clear history + lock
```

`isDirty` ต้องคำนวณจาก Draft เทียบกับ Committed snapshot ไม่ใช่คำนวณจากจำนวน history entries อย่างเดียว เพราะผู้ใช้สามารถแก้ไขแล้ว Undo กลับมาที่ค่าเดิมได้ ในกรณีนี้ history อาจยังมีรายการ แต่ `isDirty` ต้องกลับเป็น `false`

## 4. Transaction Model

### 4.1 DraftTransaction

สร้างไฟล์ `src/lib/editor-history.ts` สำหรับ type และ pure history utilities

```ts
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
  /** ใช้รวมการเปลี่ยนต่อเนื่อง เช่น resize ด้วย pointer/keyboard */
  mergeKey?: string;
};

export type EditorHistoryEntry = DraftTransaction;

export type EditorHistoryState = {
  past: EditorHistoryEntry[];
  future: EditorHistoryEntry[];
};

export const DEFAULT_EDITOR_HISTORY_LIMIT = 50;
```

`before` และ `after` ต้องเป็น snapshot ที่ immutable ในเชิงพฤติกรรม กล่าวคือก่อน push ต้องสร้าง object ใหม่จาก updater และห้ามเก็บ reference ที่อาจถูกแก้ไขภายหลัง หาก Phase ต่อไปเพิ่ม customization JSON เข้า `DashboardLayout` ต้อง clone nested object ที่เกี่ยวข้องด้วย

### 4.2 ทำไมใช้ transaction แทนเก็บค่าแต่ละ field

การเปลี่ยนลำดับ, ความกว้าง, ความสูง, visibility หรือ style ของการ์ดหนึ่งใบควรถูกย้อนกลับเป็นการกระทำเดียว ไม่ควรให้ Undo ทีละ field จนผู้ใช้ต้องกดหลายครั้งเพื่อย้อนการกระทำเดียว

ตัวอย่าง:

| การกระทำของผู้ใช้            | Transaction ที่ควรสร้าง                                        |
| ---------------------------- | -------------------------------------------------------------- |
| กดเลื่อนการ์ดขึ้น            | `reorder card` หนึ่งรายการ                                     |
| เปลี่ยนความกว้างจาก 1 เป็น 2 | `resize width` หนึ่งรายการ                                     |
| เปลี่ยนความสูงจาก 1 เป็น 3   | `resize height` หนึ่งรายการ                                    |
| กด Reset Layout              | `reset mobile layout` หนึ่งรายการ                              |
| ลากต่อเนื่องด้วย pointer     | รวมเป็นรายการเดียวด้วย `mergeKey`                              |
| เลือกการ์ด                   | ไม่สร้าง transaction                                           |
| เปลี่ยน viewport             | ไม่สร้าง transaction                                           |
| กด Undo/Redo                 | ย้าย transaction ระหว่าง past/future ไม่สร้าง transaction ใหม่ |

### 4.3 No-op transaction

ห้าม push เมื่อ `before` และ `after` มีค่าเท่ากัน เช่น ผู้ใช้เลือก width เดิม, กด Move Up กับการ์ดใบแรก หรือ drop บนการ์ดเดิม

```ts
export function layoutsEqual(a: DashboardLayout, b: DashboardLayout): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isMeaningfulTransaction(transaction: DraftTransaction): boolean {
  return !layoutsEqual(transaction.before, transaction.after);
}
```

ใน implementation จริงอาจสร้าง stable structural equality ที่ไม่พึ่ง `JSON.stringify` หากมี performance issue แต่ Phase 3 ควรใช้กติกาเดียวกับ dirty check ที่มีอยู่แล้วก่อน และต้องไม่เปลี่ยน schema เพียงเพื่อแก้ performance

## 5. Pure History Reducer

ก่อนสร้าง React hook ควรสร้าง reducer แบบ pure เพื่อให้ทดสอบ Undo/Redo ได้โดยไม่ต้อง render component

```ts
export type EditorHistoryAction =
  | { type: "push"; entry: EditorHistoryEntry }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" }
  | { type: "replace" };

export function createEmptyHistory(): EditorHistoryState {
  return { past: [], future: [] };
}

export function editorHistoryReducer(
  state: EditorHistoryState,
  action: EditorHistoryAction,
  maxEntries = DEFAULT_EDITOR_HISTORY_LIMIT,
): EditorHistoryState {
  switch (action.type) {
    case "push": {
      if (!isMeaningfulTransaction(action.entry)) return state;

      const last = state.past[state.past.length - 1];
      if (last?.mergeKey && last.mergeKey === action.entry.mergeKey) {
        const merged: EditorHistoryEntry = {
          ...last,
          after: action.entry.after,
          createdAt: action.entry.createdAt,
          label: action.entry.label,
        };
        return {
          past: state.past.slice(0, -1).concat(merged),
          future: [],
        };
      }

      return {
        past: state.past.concat(action.entry).slice(-maxEntries),
        future: [],
      };
    }
    case "undo": {
      const entry = state.past.at(-1);
      if (!entry) return state;
      return {
        past: state.past.slice(0, -1),
        future: state.future.concat(entry),
      };
    }
    case "redo": {
      const entry = state.future.at(-1);
      if (!entry) return state;
      return {
        past: state.past.concat(entry).slice(-maxEntries),
        future: state.future.slice(0, -1),
      };
    }
    case "clear":
    case "replace":
      return createEmptyHistory();
    default:
      return state;
  }
}
```

### กฎของ reducer

1. `push` ต้องล้าง `future` เพราะมีการแก้ใหม่หลัง Undo แล้ว
2. `undo` ย้ายรายการล่าสุดจาก `past` ไป `future`
3. `redo` ย้ายรายการล่าสุดจาก `future` กลับไป `past`
4. `clear` และ `replace` ล้างทั้งสอง stack
5. history มีเพดาน เช่น 50 entries เพื่อป้องกันการใช้หน่วยความจำไม่จำกัด
6. การ Save และ Cancel ต้องเรียก `clear` หลังการดำเนินการสำเร็จตามกติกาของ workflow

## 6. `useEditorHistory` Hook

สร้างไฟล์ `src/hooks/use-editor-history.ts` โดย hook นี้เป็น history-only และไม่รู้จัก Supabase, SettingsPanel หรือ business calculation

```ts
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
  replace: () => void;
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
    const entry = stateRef.current.past.at(-1) ?? null;
    if (entry) dispatch({ type: "undo" });
    return entry;
  }, []);

  const redo = useCallback(() => {
    const entry = stateRef.current.future.at(-1) ?? null;
    if (entry) dispatch({ type: "redo" });
    return entry;
  }, []);

  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const replace = useCallback(() => dispatch({ type: "replace" }), []);

  return {
    past: state.past,
    future: state.future,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    push,
    undo,
    redo,
    clear,
    replace,
  };
}
```

### ข้อควรระวังของ hook

`undo()` และ `redo()` ต้องอ่าน entry จาก ref ก่อน dispatch เพื่อให้คืน snapshot ที่จะนำไปใช้กับ Layout ได้ทันที การ dispatch จะทำให้ React render history ใหม่ในรอบถัดไป แต่การเปลี่ยน Layout ต้องเกิดจาก callback ของ editor แยกต่างหาก

ถ้าต่อไปมีการนำ hook ไปใช้กับ state ชนิดอื่น ควรทำ generic version เช่น `useEditorHistory<T>` แต่ใน Phase 3 แนะนำให้จำกัด contract เป็น `DashboardLayout` ก่อน เพราะ requirement ของ Undo/Redo รอบนี้เน้น Layout transaction และจะลดความเสี่ยงที่ Theme หรือ Rates ถูก Undo โดยไม่ตั้งใจ

## 7. การฝัง History ลงใน DashboardLayoutEditor

### 7.1 History ต้องแยก Mobile/Desktop

ภายใน `DashboardLayoutEditor.tsx` ให้สร้าง history สองตัว:

```tsx
const mobileHistory = useEditorHistory({ maxEntries: 50 });
const desktopHistory = useEditorHistory({ maxEntries: 50 });
```

เลือก history ให้ตรงกับ viewport ปัจจุบัน:

```tsx
const selected = selectedViewport === "mobile" ? mobile : desktop;
const selectedHistory = selectedViewport === "mobile" ? mobileHistory : desktopHistory;
```

### 7.2 Helper สำหรับบันทึก transaction

แทนที่จะให้ทุก handler เรียก `selected.updateLayout()` โดยตรง ให้สร้าง helper กลาง

```tsx
function applyLayoutTransaction(
  source: {
    layout: DashboardLayout;
    updateLayout: (updater: (current: DashboardLayout) => DashboardLayout) => void;
  },
  history: { push: (transaction: DraftTransaction) => void },
  viewport: DashboardViewport,
  label: string,
  updater: (current: DashboardLayout) => DashboardLayout,
  mergeKey?: string,
) {
  const before = source.layout;
  const after = updater(before);
  if (layoutsEqual(before, after)) return false;

  source.updateLayout(() => after);
  history.push({
    id: crypto.randomUUID(),
    scope: "dashboard-layout",
    viewport,
    label,
    before,
    after,
    createdAt: Date.now(),
    mergeKey,
  });
  return true;
}
```

เพื่อให้ทำงานใน environment ที่ไม่มี `crypto.randomUUID()` ให้มี fallback utility ใน implementation จริง เช่น `createEditorTransactionId()` และห้ามใช้ค่า ID ที่ขึ้นกับข้อมูลส่วนบุคคล

ตัวอย่างการใช้กับ reorder:

```tsx
const handleDrop = (group: DashboardCardGroup, targetId: DashboardCardId) => {
  if (!draggingId || draggingId === targetId || disabled) return;

  applyLayoutTransaction(
    selected,
    selectedHistory,
    selectedViewport,
    `เลื่อน ${CARD_LABELS[draggingId]} ในกลุ่ม ${group}`,
    (current) => reorderDashboardCards(current, group, draggingId, targetId),
  );
  setDraggingId(null);
};
```

ตัวอย่างกับความกว้างและความสูง:

```tsx
const handleWidthChange = (cardId: DashboardCardId, width: number) => {
  if (disabled) return;
  applyLayoutTransaction(
    selected,
    selectedHistory,
    selectedViewport,
    `ปรับความกว้าง ${CARD_LABELS[cardId]}`,
    (current) => updateDashboardCard(current, cardId, { width }),
    `resize-width:${cardId}`,
  );
};

const handleHeightChange = (cardId: DashboardCardId, height: number) => {
  if (disabled) return;
  applyLayoutTransaction(
    selected,
    selectedHistory,
    selectedViewport,
    `ปรับความสูง ${CARD_LABELS[cardId]}`,
    (current) => updateDashboardCard(current, cardId, { height }),
    `resize-height:${cardId}`,
  );
};
```

`mergeKey` ใน Phase 3 ยังรองรับ select/keyboard เป็นหลัก ส่วน pointer resize ต่อเนื่องจริงควรเพิ่มใน phase ที่ทำ Resize Handle เพราะต้องกำหนด start/end gesture และ cancellation ให้ชัดเจนก่อน

### 7.3 Undo/Redo handlers

```tsx
const handleUndo = () => {
  if (disabled) return;
  const entry = selectedHistory.undo();
  if (!entry) return;
  selected.updateLayout(() => entry.before);
  setDraggingId(null);
};

const handleRedo = () => {
  if (disabled) return;
  const entry = selectedHistory.redo();
  if (!entry) return;
  selected.updateLayout(() => entry.after);
  setDraggingId(null);
};
```

Undo/Redo ไม่ควรเรียก `applyLayoutTransaction()` เพราะจะทำให้เกิด transaction ซ้อนและทำลาย future stack

### 7.4 Reset เป็น transaction เดียว

```tsx
const resetSelectedLayout = () => {
  if (disabled || selected.loading) return;

  applyLayoutTransaction(
    selected,
    selectedHistory,
    selectedViewport,
    `รีเซ็ต Layout ${selectedViewport}`,
    () => createDefaultDashboardLayout(selectedViewport),
  );
  setDraggingId(null);
  toast.info(
    `แสดงตัวอย่าง Layout ${selectedViewport === "mobile" ? "มือถือ" : "Desktop"} ค่าเริ่มต้นแล้ว กด Save เพื่อบันทึก`,
  );
};
```

ถ้า reset กับค่าเริ่มต้นอยู่แล้ว จะไม่สร้าง history entry และไม่ทำให้ dirty

## 8. Undo/Redo Toolbar และสถานะผู้ใช้

เพิ่ม toolbar ใน Layout editor หรือในส่วน header ของ Customization Editor โดยต้องใช้ design tokens และ icon set เดิม

```tsx
<div className="flex flex-wrap items-center gap-2" aria-label="ประวัติการแก้ไข Layout">
  <button
    type="button"
    onClick={handleUndo}
    disabled={disabled || !selectedHistory.canUndo}
    aria-label="ย้อนกลับการแก้ไขล่าสุด"
    className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
  >
    ย้อนกลับ
  </button>
  <button
    type="button"
    onClick={handleRedo}
    disabled={disabled || !selectedHistory.canRedo}
    aria-label="ทำซ้ำการแก้ไขล่าสุด"
    className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
  >
    ทำซ้ำ
  </button>
  <span className="text-[11px] text-muted-foreground" aria-live="polite">
    {selectedHistory.canUndo || selectedHistory.canRedo
      ? "มีประวัติการแก้ไขใน Draft"
      : "ยังไม่มีประวัติการแก้ไข"}
  </span>
</div>
```

การแสดงจำนวน history เป็นข้อมูลช่วยเหลือเท่านั้น ไม่ควรใช้แทนสถานะ `isDirty` เพราะการ Undo กลับสู่ snapshot เดิมอาจทำให้ history ยังมีรายการ แต่ค่าปัจจุบันไม่ต่างจากค่าบันทึกแล้ว

## 9. Snapshot และ History Lifecycle

ตารางนี้กำหนด lifecycle ของ history ให้ชัดเจน

| เหตุการณ์                       | Draft                     | Snapshot               | History                            |
| ------------------------------- | ------------------------- | ---------------------- | ---------------------------------- |
| โหลด Layout จาก Supabase สำเร็จ | ตั้งเป็นค่าที่โหลด        | ตั้งเป็นค่าที่โหลด     | Clear                              |
| Guest เริ่มต้น                  | ใช้ default/session draft | ตั้งเป็นค่าเริ่มต้น    | Clear                              |
| แก้ไข Layout                    | เปลี่ยนเป็น after         | คงเดิม                 | Push past, clear future            |
| Undo                            | เปลี่ยนเป็น before        | คงเดิม                 | ย้าย past → future                 |
| Redo                            | เปลี่ยนเป็น after         | คงเดิม                 | ย้าย future → past                 |
| Undo จนเท่ากับ snapshot         | เท่ากับ saved             | คงเดิม                 | อาจยังมีรายการ แต่ `isDirty=false` |
| Reset                           | เปลี่ยนเป็น default       | คงเดิม                 | Push transaction เดียว             |
| Save สำเร็จ                     | คงค่าเดิม                 | เปลี่ยนเป็น Draft ใหม่ | Clear                              |
| Save ล้มเหลว                    | คง Draft                  | คง snapshot เดิม       | คง history เพื่อ retry             |
| Cancel                          | คืน snapshot              | คง snapshot เดิม       | Clear                              |
| เปลี่ยน user/viewport           | โหลดชุดใหม่               | ตั้ง snapshot ใหม่     | Clear                              |

## 10. ปรับ `DashboardLayoutEditorHandle`

Imperative handle เดิมมี `saveDraft()` และ `cancelDraft()` อยู่แล้ว [2] ใน Phase 3 ให้ขยายอย่างระมัดระวังดังนี้

```ts
export type DashboardLayoutEditorHandle = {
  saveDraft: () => Promise<void>;
  cancelDraft: () => void;
  clearHistory: () => void;
  getDraftStatus: () => {
    mobileDirty: boolean;
    desktopDirty: boolean;
    canUndo: boolean;
    canRedo: boolean;
  };
};
```

`SettingsPanel` ไม่ควรเรียก `undo()` โดยตรง เพราะ Undo เป็น interaction ของ Layout editor ส่วน `saveDraft()`, `cancelDraft()` และ `getDraftStatus()` เป็น boundary ที่ Settings ใช้ประสานงาน

หลัง Save สำเร็จ:

```tsx
async saveDraft() {
  if (!mobileDirty && !desktopDirty) return;

  if (mobileDirty) {
    await mobile.saveLayout();
    mobileSnapshotRef.current = mobile.layout;
  }
  if (desktopDirty) {
    await desktop.saveLayout();
    desktopSnapshotRef.current = desktop.layout;
  }

  mobileHistory.clear();
  desktopHistory.clear();
}
```

อย่างไรก็ตามการ clear history ควรเกิดหลัง `saveLayout()` ของทุก viewport ที่ต้องบันทึกผ่านครบแล้วเท่านั้น หาก Mobile สำเร็จแต่ Desktop ล้มเหลว ให้เก็บ dirty/history ของทั้ง editor ไว้ก่อน เพื่อให้ retry ไม่ทำให้ผู้ใช้สูญเสีย Draft

หลัง Cancel:

```tsx
cancelDraft() {
  if (mobileDirty) mobile.updateLayout(() => mobileSnapshotRef.current);
  if (desktopDirty) desktop.updateLayout(() => desktopSnapshotRef.current);
  mobileHistory.clear();
  desktopHistory.clear();
  setDraggingId(null);
}
```

ก่อนใช้ snapshot เป็นค่ากลับคืน ควรตรวจว่ามี snapshot พร้อมแล้ว (`loaded` และ `snapshotReady`) เพื่อไม่ให้ Cancel ระหว่างโหลดเขียนค่าทับด้วย default โดยไม่ตั้งใจ

## 11. SaveCoordinator Contract

### 11.1 เป้าหมายของ Coordinator

`SaveCoordinator` ต้องทำให้ Save ระดับ Settings มีจุดควบคุมเดียว โดยรู้จักเฉพาะ draft adapters และ persistence callbacks ไม่รู้จัก JSX และไม่คำนวณรายได้หรือชั่วโมงการทำงาน

สร้างไฟล์ `src/lib/save-coordinator.ts`

```ts
export type SaveScope =
  | "theme"
  | "rates"
  | "spreadsheet"
  | "branch-profile"
  | "branch-rates"
  | "layout-mobile"
  | "layout-desktop";

export type SaveParticipant = {
  scope: SaveScope;
  dirty: boolean;
  validate?: () => void | Promise<void>;
  save: () => void | Promise<void>;
};

export type SaveFailure = {
  scope: SaveScope;
  error: unknown;
};

export type SaveResult = {
  savedScopes: SaveScope[];
  failedScope?: SaveScope;
  error?: unknown;
};

export type SaveCoordinator = {
  save: () => Promise<SaveResult>;
  hasDirtyParticipants: () => boolean;
};
```

ในระบบจริงควรเพิ่ม `commit()` ให้ participant หากต้องการให้ coordinator เป็นเจ้าของ snapshot โดยสมบูรณ์ แต่ใน Phase 3 ระยะแรกสามารถให้ `SettingsPanel` commit local snapshots หลัง coordinator คืนผลสำเร็จทั้งหมด เพื่อให้ diff เล็กและสอดคล้องกับ state ที่มีอยู่แล้ว

รูปแบบที่สมบูรณ์กว่า:

```ts
export type SaveParticipantWithCommit = SaveParticipant & {
  commit: () => void;
};

export type SaveCoordinator = {
  save: () => Promise<SaveResult>;
  cancel: () => void;
  hasDirtyParticipants: () => boolean;
};
```

### 11.2 Pure coordinator implementation

```ts
import type { SaveCoordinator, SaveParticipant, SaveResult } from "@/lib/save-coordinator";

export function createSaveCoordinator(participants: readonly SaveParticipant[]): SaveCoordinator {
  return {
    hasDirtyParticipants: () => participants.some((participant) => participant.dirty),

    async save(): Promise<SaveResult> {
      const dirtyParticipants = participants.filter((participant) => participant.dirty);
      const savedScopes: SaveResult["savedScopes"] = [];

      try {
        // Validate ทุก scope ก่อนเริ่ม remote side effect
        for (const participant of dirtyParticipants) {
          await participant.validate?.();
        }

        // ใช้ลำดับคงที่เพื่อให้ debugging และ retry คาดเดาได้
        for (const participant of dirtyParticipants) {
          await participant.save();
          savedScopes.push(participant.scope);
        }

        return { savedScopes };
      } catch (error) {
        const failedScope = dirtyParticipants[savedScopes.length]?.scope;
        return { savedScopes, failedScope, error };
      }
    },
  };
}
```

### 11.3 ความหมายของ partial success

Supabase ไม่มี transaction เดียวครอบทุกตารางและ callback เดิมของระบบมีหลาย persistence boundary ดังนั้นถ้า Theme บันทึกสำเร็จ แต่ Layout Desktop ล้มเหลว ระบบอาจเกิด partial success ใน remote ได้ [1] [3] [4]

Phase 3 ต้องกำหนดพฤติกรรม UI ดังนี้:

1. ไม่แสดงข้อความว่า Save สำเร็จทั้งหมด
2. ไม่ล้าง history ของ Layout ที่ยังไม่สำเร็จ
3. ไม่ล็อก Settings หากยังมี scope ที่บันทึกไม่สำเร็จ
4. แสดง scope ที่ล้มเหลวและให้ผู้ใช้กด Save ใหม่ได้
5. ต้องออกแบบ callback ให้ idempotent เพื่อ retry แล้วไม่สร้างข้อมูลซ้ำ
6. หากต้องการ atomic save ข้ามหลาย domain ให้ทำเป็น phase แยก ไม่ควรแอบเพิ่ม transaction database ใน Phase 3

## 12. รวม Draft ของ Theme, Rates, Spreadsheet และ Layout

### 12.1 Participant adapters ใน SettingsPanel

`SettingsPanel` ยังสามารถเก็บ form state เดิม แล้วสร้าง participants ตอนกด Save

```tsx
const participants: SaveParticipant[] = [
  {
    scope: "theme",
    dirty: JSON.stringify(draftColors) !== JSON.stringify(savedColors),
    save: () => onSaveThemeSettings(draftColors),
  },
  {
    scope: "rates",
    dirty: JSON.stringify(rateForm) !== JSON.stringify(savedRateForm),
    validate: () => {
      normalizeSheetId();
    },
    save: () => onSaveRates(rateForm),
  },
  {
    scope: "spreadsheet",
    dirty: sheetIdInput !== savedSheetId,
    validate: () => {
      normalizeSheetId();
    },
    save: () => onSetSpreadsheetIdAsync(normalizeSheetId()),
  },
  {
    scope: "layout-mobile",
    dirty: layoutEditorRef.current?.getDraftStatus().mobileDirty ?? false,
    save: () => layoutEditorRef.current?.saveDraft(),
  },
  {
    scope: "layout-desktop",
    dirty: layoutEditorRef.current?.getDraftStatus().desktopDirty ?? false,
    save: () => layoutEditorRef.current?.saveDraft(),
  },
];
```

ใน implementation จริงไม่ควรให้ทั้ง `layout-mobile` และ `layout-desktop` เรียก `saveDraft()` ซ้ำเป็นราย participant เพราะ handle เดิมบันทึกทั้งสอง viewport ที่ dirty อยู่แล้ว ให้เลือกหนึ่งในสองแบบต่อไปนี้:

| วิธี                           | ข้อดี                        | ข้อควรระวัง                                       |
| ------------------------------ | ---------------------------- | ------------------------------------------------- |
| `layout` participant เดียว     | ใช้ handle เดิมและ diff เล็ก | รายงาน failed scope ต้องละเอียดใน `saveDraft()`   |
| แยก Mobile/Desktop participant | รายงานผลละเอียด              | ต้องเพิ่ม `saveViewportDraft(viewport)` ใน handle |

สำหรับ Phase 3 แนะนำ **layout participant เดียว** ก่อน เพื่อไม่สร้าง save call ซ้ำและลดความเสี่ยงของ race condition

```ts
{
  scope: "layout-mobile", // หรือใช้ scope ใหม่ชื่อ "layout" หากปรับ union ได้
  dirty: layoutDirty,
  save: () => layoutEditorRef.current?.saveDraft(),
}
```

ถ้าต้องการรายงานแยก viewportจริง ให้ขยาย handle เป็น:

```ts
export type DashboardLayoutEditorHandle = {
  saveDraft: () => Promise<void>;
  saveViewportDraft: (viewport: DashboardViewport) => Promise<void>;
  cancelDraft: () => void;
  getDraftStatus: () => LayoutDraftStatus;
};
```

ไม่ควรเพิ่มชื่อ field ที่ซ้ำกับ `DashboardCardLayout.width`, `height` หรือ `order` เพียงเพื่อให้ coordinator ทำงาน

### 12.2 Spreadsheet ID ต้อง await ได้

ปัจจุบัน `setSpreadsheetId()` อัปเดต local state/storage และเรียก `saveDBUserSettings()` แบบไม่ await [4] ถ้าจะให้ Save status ถูกต้อง ควรเพิ่ม callback ใหม่ใน `use-work-tracker.ts` ดังนี้

```ts
const saveSpreadsheetId = useCallback(
  async (id: string) => {
    setSpreadsheetIdState(id);
    storage.setSheetId(id);
    if (useSupabase && userId) {
      await saveDBUserSettings(userId, { spreadsheet_id: id });
    }
  },
  [useSupabase, userId],
);
```

แล้วส่งผ่าน route เป็น `onSaveSpreadsheetId` โดยให้ `setSpreadsheetId` เดิมคงไว้สำหรับกรณีที่ต้องการเปลี่ยน local value แบบไม่รอผล remote หรือปรับชื่อ callback เดิมให้เป็น async ทั้งระบบหลังตรวจทุก call site แล้ว

การเปลี่ยนนี้เป็นการปรับ **persistence contract** ไม่ใช่การเปลี่ยน business logic, สูตรคำนวณ, mapping ของ Work Log หรือ GPS อย่างไรก็ตามต้องตรวจ call site ให้ครบก่อน implementation จริง

### 12.3 Branch profile และ Branch rates

Branch profile และ Branch rates ควรแยก participant กัน เพราะในโค้ดปัจจุบันใช้ callback คนละตัว (`onUpdateBranch` และ `onSaveBranchSettings`) และมีเงื่อนไข active branch ต่างกัน [1] หากไม่มี `activeBranchId` ให้ participant ที่ dirty ต้อง fail ด้วยข้อความที่ชัดเจน ไม่ควรเงียบหรือเขียนเป็น global rates โดยไม่แจ้งผู้ใช้

## 13. Save Workflow ที่เสนอ

### 13.1 Flow หลัก

```text
Locked
  │ Unlock
  ▼
Editing / Draft
  │ แก้ Theme, Rates, Layout, Branch
  ├─ Undo / Redo: เปลี่ยน Draft เท่านั้น
  ├─ Preview: อ่าน Draft เท่านั้น
  ├─ Cancel: คืน snapshot + clear history + Lock
  └─ Save
       │
       ├─ ตรวจ Dirty scopes
       ├─ Validate ทุก scope ก่อน remote write
       ├─ Save participants ตามลำดับคงที่
       ├─ ถ้าผ่านทั้งหมด: commit snapshots + clear history + Lock
       └─ ถ้าล้มเหลว: คง Draft/history + แสดง error + ไม่ Lock
```

### 13.2 ลำดับ Save ที่แนะนำ

ลำดับควรคงที่เพื่อให้ตรวจ log และ retry ได้ง่าย:

1. Validate Spreadsheet ID และ Branch prerequisites
2. Save Theme
3. Save Rates
4. Save Spreadsheet ID ด้วย async adapter
5. Save Branch profile
6. Save Branch rates
7. Save Dashboard Layout Mobile/Desktop
8. Commit snapshot ทั้งหมด
9. Clear history
10. เปลี่ยนสถานะเป็น Locked และแสดง success toast

การ validate ทั้งหมดก่อนข้อ 2 สำคัญ เพราะถ้า Spreadsheet ID ผิด ไม่ควรเขียน Theme หรือ Rates ก่อนแล้วค่อยพบ error ที่ท้าย flow โดยไม่จำเป็น หากต้องการลด partial success มากขึ้น สามารถปรับลำดับให้ settings ที่เป็น independent save หลัง validation และคงข้อจำกัดว่า cross-domain atomicity ยังไม่มี

### 13.3 Pseudocode ของ `handleSaveAll`

```tsx
const handleSaveAll = async () => {
  if (isLocked || isSaving) return;
  setIsSaving(true);
  setSaveError(null);

  try {
    const normalizedSheetId = normalizeSheetId();
    const coordinator = createSaveCoordinator([
      {
        scope: "theme",
        dirty: !deepEqual(draftColors, savedColors),
        save: () => onSaveThemeSettings(draftColors),
      },
      {
        scope: "rates",
        dirty: !deepEqual(rateForm, savedRateForm),
        save: () => onSaveRates(rateForm),
      },
      {
        scope: "spreadsheet",
        dirty: normalizedSheetId !== savedSheetId,
        save: () => onSaveSpreadsheetId(normalizedSheetId),
      },
      {
        scope: "layout-mobile",
        dirty: layoutDirty,
        save: () => layoutEditorRef.current?.saveDraft(),
      },
    ]);

    const result = await coordinator.save();
    if (result.failedScope) {
      throw new Error(`บันทึก ${result.failedScope} ไม่สำเร็จ`);
    }

    setSavedColors(draftColors);
    setSavedRateForm(rateForm);
    setSavedSheetId(normalizedSheetId);
    setSavedBranchRateForm(branchRateForm);
    setSavedBranchNameInput(branchNameInput);
    setSavedBranchCodeInput(branchCodeInput);
    setLayoutDirty(false);
    layoutEditorRef.current?.clearHistory();
    setIsLocked(true);
    toast.success("บันทึกการตั้งค่าทั้งหมดลง Supabase เรียบร้อยแล้ว");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "บันทึกการตั้งค่าไม่สำเร็จ");
    // คง Draft, snapshot และ history ไว้เพื่อให้แก้ไขหรือ Retry ได้
  } finally {
    setIsSaving(false);
  }
};
```

Pseudocode นี้เป็นโครงสร้างเป้าหมาย ไม่ใช่ diff ที่พร้อมนำไปวางทันที เพราะต้องตัดสินใจเรื่อง branch participants, async Spreadsheet adapter และการรายงาน partial success ใน implementation จริง

## 14. Cancel Workflow

Cancel ต้องเป็น local operation และไม่ควรเรียก Supabase

```tsx
const handleCancel = () => {
  setDraftColors(savedColors);
  setRateForm(savedRateForm);
  setSheetIdInput(savedSheetId);
  setBranchRateForm(savedBranchRateForm);
  setBranchNameInput(savedBranchNameInput);
  setBranchCodeInput(savedBranchCodeInput);

  layoutEditorRef.current?.cancelDraft();
  layoutEditorRef.current?.clearHistory();
  setSaveError(null);
  setIsLocked(true);
  toast.info("ยกเลิกการแก้ไขและคืนค่าที่บันทึกล่าสุดแล้ว");
};
```

ถ้า Save บางส่วนสำเร็จแต่บางส่วนล้มเหลว แล้วผู้ใช้กด Cancel, Cancel จะคืน snapshot ในหน่วยความจำเดิม ซึ่งอาจเก่ากว่าค่าบางส่วนที่ remote บันทึกไปแล้ว ใน Phase 3 ให้แสดงข้อจำกัดนี้อย่างชัดเจนและแนะนำให้ผู้ใช้ Refresh/reload settings หลัง partial failure หากต้องการให้ snapshot ตรงกับ remote แบบอัตโนมัติ ต้องเพิ่ม read-after-write หรือ server-side transaction ใน phase แยก

## 15. Lock/Unlock Rules

| สถานะ                      | แก้ Draft ได้หรือไม่ |     Undo/Redo |                Save |              Cancel |
| -------------------------- | -------------------: | ------------: | ------------------: | ------------------: |
| Locked                     |               ไม่ได้ |        ไม่ได้ |              ไม่ได้ |           ไม่จำเป็น |
| Editing ไม่มีการเปลี่ยน    |                  ได้ | ปุ่ม disabled | disabled หรือ no-op |                 ได้ |
| Editing มี Unsaved changes |                  ได้ |  ได้ตาม stack |                 ได้ |                 ได้ |
| Saving                     |               ไม่ได้ |        ไม่ได้ |            disabled | disabled จนกว่าจะจบ |
| Save สำเร็จ                |          กลับ Locked |        ไม่ได้ |              ไม่ได้ |           ไม่จำเป็น |
| Save ล้มเหลว               |        ยังคง Editing |           ได้ |           Retry ได้ |                 ได้ |

`fieldset disabled={isLocked || isSaving}` ควรยังเป็นกลไกหลักที่ครอบ controls เหมือนปัจจุบัน [1] แต่ปุ่ม status/Unlock/Lock ที่อยู่นอก fieldset ต้องกำหนด disabled state แยกกัน เพื่อไม่ให้ผู้ใช้กด Undo ระหว่าง Save หรือกด Save ซ้ำจนเกิด concurrent write

## 16. Dirty State ที่ถูกต้อง

ควรมีฟังก์ชัน pure สำหรับเปรียบเทียบ draft กับ snapshot

```ts
export type SettingsDirtyState = {
  theme: boolean;
  rates: boolean;
  spreadsheet: boolean;
  branchProfile: boolean;
  branchRates: boolean;
  layout: boolean;
};

export function hasSettingsDirty(state: SettingsDirtyState): boolean {
  return Object.values(state).some(Boolean);
}
```

สำหรับ Layout:

```ts
const mobileDirty = mobile.loaded && !layoutsEqual(mobile.layout, mobileSnapshotRef.current);
const desktopDirty = desktop.loaded && !layoutsEqual(desktop.layout, desktopSnapshotRef.current);
const layoutDirty = mobileDirty || desktopDirty;
```

การ Undo จาก Draft กลับไปยัง Saved snapshot ต้องทำให้ `layoutDirty=false` แม้ `past` หรือ `future` ยังมีรายการ การ Save/Cancel เท่านั้นที่ต้อง clear history อย่างเด็ดขาด

## 17. Guest Mode

Guest Mode ต้องใช้ Draft และ history ในหน่วยความจำหรือ local storage ตาม behavior เดิม แต่ต้องไม่เรียก Supabase

| การทำงาน             | Authenticated           | Guest                                   |
| -------------------- | ----------------------- | --------------------------------------- |
| Load Layout          | `loadDashboardLayout()` | default/session state                   |
| Undo/Redo            | local only              | local only                              |
| Save Layout          | upsert Supabase         | local/session save ตามที่ระบบเดิมรองรับ |
| Save Theme/Rates     | Supabase + local        | local only                              |
| Save Spreadsheet ID  | Supabase + local        | local only                              |
| Save Branch settings | ต้องมี user/branch      | ไม่ควรเรียก callback ที่ต้องล็อกอิน     |
| Toast                | ระบุบันทึกลง Supabase   | ระบุบันทึกสำหรับ Session นี้            |

`useDashboardLayout.saveLayout()` มี guard ไม่เรียก remote เมื่อไม่มี `userId` หรือเป็น Guest อยู่แล้ว [3] ส่วน `use-work-tracker` มี guard `useSupabase && userId` ใน Theme/Rates [4] Coordinator ต้องไม่ bypass guard เหล่านี้ และไม่ควรเรียก raw Supabase จาก component

## 18. Timezone และ Business Logic Boundary

Phase 3 ไม่แตะการสร้าง Work Log, Check-in, Check-out, GPS, เวลาเข้า/ออก, ชั่วโมงปกติ, ชั่วโมง OT, ตัวคูณ OT, ค่าแรง, รายได้สุทธิ หรือสูตรสรุปรายวัน/รายเดือน การเปลี่ยนแปลงทั้งหมดอยู่ใน settings editor state เท่านั้น

การทดสอบ Phase 3 ต้องใช้เวลาแบบ deterministic หาก transaction มี `createdAt` ให้ใช้ fake timers ใน test ไม่ใช้เวลา timezone จริงในการคำนวณค่าแรง และไม่แปลงวันที่ของ Work Log ผ่าน coordinator

> ขอบเขตความปลอดภัย: SaveCoordinator จัดการเฉพาะค่าตั้งค่าและ Layout ไม่ควรนำ `WorkLog[]` เข้าไปใน transaction history เพราะจะทำให้ Undo ของ Settings ไปกระทบข้อมูลการทำงานจริงได้

## 19. Test Plan สำหรับ Vitest

### 19.1 History reducer tests

```ts
import { describe, expect, it } from "vitest";
import {
  createEmptyHistory,
  editorHistoryReducer,
  type DraftTransaction,
} from "@/lib/editor-history";

function transaction(before: DashboardLayout, after: DashboardLayout): DraftTransaction {
  return {
    id: "tx-1",
    scope: "dashboard-layout",
    viewport: "mobile",
    label: "เปลี่ยนความกว้าง",
    before,
    after,
    createdAt: 0,
  };
}

describe("editorHistoryReducer", () => {
  it("pushes a meaningful transaction and clears future", () => {
    const initial = createEmptyHistory();
    const withFuture = {
      past: [],
      future: [transaction(layoutB, layoutC)],
    };
    const next = editorHistoryReducer(withFuture, {
      type: "push",
      entry: transaction(layoutA, layoutB),
    });

    expect(next.past).toHaveLength(1);
    expect(next.future).toHaveLength(0);
  });

  it("does not push a no-op transaction", () => {
    const initial = createEmptyHistory();
    const next = editorHistoryReducer(initial, {
      type: "push",
      entry: transaction(layoutA, layoutA),
    });

    expect(next).toEqual(initial);
  });

  it("moves entries between past and future", () => {
    const pushed = editorHistoryReducer(createEmptyHistory(), {
      type: "push",
      entry: transaction(layoutA, layoutB),
    });
    const undone = editorHistoryReducer(pushed, { type: "undo" });
    const redone = editorHistoryReducer(undone, { type: "redo" });

    expect(undone.past).toHaveLength(0);
    expect(undone.future).toHaveLength(1);
    expect(redone.past).toHaveLength(1);
    expect(redone.future).toHaveLength(0);
  });

  it("limits history entries", () => {
    let state = createEmptyHistory();
    for (let index = 0; index < 3; index++) {
      state = editorHistoryReducer(state, { type: "push", entry: createTransaction(index) }, 2);
    }

    expect(state.past).toHaveLength(2);
  });

  it("coalesces transactions with the same merge key", () => {
    const first = { ...transaction(layoutA, layoutB), mergeKey: "resize-width:hours" };
    const second = {
      ...transaction(layoutB, layoutC),
      id: "tx-2",
      mergeKey: "resize-width:hours",
    };
    const state = editorHistoryReducer(
      editorHistoryReducer(createEmptyHistory(), { type: "push", entry: first }),
      { type: "push", entry: second },
    );

    expect(state.past).toHaveLength(1);
    expect(state.past[0].before).toEqual(layoutA);
    expect(state.past[0].after).toEqual(layoutC);
  });
});
```

ตัวแปร `layoutA`, `layoutB`, `layoutC` และ `createTransaction()` ใน skeleton ต้องสร้างจาก `createDefaultDashboardLayout()` และ `updateDashboardCard()` ไม่ใช้ข้อมูลจริงของผู้ใช้

### 19.2 Hook tests

```tsx
it("undoes and redoes a layout transaction without persistence", async () => {
  const { result } = renderHook(() => useEditorHistory());

  act(() => result.current.push(makeTransaction(layoutA, layoutB)));
  expect(result.current.canUndo).toBe(true);

  let undoEntry: EditorHistoryEntry | null = null;
  act(() => {
    undoEntry = result.current.undo();
  });

  expect(undoEntry?.before).toEqual(layoutA);
  expect(result.current.canRedo).toBe(true);
});
```

### 19.3 SaveCoordinator tests

```ts
it("validates all dirty participants before the first save", async () => {
  const save = vi.fn();
  const validate = vi.fn(() => {
    throw new Error("Spreadsheet ID ไม่ถูกต้อง");
  });
  const coordinator = createSaveCoordinator([
    { scope: "theme", dirty: true, save },
    { scope: "spreadsheet", dirty: true, validate, save },
  ]);

  const result = await coordinator.save();

  expect(validate).toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
  expect(result.failedScope).toBe("spreadsheet");
});

it("does not save clean participants", async () => {
  const cleanSave = vi.fn();
  const dirtySave = vi.fn();
  const coordinator = createSaveCoordinator([
    { scope: "theme", dirty: false, save: cleanSave },
    { scope: "rates", dirty: true, save: dirtySave },
  ]);

  const result = await coordinator.save();

  expect(cleanSave).not.toHaveBeenCalled();
  expect(dirtySave).toHaveBeenCalledOnce();
  expect(result.savedScopes).toEqual(["rates"]);
});

it("keeps the failure scope for retry", async () => {
  const firstSave = vi.fn().mockResolvedValue(undefined);
  const failingSave = vi.fn().mockRejectedValue(new Error("network"));
  const coordinator = createSaveCoordinator([
    { scope: "theme", dirty: true, save: firstSave },
    { scope: "layout-mobile", dirty: true, save: failingSave },
  ]);

  const result = await coordinator.save();

  expect(result.savedScopes).toEqual(["theme"]);
  expect(result.failedScope).toBe("layout-mobile");
});
```

### 19.4 Settings workflow tests

ควรเพิ่ม component/integration tests อย่างน้อยดังนี้:

| Test case                    | ผลที่ต้องได้                                         |
| ---------------------------- | ---------------------------------------------------- |
| เปิด Settings ตอน Locked     | ทุก field และ Layout editor disabled                 |
| Unlock แล้วเปลี่ยน Layout    | Preview เปลี่ยน, Supabase mock ยังไม่ถูกเรียก        |
| กด Undo                      | Layout กลับค่า before, Supabase mock ยังไม่ถูกเรียก  |
| กด Redo                      | Layout กลับค่า after, Supabase mock ยังไม่ถูกเรียก   |
| แก้แล้ว Undo จนเท่า snapshot | `onDirtyChange(false)`                               |
| กด Cancel                    | ทุก draft รวม Layout คืน snapshot และ history ว่าง   |
| กด Save เมื่อไม่มี dirty     | ไม่เรียก persistence และไม่สร้าง error               |
| กด Save สำเร็จ               | snapshot ใหม่, history ว่าง, Locked, success toast   |
| กด Save ล้มเหลว              | Draft/history คงอยู่, ไม่ Lock, error toast          |
| Guest Save                   | Supabase adapter ไม่ถูกเรียก                         |
| เปลี่ยน viewport             | history ของ Mobile และ Desktop ไม่ปะปนกัน            |
| โหลด Layout ใหม่             | history เดิมถูก clear และไม่แสดง unsaved change ปลอม |
| กด Save ซ้ำระหว่าง saving    | มีเพียง request ชุดเดียว                             |

## 20. Acceptance Criteria ของ Phase 3

Phase 3 จะถือว่าผ่านเมื่อเกณฑ์ต่อไปนี้ครบทั้งหมด:

1. มี `DraftTransaction`, `EditorHistoryEntry` และ `SaveCoordinator` เป็น TypeScript contracts ที่ชัดเจน
2. มี `useEditorHistory` หรือ equivalent ที่รองรับ `push`, `undo`, `redo`, `clear`, `canUndo`, `canRedo`
3. History ของ Mobile และ Desktop แยกกันอย่างชัดเจน
4. No-op ไม่สร้าง history entry
5. การ push transaction ใหม่หลัง Undo ล้าง future stack
6. History มี max size และไม่โตไม่จำกัด
7. Resize/reorder/reset ถูกบันทึกเป็น transaction ที่ผู้ใช้เข้าใจได้
8. Preview และ Dashboard ยังอ่านค่าจาก Draft/Committed renderer ตามขอบเขตเดิม
9. Undo/Redo ไม่เรียก Supabase หรือเปลี่ยน Work Log
10. `isDirty` เปรียบเทียบ Draft กับ Saved snapshot ไม่ได้ดูจาก history length เพียงอย่างเดียว
11. SaveCoordinator validate ทุก dirty scope ก่อน remote write
12. Save จะบันทึกเฉพาะ scope ที่ dirty
13. Save สำเร็จทุก scope จึงจะ commit snapshot, clear history และ Lock
14. Save ล้มเหลวต้องคง Draft/history และเปิดให้ Retry
15. Cancel ไม่เรียก Supabase, คืน snapshot และ clear history
16. Guest Mode ไม่เรียก Supabase
17. Spreadsheet ID ใช้ async save adapter หรือมีวิธีตรวจผลการบันทึกที่ไม่ใช่ fire-and-forget
18. ไม่มีการเพิ่มฟิลด์ซ้ำกับ Work Log, `DashboardCardLayout`, Theme หรือ Branch schema โดยไม่จำเป็น
19. ไม่เปลี่ยนสูตรชั่วโมง, OT, ค่าแรง, รายได้, GPS หรือ timezone `Asia/Bangkok`
20. คง design tokens, font, icon style และ test IDs เดิม
21. Vitest, ESLint และ `npm run build:render` ผ่าน
22. ทดสอบ Guest Mode และ mobile viewport ก่อนขออนุมัติ Commit/Push

## 21. ไฟล์ที่คาดว่าจะเพิ่มหรือแก้เมื่อเริ่ม Implementation

ตารางนี้เป็นรายการวางแผนเท่านั้น ยังไม่มีการแก้ไฟล์จริงจากเอกสารฉบับนี้

| ไฟล์                                            | ประเภทการเปลี่ยนแปลง  | เหตุผล                                             |
| ----------------------------------------------- | --------------------- | -------------------------------------------------- |
| `src/lib/editor-history.ts`                     | เพิ่มใหม่             | contracts และ pure reducer                         |
| `src/hooks/use-editor-history.ts`               | เพิ่มใหม่             | React hook สำหรับ past/future                      |
| `src/lib/save-coordinator.ts`                   | เพิ่มใหม่             | Save participant/result contract และ orchestration |
| `src/components/work/DashboardLayoutEditor.tsx` | แก้                   | เชื่อม history, Undo/Redo และ clear lifecycle      |
| `src/components/work/SettingsPanel.tsx`         | แก้                   | ใช้ coordinator รวม Save และ failure behavior      |
| `src/hooks/use-work-tracker.ts`                 | อาจแก้                | เพิ่ม async Spreadsheet save boundary              |
| `src/routes/_authenticated/index.tsx`           | อาจแก้                | ส่ง async callback หรือ public handle ใหม่         |
| `src/test/editor-history.test.ts`               | เพิ่มใหม่             | reducer/transaction tests                          |
| `src/test/use-editor-history.test.tsx`          | เพิ่มใหม่             | hook tests                                         |
| `src/test/save-coordinator.test.ts`             | เพิ่มใหม่             | validation, partial failure, clean scope tests     |
| Supabase migration                              | ไม่ควรเพิ่มใน Phase 3 | ไม่จำเป็นต่อ history และ coordinator               |

## 22. สิ่งที่ไม่ทำใน Phase 3

Phase 3 ยังไม่ควรทำสิ่งต่อไปนี้:

- ไม่ทำ database transaction ข้าม `user_settings`, `dashboard_layouts` และ branch settings
- ไม่เปลี่ยน `DashboardLayout.version` หากไม่จำเป็นต่อการอ่านข้อมูล
- ไม่เก็บ history ลง Supabase
- ไม่ทำ Undo/Redo ให้ Work Logs หรือข้อมูล GPS
- ไม่เปลี่ยนสูตรค่าแรง, OT, รายได้, ชั่วโมง หรือการสรุปเดือน
- ไม่เปลี่ยน `checkInGPS`/`checkOutGPS`
- ไม่ทำ pointer drag, resize handle, grid snap หรือ multi-select แบบเต็มรูปแบบ
- ไม่ทำ optimistic remote update ตอนกด property control
- ไม่เพิ่มปุ่ม Save ย่อยที่เขียน Supabase โดยตรงใน Component Library หรือ Customization Panel

## 23. ลำดับการลงมือทำจริงหลังได้รับอนุมัติ

1. เพิ่ม pure contracts และ reducer พร้อม unit tests ก่อน
2. เพิ่ม `useEditorHistory` และทดสอบ past/future lifecycle
3. เชื่อม `DashboardLayoutEditor` โดยเริ่มจาก reorder, width, height และ Reset
4. เพิ่ม Undo/Redo toolbar และ disabled states
5. เพิ่ม clear/reset lifecycle ใน load, Save, Cancel และ viewport/user change
6. สร้าง `SaveCoordinator` และทดสอบ validation/partial failure
7. ปรับ `SettingsPanel.handleSaveAll()` ให้ใช้ coordinator โดยยังคง UI เดิม
8. เพิ่ม async Spreadsheet persistence boundary หลังตรวจ call sites
9. รัน lint, Vitest, build และ mobile/Guest smoke test
10. แสดงตัวอย่าง diff, ผลทดสอบ และรายการไฟล์ที่จะเปลี่ยนให้ผู้ใช้อนุมัติก่อน Commit/Push

## 24. สรุปสถาปัตยกรรมที่ต้องการ

Phase 3 ควรทำให้ระบบมีเส้นแบ่งที่ชัดเจนดังนี้:

```text
Component controls
      │
      ▼
Draft updater ──► DraftTransaction ──► past/future history
      │                    │
      │                    ├─ Undo/Redo local only
      │                    └─ Preview local only
      ▼
Settings dirty coordinator
      │
      ├─ Cancel → snapshot restore + clear history + Lock
      └─ Save → validate → persist dirty scopes → commit snapshot
                                      │
                         success ────┴──── failure
                           │                 │
                  clear history + Lock   keep Draft/history + Retry
```

สถาปัตยกรรมนี้ช่วยให้การแก้ไขไม่ถูกบันทึกทันที, Undo/Redo ไม่แตะข้อมูลจริง, Save/Cancel มีจุดควบคุมเดียว และ Guest Mode สามารถทำงานแบบ local ได้ โดยยังคง business logic ของระบบบันทึกการทำงานและ persistence contract หลักของโปรเจ็กต์ไว้

## References

[1]: `src/components/work/SettingsPanel.tsx` — Settings draft state, dirty tracking, Lock/Unlock, Save/Cancel workflow และ Layout editor ref

[2]: `src/components/work/DashboardLayoutEditor.tsx` — Mobile/Desktop layout draft, snapshot, dirty state และ imperative save/cancel handle

[3]: `src/hooks/use-dashboard-layout.ts` — Dashboard layout loading, Guest guard, draft update และ Supabase save boundary

[4]: `src/hooks/use-work-tracker.ts` — Theme, Rates, Branch และ Spreadsheet persistence callbacks พร้อม Guest/Supabase guards

[5]: `src/lib/dashboard-layout.ts` — `DashboardLayout`, `DashboardCardLayout`, card IDs, reorder/resize utilities และ JSON persistence

[6]: `interactive-customization-phase-1-detail.md` — Foundation และ Preview Canvas contracts

[7]: `interactive-customization-phase-2-detail.md` — Component Library และ Customization Panel contracts
