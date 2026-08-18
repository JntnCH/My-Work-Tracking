import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2 } from "lucide-react";
import type {
  DashboardCardGroup,
  DashboardCardId,
  DashboardCardLayout,
  DashboardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";
import { renderDashboardCardContent } from "@/lib/dashboard-card-content";
import type { MonthlySummary } from "@/lib/work-log";

type Props = {
  layout: DashboardLayout;
  viewport: DashboardViewport;
  summary: MonthlySummary;
  chartColors: string[] | undefined;
  disabled: boolean;
  selectedCardId: DashboardCardId | null;
  onSelectCard: (id: DashboardCardId | null) => void;
  onMoveCard: (id: DashboardCardId, patch: { x: number; y: number }) => void;
  onResizeCard: (
    id: DashboardCardId,
    patch: { width: number; height: number; x: number; y: number },
  ) => void;
};

type ResizeDirection = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

type Interaction = {
  pointerId: number;
  id: DashboardCardId;
  mode: "drag" | "resize";
  resizeDirection?: ResizeDirection;
  captureTarget: HTMLElement;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type PendingTouch = {
  pointerId: number;
  id: DashboardCardId;
  target: HTMLElement;
  startClientX: number;
  startClientY: number;
};

const NORMAL_CARD_HEIGHT = 92;
const NET_CARD_HEIGHT = 104;
const CHART_CARD_HEIGHT = 260;
const TOUCH_DRAG_DELAY = 220;
const TOUCH_MOVE_TOLERANCE = 8;
const GROUP_ORDER: DashboardCardGroup[] = ["net", "work", "income", "charts"];

const RESIZE_HANDLES: Array<{
  direction: ResizeDirection;
  position: string;
  cursor: string;
  label: string;
}> = [
  { direction: "nw", position: "-left-2 -top-2", cursor: "cursor-nwse-resize", label: "มุมซ้ายบน" },
  {
    direction: "n",
    position: "left-1/2 -top-2 -translate-x-1/2",
    cursor: "cursor-n-resize",
    label: "ด้านบนกลาง",
  },
  { direction: "ne", position: "-right-2 -top-2", cursor: "cursor-nesw-resize", label: "มุมขวาบน" },
  {
    direction: "w",
    position: "-left-2 top-1/2 -translate-y-1/2",
    cursor: "cursor-w-resize",
    label: "ด้านซ้ายกลาง",
  },
  {
    direction: "e",
    position: "-right-2 top-1/2 -translate-y-1/2",
    cursor: "cursor-e-resize",
    label: "ด้านขวากลาง",
  },
  {
    direction: "sw",
    position: "-bottom-2 -left-2",
    cursor: "cursor-nesw-resize",
    label: "มุมซ้ายล่าง",
  },
  {
    direction: "s",
    position: "-bottom-2 left-1/2 -translate-x-1/2",
    cursor: "cursor-s-resize",
    label: "ด้านล่างกลาง",
  },
  {
    direction: "se",
    position: "-bottom-2 -right-2",
    cursor: "cursor-nwse-resize",
    label: "มุมขวาล่าง",
  },
];

export function DashboardCustomizationCanvas({
  layout,
  viewport,
  summary,
  chartColors,
  disabled,
  selectedCardId,
  onSelectCard,
  onMoveCard,
  onResizeCard,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const pendingTouchRef = useRef<PendingTouch | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const [activeInteraction, setActiveInteraction] = useState<Interaction | null>(null);
  const cardsByGroup = GROUP_ORDER.map((group) => ({
    group,
    cards: layout.cards.filter((card) => card.group === group).sort(compareReflowPosition),
  }));

  const clearTouchTimer = () => {
    if (touchTimerRef.current !== null) {
      window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const clearPendingTouch = () => {
    clearTouchTimer();
    pendingTouchRef.current = null;
  };

  const beginInteraction = (
    card: DashboardCardLayout,
    target: HTMLElement,
    pointerId: number,
    startClientX: number,
    startClientY: number,
    mode: "drag" | "resize",
    resizeDirection?: ResizeDirection,
  ) => {
    const interaction: Interaction = {
      pointerId,
      id: card.id,
      mode,
      resizeDirection,
      captureTarget: target,
      startClientX,
      startClientY,
      startX: card.x,
      startY: card.y,
      startWidth: card.width,
      startHeight: card.height,
    };
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Synthetic events may not have an active pointer; Canvas still updates while mounted.
    }
    interactionRef.current = interaction;
    setActiveInteraction(interaction);
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    card: DashboardCardLayout,
    mode: "drag" | "resize",
    resizeDirection?: ResizeDirection,
  ) => {
    if (disabled) return;
    event.stopPropagation();
    onSelectCard(card.id);
    const target = event.currentTarget;

    if (mode === "drag" && event.pointerType === "touch") {
      clearPendingTouch();
      pendingTouchRef.current = {
        pointerId: event.pointerId,
        id: card.id,
        target,
        startClientX: event.clientX,
        startClientY: event.clientY,
      };
      touchTimerRef.current = window.setTimeout(() => {
        const pending = pendingTouchRef.current;
        if (!pending || pending.pointerId !== event.pointerId) return;
        const pendingCard = layout.cards.find((item) => item.id === pending.id);
        if (!pendingCard) return;
        beginInteraction(
          pendingCard,
          pending.target,
          pending.pointerId,
          pending.startClientX,
          pending.startClientY,
          "drag",
        );
        pendingTouchRef.current = null;
        touchTimerRef.current = null;
      }, TOUCH_DRAG_DELAY);
      return;
    }

    event.preventDefault();
    beginInteraction(
      card,
      target,
      event.pointerId,
      event.clientX,
      event.clientY,
      mode,
      resizeDirection,
    );
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const pending = pendingTouchRef.current;
    if (pending && pending.pointerId === event.pointerId) {
      const distance = Math.hypot(
        event.clientX - pending.startClientX,
        event.clientY - pending.startClientY,
      );
      if (distance > TOUCH_MOVE_TOLERANCE) clearPendingTouch();
      return;
    }

    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId || disabled) return;
    const canvas = canvasRef.current;
    const card = layout.cards.find((item) => item.id === interaction.id);
    if (!canvas || !card) return;
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const deltaXPercent = ((event.clientX - interaction.startClientX) / rect.width) * 100;
    const deltaYPercent = ((event.clientY - interaction.startClientY) / rect.height) * 100;

    if (interaction.mode === "drag") {
      onMoveCard(card.id, {
        x: roundPosition(clamp(interaction.startX + deltaXPercent, 0, 100)),
        y: roundPosition(clamp(interaction.startY + deltaYPercent, 0, 100)),
      });
      return;
    }

    const direction = interaction.resizeDirection ?? "se";
    const columns = getColumns(card, viewport);
    const horizontalDirection = direction.includes("e")
      ? "east"
      : direction.includes("w")
        ? "west"
        : null;
    const verticalDirection = direction.includes("s")
      ? "south"
      : direction.includes("n")
        ? "north"
        : null;
    const widthStep = Math.round(
      (event.clientX - interaction.startClientX) / (rect.width / columns),
    );
    const heightStep = Math.round(
      (event.clientY - interaction.startClientY) / getCardBaseHeight(card),
    );
    const maxWidth = card.group === "net" ? columns : columns;
    const nextWidth = horizontalDirection
      ? clamp(
          interaction.startWidth + (horizontalDirection === "east" ? widthStep : -widthStep),
          1,
          maxWidth,
        )
      : interaction.startWidth;
    const nextHeight = verticalDirection
      ? clamp(
          interaction.startHeight + (verticalDirection === "south" ? heightStep : -heightStep),
          1,
          card.group === "charts" ? 6 : 4,
        )
      : interaction.startHeight;
    const nextX =
      horizontalDirection === "west" ? interaction.startX + deltaXPercent : interaction.startX;
    const nextY =
      verticalDirection === "north" ? interaction.startY + deltaYPercent : interaction.startY;

    onResizeCard(card.id, {
      width: nextWidth,
      height: nextHeight,
      x: roundPosition(clamp(nextX, 0, 100)),
      y: roundPosition(clamp(nextY, 0, 100)),
    });
  };

  const finishPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (pendingTouchRef.current?.pointerId === event.pointerId) clearPendingTouch();
    if (interactionRef.current?.pointerId !== event.pointerId) return;
    const captureTarget = interactionRef.current.captureTarget;
    try {
      if (captureTarget.hasPointerCapture(event.pointerId)) {
        captureTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer may already have been released by the browser.
    }
    interactionRef.current = null;
    setActiveInteraction(null);
  };

  return (
    <div className="space-y-2" data-testid="dashboard-customization-canvas">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {disabled
            ? "ปลดล็อก Settings ก่อนจึงจะเลือก ลาก หรือปรับขนาดได้"
            : "แตะเพื่อเลือก · กดค้างแล้วลาก · ลากจุดรอบกรอบเพื่อปรับขนาด · พื้นที่ว่างใช้ Scroll"}
        </span>
        <span className="shrink-0">
          {viewport === "mobile" ? "Canvas Mobile" : "Canvas Desktop"}
        </span>
      </div>

      <div
        className="max-h-[min(75vh,48rem)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-dashed border-border bg-secondary/30"
        style={{ touchAction: "pan-y" }}
        data-dashboard-customization-viewport={viewport}
      >
        <div
          ref={canvasRef}
          className="space-y-3 px-10 py-12"
          style={{ touchAction: "pan-y" }}
          data-dashboard-customization-canvas-surface={viewport}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) onSelectCard(null);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          {cardsByGroup.map(({ group, cards }) => (
            <section
              key={group}
              className="grid min-w-0 grid-cols-2 items-stretch gap-2 sm:gap-3 md:grid-cols-6"
              data-dashboard-card-group={group}
              style={{
                gridTemplateColumns: `repeat(${getSectionColumns(viewport)}, minmax(0, 1fr))`,
              }}
            >
              {cards.map((card) => {
                const selected = selectedCardId === card.id;
                const dragging =
                  activeInteraction?.id === card.id && activeInteraction.mode === "drag";
                const resizing =
                  activeInteraction?.id === card.id && activeInteraction.mode === "resize";
                const width = getGridSpan(card, viewport);
                const height = getCardHeight(card);
                return (
                  <article
                    key={card.id}
                    className={`relative min-w-0 overflow-visible rounded-xl ${
                      selected
                        ? "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "z-10"
                    } ${
                      dragging
                        ? "cursor-grabbing opacity-90"
                        : disabled
                          ? "cursor-default"
                          : "cursor-grab"
                    }`}
                    data-dashboard-card-id={card.id}
                    data-dashboard-card-selected={selected ? "true" : "false"}
                    data-dashboard-card-interacting={dragging || resizing ? "true" : "false"}
                    style={{
                      height: `${height}px`,
                      gridColumn: `span ${Math.min(width, getSectionColumns(viewport))} / span ${Math.min(width, getSectionColumns(viewport))}`,
                      touchAction: "none",
                      userSelect: "none",
                    }}
                    onPointerDown={(event) => handlePointerDown(event, card, "drag")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectCard(card.id);
                    }}
                  >
                    <div className="pointer-events-none h-full min-h-0 min-w-0 overflow-visible rounded-xl">
                      {renderDashboardCardContent(card.id, summary, chartColors)}
                    </div>
                    {selected ? (
                      <>
                        <div className="pointer-events-none absolute -top-9 left-0 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow">
                          {card.id} · x {roundPosition(card.x)}% · y {roundPosition(card.y)}% · w{" "}
                          {card.width} · h {card.height}
                        </div>
                        {RESIZE_HANDLES.map((handle) => (
                          <button
                            key={handle.direction}
                            type="button"
                            aria-label={`ปรับขนาด ${card.id} ${handle.label}`}
                            className={`absolute z-40 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow ${handle.position} ${handle.cursor}`}
                            style={{ touchAction: "none" }}
                            onPointerDown={(event) =>
                              handlePointerDown(event, card, "resize", handle.direction)
                            }
                          >
                            <Maximize2 className="h-2.5 w-2.5" />
                          </button>
                        ))}
                      </>
                    ) : null}
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSectionColumns(viewport: DashboardViewport): number {
  return viewport === "mobile" ? 2 : 6;
}

function getColumns(card: DashboardCardLayout, viewport: DashboardViewport): number {
  return getSectionColumns(viewport);
}

function getGridSpan(card: DashboardCardLayout, viewport: DashboardViewport): number {
  const columns = getSectionColumns(viewport);
  if (card.group === "net") return columns;
  if (card.group === "charts") {
    return viewport === "mobile" ? columns : 3 * clamp(card.width, 1, 2);
  }
  return viewport === "mobile" ? clamp(card.width, 1, 2) : 2 * clamp(card.width, 1, 3);
}

function getCardBaseHeight(card: DashboardCardLayout): number {
  if (card.group === "net") return NET_CARD_HEIGHT;
  return card.group === "charts" ? CHART_CARD_HEIGHT : NORMAL_CARD_HEIGHT;
}

function getCardHeight(card: DashboardCardLayout): number {
  return getCardBaseHeight(card) * clamp(card.height, 1, card.group === "charts" ? 6 : 4);
}

function compareReflowPosition(a: DashboardCardLayout, b: DashboardCardLayout): number {
  const y = a.y - b.y;
  if (Math.abs(y) > 0.01) return y;
  const x = a.x - b.x;
  if (Math.abs(x) > 0.01) return x;
  if (a.group !== b.group) return groupRank(a.group) - groupRank(b.group);
  return a.order - b.order;
}

function groupRank(group: DashboardCardGroup): number {
  return group === "net" ? 0 : group === "work" ? 1 : group === "income" ? 2 : 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundPosition(value: number): number {
  return Math.round(value * 100) / 100;
}
