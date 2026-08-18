import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Monitor,
  Redo2,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import {
  createDefaultDashboardLayout,
  getDashboardCards,
  reorderDashboardCards,
  updateDashboardCard,
  type DashboardCardGroup,
  type DashboardCardLayout,
  type DashboardLayout,
  type DashboardViewport,
} from "@/lib/dashboard-layout";
import { createDashboardLayoutTransaction, dashboardLayoutsEqual } from "@/lib/editor-history";

type Props = {
  userId: string;
  isGuest: boolean;
  disabled: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
};

export type DashboardLayoutDraftStatus = {
  mobileDirty: boolean;
  desktopDirty: boolean;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

export type DashboardLayoutEditorHandle = {
  saveDraft: () => Promise<void>;
  cancelDraft: () => void;
  clearHistory: () => void;
  getDraftStatus: () => DashboardLayoutDraftStatus;
};

const GROUPS: Array<{ id: DashboardCardGroup; label: string }> = [
  { id: "net", label: "รายได้สุทธิ" },
  { id: "work", label: "สถิติการทำงาน" },
  { id: "income", label: "รายรับและรายการหัก" },
  { id: "charts", label: "กราฟ" },
];

const CARD_LABELS: Record<DashboardCardLayout["id"], string> = {
  "net-income": "รายได้สุทธิรวม",
  "work-days": "วันทำงานทั้งหมด",
  "days-with-ot": "วันที่มี OT",
  "days-without-ot": "วันที่ไม่มี OT",
  tasks: "งานที่ทำเสร็จ",
  "tasks-average": "เฉลี่ยงานต่อวัน",
  hours: "ชั่วโมงรวม",
  "ot-income": "ค่า OT",
  allowance: "เบี้ยเลี้ยงและรายรับอื่น",
  deductions: "รายการหักรวม",
  "daily-income": "รายได้รายวัน",
  "daily-tasks": "จำนวนงานที่ทำเสร็จรายวัน",
  "work-type-income": "สัดส่วนรายได้ตามประเภทงาน",
  "frequent-location": "สถานที่ทำงานบ่อยที่สุด",
};

export const DashboardLayoutEditor = forwardRef<DashboardLayoutEditorHandle, Props>(
  function DashboardLayoutEditor({ userId, isGuest, disabled, onDirtyChange }, ref) {
    const [selectedViewport, setSelectedViewport] = useState<DashboardViewport>("mobile");
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const mobile = useDashboardLayout(userId, isGuest, "mobile");
    const desktop = useDashboardLayout(userId, isGuest, "desktop");
    const mobileHistory = useEditorHistory();
    const desktopHistory = useEditorHistory();
    const {
      canUndo: canUndoMobile,
      canRedo: canRedoMobile,
      push: pushMobileHistory,
      undo: undoMobileHistory,
      redo: redoMobileHistory,
      clear: clearMobileHistory,
    } = mobileHistory;
    const {
      canUndo: canUndoDesktop,
      canRedo: canRedoDesktop,
      push: pushDesktopHistory,
      undo: undoDesktopHistory,
      redo: redoDesktopHistory,
      clear: clearDesktopHistory,
    } = desktopHistory;
    const mobileSnapshotRef = useRef<DashboardLayout>(mobile.layout);
    const desktopSnapshotRef = useRef<DashboardLayout>(desktop.layout);
    const mobileSnapshotReadyRef = useRef(false);
    const desktopSnapshotReadyRef = useRef(false);

    useEffect(() => {
      mobileSnapshotReadyRef.current = false;
      desktopSnapshotReadyRef.current = false;
      clearMobileHistory();
      clearDesktopHistory();
    }, [clearDesktopHistory, clearMobileHistory, isGuest, userId]);

    useEffect(() => {
      if (!mobile.loaded || mobileSnapshotReadyRef.current) return;
      mobileSnapshotRef.current = cloneLayout(mobile.layout);
      mobileSnapshotReadyRef.current = true;
      clearMobileHistory();
    }, [clearMobileHistory, mobile.layout, mobile.loaded]);

    useEffect(() => {
      if (!desktop.loaded || desktopSnapshotReadyRef.current) return;
      desktopSnapshotRef.current = cloneLayout(desktop.layout);
      desktopSnapshotReadyRef.current = true;
      clearDesktopHistory();
    }, [clearDesktopHistory, desktop.layout, desktop.loaded]);

    const mobileDirty =
      mobile.loaded &&
      mobileSnapshotReadyRef.current &&
      !dashboardLayoutsEqual(mobile.layout, mobileSnapshotRef.current);
    const desktopDirty =
      desktop.loaded &&
      desktopSnapshotReadyRef.current &&
      !dashboardLayoutsEqual(desktop.layout, desktopSnapshotRef.current);
    const isDirty = mobileDirty || desktopDirty;
    const selected = selectedViewport === "mobile" ? mobile : desktop;
    const selectedHistory = selectedViewport === "mobile" ? mobileHistory : desktopHistory;

    useEffect(() => {
      onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    useImperativeHandle(
      ref,
      () => ({
        async saveDraft() {
          if (!mobileDirty && !desktopDirty) return;

          if (mobileDirty) {
            await mobile.saveLayout();
            mobileSnapshotRef.current = cloneLayout(mobile.layout);
          }
          if (desktopDirty) {
            await desktop.saveLayout();
            desktopSnapshotRef.current = cloneLayout(desktop.layout);
          }

          clearMobileHistory();
          clearDesktopHistory();
          toast.success(
            isGuest ? "บันทึก Layout สำหรับ Session นี้แล้ว" : "บันทึก Layout ลง Supabase แล้ว",
          );
        },
        cancelDraft() {
          if (mobileDirty && mobileSnapshotReadyRef.current) {
            mobile.updateLayout(() => cloneLayout(mobileSnapshotRef.current));
          }
          if (desktopDirty && desktopSnapshotReadyRef.current) {
            desktop.updateLayout(() => cloneLayout(desktopSnapshotRef.current));
          }
          clearMobileHistory();
          clearDesktopHistory();
          setDraggingId(null);
        },
        clearHistory() {
          clearMobileHistory();
          clearDesktopHistory();
        },
        getDraftStatus() {
          return {
            mobileDirty,
            desktopDirty,
            isDirty,
            canUndo: canUndoMobile || canUndoDesktop,
            canRedo: canRedoMobile || canRedoDesktop,
          };
        },
      }),
      [
        canRedoDesktop,
        canRedoMobile,
        canUndoDesktop,
        canUndoMobile,
        clearDesktopHistory,
        clearMobileHistory,
        desktop,
        desktopDirty,
        isDirty,
        isGuest,
        mobile,
        mobileDirty,
      ],
    );

    const handleViewportChange = (nextViewport: DashboardViewport) => {
      if (nextViewport === selectedViewport) return;
      setDraggingId(null);
      setSelectedViewport(nextViewport);
    };

    const applySelectedLayout = (
      label: string,
      updater: (current: DashboardLayout) => DashboardLayout,
      mergeKey?: string,
    ) => {
      if (disabled || !selected.loaded) return false;
      const before = selected.layout;
      const after = updater(before);
      const transaction = createDashboardLayoutTransaction(
        before,
        after,
        selectedViewport,
        label,
        mergeKey,
      );
      if (!transaction) return false;

      selected.updateLayout(() => after);
      (selectedViewport === "mobile" ? pushMobileHistory : pushDesktopHistory)(transaction);
      return true;
    };

    const handleDrop = (group: DashboardCardGroup, targetId: DashboardCardLayout["id"]) => {
      if (!draggingId || draggingId === targetId) return;
      applySelectedLayout(
        `เลื่อน ${CARD_LABELS[draggingId as DashboardCardLayout["id"]]} ในกลุ่ม ${group}`,
        (current) =>
          reorderDashboardCards(current, group, draggingId as DashboardCardLayout["id"], targetId),
      );
      setDraggingId(null);
    };

    const handleUndo = () => {
      if (disabled) return;
      const entry = (selectedViewport === "mobile" ? undoMobileHistory : undoDesktopHistory)();
      if (!entry) return;
      selected.updateLayout(() => cloneLayout(entry.before));
      setDraggingId(null);
    };

    const handleRedo = () => {
      if (disabled) return;
      const entry = (selectedViewport === "mobile" ? redoMobileHistory : redoDesktopHistory)();
      if (!entry) return;
      selected.updateLayout(() => cloneLayout(entry.after));
      setDraggingId(null);
    };

    const resetSelectedLayout = () => {
      const changed = applySelectedLayout(`รีเซ็ต Layout ${selectedViewport}`, () =>
        createDefaultDashboardLayout(selectedViewport),
      );
      setDraggingId(null);
      if (changed) {
        toast.info(
          `แสดงตัวอย่าง Layout ${selectedViewport === "mobile" ? "มือถือ" : "Desktop"} ค่าเริ่มต้นแล้ว กด Save เพื่อบันทึก`,
        );
      }
    };

    return (
      <section className="surface-card space-y-5 p-5">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold">
              <GripVertical className="h-5 w-5 text-primary" /> ปรับ Layout Dashboard
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              จัดลำดับ ลากขึ้นลง และปรับความกว้าง/ความสูงของการ์ดจาก Settings เท่านั้น
            </p>
          </div>
          <button
            type="button"
            onClick={resetSelectedLayout}
            disabled={disabled || selected.loading}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ต Layout นี้
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-card p-1">
              <button
                type="button"
                onClick={() => handleViewportChange("mobile")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                  selectedViewport === "mobile"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
              <button
                type="button"
                onClick={() => handleViewportChange("desktop")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                  selectedViewport === "desktop"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={disabled || !selectedHistory.canUndo}
                aria-label="ย้อนกลับการแก้ไข Layout ล่าสุด"
                className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={disabled || !selectedHistory.canRedo}
                aria-label="ทำซ้ำการแก้ไข Layout ล่าสุด"
                className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <span
            className="flex items-center gap-1 text-[11px] text-muted-foreground"
            aria-live="polite"
          >
            {selected.loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> กำลังโหลด Layout…
              </>
            ) : isDirty ? (
              <>
                <span className="text-warning">ยังไม่ได้บันทึก</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-success" /> บันทึกแล้ว
              </>
            )}
          </span>
        </div>

        <fieldset disabled={disabled} className="space-y-5">
          {GROUPS.map((group) => {
            const cards = getDashboardCards(selected.layout, group.id);
            return (
              <div key={group.id} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h4>
                <div className="space-y-2">
                  {cards.map((card) => (
                    <LayoutCardRow
                      key={card.id}
                      card={card}
                      viewport={selectedViewport}
                      dragging={draggingId === card.id}
                      onDragStart={() => setDraggingId(card.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDrop={() => handleDrop(group.id, card.id)}
                      onMoveUp={() =>
                        applySelectedLayout(`เลื่อน ${CARD_LABELS[card.id]} ขึ้น`, (current) =>
                          moveCard(current, group.id, card.id, -1),
                        )
                      }
                      onMoveDown={() =>
                        applySelectedLayout(`เลื่อน ${CARD_LABELS[card.id]} ลง`, (current) =>
                          moveCard(current, group.id, card.id, 1),
                        )
                      }
                      onWidthChange={(width) =>
                        applySelectedLayout(
                          `ปรับความกว้าง ${CARD_LABELS[card.id]}`,
                          (current) => updateDashboardCard(current, card.id, { width }),
                          `resize-width:${selectedViewport}:${card.id}`,
                        )
                      }
                      onHeightChange={(height) =>
                        applySelectedLayout(
                          `ปรับความสูง ${CARD_LABELS[card.id]}`,
                          (current) => updateDashboardCard(current, card.id, { height }),
                          `resize-height:${selectedViewport}:${card.id}`,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
      </section>
    );
  },
);

function LayoutCardRow({
  card,
  viewport,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
  onMoveUp,
  onMoveDown,
  onWidthChange,
  onHeightChange,
}: {
  card: DashboardCardLayout;
  viewport: DashboardViewport;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
}) {
  const maxWidth =
    card.group === "charts" ? (viewport === "mobile" ? 1 : 2) : viewport === "mobile" ? 2 : 3;
  const maxHeight = card.group === "charts" ? 6 : 3;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-3 transition sm:flex-row sm:items-center ${
        dragging ? "border-primary bg-primary/5 opacity-60" : "border-border"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate text-sm font-semibold">{CARD_LABELS[card.id]}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          กว้าง
          <select
            value={card.width}
            onChange={(event) => onWidthChange(Number(event.target.value))}
            className="rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs text-foreground"
          >
            {Array.from({ length: maxWidth }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}/{maxWidth}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          สูง
          <select
            value={card.height}
            onChange={(event) => onHeightChange(Number(event.target.value))}
            className="rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs text-foreground"
          >
            {Array.from({ length: maxHeight }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value} แถว
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-1">
          <button
            type="button"
            onClick={onMoveUp}
            aria-label={`เลื่อน ${CARD_LABELS[card.id]} ขึ้น`}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            aria-label={`เลื่อน ${CARD_LABELS[card.id]} ลง`}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function moveCard(
  layout: DashboardLayout,
  group: DashboardCardGroup,
  cardId: DashboardCardLayout["id"],
  direction: -1 | 1,
): DashboardLayout {
  const cards = getDashboardCards(layout, group);
  const index = cards.findIndex((card) => card.id === cardId);
  const target = cards[index + direction];
  if (!target) return layout;
  return reorderDashboardCards(layout, group, cardId, target.id);
}

function cloneLayout(layout: DashboardLayout): DashboardLayout {
  return {
    version: layout.version,
    cards: layout.cards.map((card) => ({ ...card })),
  };
}
